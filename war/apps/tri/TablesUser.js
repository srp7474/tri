/*
 @license
 Copyright (c) 2013 by Steve Pritchard of Rexcel Systems Inc.
 This file is made available under the terms of the Creative Commons Attribution-ShareAlike 3.0 license
 http://creativecommons.org/licenses/by-sa/3.0/.
 Contact: public.pritchard@gmail.com
*/
"use strict";

//----------------------------------------------------------------------------
//-------------------------------- USER records ------------------------------
//----------------------------------------------------------------------------
oApp.factory('tblUSR',['servREG','servGAE','servTBL','servSess',function(servREG,servGAE,servTBL,servSess) {
  var oFuncs = {};

  var oTabProp = {
       recTitle: 'User'
      ,recName:  'user'
      ,recType:  null      // null means internal user record
      ,lsName:   null      // no cache either
      ,tabServ:  oFuncs    //self pointer
      ,recServ:  servTBL
      ,order:    null
      ,cols:    [{type: 'actions', title: 'Actions'}     // Default Actions
                ,{col: getUserID,  title: 'Userid'       ,many:false, showEdit:true}
                ,{col: 'obj',      title: 'User'         ,type:'property', showList:false, hide:'token,another'}
                ]
      ,validate: validate
      ,createExit: createExit
      ,menuWhen  : testShowOK
  };

  oFuncs.getTabProp  = function()            {return oTabProp;}
  servREG.registerTable(oFuncs);
  return oFuncs;

  function getUserID(oObj) {
    if (!oObj.KeyName) return null;
    var sStr = oObj.KeyName;
    var nIX = sStr.lastIndexOf("/");
    return sStr.substring(nIX+1);
  }

  function validate(scope,oObj,oOrig,fValidateStd,fEditErr) { // custom validation
    if (!oObj.obj) return false;
    if (getUserID(oObj) != '.config') {
      if (!('password' in oObj.obj)) return fEditErr("'password' field required");
      if (oObj.obj.password != oOrig.obj.password) {
        if (oObj.obj.password.match(/[a-zA-Z]/) == null) return fEditErr("'password' field must contain alphabetic");
      }
    }
    return fValidateStd(oTabProp);
  }

  function testShowOK() { //incase guest sneaks in
    return servSess.isAdmin();
  }

  function createExit(oObj) {
//    dumpObjLog(oObj,"createExit");
    delete oObj.tag;
    var sName = prompt("Enter unique Userid");
    var bDup = true;
    while(bDup) {
      if (sName == null) return false;
      bDup = false;
      for(var i in oTabProp.oObjs) {
        var oRec = oTabProp.oObjs[i];
        if (sName == getUserID(oRec)) bDup = true;
      }
      if (bDup) sName = prompt("Not unique, re-enter unique Userid");
    }
    log("createExit ok "+oTabProp.oObjs.length+" name="+sName);
    oObj.KeyName = "*/"+servGAE.getCust()+"/"+sName;
    oObj.obj = {};
    oObj.obj.password = "";
    return true;
  }


}]);


