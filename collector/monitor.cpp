#include <iostream>
#include <fstream>
#include <sstream>
#include <string>
#include <algorithm>
#include <cctype>
#include <vector>
#include <cmath>
#include <unistd.h>
#include <stdexcept>
#include <dirent.h>
#include <sys/types.h>
#include <thread>
#include <sys/statvfs.h>
#include <tuple>

// Helper to read a file into a string
std::string readFile(const std::string &path) {
    std::ifstream file(path);
    if (!file.is_open()) return "";
    std::ostringstream ss;
    ss << file.rdbuf();
    return ss.str();
}
//Helper to convert seconds to minutes
double stoMinutes(const double seconds){
    return seconds/60;
}
//Helper to convert seconds to hours
double stoHours(const double seconds){
    return seconds/3600;
}
//Helper to convert kb to mb
double btoMB(const double kb){
    return kb/1024;
}
//Helper to convert kb to gb
double btoGB(const double kb){
    return kb/(1024*1024);
}
//Helper to convert seconds to human time
std::vector<int> stoHuman(const double seconds){
    std::vector<int> time;
    time.push_back(seconds/(24*60*60));
    time.push_back(static_cast<int>(seconds/(60*60))%24);
    time.push_back(static_cast<int>(seconds/60)%60);
    return time;
}

double getUptime(){
    double uptime {};
    double idle {};
    std::string stat = readFile("/proc/uptime");
    std::stringstream ss(stat);
    ss >> uptime >> idle;
    return uptime;
}

double getCPUIdle(){
    double uptime {};
    double idle {};
    std::string stat = readFile("/proc/uptime");
    std::stringstream ss(stat);
    ss >> uptime >> idle;
    return idle;
}

//get number of cores
int getCores(){
    int count{};
    std::string stat = readFile("/proc/stat");
    std::string line;
    std::stringstream ss(stat);
    while(std::getline(ss, line)){
        if(line.find("cpu") != std::string::npos){
            count++;
        }
    }
    return count-1;
}

//get specific core's metrics
std::vector<int> getCoreMetrics(const std::string &core){
    std::vector<int> metrics;
    std::string stat = readFile("/proc/stat");
    std::string line;
    std::stringstream ss(stat);
    while(std::getline(ss, line)){
        if(line.find(core) != std::string::npos){
            long column;
            std::string label;
            std::stringstream sss(line);
            sss>>label;
            while(sss >> column){
                metrics.push_back(column);
            }
            break;
        }
    }
    return metrics;
}

//get system load averages
std::vector<double> getLoadAverage(){
    std::vector<double> metrics;
    double column;
    std::stringstream ss(readFile("/proc/loadavg"));
    while(ss >> column){
        metrics.push_back(column);
    }
    return metrics;
}

//get system number of file descriptors
std::vector<long long> getFileDescriptors(){
    std::vector<long long> fds;
    long long fd;
    std::stringstream ss(readFile("/proc/sys/fs/file-nr"));
    while(ss >> fd){
        fds.push_back(fd);
    }
    return fds;
}

//get disk devices
std::vector<std::string> getDiskDevices(){
    std::vector<std::string> devices;
    std::string device;
    std::string line;
    std::stringstream ss(readFile("/proc/diskstats"));
    while(std::getline(ss, line)){
        std::stringstream sss(line);
        int a, b;
        sss>>a>>b>>device;
        devices.push_back(device);
    }
    return devices;
}

//get disk device metrics
std::vector<long> getDiskDevicesMetrics(const std::string dev){
    std::vector<long> metrics;
    std::string device;
    std::string line;
    std::stringstream ss(readFile("/proc/diskstats"));
    while(std::getline(ss, line)){
        if(line.find(dev) != std::string::npos){
        std::stringstream sss(line);
        int a, b, temp;
        sss>>a>>b>>device;
        metrics.push_back(a);
        metrics.push_back(b);
        while(sss >> temp){
            metrics.push_back(temp);
        }
        break;
        }
    }
    return metrics;
} 

