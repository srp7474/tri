@echo off
title Triangular WebServer port 8882
set w0=%~dp0
set CPBASE=%w0%..

del /q node-flag.txt
echo java>java-flag.txt

rem ------- Configuaration point ---------
rem set TRI_GAE=your TRI_GAE unzip location plus gae-sdk or appengine-java-sdk-1.8.1.1
rem ------ end configuration point -------


if '%TRI_GAE%' == '' (
  echo Variable TRI_GAE not defined.  Please define and try again.
  goto :EOF
)

if not exist %TRI_GAE%\lib\appengine-remote-api.jar (
  echo Variable TRI_GAE does not point to compliant directory.  Please define and try again.
  goto :EOF
)

set GAEBASE=%TRI_GAE%
echo CWD %w0% CPBASE=%CPBASE%

set CPLIB=%CPBASE%\war\WEB-INF\lib
set CP=%CPBASE%\war\WEB-INF\classes
set CP=%CP%;%GAEBASE%\lib\appengine-tools-api.jar
set CP=%CP%;%GAEBASE%\lib\appengine-remote-api.jar
set CP=%CP%;%CPLIB%\bbbrun.jar
set CP=%CP%;%CPLIB%\ace.jar
set CP=%CP%;%CPLIB%\ACT.jar
set CP=%CP%;%CPLIB%\bbb.jar
set CP=%CP%;%CPLIB%\gemscore.jar
set CP=%CP%;%CPLIB%\gemstool.jar
set CP=%CP%;%CPLIB%\lib\impl\appengine-api.jar
set CP=%CP%;%CPLIB%\gemscore.jar
set CP=%CP%;%CPLIB%\gemstool.jar
set start_parms=--port=8882 --address=0.0.0.0 --disable_update_check --sdk_root=%GAEBASE%

set AGENT=-javaagent:%GAEBASE%\lib\agent\appengine-agent.jar
rem gemsprops=--jvm_flag=-DCOMPUTERNAME=%COMPUTERNAME% --jvm_flag=-Dsys.prime=true
set gemsprops=--jvm_flag=-DCOMPUTERNAME=%COMPUTERNAME%

echo -----------------------CitaRun Starting -----------------------------
echo path=%CP%
java  -cp %CP%  com.google.appengine.tools.KickStart %gemsprops% com.google.appengine.tools.development.DevAppServerMain %start_parms% %1 %2 %3 %4 %5 %6 %CPBASE%\war

goto done
:done
