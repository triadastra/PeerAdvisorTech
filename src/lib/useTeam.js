import { useEffect, useState } from 'react';
import { people } from '../data/people';
import { api } from './api';

export function useTeam() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    const refresh = () => api.team().then((rows) => {
      if (active) { setMembers(rows); setError(false); }
    }).catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    refresh();
    const timer = setInterval(refresh, 30000);
    window.addEventListener('focus', refresh);
    return () => { active = false; clearInterval(timer); window.removeEventListener('focus', refresh); };
  }, []);
  return { people: [...people, ...members], loading, error };
}
