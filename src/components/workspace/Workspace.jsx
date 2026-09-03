import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../lib/authContext';
import { vidFor, listTracks, listAssignments, listForum, createAssignment } from '../../lib/db';
import { initials } from './util';
import MyTimeline from './MyTimeline';
import Groups from './Groups';
import Forum from './Forum';
import WorkOnItModal from './WorkOnItModal';

const TABS = ['Timeline', 'Groups & Tasks', 'Forum'];

export default function Workspace() {
  const { user, profile, signOut } = useAuth();
  const [tab, setTab] = useState('Timeline');
  const [tracks, setTracks] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [forum, setForum] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  // Work-on-it modal: { track, node } while choosing → confirmed assignment reveals the git link.
  const [modal, setModal] = useState(null);

  const reload = useCallback(async () => {
    const [tr, a, f] = await Promise.all([listTracks(), listAssignments(), listForum()]);
    setTracks(tr);
    setAssignments(a);
    setForum(f);
    setLoading(false);
  }, []);

  // Initial load (async IIFE so the effect body itself sets no state synchronously).
  useEffect(() => {
    let active = true;
    (async () => {
      const [tr, a, f] = await Promise.all([listTracks(), listAssignments(), listForum()]);
      if (!active) return;
      setTracks(tr);
      setAssignments(a);
      setForum(f);
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  const notify = useCallback((msg, type = 'ok') => {
    clearTimeout(toastTimer.current);
    setToast({ msg, type });
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  const name = profile?.name || user?.name || user?.email?.split('@')[0] || 'Member';
  const role = profile?.role || user?.role || 'Member';
  const vid = profile?.vid || vidFor(user);

  const myAssignments = assignments.filter((a) => a.member_ids?.includes(user?.id));
  const go = (t) => setTab(t);
  const openWorkOn = (track, node) => setModal({ track, node, phase: 'confirm' });

  // Confirm → create/join the claim; on success the modal shows the git link.
  const confirmWorkOn = useCallback(async () => {
    if (!modal?.node) return;
    setModal((m) => ({ ...m, busy: true }));
    try {
      const assignment = await createAssignment({ node_id: modal.node.id });
      await reload();
      setModal((m) => ({ ...m, busy: false, phase: 'done', assignment }));
    } catch (err) {
      setModal((m) => ({ ...m, busy: false }));
      notify(err?.message || 'Could not start this step.', 'err');
    }
  }, [modal, reload, notify]);

  const ctx = {
    user, name, role, vid,
    tracks, assignments, forum, myAssignments,
    loading, reload, notify, go, tab,
    openWorkOn,
    setForum,
  };

  const Section = { Timeline: MyTimeline, 'Groups & Tasks': Groups, Forum }[tab];

  return (
    <div className="min-h-screen">
      {/* ── Top bar ── */}
      <div className="sticky top-0 z-40 bg-ink-950/90 backdrop-blur-md border-b border-ink-800">
        <div className="mx-auto max-w-[1100px] px-4 md:px-6 h-[60px] flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <span className="inline-block w-2 h-2 bg-acid-500" />
            <span className="font-mono text-sm font-semibold text-ink-50">PATD<span className="text-ink-500 font-normal">/workspace</span></span>
          </Link>
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-[10px] w-8 h-8 border border-acid-500/30 flex items-center justify-center text-acid-500 shrink-0">{initials(name)}</span>
            <div className="hidden sm:block leading-tight">
              <div className="text-[13px] text-ink-100">{name}</div>
              <div className="kicker text-ink-700">{vid}</div>
            </div>
            <button
              onClick={signOut}
              className="ml-2 kicker text-ink-500 hover:text-ink-200 transition-colors border border-ink-800 hover:border-ink-600 px-2.5 py-1"
            >
              Exit
            </button>
          </div>
        </div>
        {/* ── Tab strip ── */}
        <div className="mx-auto max-w-[1100px] px-4 md:px-6">
          <div className="flex items-center gap-7 md:gap-9 overflow-x-auto no-scrollbar">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => go(t)}
                className={`kicker shrink-0 py-3 -mb-px border-b-2 transition-colors ${
                  tab === t ? 'text-ink-50 border-acid-500' : 'text-ink-500 border-transparent hover:text-ink-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Active section ── */}
      <div className="mx-auto max-w-[1100px] px-4 md:px-6 py-8 md:py-10">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="min-w-0">
          {loading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3].map((i) => <div key={i} className="h-14 border border-ink-800 bg-ink-900/30" />)}
            </div>
          ) : (
            Section && <Section ctx={ctx} />
          )}
        </motion.div>
      </div>

      {/* ── Work-on-it modal ── */}
      <AnimatePresence>
        {modal && (
          <WorkOnItModal
            modal={modal}
            assignments={assignments}
            onConfirm={confirmWorkOn}
            onClose={() => { setModal(null); if (modal.phase === 'done') go('Timeline'); }}
            onInvite={() => go('Forum')}
          />
        )}
      </AnimatePresence>

      {/* ── Toast ── */}
      {toast && (
        <motion.div
          key={toast.msg}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-ink-900 border border-ink-800 px-4 py-3 max-w-xs"
        >
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: toast.type === 'err' ? '#fb7185' : '#c8f135' }} />
          <span className="text-sm text-ink-100 leading-snug">{toast.msg}</span>
        </motion.div>
      )}
    </div>
  );
}
