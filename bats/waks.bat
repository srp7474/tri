@echo off
set jars=.\..\lib
set ExtraClasses=%jars%\waks.jar
set ExtraClasses=%ExtraClasses%;%jars%\gemscore.jar
set ExtraClasses=%ExtraClasses%;%jars%\gemstool.jar

if "%1" == "run" (
  rem callback so we get another crack at parsing new values
  echo PARMS %WAKSPGM% trns.util.WAKS %w1% %w2% %w3% %WAKSWAKS% %WSHIP% %2 %3 %4 %5 %6
  if "%WAKSPGM%" == "java" (
    java -cp %ExtraClasses% trns.util.WAKS %w1% %w2% %w3% %WAKSWAKS% %WSHIP% %2 %3 %4 %5 %6
  )
  if "%WAKSPGM%" == "node" (
    node ..\war\node-js\waks.js %w1% %w2% %w3% %WAKSWAKS% %WSHIP% %2 %3 %4 %5 %6
  )
  goto :EOF
)

if "%1" == "run-help" (
  if "%WAKSPGM%" == "java" (
    java -cp %ExtraClasses% trns.util.WAKS -h
  )
  if "%WAKSPGM%" == "node" (
    node ..\war\node-js\waks.js -h
  )
  goto :EOF
)


if "%1" == "echo" (
  rem callback so we get another crack at parsing new value
  if "%2" == "WAKSURL" echo configured: %2 %WAKSURL% %3
  if "%2" == "WAKSDIR" echo configured: %2 %WAKSDIR%
  if "%2" == "WAKSWAKS" echo configured: %2 %WAKSWAKS%
  goto :EOF
)

if "%1" == "set" (
  set WAKSWAKS=
  if "%4" == "" (
    echo missing required parameters
    goto help
  )
  set WAKSWAKS=-cust %2 -user %3 -pw %4
  waks echo WAKSWAKS
  goto :EOF
)

if "%1" == "dir" (
  set WAKSDIR=
  if "%2" == "" (
    echo missing required parameters
    goto help
  )
  set WAKSDIR=%2
  waks echo WAKSDIR
  goto :EOF
)

if "%1" == "site" (
  echo configure site
  rem %2 is gae or jitsu
  rem %3 is app name at that site
  if "%3" == "" (
    echo missing required parameters
    goto help
  )
  set WAKSURL=
  if "%2" == "gae" (
    set WAKSURL=http://%3.appspot.com/gems/cita/ajax.ajax
    waks echo WAKSURL
    set WAKSMODE=java
  )
  if "%2" == "jitsu" (
    set WAKSURL=http://%3.nodejitsu.com/gems/cita/ajax.ajax
    waks echo WAKSURL %WAKSURL%
    set WAKSMODE=node
  )
  goto :EOF
)

if "%WAKSWAKS%" == "" (
  echo WAKS not configured
  goto help
)

if "%WAKSDIR%" == "" (
  echo WAKSDIR not configured
  goto help
)

set w0=read

set WAKSPGM=
if exist java-flag.txt (
  set WAKSPGM=java
  set w1=-url http://localhost:8882/gems/cita/ajax.ajax
)

if exist node-flag.txt (
  set WAKSPGM=node
  set w1=-url http://localhost:8888/gems/cita/ajax.ajax
)

if "%1" == "prod" (
  if "%WAKSURL%" == "" (
    echo WAKSURL not configured needed for prod mode
    goto help
  )
  set w1=-url "%WAKSURL%"
  set WAKSPGM=%WAKSMODE%
  shift
)

set WSHIP=
if "%1" == "ship" (
  set WSHIP=-ship
  shift
)

if "%2" == "" (
  echo no type or key
  goto help
)

rem echo URL is %w1% app=%wsys%


rem Read file from server
set w2=-file %WAKSDIR%
set w3=-type %1 -name %2

waks run %3 %4 %5 %6 %7 %8

goto :EOF
:help
echo ---------------------------------- WAKS help ---------------------------------
echo WAKS transfers data between the local machine and the Google App Engine Server
echo .
echo Before the first use the
echo .
echo         WAKS set cust user password
echo   and   WAKS dir dirname
echo   and   WAKS site site-type site-id  (only when dealing with prod site)
echo .
echo commands to set the configuration and work directory
echo .
echo To read data issue command:
echo .
echo    WAKS [prod] type name
echo .
echo To ship data issue command:
echo .
echo    WAKS [prod] ship type name
echo .
echo where
echo   cust      - the application id. Use $ to access User records
echo   user      - the SuperUser id
echo   password  - the SuperUser password
echo   dirname   - fully qualified directory name
echo   [prod]    - coded as prod to trigger use of production URL
echo   site-id   - 1st node ID as site ID
echo   site-type - GAE for Google App Engine, jitsu for NodeJitsu site
echo   type      - record type (2nd part of store key)
echo   name      - name of record (3rd part or store key)
echo   ship      - coded as ship to trigger ship mode
echo  .
echo  ---------------- WAKS utility internal commands ----------------------------
call waks run-help

:done

