/*
 @license
 Copyright (c) 2013 by Steve Pritchard of Rexcel Systems Inc.
 This file is made available under the terms of the Creative Commons Attribution-ShareAlike 3.0 license
 http://creativecommons.org/licenses/by-sa/3.0/.
 Contact: public.pritchard@gmail.com
*/
"use strict";

log("loading tblENV factory code");
oGBL.optTables.push("tblENV");

//----------------------------------------------------------------------------
//------------------------------- Envelope records -----------------------------
//----------------------------------------------------------------------------
oApp.factory('tblENV',['servREG','servREC','servSess','servCRUD',function(servREG,servREC,servSess,servCRUD) {
  log("Running tblENV factory");
  var oFuncs = {};
  var oTabProp = {
       recTitle: 'Envelope'
      ,recName:  'envs'  // % is chunked flag
      ,recType:  'env'
      ,lsName:   "-envs" // derived
      ,tabServ:  oFuncs    //self pointer
      ,recServ:  servREC
      ,order:    {col:'date',seq:'reverse'}
      ,cols:    [{type:'actions',     title: 'Actions'           ,showEdit:false, addDefault:true}
                 ,{col: 'date',       title: 'Date'              ,showList:true}
                 ,{col: 'recipient',  title: 'Recipient'         ,showList:true}
                 ,{col: 'number',     title: '#Envelopes'        ,showList:true,  reqd:true}
                 ,{col: 'amt',        title: 'Amount'            ,showList:true,  reqd:false}
                 ,{col: 'enteredBy',  title: 'EnteredBy'         ,showList:false, reqd:false, readonly:true}
                ]
      ,menuWhen          : testDoubleLogin
      ,addDonorLine      : addDonorEnvLine
      ,createExit        : createExit
      ,primeEdit         : primeEdit
      ,optActions        : [{click:'printBatch()',title:"Print today's envelopes",label:'Print Batch',whatClass:'testBatch()'}]
  };

  oFuncs.getTabProp  = function()            {return oTabProp;}

  // public functions

  function primeEdit(scope,oTP,oObj) {
    scope.sEditSuppName  = 'donors-list.html';
    return oObj;
  }

  oFuncs.printBatch = function() {
    var oHandler = function printReqHandler(event) {
      log("printBatch Handler called %o",event);
      var oObjs = getTodaysObjs();
      var oMsg = {verb:'envs:obj-data',payload:{objs:oObjs}};
      event.source.postMessage(oMsg,"*");
    }
    servSess.createFormWindow('envs',oHandler,"Deps.htm","FormEnvelope.htm");
  }

  oFuncs.testBatch = function() {
    var oObjs = getTodaysObjs();
    if (oObjs.length > 0) return 'c-action';
    return 'c-quiet';
  }

  servREG.registerTable(oFuncs);
  return oFuncs;

  function addDonorEnvLine(scope,oDonSum,oDonor) {
    log("add Donor Line into envelope scope=%o donor=%o",scope,oDonor);
    scope.oObj.recipient = getName(oDonor);
  }

  function getName(oDon) {
    return oDon.FirstName+" "+oDon.LastName;
  }


  // private functions
  function getTodaysObjs() {
    var oObjs = [];
    var sNow  = getNowYMD();
    if (!oTabProp.oObjs) oTabProp.oObjs = [];
    for(var i=0,iMax=oTabProp.oObjs.length; i<iMax; i+=1) {
      var oObj = oTabProp.oObjs[i];
      if ((oObj.date == sNow) && (oObj.enteredBy == getUserStr())) oObjs.push(oObj);
    }
    return oObjs;
  }

  function createExit(oObj) {
    oObj.date      = getNowYMD();
    oObj.number    = 1;
    oObj.enteredBy = getUserStr();
    return true;
  }

  function getUserStr() {
    return servSess.getUser()+"/"+servSess.getUser2();
  }

  function testDoubleLogin() {
    var sUser1 = servSess.getUser();
    var sUser2 = servSess.getUser2();
    if (!sUser1) return false;
    if (!sUser2) return false;
    //log("testDoubleLogin "+sUser1+" "+sUser2);
    if (sUser1 != sUser2) return true;
    return false;
  }


}]);
