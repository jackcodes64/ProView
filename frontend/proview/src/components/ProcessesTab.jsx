export default function ProcessesTab({ data }) {
  return (
    <div className="processes-container">
      <div className="table-card">
        <div className="table-header">
          <h3 className="table-title">System Processes</h3>
          <div className="table-actions">
            <span className="table-count">{data.processes.length} total</span>
          </div>
        </div>
        <div className="table-wrapper">
          <table className="procs-table">
            <thead>
              <tr>
                <th>PID</th>
                <th>PR</th>
                <th>NI</th>
                <th>VIRT</th>
                <th>RES</th>
                <th>S</th>
                <th>%CPU</th>
                <th>TIME+</th>
                <th>COMMAND</th>
              </tr>
            </thead>
            <tbody>
              {data.processes.map((proc) => (
                <tr key={proc.pid}>
                  <td className="mono">{proc.pid}</td>
                  <td className="mono">{proc.pr}</td>
                  <td className="mono">{proc.nice}</td>
                  <td className="mono">{proc.virt || '0'}</td>
                  <td className="mono">{proc.res || '0'}</td>
                  <td className={`state-${proc.state}`}>{proc.state}</td>
                  <td className="mono">{proc.cpu.toFixed(1)}</td>
                  <td className="mono">{proc.time.toFixed(3)}</td>
                  <td className="cmd">{proc.cmd}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
