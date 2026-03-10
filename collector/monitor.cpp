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

// Helper to read a file into a string
std::string readFile(const std::string &path) {
    std::ifstream file(path);
    if (!file.is_open()) return "";
    std::ostringstream ss;
    ss << file.rdbuf();
    return ss.str();
}
//Helper to convert seconds to minutes
int stoMinutes(const int seconds){
    return seconds/60;
}
//Helper to convert seconds to hours
int stoHours(const int seconds){
    return seconds/3600;
}
//Helper to convert bytes to mb
int btoMB(const int seconds){
    return seconds/1024;
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

    for(size_t i{}; i <= getCores(); i++){
    std::cout<<"____________________________________Total Core "<< i+1 <<" Metrics________________________________"<<std::endl;
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

    return 0;
}
