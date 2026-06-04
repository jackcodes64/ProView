import { MoreVertical } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Legend
} from 'recharts';

export default  function OverviewTab({ data, processStatesData, settings }) {
  return (
    <div className="charts-grid">
      <div className="chart-card">
        <div className="chart-header">
          <div>
            <h3 className="chart-title">Process States</h3>
            <p className="chart-subtitle">Distribution of process lifecycle states</p>
          </div>
          <MoreVertical size={16} color="#737373" />
        </div>
        <div className="chart-body">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={processStatesData}>
              {settings.showGridLines && <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />}
              <XAxis dataKey="name" stroke="#525252" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#525252" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#141414', border: '1px solid #262626', borderRadius: '8px', fontSize: '12px' }} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
              <Line type="monotone" dataKey="Running" stroke="#3b82f6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Sleeping" stroke="#8b5cf6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Zombie" stroke="#a50c35" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Dead" stroke="#080316" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Idle" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-card">
        <div className="chart-header">
          <div>
            <h3 className="chart-title">Load Averages</h3>
            <p className="chart-subtitle">System load over 1, 5, and 15 minute intervals</p>
          </div>
          <MoreVertical size={16} color="#737373" />
        </div>
        <div className="chart-body">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.loadAvgs}>
              {settings.showGridLines && <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />}
              <XAxis 
                dataKey="timestamp" 
                stroke="#525252" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(str) => new Date(str).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              />
              <YAxis stroke="#525252" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#141414', border: '1px solid #262626', borderRadius: '8px', fontSize: '12px' }} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
              <Line name="1 min" type="monotone" dataKey="last_1" stroke="#3b82f6" strokeWidth={2} dot={false} />
              <Line name="5 min" type="monotone" dataKey="last_5" stroke="#f59e0b" strokeWidth={2} dot={false} />
              <Line name="15 min" type="monotone" dataKey="last_15" stroke="#ef4444" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-card full-width-chart">
        <div className="chart-header">
          <div>
            <h3 className="chart-title">CPU Core Utilization</h3>
            <p className="chart-subtitle">Real-time breakdown of CPU core time distribution</p>
          </div>
          <div className="chart-legend">
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#3b82f6' }}></div>
              <span className="legend-label">User</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#8b5cf6' }}></div>
              <span className="legend-label">System</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#262626' }}></div>
              <span className="legend-label">Idle</span>
            </div>
          </div>
        </div>
        <div className="chart-body">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.cpuTimes} layout="vertical" margin={{ left: 20 }}>
              {settings.showGridLines && <CartesianGrid strokeDasharray="3 3" stroke="#262626" horizontal={false} />}
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" stroke="#525252" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: '#ffffff05' }} contentStyle={{ backgroundColor: '#141414', border: '1px solid #262626', borderRadius: '8px', fontSize: '12px' }} />
              <Bar dataKey="user_proc" stackId="a" fill="#3b82f6" />
              <Bar dataKey="sys_proc" stackId="a" fill="#8b5cf6" />
              <Bar dataKey="iowait" stackId="a" fill="#f59e0b" />
              <Bar dataKey="idle" stackId="a" fill="#262626" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
