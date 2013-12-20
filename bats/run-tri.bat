@echo off
title Tri-Server: 8888
rem add -v on command line for verbose
del /q java-flag.txt
echo node>node-flag.txt
node ..\war\node-js\tri-server.js -port 8888 -quit -root appspage.html -base ./../war -db ./TRI-DB %1 %2 %3 %4 %5
