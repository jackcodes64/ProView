import { ShieldAlert, Sliders } from 'lucide-react';

export default function SettingsTab({ settings, setSettings }) {
  return (
    <div className="settings-container">
      <div className="settings-grid">
        <div className="settings-card">
          <div className="settings-header">
            <div className="settings-title-group">
              <ShieldAlert size={18} className="settings-icon-accent" />
              <div>
                <h3 className="settings-title">Alert Thresholds</h3>
                <p className="settings-subtitle">Configure when the system should trigger warnings</p>
              </div>
            </div>
          </div>
          <div className="settings-body">
            <div className="setting-item">
              <div className="setting-info">
                <label>CPU Load Threshold</label>
                <span>Trigger alert when CPU exceeds this value</span>
              </div>
              <input 
                type="range" min="0" max="5" 
                value={settings.cpuThreshold} 
                onChange={(e) => setSettings({...settings, cpuThreshold: parseInt(e.target.value)})}
                className="setting-range"
              />
              <span className="setting-value">{settings.cpuThreshold}</span>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <label>Memory Usage Threshold (%)</label>
                <span>Trigger alert when RAM exceeds this value</span>
              </div>
              <input 
                type="range" min="1" max="100" 
                value={settings.memThreshold} 
                onChange={(e) => setSettings({...settings, memThreshold: parseInt(e.target.value)})}
                className="setting-range"
              />
              <span className="setting-value">{settings.memThreshold}%</span>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <label>Disk Usage Threshold (%)</label>
                <span>Trigger alert when Disk exceeds this value</span>
              </div>
              <input 
                type="range" min="1" max="100" 
                value={settings.diskThreshold} 
                onChange={(e) => setSettings({...settings, diskThreshold: parseInt(e.target.value)})}
                className="setting-range"
              />
              <span className="setting-value">{settings.diskThreshold}%</span>
            </div>
          </div>
        </div>

        <div className="settings-card">
          <div className="settings-header">
            <div className="settings-title-group">
              <Sliders size={18} className="settings-icon-accent" />
              <div>
                <h3 className="settings-title">Creative Settings</h3>
                <p className="settings-subtitle">Personalize your monitoring experience</p>
              </div>
            </div>
          </div>
          <div className="settings-body">
            <div className="setting-item">
              <div className="setting-info">
                <label>Refresh Interval (seconds)</label>
                <span>How often the data updates</span>
              </div>
              <select 
                value={settings.refreshInterval} 
                onChange={(e) => setSettings({...settings, refreshInterval: parseInt(e.target.value)})}
                className="setting-select"
              >
                <option value={1}>1 second</option>
                <option value={2}>2 seconds</option>
                <option value={5}>5 seconds</option>
                <option value={10}>10 seconds</option>
                <option value={30}>30 seconds</option>
              </select>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <label>Accent Color</label>
                <span>Choose the primary UI color</span>
              </div>
              <div className="color-picker">
                {['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'].map(color => (
                  <button 
                    key={color}
                    className={`color-swatch ${settings.themeColor === color ? 'active' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSettings({...settings, themeColor: color})}
                  />
                ))}
              </div>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <label>Critical Alerts</label>
                <span>Enable system-wide critical notifications</span>
              </div>
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={settings.alertOnCritical}
                  onChange={(e) => setSettings({...settings, alertOnCritical: e.target.checked})}
                />
                <span className="slider round"></span>
              </label>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <label>Compact Mode</label>
                <span>Reduce spacing for high-density information</span>
              </div>
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={settings.compactMode}
                  onChange={(e) => setSettings({...settings, compactMode: e.target.checked})}
                />
                <span className="slider round"></span>
              </label>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <label>Show Grid Lines</label>
                <span>Toggle grid lines on all charts</span>
              </div>
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={settings.showGridLines}
                  onChange={(e) => setSettings({...settings, showGridLines: e.target.checked})}
                />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
