@echo off
rem Copyright 2009 Google Inc. All Rights Reserved.

rem Launches the AppCfg utility, which allows Google App Engine
rem developers to deploy their application to the cloud.

rem This is adapted to update the prod version and then ship it to google

if '%TRI_GAE%' == '' (
  set TRI_GAE=D:\pgms\gae\appengine-java-sdk-1.8.1.1
)

REM ***** Note - find a better way to fix index.html
copy /u /e /s /[!cita.ace bbb.ace run-ws.bat web-server.js appengine-web.xml web.xml TRI-DB\*] ..\..\war\*.* ..\..\prod\war
copy ..\..\variants\index-gae.html ..\..\prod\war\index.html

if '%1' == '' (
  java -Xmx1100m -cp %TRI_GAE%\lib\appengine-tools-api.jar com.google.appengine.tools.admin.AppCfg --email=srp7474 update ../../prod/war %*
)
if '%1' == 'rollback' (
  shift
  java -Xmx1100m -cp %TRI_GAE%\lib\appengine-tools-api.jar com.google.appengine.tools.admin.AppCfg --email=srp7474 rollback ../../prod/war %*
)
