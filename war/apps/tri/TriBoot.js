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

function ctrlMain($scope,servSess,servGAE,servREG,servCRUD) {
  log("Created ctrlMain for TriBoot page");
  servGAE.setCust("???");
  servSess.setTitle("TriBoot - Triangular: AngularJS Booster - Application Admin");
  $scope.oApps = null;
  servSess.setBootExit(bootExit);

  $scope.getTitle            = function() {return servSess.getTitle();}

  function bootExit() {
    servGAE.setURL(servGAE.getURL().replace(/cita/,"boot"));  // Causes Req not B3Req object inside gems server
    log("calling boot exit "+servGAE.getURL());
    servGAE.validateStore(storeOK,storeNAK);

    function storeOK(status,data) {
      log("StoreOK status=%o data=%o",status,data);
    }

    function storeNAK(status,data) {
      log("StoreNAK status=%o %o",status,data);
      if (data.trap) {
        var sLines = (""+data.trap).split(/\n/);
        log("StoreNAK data=%o",data);
        for(var i=0,iMax=sLines.length; i<iMax; i+=1) {
          log("line"+i+":"+sLines[i]);
        }
      }
      if (data['status-message'] == "not-primed") {
        log("get ready to prime");
        $scope.oObj = {};
        //$scope.oObj = {User:'srp',NewPassword:'xx',ConfirmPassword:'xx'};
        servSess.setUser('SINGLE',null,null);
        servSess.setSect('PrimeSystem');
      }
    }

    $scope.primeStore = function(scope) {
      var oObj = $scope.oObj;
      log("request primeStore "+oObj.User+" "+oObj.NewPassword+" "+oObj.ConfirmPassword);
      servSess.setErrorMsg(null);
      if (!oObj.User || oObj.User.length == 0) return servSess.setErrorMsg("Invalid Userid");
      if (!oObj.NewPassword || (oObj.NewPassword.length == 0)) {
        return servSess.setErrorMsg("New password required");
      }
      if (oObj.NewPassword && oObj.NewPassword.match(/[a-zA-Z]/) == null) {
         return servSess.setErrorMsg("New password must contain at least one alphabetic character");
      }
      if (oObj.NewPassword != oObj.ConfirmPassword) {
        return servSess.setErrorMsg("Password differs from Confirm Password");
      }

      servGAE.primeStore(oObj.User,oObj.NewPassword,primeOK,primeFail);

      function primeOK(status,data) {
        log("prime worked %o %o",status,data);
        window.location.reload();
      }
      function primeFail(status,data) {
        log("prime failed %o %o",status,data);
      }
    }

    $scope.isLocalDatastore = function() {
      var sURL = ""+window.location;
      if (sURL.match(/localhost:/i)) return true;
      return false;
    }


    $scope.superLogin = function(scope) {
      log("super user login "+scope.UserName+" "+scope.Password);
      servGAE.superLogin(scope.UserName,scope.Password,loginOK,loginFail);
      function loginOK(status,data) {
        log("login worked %o %o",status,data);
        servSess.setErrorMsg(null);
        servSess.setSect('AdminSystem');
        servSess.setConfirmMsg('SuperUser login successful');
        $scope.oUser = {user:scope.UserName,password:scope.Password};
        $scope.oObj  = {};
        listApps();
      }
      function loginFail(status,data) {
        log("login failed %o %o",status,data);
        servSess.setErrorMsg(data['status-message']);
      }
    }

    $scope.addAppAdminuser = function(scope) {
      var oObj = $scope.oObj;
      log("add app admin user %o ",$scope.oObj);
      servSess.setErrorMsg(null);

      if (!oObj.AppID || oObj.AppID.length == 0) return servSess.setErrorMsg("Invalid AppID");
      if (oObj.AppID.match(/^[a-z0-9]+$/) == null) {
         return servSess.setErrorMsg("AppID cannot contain special characters");
      }

      if (!oObj.User || oObj.User.length == 0) return servSess.setErrorMsg("Invalid Userid");
      if (oObj.User.match(/^[a-zA-Z0-9.]+$/) == null) {
         return servSess.setErrorMsg("UserID cannot contain special characters");
      }

      if (!oObj.NewPassword || oObj.NewPassword.match(/[a-zA-Z]/) == null) {
         return servSess.setErrorMsg("New password must contain at least one alphabetic character");
      }
      if (oObj.NewPassword != oObj.ConfirmPassword) {
        return servSess.setErrorMsg("Password differs from Confirm Password");
      }

      servGAE.addAdminUser(oObj,$scope.oUser.user,$scope.oUser.password,addOK,addFail);

      function addOK(status,data) {
        log("add worked %o %o",status,data);
        servSess.setConfirmMsg("add app="+oObj.AppID+" AdminUser="+oObj.User+" successful");
        listApps();
      }
      function addFail(status,data) {
        log("add failed %o %o",status,data);
        servSess.setErrorMsg(data['status-message']);
      }
    }

    function listApps() {
      log("listApps "+$scope.oUser.user);
      servGAE.listApps($scope.oUser.user,$scope.oUser.password,listOK,listFail);

      function listOK(status,data) {
        log("list worked %o %o",status,data);
        $scope.oApps = data.RESULT.RECORD;
      }

      function listFail(status,data) {
        log("list failed %o %o",status,data);
        $scope.oApps = null;
      }
    }


  }


  $scope.xfrAdminFunctions = function(app) {
    servSess.xfrAdminApp(app);
  }

  function logonExit(oProf) {
    log("logonExit called");
    var oOMs = [];
    if (oProf && oProf.repfile) {
      oOMs.push({menu:"Add Repeat Set",func:addNewChqSet,role:'admin'});
    }
    oOMs.push({menu:"Admin Functions",func:xfrAdminFunctions,role:'admin'});
    servSess.setOptMenuItems(oOMs);
  }

}



