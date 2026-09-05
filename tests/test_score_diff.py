import importlib.util
import json
import pathlib
import subprocess
import tempfile
import unittest

spec = importlib.util.spec_from_file_location('scorer', pathlib.Path(__file__).resolve().parents[1] / 'server/score_diff.py')
scorer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(scorer)

class DiffTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.repo = self.tmp.name
        self.git('init', '-q')
        self.git('config', 'user.name', 'Test')
        self.git('config', 'user.email', 'test@example.test')
        self.write('main.py', 'def pick(x):\n    if x:\n        return 1\n    return 0\n\ndef untouched(y):\n    if y:\n        return 3\n    return 4\n')
        self.base = self.commit()
    def tearDown(self): self.tmp.cleanup()
    def git(self, *args): return subprocess.check_output(['git', '-C', self.repo, *args], stderr=subprocess.DEVNULL).decode().strip()
    def write(self, name, text):
        path = pathlib.Path(self.repo) / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text)
    def commit(self):
        self.git('add', '.')
        self.git('commit', '-qm', 'fixture')
        return self.git('rev-parse', 'HEAD')
    def metrics(self): return scorer.metrics(self.repo, self.base, self.commit())
    def test_whitespace(self):
        self.write('main.py', (pathlib.Path(self.repo)/'main.py').read_text().replace('    ', '        ') + '\n\n')
        m = self.metrics()
        self.assertEqual((m['L'], m['C'], m['S']), (0, 0, 0))
    def test_rename(self):
        self.git('mv', 'main.py', 'renamed.py')
        m = self.metrics()
        self.assertEqual((m['L'], m['C'], m['S']), (0, 0, 0))
    def test_only_modified_function_complexity(self):
        self.write('main.py', (pathlib.Path(self.repo)/'main.py').read_text().replace('return 1', 'return 2'))
        m = self.metrics()
        self.assertEqual(m['L'], 1)
        self.assertEqual(m['C'], 2) # untouched function is not counted
    def test_exclusions(self):
        for f in ['package-lock.json', 'vendor/a.py', 'data/example.py', 'dist/app.js', 'app.generated.js', 'src/widget.d.ts']:
            self.write(f, 'def added(x):\n if x: return 3\n')
        m = self.metrics()
        self.assertEqual(m['L'], 0)
    def test_notebook_outputs(self):
        nb = {'cells':[{'cell_type':'code','source':['def hi():\n','    return 1'], 'outputs':[], 'execution_count':1}]}
        self.write('work.ipynb',json.dumps(nb)); self.base = self.commit()
        nb['cells'][0]['outputs'] = [{'text':['huge output'*1000]}]
        nb['cells'][0]['execution_count'] = 99
        self.write('work.ipynb',json.dumps(nb))
        self.assertEqual(self.metrics()['L'],0)
    def test_notebook_code(self):
        self.write('work.ipynb',json.dumps({'cells':[{'cell_type':'code','source':['def hi(x):\n','    if x: return 1\n','    return 0'], 'outputs':[{'text':['noise'*1000]}]}]}))
        m = self.metrics()
        self.assertEqual(m['L'],3);self.assertEqual(m['C'],2)
    def test_spread_and_tests(self):
        for i in range(20): self.write(f'src/file{i}.py','value = 1\n')
        self.write('tests/test_main.py','def test_pick():\n assert True\n')
        m = self.metrics()
        self.assertEqual(m['S'],15);self.assertEqual(m['T'],0)
        self.assertEqual(m['test_files'],['tests/test_main.py'])
    def test_added_deleted_max(self):
        self.write('main.py','def smaller():\n    return 2\n')
        m = self.metrics()
        self.assertEqual(m['L'],max(m['added'],m['deleted']))
        self.assertGreater(m['deleted'],m['added'])

if __name__ == '__main__': unittest.main()
