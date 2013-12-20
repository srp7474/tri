@echo off
rem Copyright 2009 Google Inc. All Rights Reserved.

rem Launches the AppCfg utility, which allows Google App Engine
rem developers to deploy their application to the cloud.

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



if '%1' == '' (
  java -Xmx1100m -cp %TRI_GAE%\lib\appengine-tools-api.jar com.google.appengine.tools.admin.AppCfg update ../war %*
)
if '%1' == 'rollback' (
  shift
  java -Xmx1100m -cp %TRI_GAE%\lib\appengine-tools-api.jar com.google.appengine.tools.admin.AppCfg rollback ../war %*
)
