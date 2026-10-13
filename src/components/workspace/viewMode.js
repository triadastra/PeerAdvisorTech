// Presentation only. The authenticated account and server authorization stay intact.
export function workspaceView(role, projectInfo, requestedMode) {
  const canSwitchView = role === 'Admin' || projectInfo?.admin === true;
  const studentView = canSwitchView && requestedMode === 'student';
  return {
    canSwitchView,
    studentView,
    role: studentView ? 'Member' : role,
    projectInfo: studentView && projectInfo ? { ...projectInfo, admin: false, review_url: null } : projectInfo,
  };
}
