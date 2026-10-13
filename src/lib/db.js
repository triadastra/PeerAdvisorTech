// ─────────────────────────────────────────────────────────────────────────
//  DATA ACCESS — thin helpers over our own API (see ./api.js and server/).
//  Reads and writes surface failures so the workspace can offer a retry
//  instead of misrepresenting an unavailable service as an empty workspace.
// ─────────────────────────────────────────────────────────────────────────

import { api } from './api.js';

// Client-side fallback VID; the server normally supplies the real one.
export function vidFor(user) {
  return user?.vid || '0x000000…00';
}

export const listProfiles = () => api.profiles();
export const listTasks = () => api.tasks();
export const listEvents = () => api.events();

export const createTask = (body) => api.createTask(body);
export const updateTask = (id, patch) => api.updateTask(id, patch);
export const deleteTask = (id) => api.deleteTask(id);

export const createEvent = (body) => api.createEvent(body);
export const deleteEvent = (id) => api.deleteEvent(id);

export const listTracks = () => api.tracks();
export const listAssignments = () => api.assignments();
export const createAssignment = (body) => api.createAssignment(body);
export const joinAssignment = (id) => api.joinAssignment(id);
export const leaveAssignment = (id) => api.leaveAssignment(id);

export const listForum = () => api.forum();
export const createPost = (body) => api.createPost(body);
export const deletePost = (id) => api.deletePost(id);
