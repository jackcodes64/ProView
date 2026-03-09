# ProView Description 
---
> **ProView** is not just another process monitoring tool.  
> Imagine `top` with a brain; instead of throwing 'cryptic' numbers and endless rows, it highlights **meaningful insights**.  
> Abnormal patterns are singled out, relationships between processes are revealed, and administrators gain clarity for **early intervention** and **better understanding** of system behavior.

---

## Problem

Traditional UNIX process monitoring tools (`top`, `htop`, `ps`) produce verbose outputs that are:
- Hard to interpret at scale
- Focused on isolated metrics (CPU %, memory, nice value)
- Blind to **relationships** between processes, attributes, and resources

Admins often end up scanning one or two columns, missing the bigger picture.  
This deprives them of context: how processes interact, which ones are abnormal, and how third-party processes affect the main system.

---

## Solution

ProView bridges the gap between raw metrics and actionable insight:

1. **Collector (C)**  
   - A system program written in C++ runs on the Linux machine.  
   - Collects process metrics in real time.

2. **Backend (Node.js)**  
   - Receives data from the collector.  
   - Exposes REST APIs and WebSocket streams.  
   - Stores structured insights in SQL.

3. **Frontend (React)**  
   - Consumes APIs for real-time visualization.  
   - Presents **user-friendly dashboards** with charts, anomalies, and relationships.  
   - Powered by **Recharts** for interactive graphs.

4. **Insight Layer**  
   - Instead of raw dumps, ProView highlights:  
     - Abnormal CPU/memory usage  
     - Suspicious process hierarchies  
     - Resource contention patterns  
     - Early warning signals

---

##  Tech Stack

| Layer        | Technology |
|--------------|------------|
| Collector    | C (Linux system metrics) |
| Backend      | Node.js, WebSocket, SQL |
| Frontend     | React, Recharts |
| APIs         | REST, Gemini API |

---

##  Features

- Real-time process monitoring
- Anomaly detection (outliers, abnormal nice values, rogue processes)
- Relationship mapping between parent/child processes
- Interactive visualizations for admins
- Early intervention alerts

---

##  Getting Started

### Prerequisites
- Linux machine with GCC
- Node.js (>= 18.x)
- SQL database (MySQL)
- Yarn or npm for frontend

### Installation
```bash
# Clone repository
git clone https://github.com/jackcodes64/proview
cd proview

# Build collector
cd collector
make

cd ../backend
npm install

cd ../frontend
yarn install

cd ../
npm run dev
