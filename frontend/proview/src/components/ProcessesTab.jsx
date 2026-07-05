import {useState} from "react"
import {askGemini} from "../services/Gemini.js"

export default function ProcessesTab({ data }) {
  const [aiInsight, setaiInsight] = useState("");

  async function generateaiInsight(){
    const prompt = `Analyze the processes and system overview and provide insights(in relation to proceses): ${JSON.stringify(data)}, Give insight about the processes and recommendations in less than 150 letters.`;
    const insight = await askGemini(prompt);
    setaiInsight(insight);
  }
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
                <th>S</th>
                <th>TIME+</th>
                <th>COMMAND</th>
              </tr>
            </thead>
            <tbody>
              {data.processes.map((proc) => (
                <tr key={proc.pid}>
                  <td className="mono">{proc.pid}</td>
                  <td className={`state-${proc.state}`}>{proc.state}</td>
                  <td className="mono">{proc.time.toFixed(3)}</td>
                  <td className="cmd">{proc.cmd}</td>
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
