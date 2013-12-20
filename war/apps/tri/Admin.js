/*
 @license
 Copyright (c) 2013 by Steve Pritchard of Rexcel Systems Inc.
 This file is made available under the terms of the Creative Commons Attribution-ShareAlike 3.0 license
 http://creativecommons.org/licenses/by-sa/3.0/.
 Contact: public.pritchard@gmail.com
*/
"use strict";

// ---------------------------------------------------------------------------
/* This forces angular to load the tables and their dependencies
 *
 * We rely on the implied dependency injection to haul in only the tables needed and
 * thus automatically configure the system menus and available actions.
 */

loadOptTables();  // prime optional tables

function loadOptTables() {
  log("loading optional tables");
  var sURL = ""+window.location;
  var oResult = sURL.match(/[&?]tables=([^&].+)/);
  if (oResult != null) {
    var sTables = oResult[1];
    var sTbls = sTables.split(";");
    for(var i =0;i<sTbls.length;i += 1) {
      var sTbl = "../"+sTbls[i]+".js";
      $LAB.script(sTbl).wait(); // load table code, wait for load to complete
      log("Loaded  optional "+sTbl+" ("+(i+1)+" of "+sTbls.length+")");
    }
  }
}

function ctrlMain($injector,$scope,servSess,servGAE,tblUSR) {
  log("----------- Creating ctrlMain for Admin application");
  for(var i=0,iMax=oGBL.optTables.length; i<iMax; i+=1) {
    var sTbl = oGBL.optTables[i];
    log("injecting "+sTbl+" dependency");
    $scope[sTbl] = $injector.get(sTbl);
  }
  var sCust = "????";
  var sURL = ""+window.location;
  var oResult = sURL.match(/[&?]cust=([^&]+)/);
  if (oResult) sCust = oResult[1];
  servSess.setTitle("Triangular:Admin Functions ("+sCust+")");
  servGAE.setCust(sCust);
  if(localStorage['_admin_app_return']) {
    servSess.setOptMenuItems([{menu:"App Interface",func:xfrAppFunctions,role:'admin'}]);
  }
  return;


  function xfrAppFunctions() {
    var sURL = ""+window.location;
    var sRetApp = localStorage['_admin_app_return'];
    var nIX = sURL.indexOf("/apps");
    var sNewURL = sURL.substring(0,nIX)+sRetApp;
    localStorage['_admin_app_return'] = null;
    log("xfr "+sURL+" "+sRetApp+" "+sNewURL);
    window.location = sNewURL;
  }

}

