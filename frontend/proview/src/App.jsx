import { useState, useEffect, useMemo, useCallback } from 'react';
import {askGemini} from "./services/Gemini.js"
import { 
  LayoutDashboard, 
  Activity, 
  Database, 
  Network, 
  Settings as SettingsIcon,
  RefreshCw,
  AlertCircle,
  Cpu,
  MoreVertical,
} from 'lucide-react';
import './App.css';

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

// Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ProcessesTab from './components/ProcessesTab';
import StorageTab from './components/StorageTab';
import NetworkTab from './components/NetworkTab';
import SettingsTab from './components/SettingsTab';

// API Service
import { fetchAllSystemData } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [settings, setSettings] = useState({
    cpuThreshold: 5,
    memThreshold: 90,
    diskThreshold: 85,
    refreshInterval: 2,
    themeColor: '#3b82f6',
    showNotifications: true,
    alertOnCritical: true,
    compactMode: false,
    showGridLines: true
  });

  const addNotification = useCallback((message, type = 'warning') => {
    const id = Date.now();
    setNotifications(prev => {
      // Don't add duplicate active alerts of the same type if they are very recent
      if (prev.length > 0 && prev[0].message === message && (id - prev[0].id) < 30000) {
        return prev;
      }
      return [{ id, message, type, timestamp: new Date(), read: false }, ...prev].slice(0, 20);
    });
  }, []);

  const loadData = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const result = await fetchAllSystemData();
      setData(result);
      
      //console.log(result);
      setError(null);

      // Check for alerts
      if (result.systemStats.load_avg > settings.cpuThreshold) {
        addNotification(`High CPU Load: ${result.systemStats.load_avg}`, 'critical');
      }
      if (result.systemStats.memUsage > settings.memThreshold) {
        addNotification(`High Memory Usage: ${result.systemStats.memUsage}%`, 'critical');
      }
      if (result.systemStats.diskUsagePercent > settings.diskThreshold) {
        addNotification(`High Disk Usage: ${result.systemStats.diskUsagePercent}`, 'critical');
      }

    } catch (err) {
      setError('Failed to connect to monitoring service. Please check your connection.');
      console.error(err);
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [settings.cpuThreshold, settings.memThreshold, settings.diskThreshold, addNotification]);

  useEffect(() => {
    loadData(true);
  }, [loadData]);

  useEffect(() => {
    if (!settings.refreshInterval) return;
    const interval = setInterval(() => {
      loadData();
    }, settings.refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [settings.refreshInterval, loadData]);

  useEffect(() => {
    document.documentElement.style.setProperty('--accent-color', settings.themeColor);
  }, [settings.themeColor]);

  const processStatesData = useMemo(() => {
    if (!data?.processes) return [];
    const statesMap = { "R": "Running", "S": "Sleeping", "D": "Disk Sleep", "Z": "Zombie", "T": "Stopped", "I":"Idle" };
    const counts = data.processes.reduce((acc, p) => {
      const label = statesMap[p.state] || p.state;
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {});

    return [
      { name: 'T-15', ...counts },
      { name: 'T-10', ...counts },
      { name: 'T-5', ...counts },
      { name: 'Now', ...counts }
    ];
  }, [data?.processes]);

  const sidebarItems = [
    { name: 'Overview', icon: LayoutDashboard },
    { name: 'Processes', icon: Activity },
    { name: 'Storage', icon: Database },
    { name: 'Network', icon: Network },
    { name: 'Settings', icon: SettingsIcon },
  ];

  const renderTabContent = () => {
    if (loading) return (
      <div className="loading-state">
        <RefreshCw className="spin-icon" size={48} />
        <p>Connecting to system metrics...</p>
      </div>
    );

    if (error) return (
      <div className="error-state">
        <AlertCircle size={48} color="#ef4444" />
        <h2>Connection Error</h2>
        <p>{error}</p>
        <button onClick={() => loadData(true)} className="retry-button">
          Retry Connection
        </button>
      </div>
    );

    if (!data) return null;

    switch (activeTab) {
      case 'Overview':
        return <OverviewTab data={data} processStatesData={processStatesData} settings={settings} />;
      case 'Processes':
        return <ProcessesTab data={data} settings={settings} />;
      case 'Storage':
        return <StorageTab data={data} settings={settings} />;
      case 'Network':
        return <NetworkTab data={data} settings={settings} />;
      case 'Settings':
        return <SettingsTab settings={settings} setSettings={setSettings} />;
      default:
        return null;
    }
  };

  return (
    <div className={`app-container ${settings.compactMode ? 'compact' : ''}`}>
      <Sidebar 
        sidebarItems={sidebarItems} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        notifications={notifications}
        setNotifications={setNotifications}
      />

      <main className="main-content">
        <Header activeTab={activeTab} />

        <div className="dashboard-scroll">
          {activeTab !== 'Settings' && data && <TopStats data={data} />}
          
          {renderTabContent()}

          {activeTab !== 'Settings' && data && <BottomStats data={data} />}
        </div>
      </main>
    </div>
  );
}

function TopStats({ data }) {
	//----%inc
	let procCount = 0;
	let pcInc = 0;
	function increase(){
	      procCount = data.processes.length; // can be 0
	      const prevCount = Number(localStorage.getItem("prevCount")) || 0; //can be zero
	      const percentageInc = prevCount > 0 ? (procCount - prevCount) / prevCount * 100 : 100;
	      pcInc = percentageInc.toFixed(2);
	}
	increase();
	
	useEffect(()=>{
		localStorage.setItem("prevCount", procCount);
	}, [procCount])
        //----%inc
  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-info">
          <div className="stat-header">
            <span className="stat-label">Total Processes</span>
          </div>
          <div className="stat-value-container">
            <span className="stat-value">{data.processes.length}</span>
            <span className="stat-change positive">{pcInc >=0?"+ ":'- '}{Math.abs(pcInc)}%</span>
          </div>
        </div>
        <Activity size={16} color="#3b82f6" />
      </div>

      <div className="stat-card">
        <div className="stat-info">
          <div className="stat-header">
            <span className="stat-label">Load Avg</span>
          </div>
          <div className="stat-value-container">
            <span className="stat-value">
              {data.systemStats.load_avg}
            </span>
            <span className="stat-change positive">
              {data.systemStats.load_avg < 3 ? "STABLE":(data.systemStats.load_avg < 4 ? "NORMAL":"HIGH")}
            </span>
          </div>
        </div>
        <Cpu size={16} color="#8b5cf6" />
      </div>

      <div className="stat-card">
        <div className="stat-info">
          <div className="stat-header">
            <span className="stat-label">Memory Usage</span>
          </div>
          <div className="stat-value-container">
            <span className="stat-value">{data.systemStats.memUsage}%</span>
            <span className="stat-change positive">
              {data.systemStats.memUsage < 50 ? "STABLE":(data.systemStats.memUsage < 70 ? "NORMAL":"HIGH")}
            </span>
          </div>
        </div>
        <Database size={16} color="#f59e0b" />
      </div>

      <div className="stat-card">
        <div className="stat-info">
          <div className="stat-header">
            <span className="stat-label">Zombies</span>
          </div>
          <div className="stat-value-container">
            <span className="stat-value">{data.systemStats.zombies}</span>
          </div>
        </div>
        <Network size={16} color="#10b981" />
      </div>
    </div>
  );
}
function BottomStats({ data }) {
  return (
    <div className="stats-grid" style={{ marginTop: '32px' }}>
      <div className="stat-card">
        <div className="stat-info">
          <div className="stat-header">
            <span className="stat-label">Uptime</span>
          </div>
          <div className="stat-value-container">
            <span className="stat-value">{data.systemStats.uptime}</span>
          </div>
        </div>
        <Activity size={16} color="#3b82f6" />
      </div>

      <div className="stat-card">
        <div className="stat-info">
          <div className="stat-header">
            <span className="stat-label">Disk Usage</span>
          </div>
          <div className="stat-value-container">
            <span className="stat-value">{data.systemStats.diskUsage}</span>
          </div>
        </div>
        <Database size={16} color="#f59e0b" />
      </div>

      <div className="stat-card">
        <div className="stat-info">
          <div className="stat-header">
            <span className="stat-label">Swap</span>
          </div>
          <div className="stat-value-container">
            <span className="stat-value">{data.systemStats.swapUsage}</span>
          </div>
        </div>
        <Database size={16} color="#ef4444" />
      </div>

      <div className="stat-card">
        <div className="stat-info">
          <div className="stat-header">
            <span className="stat-label">Cores</span>
          </div>
          <div className="stat-value-container">
            <span className="stat-value">{data.systemStats.cores}</span>
          </div>
        </div>
        <Cpu size={16} color="#8b5cf6" />
      </div>
    </div>
  );
}

function OverviewTab({ data, processStatesData, settings }) {

  const [aiInsight, setaiInsight] = useState("");

  async function generateaiInsight(){
    const prompt = `Analyze the process and system overview and provide insights: ${JSON.stringify(data)}, Make statements about the system state/overview, real insight and action in less than 150 letters.`;
    const insight = await askGemini(prompt);
    setaiInsight(insight);
  }

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

              <Line type="monotone" dataKey="Running" stroke="cyan" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Sleeping" stroke="blue" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Zombie" stroke="#a50c35" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Disk Sleep" stroke="yellow" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Idle" stroke="red" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Stopped" stroke="#10b981" strokeWidth={2} dot={false} />

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

      <div className="aiInsight">
            <div className="aiHeader"><h3>AI Insight</h3></div>
            <div className="aiBody">
              <button onClick={()=>generateaiInsight()}>Get Insight</button>
              <p dangerouslySetInnerHTML={{__html: aiInsight && typeof aiInsight === "string"?aiInsight:"Processing..."}}></p>
            </div>
        </div>
    </div>
  );
}
