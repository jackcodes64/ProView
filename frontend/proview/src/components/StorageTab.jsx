import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';

export default function StorageTab({ data, settings }) {
  return (
    <div className="storage-container">
      <div className="charts-grid">
        {/* Memory Pie Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Memory Distribution</h3>
              <p className="chart-subtitle">Physical memory allocation (KB)</p>
            </div>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Used', value: data.memoryData[0].used },
                    { name: 'Free', value: data.memoryData[0].free },
                    { name: 'Cached', value: data.memoryData[0].cached },
                    { name: 'Available', value: data.memoryData[0].availabe }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#3b82f6" />
                  <Cell fill="#10b981" />
                  <Cell fill="#8b5cf6" />
                  <Cell fill="green" />
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#141414', border: '1px solid #262626', borderRadius: '8px', fontSize: '12px' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Disk Usage Horizontal Bar */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Disk Space Usage</h3>
              <p className="chart-subtitle">Main storage volume (Bytes)</p>
            </div>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={[
                  {
                    name: 'Storage',
                    Total: data.disksData[0].total_space,
                    Used: data.disksData[0].used,
                    Available: data.disksData[0].available
                  }
                ]}
                margin={{ left: 20, right: 20, top: 20, bottom: 20 }}
              >
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" hide />
                <Tooltip contentStyle={{ backgroundColor: '#141414', border: '1px solid #262626', borderRadius: '8px', fontSize: '12px' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                <Bar dataKey="Used" fill="#ef4444" radius={[4, 4, 4, 4]} />
                <Bar dataKey="Available" fill="#10b981" radius={[4, 4, 4, 4]} />
                <Bar dataKey="Total" fill="#3b82f6" radius={[4, 4, 4, 4]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Partitions Vertical Bar */}
        <div className="chart-card full-width-chart">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">System Partitions & Devices</h3>
              <p className="chart-subtitle">Sector reads and I/O activity per device</p>
            </div>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.diskDevices}>
                {settings.showGridLines && <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />}
                <XAxis dataKey="name" stroke="#525252" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#525252" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#141414', border: '1px solid #262626', borderRadius: '8px', fontSize: '12px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                <Bar name="Sector Reads" dataKey="sector_read" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar name="Time Writing" dataKey="time_writing" fill="red" radius={[4, 4, 0, 0]} />
                <Bar name="Writes" dataKey="writes_completed" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