// Get memory usage from /proc/[pid]/status per process
void getMemoryUsage(pid_t pid) {
    std::string status = readFile("/proc/" + std::to_string(pid) + "/status");
    std::istringstream iss(status);
    std::string line;
    while (std::getline(iss, line)) {
        if (line.find("VmRSS:") != std::string::npos || 
            line.find("VmSwap:") != std::string::npos) {
            std::cout << line << std::endl;
        }
    }
}

int statCount(const std::string label){
    int count {};
    std::string stat = readFile("/proc/stat");
    std::istringstream iss(stat);
    std::string line;
    while (std::getline(iss, line)) {
        if(line.rfind(label) != std::string::npos){
            std::stringstream ss(line);
            std::string labelN;
            ss>>labelN>>count;
            break;
        }
    }
    return count;
}

double memCount(const std::string label){
    double count {};
    std::string stat = readFile("/proc/meminfo");
    std::istringstream iss(stat);
    std::string line;
    while (std::getline(iss, line)) {
        if(line.find(label) != std::string::npos){
            std::stringstream ss(line);
            std::string labelN;
            ss>>labelN>>count;
            break;
        }
    }
    return count;
}

//get disk device paths
std::vector<std::string> getDiskPaths(){
    std::vector<std::string> mountpoints;
    std::string read = readFile("/proc/mounts");
    std::stringstream ss(read);
    std::string line;
    while(std::getline(ss, line)){
        std::stringstream sss(line);
        std::string device, mountpoint, fstype;
        if(sss >> device >> mountpoint>> fstype){
            struct statvfs buf;
            if(statvfs(mountpoint.c_str(), &buf)==0)
            mountpoints.push_back(mountpoint);
        }
    }
    return mountpoints;
}

//get disk usage
std::tuple<unsigned long long, unsigned long long,  unsigned long long> getDiskUsage(const std::string & path){
    struct statvfs buf;
    if(statvfs(path.c_str(), &buf) != 0){
        return {0, 0, 0};
    }
    unsigned long long total = buf.f_blocks*buf.f_frsize;
    unsigned long long available = buf.f_bavail*buf.f_frsize;
    unsigned long long used = total - available;
    return {total, available, used};
}

// Get disk I/O from /proc/[pid]/io
void getDiskIO(pid_t pid) {
    std::string io = readFile("/proc/" + std::to_string(pid) + "/io");
    std::cout << io << std::endl;
}

// Get process priority from /proc/[pid]/stat
void getPriority(pid_t pid) {
    std::string stat = readFile("/proc/" + std::to_string(pid) + "/stat");
    std::istringstream iss(stat);
    std::vector<std::string> fields;
    std::string field;
    while (iss >> field) fields.push_back(field);

    if (fields.size() > 18) {
        std::cout << "Priority: " << fields[17] << std::endl;
        std::cout << "Nice value: " << fields[18] << std::endl;
    }
}

// Count zombie processes
int countZombies() {
    int zombies = 0;
    DIR *dir = opendir("/proc");
    if (!dir) return 0;

    struct dirent *entry;
    while ((entry = readdir(dir)) != nullptr) {
        if (entry->d_type == DT_DIR) {
            std::string pidStr = entry->d_name;

            if (!pidStr.empty() &&
                std::all_of(pidStr.begin(), pidStr.end(),
                            [](unsigned char c){ return std::isdigit(c); })) {

                std::string status = readFile("/proc/" + pidStr + "/status");
                if (status.find("State:\tZ") != std::string::npos) {
                    zombies++;
                }
            }
        }
    }
    closedir(dir);
    return zombies;
}

