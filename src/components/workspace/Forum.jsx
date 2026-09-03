import { useState } from 'react';
import { createPost, deletePost } from '../../lib/db';
import { initials } from './util';

function timeAgo(iso) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86_400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86_400)}d ago`;
}

export default function Forum({ ctx }) {
  const { user, forum, reload, notify } = ctx;
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);

  const post = async () => {
    const text = body.trim();
    if (!text) return;
    setBusy(true);
    try {
      await createPost({ body: text });
      setBody('');
      await reload();
    } catch (err) {
      notify(err?.message || 'Could not post.', 'err');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    try { await deletePost(id); await reload(); } catch (err) { notify(err?.message || 'Could not delete.', 'err'); }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-[-0.02em] text-ink-50">Forum</h1>
        <p className="mt-2 text-ink-300">Find teammates, share progress, ask for a hand. Recruiting a friend for a step? Post it here.</p>
      </div>

      {/* Composer */}
      <div className="border border-ink-700 bg-ink-900/60 p-4">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') post(); }}
          rows={3}
          placeholder="What are you working on? Who do you want to build with?"
          className="w-full bg-ink-950 border border-ink-800 focus:border-acid-500 px-3.5 py-3 text-ink-50 placeholder-ink-600 outline-none transition-colors resize-none text-sm"
        />
        <div className="mt-3 flex items-center justify-between">
          <span className="kicker text-ink-600">⌘/Ctrl + Enter</span>
          <button
            onClick={post}
            disabled={busy || !body.trim()}
            className="kicker text-ink-950 bg-acid-500 px-5 py-2.5 hover:bg-acid-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {busy ? 'Posting…' : 'Post →'}
          </button>
        </div>
      </div>

      {/* Posts */}
      {forum.length === 0 ? (
        <p className="kicker text-ink-600">No posts yet — start the conversation.</p>
      ) : (
        <div className="space-y-3">
          {forum.map((p) => (
            <div key={p.id} className="border border-ink-800 bg-ink-900/30 p-4">
              <div className="flex items-center gap-2.5 mb-2">
                <span className="font-mono text-[10px] w-7 h-7 border border-ink-700 flex items-center justify-center text-ink-300 shrink-0">{initials(p.author)}</span>
                <span className="text-[13px] text-ink-100">{p.author}</span>
                <span className="kicker text-ink-600">· {timeAgo(p.created_at)}</span>
                {p.user_id === user.id && (
                  <button onClick={() => remove(p.id)} className="ml-auto kicker text-ink-600 hover:text-[#fb7185] transition-colors">Delete</button>
                )}
              </div>
              <p className="text-sm text-ink-200 leading-relaxed whitespace-pre-wrap">{p.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
