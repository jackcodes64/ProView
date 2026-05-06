const express = require("express")
const app = express();
const cors = require("cors");

app.use(express.json());
app.use(cors())

const mysql = require("mysql2");
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "disguise9",
    database: "processes",
    connectTimeout: 5000
})

app.get("/procs", (req, res)=>{
    connection.query(
        "SELECT * FROM PROCS WHERE timestamp = (SELECT MAX(timestamp) FROM PROCS) - 1", (err, rows)=>{
            if(err){
                console.log("An Error Occured While Fetching Procs");
                res.status(500).send("Error Retrieving Procs");
            }
            res.json(rows);
        });
})
app.get("/disks", (req, res)=>{
    connection.query(
        "SELECT * FROM DISKS ORDER BY timestamp DESC LIMIT 1", (err, rows)=>{
            if(err){
                console.log("An Error Occured While Fetching disks");
                res.status(500).send("Error Retrieving disks");
            }
            res.json(rows);
        });
})
app.get("/cpu-time", (req, res)=>{
    connection.query(
        "SELECT * FROM CPU_TIME ORDER BY timestamp DESC LIMIT 2", (err, rows)=>{
            if(err){
                console.log("An Error Occured While Fetching per cpu stats");
                res.status(500).send("Error Retrieving per cpu stats");
            }
            res.json(rows);
        });
})
app.get("/memory", (req, res)=>{
    connection.query(
        "SELECT * FROM MEMORY ORDER BY id DESC LIMIT 1", (err, rows)=>{
            if(err){
                console.log("An Error Occured While Fetching Memory");
                res.status(500).send("Error Retrieving Memory");
            }
            res.json(rows);
        });
})
app.get("/load-avgs", (req, res)=>{
    connection.query(
        "SELECT * FROM LOAD_AVGS ORDER BY id DESC LIMIT 20", (err, rows)=>{
            if(err){
                console.log("An Error Occured While Fetching load-avgs");
                res.status(500).send("Error Retrieving load-avgs");
            }
            res.json(rows);
        });
})
app.get("/file-descriptors", (req, res)=>{
    connection.query(
        "SELECT * FROM FILE_DESCRIPTORS", (err, rows)=>{
            if(err){
                console.log("An Error Occured While Fetching fds");
                res.status(500).send("Error Retrieving fds");
            }
            res.json(rows);
        });
})
app.get("/disk-devices", (req, res)=>{
    connection.query(
        "SELECT * FROM DISK_DEVICES ORDER BY id DESC LIMIT 5", (err, rows)=>{
            if(err){
                console.log("An Error Occured While Fetching Disk devices");
                res.status(500).send("Error Retrieving Disk Devices");
            }
            res.json(rows);
        });
})
app.get("/cpu", (req, res)=>{
    connection.query(
        "SELECT * FROM CPU ORDER BY id DESC LIMIT 1", (err, rows)=>{
            if(err){
                console.log("An Error Occured While Fetching CPU stats");
                res.status(500).send("Error Retrieving CPU stats");
            }
            res.json(rows);
        });
})
app.get("/network", (req, res)=>{
    connection.query(
        "SELECT * FROM NETWORK WHERE timestamp = (SELECT MAX(timestamp) FROM NETWORK)", (err, rows)=>{
            if(err){
                console.log("An Error Occured While Fetching net stats");
                res.status(500).send("Error Retrieving net stats");
            }
            res.json(rows);
        });
})

app.post('/metrics', async (req, res) => {
    const data = req.body;
    
    if(!data || typeof data !== 'object') {
        console.error("Invalid system data received");
        return res.status(400).send("Invalid System data");
    }

    console.log("API /metrics fetched with data:", data);

    console.log(data.cpu.uptime);
    try {
        connection.query(
            'INSERT INTO CPU(uptime, idle_time, cores, procs, context_switches, running_procs, blocked_procs) VALUES (?,?,?,?,?,?,?)',
            [data.cpu.uptime || 0,
            data.cpu.idle_time || 0,
            data.cpu.cores || 0,
            data.cpu.procs || 0,
            data.cpu.context_switches || 0,
            data.cpu.running_procs || 0,
            data.cpu.blocked_procs || 0]
        );

        connection.query(
            'INSERT INTO MEMORY(total, free, availabe, used, buffer, cached, swap_cached, active, swap_total, swap_free, swap_used) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
            [data.memory.total || 0, 
            data.memory.free || 0, 
            data.memory.available || 0, 
            data.memory.used || 0, 
            data.memory.buffer || 0, 
            data.memory.cached || 0, 
            data.memory.swap_cached || 0,
            data.memory.active || 0,
            data.memory.swap_total || 0,
            data.memory.swap_free || 0,
            data.memory.swap_used || 0,
        ]);

        for(let core of data.cores){
            connection.query(
            'INSERT INTO CPU_TIME(name, user_proc, nice_proc, sys_proc, idle, stolen, quest_proc, guest_niced, iowait) VALUES (?,?,?,?,?,?,?,?,?)',
            [
                core.name || "Unknown",
                core.user_proc || 0,
                core.nice_proc || 0,
                core.sys_proc || 0,
                core.idle || 0,
                core.stolen || 0,
                core.geust_proc || 0,
                core.guest_niced || 0,
                core.iowait || 0]
        );
        }
        for(let device of data.disk_devices){
            connection.query(
            'INSERT INTO DISK_DEVICES(name, sector_read, time_spent, writes_completed, time_writing, time_io, io_progressing) VALUES (?,?,?,?,?,?,?)',
            [
                device.name || "unknown",
                device.sectors_read || 0,
                device.time_spent || 0,
                device.writes_completed || 0,
                device.time_writing || 0,
                device.time_io || 0,
                device.io_progress || 0]
        );
        }

        connection.query(
            'INSERT INTO DISKS(number, total_space, available, used) VALUES (?,?,?,?)',
            [
                data.disk.number || 0, 
                data.disk.total || 0, 
                data.disk.available || 0, 
                data.disk.used || 0]
        );
        console.log("TOTAL DISK; ", data.disk.total);//debug

        connection.query(
            'INSERT INTO LOAD_AVGS(last_1, last_5, last_15) VALUES (?,?,?)',
            [data.loadavg.last_1 || 0,
            data.loadavg.last_5 || 0,
            data.loadavg.last_15 || 0]
        );

        connection.query(
            'INSERT INTO FILE_DESCRIPTORS(used_fd, allocated, system_fd) VALUES (?,?,?)',
            [data.fd.used_fd || 0,
            data.fd.allocated_fd || 0,
            data.fd.open || 0]
        );

        for(let face of data.network){
            connection.query(
                'INSERT INTO NETWORK(name, bytes, dropped, errors) VALUES (?,?,?,?)',
                [face.name || "Unknown",
                face.bytes || 0,
                face.dropped || 0,
                face.errors || 0]
            );
        }

        for(let proc of data.procs){
            connection.query(
                'INSERT INTO PROCS(pid, state, pr, nice, cpu, time, cmd) VALUES (?,?,?,?,?,?,?)',
                [   proc.pid ||0,
                    String.fromCharCode(proc.state) || "E",
                    proc.pr ||0,
                    proc.ni ||0,
                    proc.cpu ||0,
                    proc.time ||0,
                    proc.cmd || "Unknown"
                ]
            );
        }

        res.sendStatus(200);
    } catch (error) {
        console.error("Error inserting sytem metrics:" , error);
        res.status(500).send("Internal Server Error");
    }
});

app.listen(5000, ()=>{console.log("Server Running at port 5000")});
