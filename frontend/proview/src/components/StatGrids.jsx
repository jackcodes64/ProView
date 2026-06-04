import {useEffect} from "react"
import { Activity, Cpu, Database, Network } from 'lucid-react';

export function TopStats({ data }) {
  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-info">
          <div className="stat-header">
            <span className="stat-label">Total Processes</span>
          </div>
          <div className="stat-value-container">
            <span className="stat-value">{data.processes.length}</span>
            <span className="stat-change positive">{+4.4}%</span>
          </div>
        </div>
        <Activity size={16} color="#3b82f6" />
      </div>

      <div className="stat-card">
        <div className="stat-info">
          <div className="stat-header">
            <span className="stat-label">CPU Load</span>
          </div>
          <div className="stat-value-container">
            <span className="stat-value">
              {data.systemStats.cpuUsage}%
            </span>
            <span className="stat-change positive">
              NORMAL
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
              STABLE
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

export function BottomStats({ data }) {
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
