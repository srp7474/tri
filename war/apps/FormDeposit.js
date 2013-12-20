/*
 @license
 Copyright (c) 2013 by Steve Pritchard of Rexcel Systems Inc.
 This file is made available under the terms of the Creative Commons Attribution-ShareAlike 3.0 license
 http://creativecommons.org/licenses/by-sa/3.0/.
 Contact: public.pritchard@gmail.com
*/
"use strict";

// ---------------------------------------------------------------------------
// ----------------------------- Controllers ---------------------------------
// ---------------------------------------------------------------------------


// ---------------------------------------------------------------------------
function ctrlForm($scope,$rootScope,$templateCache) {
  $scope.oObj          = null;
  $scope.oInfo         = null;
  $scope.oTots         = {};
  $scope.oDonMap       = {};
  $scope.sYear         = getNowString().substring(0,4);
  $scope.oObjRep       = {type:'sum'}

  $scope.printPage     = function()           {printList();}
  $scope.closePage     = function()           {closePage();}
  $scope.getDonorName  = function(sCode)      {return getDonorName(sCode);}
  $scope.isLoaded      = function()           {return ($scope.oObj != null);}
  $scope.panel_extra   = 'panel-extra.html';


  log("ctrlForm loaded %o",$templateCache);

  if (!window.opener) return;


  hookMsgListener();
  tri.postToOpener({verb:"deps:send-print-info"});
  return;

  function hookMsgListener() {
    log("Hooked message listener in Print.js");
    tri.loadTemplates($rootScope,$templateCache);


    var oHandler = function(event) {
      console.log("return message ",event);
      if (event.data.verb) {
        if (event.data.verb == "deps:deps-data") {
          console.log("have deps-data ",event.data);
          $scope.oObj    = event.data.payload.oObj;
          $scope.oInfo   = event.data.payload.oInfo;
          $scope.oDonMap = event.data.payload.oMap;
          primeTotals();
          $scope.$digest();
        } else {
          console.log("spurious msg ",event.data);
        }
      }
    }
    oGBL.msgHandler.deps = oHandler;
  }

  function printList() {
    window.print();
  }

  function loadTallyStr(scope,sTallyStr) {
    if (!sTallyStr) return;
    var sParts = sTallyStr.split(" ");
    log("tallystr "+sTallyStr+" "+sParts.length);
    for(var i=0,iMax=sParts.length; i<iMax; i+=1) {
      var sItem = sParts[i].split("=");
      if (!(sItem[0] in scope.oTots)) scope.oTots[sItem[0]] = 0;
      scope.oTots[sItem[0]] += (+sItem[1]);
    }
  }

  function primeTotals() {
    if (!$scope.oObj) return 0;
    if (!$scope.oObj.details) return 0;
    if (!$scope.oObj.details.donors) return 0;
    console.log("priming oObj",$scope.oObj);
    var oDonors = $scope.oObj.details.donors;
    var nChqs = 0;
    $scope.oTots.cheques = [];
    for(var i=0,iMax=oDonors.length; i<iMax; i+=1) {
      var oDon = oDonors[i];
      if (oDon.tender == 'cheque') {
        var oChq = {amt:oDon.amount,name:oDon.code};
        $scope.oTots.cheques.push(oChq);
        nChqs += 1;
      } else {
        loadTallyStr($scope,oDon.tallystr);
      }
    }
    while($scope.oTots.cheques.length < 23) {
      $scope.oTots.cheques.push({name:'.'});
    }
    createSummaryInfo(oDonors);
    $scope.oTots.chequeCount = nChqs;
    $scope.oTots.total = ((+$scope.oObj.cashSum)+(+$scope.oObj.chequeSum)).toFixed(2);
    $scope.oTots.date = $scope.oObj.name.substring(0,10);
    $scope.oTots.counters = $scope.oObj.details.counter1+"/"+$scope.oObj.details.counter1;
  }

  function getDonorName(sCode) {
    if (sCode == ".") return null;
    var oDon = $scope.oDonMap[sCode];
    if (oDon == null) return "not-found";
    return oDon.LastName+", "+oDon.FirstName;
  }

  function getNote(oDon) {
    if (oDon.note) return "\r\n"+oDon.note;
    return '';
  }

  function createSummaryInfo(oDonors) {
    $scope.oTots.sumLines = [];
    console.log("DonorRecords %o",oDonors);
    console.log("Accounts %o",$scope.oInfo.accts);
    var oMap = {};
    var nSeq = 0;
    var amts = [];
    for(var i=0,iMax=oDonors.length+1; i<iMax; i+=1) amts.push(0);
    for(var i=0,iMax=$scope.oInfo.accts.length; i<iMax; i+=1) {
      var oAcct = $scope.oInfo.accts[i];
      if (oAcct.subcodes) {
        for(var j=0,jMax=oAcct.subcodes.length; j<jMax; j+=1) {
          var sSubCode = oAcct.subcodes[j];
          oMap[sSubCode] = {name:sSubCode,seq:nSeq++,amt:angular.copy(amts),acct:oAcct.code};
        }
      } else {
        oMap[oAcct.code] = {name:oAcct.name,seq:nSeq++,amt:angular.copy(amts),acct:oAcct.code};
      }
    }
    console.log("map ",oMap);
    for(var i=0,iMax=oDonors.length; i<iMax; i+=1) {
      var oDon = oDonors[i];
      var oDonMap = angular.copy(oMap);
      var oSL = {code:oDon.code,name:getDonorName(oDon.code)+getNote(oDon),ix:i+1,class:'detail'};
      $scope.oTots.sumLines.push(oSL);
      if (oDon.tender == 'cheque') {
        oSL.chqAmt=oDon.amount;
      } else {
        oSL.cashAmt=oDon.amount;
      }
      for(var j=0,jMax=oDon.desigs.length; j<jMax; j+=1) {
        var oDes = oDon.desigs[j];
        //console.log("des ",oDes);
        if (oDes.subacct) {
          oMap[oDes.subacct].amt[0] += +oDes.amt;
          oMap[oDes.subacct].amt[oSL.ix] += +oDes.amt;
        } else {
          oMap[oDes.acct].amt[0] += +oDes.amt;
          oMap[oDes.acct].amt[oSL.ix] += +oDes.amt;
        }
        oSL.oDonMap = oDonMap;
      }
    }
    oSL = {name:'**** TOTAL',chqAmt:$scope.oObj.chequeSum,cashAmt:$scope.oObj.cashSum,ix:0,class:'total'};
    $scope.oTots.sumLines.push(oSL);
    var oBins = []
    for(var i in oMap) {
      var oBin = oMap[i];
      if (oBin.amt[0] > 0) {
        for(var j=0,jMax=oBin.amt.length; j<jMax; j+=1) {
          if (oBin.amt[j] > 0) {
            oBin.amt[j] = (+oBin.amt[j]).toFixed(2);
          } else {
            oBin.amt[j] = null;
          }
        }
        oBins.push(oBin);
      }
    }
    while(oBins.length < 7) {
      oBins.push({name:'.',seq:100+oBins.length,acct:'',amt:[]});
    }
    oBins.sort(function(a,b) {
      if (a.seq < b.seq) return -1;
      if (a.seq > b.seq) return 1;
      return 0;
    });
    console.log("lines ",$scope.oTots.sumLines);
    console.log("bins ",oBins);
    $scope.oTots.bins = oBins;
  }
}


