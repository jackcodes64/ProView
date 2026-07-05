import {useState} from "react"
import {askGemini} from "../services/Gemini.js"

export default function NetworkTab({ data }) {
  const [aiInsight, setaiInsight] = useState("");

  async function generateaiInsight(){
    const prompt = `Analyze the processes and system overview and provide insights (in relation to network): ${JSON.stringify(data)}, Give insight about the processes and recommendations in less than 200 letters.`;
    const insight = await askGemini(prompt);
    setaiInsight(insight);
  }

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
