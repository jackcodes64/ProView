#include <iostream>
#include <unistd.h>
#include <fcntl.h>
#include <fstream>

using namespace std;
int main(){
    string text;
    string bootPath = "/var/log/boot.log";
    string altPath = "/var/log/boot.log";
    string xdmPath = "/var/log/boot.log";
    string xorgPath = "/var/log/Xorg.0.log";

    ifstream reader(altPath);

    while(getline(reader, text)){
        cout<<text<<endl;
    }
    cout<<text.length()<<endl;
    reader.close();
}