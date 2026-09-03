// ─────────────────────────────────────────────────────────────────────────
//  DATA ACCESS — thin helpers over our own API (see ./api.js and server/).
//  Reads return [] on failure (e.g. signed out) so the workspace renders
//  empty rather than crashing; writes surface errors to the caller.
// ─────────────────────────────────────────────────────────────────────────

import { api } from './api';

// Client-side fallback VID; the server normally supplies the real one.
export function vidFor(user) {
  return user?.vid || '0x000000…00';
}

const safe = (promise) => promise.catch(() => []);

export const listProfiles = () => safe(api.profiles());
export const listTasks = () => safe(api.tasks());
export const listEvents = () => safe(api.events());

export const createTask = (body) => api.createTask(body);
export const updateTask = (id, patch) => api.updateTask(id, patch);
export const deleteTask = (id) => api.deleteTask(id);

export const createEvent = (body) => api.createEvent(body);
export const deleteEvent = (id) => api.deleteEvent(id);

export const listTracks = () => safe(api.tracks());
export const listAssignments = () => safe(api.assignments());
export const createAssignment = (body) => api.createAssignment(body);
export const joinAssignment = (id) => api.joinAssignment(id);
export const leaveAssignment = (id) => api.leaveAssignment(id);

export const listForum = () => safe(api.forum());
export const createPost = (body) => api.createPost(body);
export const deletePost = (id) => api.deletePost(id);
