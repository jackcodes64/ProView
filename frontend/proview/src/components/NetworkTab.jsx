export default function NetworkTab({ data }) {
  return (
    <div className="network-container">
      <div className="table-card">
        <div className="table-header">
          <h3 className="table-title">Network Interfaces</h3>
          <div className="table-actions">
            <span className="table-count">{data.networkData.length} interfaces</span>
          </div>
        </div>
        <div className="table-wrapper">
          <table className="procs-table">
            <thead>
              <tr>
                <th>INTERFACE</th>
                <th>BYTES RECEIVED</th>
                <th>DROPPED</th>
                <th>ERRORS</th>
                <th>TIMESTAMP</th>
              </tr>
            </thead>
            <tbody>
              {data.networkData.map((net) => (
                <tr key={net.id}>
                  <td className="cmd">{net.name}</td>
                  <td className="mono">{(net.bytes / 1024 / 1024).toFixed(2)} MB</td>
                  <td className={net.dropped > 0 ? 'state-Z' : 'mono'}>{net.dropped}</td>
                  <td className={net.errors > 0 ? 'state-Z' : 'mono'}>{net.errors}</td>
                  <td className="mono">{new Date(net.timestamp).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
