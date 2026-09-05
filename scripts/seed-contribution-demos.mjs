// Run only with the local API stopped. Demo records are separate from real credit.
import { data, save } from '../server/store.js';
import { scoreHours, schoolDay } from '../server/scoring.js';
const examples = [
  ['Club radar', 'Built club search and interest filters', 320, 27, 4],
  ['Lost & found', 'Added item categories and a clear empty state', 185, 12, 3],
  ['Study buddy', 'Implemented topic filters and resource cards', 470, 32, 5],
  ['Club radar', 'Improved keyboard navigation', 72, 8, 2],
  ['Lost & found', 'Renamed a component and adjusted whitespace', 0, 0, 0],
];
const students = [
  ...data.users.map(u => ({id:`demo-${u.id}`, name:u.name})),
  ...['Maya Chen', 'Ethan Wong', 'Sofia Patel', 'Leo Chan'].map((name,i)=>({id:`demo-student-${i}`,name})),
];
const now = new Date();
const day = schoolDay(now);
data.demo_contributions = students.map((student,i) => {
  const [project,title,L,C,S] = examples[i % examples.length];
  const metrics = {L,C,S,T:0,R:0,added:L,deleted:0,source_files:[],test_files:[]};
  const calculated=scoreHours(metrics);
  return {id:`demo-log-${student.id}`,demo:true,version:'demo',status:'demo',user_id:student.id,author:student.name,
    title,track_title:project,node_title:'Sample project activity',body:'Illustrative system log for the school activity feed. These sample metrics do not represent an actual Git push or award real credit.',
    metrics,credited_metrics:metrics,calculated_hours:calculated,hours:calculated>=.25?calculated:0,day,year:day.slice(0,4),created_at:new Date(now.getTime()-i*37*60*1000).toISOString()};
});
save();
console.log(`Saved ${data.demo_contributions.length} demo logs in the separate demo collection; real scores unchanged.`);
