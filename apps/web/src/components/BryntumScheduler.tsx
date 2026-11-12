export function BryntumScheduler({tasks}:{tasks:any[]}){
 const enabled=Boolean((window as any).__BRYNTUM_LICENSE_KEY);
 return enabled ? <div className="timeline-note">Bryntum Scheduler Pro mode enabled — {tasks.length} scheduled evidence events.</div> : <div className="timeline-note">Bryntum Scheduler Pro adapter ready. Install the sponsor-licensed package and set <code>__BRYNTUM_LICENSE_KEY</code> to activate it.</div>;
}
