#include <iostream>
#include <fstream>
#include <sstream>
#include <string>
#include <vector>
#include <unistd.h>
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

// Get memory usage from /proc/[pid]/status
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

void getProcessNumber(){
    std::string stat = readFile("/proc/stat");
    std::istringstream iss(stat);
    std::string line;
    while (std::getline(iss, line)) {
        if(line.find("processes") != std::string::npos){
            
        }
    }
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
// int countZombies() {
//     int zombies = 0;
//     DIR *dir = opendir("/proc");
//     if (!dir) return 0;

//     struct dirent *entry;
//     while ((entry = readdir(dir)) != nullptr) {
//         if (entry->d_type == DT_DIR) {
//             std::string pidjjStr = entry->d_name;
//             if (std::all_of(pidStr.begin(), pidStr.end(), ::isdigit)) {
//                 std::string status = readFile("/proc/" + pidStr + "/status");
//                 if (status.find("State:\tZ") != std::string::npos) {
//                     zombies++;
//                 }
//             }
//         }
//     }
//     closedir(dir);
//     return zombies;
// }

int main() {
    pid_t pid = getpid(); // Example: current process
    std::cout << "Metrics for PID: " << pid << std::endl;

    std::cout << "\n--- Memory Usage ---" << std::endl;
    getMemoryUsage(pid);

    std::cout << "\n--- Disk I/O ---" << std::endl;
    getDiskIO(pid);

    std::cout << "\n--- Priority ---" << std::endl;
    getPriority(pid);

    std::cout<<"\n--- CPU ---"<<std::endl;
    std::cout<<readFile("/proc/stat")<<std::endl;

    std::cout << "\n--- Zombie Processes ---" << std::endl;
    //std::cout << "Zombie count: " << countZombies() << std::endl;

    std::string sdouble = "77.8";
    std::cout<<std::stold(sdouble) *3 << std::endl;

    return 0;
}
