// One policy for the card UI. The server remains authoritative for permissions.
export function taskAccess(task, userId, admin, now = Date.now()) {
  const joined = !!userId && (task.members || []).includes(userId);
  const archived = !!task.archived_at;
  const finished = task.status === 'done' || !!task.pr;
  const reviewing = !finished && (task.status === 'review' || !!task.submission);
  const closed = !!task.recruiting_ends_at && Number(task.recruiting_ends_at) <= now;
  return {
    joined, archived, finished, reviewing, closed,
    canJoin: !joined && !archived && !finished && !reviewing && task.status === 'open' && !closed,
    canWork: !archived && !finished && !!task.repository && (joined || admin),
    canComplete: joined && !archived && !finished && !task.repository,
    canManage: !!admin,
    canReview: !!admin && !archived && reviewing && !!task.repository,
  };
}
export const plural = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`;
export function studioLink(view, projectId, taskId, origin = window.location.origin) {
  const url = new URL('/workspace', origin);
  url.searchParams.set('view', view);
  if (projectId) url.searchParams.set('project', projectId);
  if (taskId) url.searchParams.set('task', taskId);
  return url.href;
}
