import { SidebarLayout } from "@/components/SidebarLayout";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";

const data = [
  { name: 'Week 1', score: 5.5 },
  { name: 'Week 2', score: 6.0 },
  { name: 'Week 3', score: 6.0 },
  { name: 'Week 4', score: 6.5 },
  { name: 'Week 5', score: 7.0 },
  { name: 'Current', score: 7.5 },
];

const skillData = [
  { name: 'Reading', score: 8.0, color: '#10b981' },
  { name: 'Listening', score: 7.5, color: '#3b82f6' },
  { name: 'Speaking', score: 7.0, color: '#f59e0b' },
  { name: 'Writing', score: 6.0, color: '#ef4444' },
];

export default function Analytics() {
  return (
    <SidebarLayout>
       <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Performance Analytics</h1>
        <p className="text-muted-foreground mt-1">Detailed breakdown of your progress and skills.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Progress Chart */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
          <h3 className="font-bold mb-6">Overall Band Progression</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0891b2" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#0891b2" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} dy={10} />
                <YAxis domain={[0, 9]} axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                />
                <Area type="monotone" dataKey="score" stroke="#0891b2" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Skill Breakdown */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
          <h3 className="font-bold mb-6">Skill Breakdown</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skillData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                <XAxis type="number" domain={[0, 9]} hide />
                <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 12, fontWeight: 500}} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '12px'}} />
                <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={30}>
                  {skillData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
