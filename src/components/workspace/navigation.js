export const tools = [
  { id: 'home', key: 'Studio', label: 'Overview', group: 'Workspace', description: 'Your next steps, active work, and a shortcut to every tool.' },
  { id: 'my-work', key: 'Timeline', label: 'My work', group: 'Workspace', description: 'Continue tasks you joined. Open your code workspace or finish a task.' },
  { id: 'projects', key: 'Groups & Tasks', label: 'Projects', group: 'Workspace', description: 'Browse project briefs, find a task, and join a team.' },
  { id: 'planner', key: 'Tasks & plans', label: 'Task planner', group: 'Organize', description: 'See team priorities and deadlines. Administrators publish these planning tasks.' },
  { id: 'calendar', key: 'Calendar', label: 'Calendar', group: 'Organize', description: 'Schedule a work session and see the team’s upcoming events.' },
  { id: 'contributions', key: 'Contributions', label: 'Contributions', group: 'Collaborate', description: 'Finish eligible Git assignments and review credited contribution hours.' },
  { id: 'discussion', key: 'Forum', label: 'Discussion', group: 'Collaborate', description: 'Find a teammate, ask for help, or share an update.' },
  { id: 'guide', key: 'Guide', label: 'Studio guide', group: 'Help', description: 'Learn which tool to use and how joining, code review, and contribution hours work.' },
];
export const toolFor = value => tools.find(t => t.id === value || t.key === value) || tools[0];
export function projectTaskState(task, now = Date.now()) {
  if (task.archived_at) return 'Archived';
  if (task.pr) return 'PR opened';
  if (task.status === 'done') return 'Completed';
  if (task.status === 'review' || task.submission) return 'In review';
  if (!task.recruiting_ends_at) return 'Ready to start';
  return Number(task.recruiting_ends_at) > now ? 'Finding teammates' : 'In progress';
}
export function myProjectTasks(projects, userId) {
  if (!userId) return [];
  return projects.flatMap(project => (project.tasks || [])
    .filter(task => !task.archived_at && task.members?.includes(userId))
    .map(task => ({ ...task, project_title: project.title })));
}
