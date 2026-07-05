const API_BASE_URL = 'http://127.0.0.1:5000';

const FetchData = async () => {

  const loadAvgs = await fetchLoad();
 
  const cpuTimes = await fetchCpuTime();

  const processes = await fetchProcesses();

  function countZombies(){
    let count = 0;
    for(let proc of processes){
      if(proc.state === "R"){
        count++;
      }
    }
    return count;
  }

  const res = await fetchCpu();
  const {uptime, cores } = res[0];

  function getUptime(uptime){
    let days = Math.floor((uptime / (60*60*24)));
    let hours = Math.floor(((uptime / (60*60*24))- days) * (24));
    let min = (((((uptime / (60*60*24))- days) * (24)) - hours)*60).toFixed();
    return `${days}d ${hours}hrs ${min}min`;
  }

  function getLoad(){
    let latest = loadAvgs[0];
    for(let load of loadAvgs){
      if(latest.id < load.id){
        latest = load;
      }
    }
    return latest.last_1;
  }

  const disksData = await fetchDisks();

  const diskUsagePercent = Math.floor((disksData[0].used /disksData[0].total_space) * 100 );
  const cpuUsage = Math.floor(Math.random() * 100);

  const memoryData = await fetchMemory();
  const swapUsage = (memoryData[0].swap_used/(1024*1024)).toFixed(2);
  const memUsage = ((memoryData[0].used/memoryData[0].total)* 100).toFixed(0);

  const networkData = await fetchNetwork();

  const systemStats = {
    uptime: getUptime(uptime),
    diskUsage: `${diskUsagePercent}%`,
    diskUsagePercent,
    swapUsage: `${swapUsage}GB`,
    cores,
    cpuUsage,
    memUsage,
    zombies: countZombies(),
    load_avg: getLoad(),
  };

  const diskDevices = await fetchDiskDevices();

  //console.log(loadAvgs, cpuTimes, processes, systemStats, memoryData, disksData, diskDevices, networkData)

  return { loadAvgs, cpuTimes, processes, systemStats, memoryData, disksData, diskDevices, networkData };
};

const fetchMemory = async () => {
  const response = await fetch(`${API_BASE_URL}/memory`);
  return response.json();
};
const fetchDisks = async () => {
  const response = await fetch(`${API_BASE_URL}/disks`);
  return response.json();
};
const fetchDiskDevices = async () => {
  const response = await fetch(`${API_BASE_URL}/disk-devices`);
  return response.json();
};
const fetchNetwork = async () => {
  const response = await fetch(`${API_BASE_URL}/network`);
  return response.json();
};
 
const fetchCpuTime = async () => {
  const response = await fetch(`${API_BASE_URL}/cpu-time`);
  return response.json();
};
const fetchLoad = async () => {
  const response = await fetch(`${API_BASE_URL}/load-avgs`);
  return response.json();
};
const fetchProcesses = async () => {
  const response = await fetch(`${API_BASE_URL}/procs`);
  return response.json();
};
const fetchCpu = async () => {
  const response = await fetch(`${API_BASE_URL}/cpu`);
  return response.json();
};

export const fetchAllSystemData = async () => {
  return FetchData();
};

console.log(FetchData())