int main() {
    pid_t pid = getpid(); //current process
    std::cout << "Metrics for PID: " << pid << std::endl;

    std::cout << "\n--- Memory Usage ---" << std::endl;
    getMemoryUsage(pid);

    std::cout << "\n--- Disk I/O ---" << std::endl;
    getDiskIO(pid);

    std::cout << "\n--- Priority ---" << std::endl;
    getPriority(pid);

    std::cout<<"\n--- CPU ---"<<std::endl;
    std::cout<<"CPU uptime is:"<<getUptime()<<" s"<<std::endl;
    std::cout<<"CPU idle time is:"<<getCPUIdle()<<" s"<<std::endl;
    std::cout<<"Number of CPU cores :"<<getCores()<<" cores"<<std::endl;
    std::cout<<"There are currently :"<<statCount("processes")<<" processes in the entire system (created since reboot)"<<std::endl;
    std::cout<<"There are currently :"<<statCount("ctxt")<<" context switches since reboot"<<std::endl;
    std::cout<<"There are currently :"<<statCount("proc_running")<<" running processes"<<std::endl;
    std::cout<<"There are currently :"<<statCount("proc_blocked")<<" blocked (waiting) processes"<<std::endl;
    std::cout<<"The system has been up for :"<<statCount("btime")/(60*60)<<" hours"<<std::endl;

    std::cout<<"____________________________________Total CPU Metrics________________________________"<<std::endl;
    std::vector<int> cpu = getCoreMetrics("cpu");
    std::cout<<"Time on user processes: "<<stoHours(cpu.at(0))<<" hours"<<std::endl;
    std::cout<<"Time on niced processes: "<<stoHours(cpu.at(1))<<" hours"<<std::endl;
    std::cout<<"Time on system processes: "<<stoHours(cpu.at(2))<<" hours"<<std::endl;
    std::cout<<"Time on idle: "<<stoHours(cpu.at(3))<<" hours"<<std::endl;
    std::cout<<"Time on stolen by other OSs: "<<cpu.at(7)<<" s"<<std::endl;
    std::cout<<"Time on guest processes: "<<cpu.at(8)<<" s"<<std::endl;
    std::cout<<"Time on guest's niced processes: "<<stoMinutes(cpu.at(9))<<" minutes"<<std::endl;
    std::cout<<"Time on iowait: "<<stoHours(cpu.at(4))<<" hours"<<std::endl;

    std::vector<int> cpuSamp1 = getCoreMetrics("cpu");
    std::this_thread::sleep_for(std::chrono::milliseconds(100));
    std::vector<int> cpuSamp2 = getCoreMetrics("cpu");
    long double cpuSum1{}, idleWait1{};
    long double cpuSum2{}, idleWait2{};
    for(size_t i {}; i < cpuSamp1.size(); i++){
        if(i == 3 || i == 4){
            idleWait1 += cpuSamp1.at(i);
        }
        cpuSum1 += cpuSamp1.at(i);
    }
    for(size_t i {}; i < cpuSamp2.size(); i++){
        if(i == 3 || i == 4){
            idleWait2 += cpuSamp2.at(i);
        }
        cpuSum2 += cpuSamp2.at(i);
    }
    long double deltaCPU = cpuSum2 - cpuSum1;
    long double deltaIdle = idleWait2 - idleWait1;
    long double usage = ((deltaCPU - deltaIdle) / deltaCPU) * 100.0;
    std::cout<<"CPU usage: "<<usage<<"%"<<std::endl;



    for(size_t i{}; i < getCores(); i++){
    std::cout<<"____________________________________Core "<< i+1 <<" Metrics________________________________"<<std::endl;
    std::string var = "cpu" + std::to_string(i);
    std::vector<int> cpu = getCoreMetrics(var);
    std::cout<<"Time on user processes: "<<stoHours(cpu.at(0))<<" hours"<<std::endl;
    std::cout<<"Time on niced processes: "<<stoHours(cpu.at(1))<<" hours"<<std::endl;
    std::cout<<"Time on system processes: "<<stoHours(cpu.at(2))<<" hours"<<std::endl;
    std::cout<<"Time on idle: "<<stoHours(cpu.at(3))<<" hours"<<std::endl;
    std::cout<<"Time on iowait: "<<stoHours(cpu.at(4))<<" hours"<<std::endl;
    std::cout<<"Time on stolen by other OSs: "<<cpu.at(7)<<" s"<<std::endl;
    std::cout<<"Time on guest processes: "<<cpu.at(8)<<" s"<<std::endl;
    std::cout<<"Time on guest's niced processes: "<<stoMinutes(cpu.at(9))<<" minutes"<<std::endl;
    }

    std::cout<<"\n--- Memory---"<<std::endl;
    std::cout<<"Total main memory :"<<memCount("MemTotal:")/1024<<" MB"<<std::endl;
    std::cout<<"Free main memory :"<<memCount("MemFree:")/1024<<" MB"<<std::endl;
    std::cout<<"Available memory :"<<memCount("MemAvailable:")/1024<<" MB (surrendered begrudgingly)"<<std::endl;
    std::cout<<"Used memory :"<<(memCount("MemTotal:") - memCount("MemAvailable:"))/1024<<" MB"<<std::endl;
    std::cout<<"Buffer memory :"<<memCount("Buffer:")/1024<<" MB"<<std::endl;
    std::cout<<"Cached memory :"<<memCount("Cached:")/1024<<" MB"<<std::endl;
    std::cout<<"Swapped but cached memory :"<<memCount("SwapCached:")/1024<<" MB"<<std::endl;
    std::cout<<"Active memory :"<<memCount("Active")/1024<<" MB"<<std::endl;
    std::cout<<"Total swap memory :"<<memCount("SwapFree")/(1024.0*1024.0)<<" GB"<<std::endl;
    std::cout<<"Used swap memory :"<<memCount("SwapFree")/1024<<" MB"<<std::endl;

    std::cout << "\n--- Zombie Processes ---" << std::endl;
    std::cout << "Zombie count: " << countZombies() << std::endl;

    std::cout<<"___________________________Load Averages________________________________"<<std::endl;
    std::vector<double> loadAvg = getLoadAverage();
    std::cout<<"Load average in the last 1 minute is: "<<loadAvg.at(0)<<std::endl;
    std::cout<<"Load average in the last 5 minute is: "<<loadAvg.at(1)<<std::endl;
    std::cout<<"Load average in the last 15 minute is: "<<loadAvg.at(2)<<std::endl;

    std::cout<<"___________________________File Descriptors________________________________"<<std::endl;
    std::vector<long long> fds = getFileDescriptors();
    std::cout<<"Used file descriptors: "<<fds.at(0)<<std::endl;
    std::cout<<"Allocated fds but not used: "<<fds.at(1)<<std::endl;
    std::cout<<"System file descriptors: "<<fds.at(2)<<std::endl;

    std::cout<<"___________________________Disk Devices________________________________"<<std::endl;
    std::vector<std::string> devs = getDiskDevices();
    std::cout<<"Number of divices: "<<devs.size()<<std::endl;
    for(size_t i{}; i < devs.size(); i++){
        std::cout<<"\n"<<i+1<<". _________Device "<<devs[i]<<" metrics_______"<<std::endl;
        std::vector<long> dev = getDiskDevicesMetrics(devs[i]);
        std::cout<<"Device name: "<<devs[i]<<std::endl;
        std::cout<<"Sectors read: "<<dev[4]<<std::endl;
        std::cout<<"Time spent: "<<stoMinutes(dev[5])<<" minutes"<<std::endl;
        std::cout<<"writes completed: "<<dev[6]<<std::endl;
        std::cout<<"Time spent writing : "<<stoMinutes(dev[9]/1000)<<" minutes"<<std::endl;
        std::cout<<"Time spent on I/Os : "<<stoMinutes(dev[11]/1000)<<" minutes"<<std::endl;
        std::cout<<"I/Os in progress : "<<dev[10]<<std::endl;
    }

    std::cout<<"_______________________________DISK USAGE______________________________"<<std::endl;
    std::vector<std::string> diskPaths = getDiskPaths();
    unsigned long long totalDisk{}, usedDisk{}, availableDisk{};
    for(auto path : getDiskPaths()){
    auto [total, available, used] = getDiskUsage(path);
    std::cout<<"For "<<path<<", total memory: "<<total/(1024*1024*1024)<<"GB | Available: "<<available/(1024*1024*1024)<<"GB | used: "<<used/(1024*1024*1024)<<"GB."<<std::endl;
    totalDisk += total;
    availableDisk += available;
    usedDisk += used;
    }
    std::cout<<"The total disk space is: "<<totalDisk/(1024*1024*1024)<<"GB"<<std::endl;
    std::cout<<"The available disk space is: "<<availableDisk/(1024*1024*1024)<<"GB"<<std::endl;
    std::cout<<"The used disk space is: "<<usedDisk/(1024*1024*1024)<<"GB"<<std::endl;
    return 0;
}
