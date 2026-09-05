"""Deterministic, read-only Git diff metrics. Never imports or executes repo code."""
import collections
import difflib
import json
import math
import pathlib
import re
import subprocess
import sys
import lizard

SOURCE = {'.py', '.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx', '.java', '.c', '.h', '.cc', '.cpp', '.hpp', '.cs', '.go', '.rs', '.rb', '.php', '.swift', '.kt', '.kts', '.scala', '.vue', '.html', '.css', '.scss', '.sql', '.sh', '.ipynb'}
EXCLUDED = {'node_modules', 'vendor', 'vendors', 'dist', 'build', 'coverage', 'generated', '__generated__', '.git', '.venv', 'venv', 'data', 'datasets', 'fixtures', '__snapshots__', 'third_party', 'third-party', 'out', '.next'}

def git(repo, *args):
    return subprocess.check_output(['git', '-c', 'core.quotePath=false', '-C', repo, *args], timeout=15)

def included(path):
    p = pathlib.PurePosixPath(path.lower())
    return p.suffix in SOURCE and not any(x in EXCLUDED for x in p.parts) and not re.search(r'(\.min\.|\.generated\.|\.g\.|\.designer\.|\.d\.ts$|lock\.)', p.name)

def test_file(path):
    return bool(re.search(r'(^|/)(__tests__|tests?|specs?)(/|$)|(^|/)(test_|spec_)|[._](test|spec)[.]|(_test|Test|Tests)\.', path))

def read(repo, sha, path):
    if not path:
        return ''
    size = int(git(repo, 'cat-file', '-s', f'{sha}:{path}'))
    if size > 2_000_000:
        raise ValueError('A source file exceeds the 2 MB scoring limit; split it before submitting.')
    raw = git(repo, 'show', f'{sha}:{path}').decode('utf8', errors='strict')
    if '\x00' in raw:
        return ''
    if pathlib.PurePosixPath(path).suffix == '.ipynb':
        nb = json.loads(raw)
        # Only code cells: outputs, execution counters, metadata and markdown never score.
        return '\n\n'.join(''.join(c.get('source', [])) for c in nb.get('cells', []) if c.get('cell_type') == 'code')
    if re.search(r'@generated|auto[- ]generated|automatically generated|do not edit', raw[:2000], re.I):
        return ''
    return raw

def normalized(text):
    return re.sub(r'\s+', '', text)

def functions(path, source):
    name = path + '.py' if path.endswith('.ipynb') else path
    result = lizard.analyze_file.analyze_source_code(name, source)
    lines = source.splitlines()
    return [(normalized('\n'.join(lines[f.start_line - 1:f.end_line])), f.cyclomatic_complexity) for f in result.function_list]

def metrics(repo, base, head):
    if not all(re.fullmatch(r'[0-9a-f]{40,64}', s) for s in [base, head]):
        raise ValueError('Expected immutable commit SHAs.')
    git(repo, 'merge-base', '--is-ancestor', base, head)
    entries = git(repo, 'diff', '-M', '-w', '--ignore-blank-lines', '--name-status', '-z', base, head, '--').decode().split('\x00')
    pairs = []
    i = 0
    while i < len(entries) and entries[i]:
        status, path = entries[i], entries[i+1]
        i += 2
        old, new = path, path
        if status[0] in 'RC':
            new = entries[i]; i += 1
        if status[0] == 'A': old = None
        if status[0] == 'D': new = None
        if included(new or old): pairs.append((old, new))
    if len(pairs) > 500:
        raise ValueError('More than 500 source files changed; split the task before submitting.')
    before_functions = collections.Counter()
    texts = []
    for old, new in pairs:
        a = read(repo, base, old) if old and included(old) else ''
        b = read(repo, head, new) if new and included(new) else ''
        texts.append((old, new, a, b))
        for signature, _ in functions(old or new, a): before_functions[signature] += 1
    added = deleted = complexity = 0
    files, test_files = [], []
    for old, new, a, b in texts:
        if normalized(a) == normalized(b): continue
        if (new or old).endswith('.ipynb') or not a or not b:
            # For notebook code cells and excluded/generated endpoints, normalize lines
            # before diffing; never count serialized notebook output or metadata.
            al = [normalized(x) for x in a.splitlines() if x.strip()]
            bl = [normalized(x) for x in b.splitlines() if x.strip()]
            adds = dels = 0
            for op, a1, a2, b1, b2 in difflib.SequenceMatcher(None, al, bl, autojunk=False).get_opcodes():
                if op in ('replace', 'delete'): dels += a2-a1
                if op in ('replace', 'insert'): adds += b2-b1
        else:
            diff = git(repo, 'diff', '-M', '-w', '--ignore-blank-lines', '--no-ext-diff', '--no-textconv', '--format=', '--unified=0', base, head, '--', *dict.fromkeys([old, new])).decode()
            adds = sum(x.startswith('+') and not x.startswith('+++') and bool(x[1:].strip()) for x in diff.splitlines())
            dels = sum(x.startswith('-') and not x.startswith('---') and bool(x[1:].strip()) for x in diff.splitlines())
        if not adds and not dels: continue
        added += adds; deleted += dels
        path = new or old
        (test_files if test_file(path) else files).append(path)
        for signature, cc in functions(path, b):
            # Unchanged or moved functions don't count as newly added logic.
            if before_functions[signature]: before_functions[signature] -= 1
            else: complexity += cc
    return {'added': added, 'deleted': deleted, 'L': max(added, deleted), 'C': complexity,
            'S': min(15, len(set(files))), 'source_files': files, 'test_files': test_files,
            'T': 0, 'R': 0}

def hours(m):
    return min(4, .4*math.log1p(m['L']/500) + .3*math.log1p(m['C']/10) + .15*math.log1p(m['S']) + .3*m.get('T', 0) + .4*m.get('R', 0))

if __name__ == '__main__':
    try:
        m = metrics(*sys.argv[1:4])
        print(json.dumps({'metrics': m, 'hours': hours(m), 'version': 'git-hours-v1'}))
    except Exception as e:
        print(str(e), file=sys.stderr)
        sys.exit(1)
