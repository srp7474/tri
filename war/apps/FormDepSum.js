/*
 @license
 Copyright (c) 2013 by Steve Pritchard of Rexcel Systems Inc.
 This file is made available under the terms of the Creative Commons Attribution-ShareAlike 3.0 license
 http://creativecommons.org/licenses/by-sa/3.0/.
 Contact: public.pritchard@gmail.com
*/
"use strict";

// ---------------------------------------------------------------------------
function ctrlForm($scope,$rootScope,$templateCache) {
  $scope.oAllObjs  = null;
  $scope.nPageIX    = 0;
  $scope.oPrtObjs  = [];
  $scope.oDistricts  = [];
  $scope.oObjRep   = {type:'active',district:'H1C1'};
  $scope.oOptions  = [{value:"1",name:"val1"},{value:"2",name:"val2"},{value:"3",name:"val3"}];
  $scope.panel_extra   = 'panel-extra.html';

  $scope.oMonths   = [{name:"Jan",objs:[]}
                     ,{name:"Feb",objs:[]}
                     ,{name:"Mar",objs:[]}
                     ,{name:"Apr",objs:[]}
                     ,{name:"May",objs:[]}
                     ,{name:"Jun",objs:[]}
                     ,{name:"Jul",objs:[]}
                     ,{name:"Aug",objs:[]}
                     ,{name:"Sep",objs:[]}
                     ,{name:"Oct",objs:[]}
                     ,{name:"Nov",objs:[]}
                     ,{name:"Dec",objs:[]}
                     ];
  $scope.oDays     = [];
  $scope.oActive   = [];
  $scope.oRecs     = [];
  $scope.sCache    = null;

  $scope.isLoaded         = function()               {return ($scope.oAllObjs != null);}
  $scope.printPage        = function()               {window.print();}
  $scope.isTrue           = function(b,sTrue,sFalse) {return b?(sTrue||'true'):(sFalse||'false');}
  $scope.getRows          = function(sReport)        {return getRows(sReport);}
  $scope.getName          = function(oRow)           {return getName(oRow);}
  $scope.getDistricts     = function()               {return $scope.oDistricts;}
  $scope.getNames         = function(oRow)           {return getNames(oRow);}
  $scope.getPhones        = function(oRow)           {return getPhones(oRow);}
  $scope.getAddress       = function(oRow)           {return getAddress(oRow);}

  log("ctrlPrt now loaded opener="+(window.opener != null));

  if (!window.opener) return;

  hookMsgListener();
  tri.postToOpener({verb:"deps:send-sum-info"});
  return;


  function hookMsgListener() {
    log("Hooked message listener in FormEnvelope.js");
    tri.loadTemplates($rootScope,$templateCache);
    var oHandler = function(event) {
      console.log("return message evt=%o",event);
      if (event.data.verb) {
        if (event.data.verb == "deps:deps-sum-data") {
          console.log("have deps-sum-data ",event.data);
          $scope.oAllObjs   = event.data.payload.oObjs;
          initDisplay(event.data.payload);
          $scope.$digest();
        } else {
          console.log("spurious msg ",event.data);
        }
      }
    }
    oGBL.msgHandler.deps = oHandler;
  }

  function initDisplay(payload) {
    $scope.oDonMap = payload.oMap;
    $scope.oProf   = payload.oProf;
    var oDistMap  = {};
    var oActCodes = {};
    var oPat = null;
    if ($scope.oProf.districts) {
      var sParts = $scope.oProf.districts.split(",");
      for(var i=0,iMax=sParts.length; i<iMax; i+=1) {
        oDistMap[sParts[i]] = {value:sParts[i],name:sParts[i]};
      }
      oPat = new RegExp(sParts[0]);
    } else {
      oDistMap['.?'] = {value:'.?',name:'.?'};
      oPat = new RegExp('.?')
    }
    for(var i=0,iMax=payload.oObjs.length; i<iMax; i+=1) {
      var oObj = payload.oObjs[i];
      for(var j=0,jMax=oObj.details.donors.length; j<jMax; j+=1) {
        var oDon = oObj.details.donors[j];
        var oWho = $scope.oDonMap[oDon.code];
        if (oWho) {
          oDon.who = oWho;
          var sDistrict = null;
          if ($scope.oProf.districts) {
            if (oWho.District) {
              if (oWho.District.match(oPat)) sDistrict = oWho.District;
            }
          } else {
            sDistrict = ""+oWho.District;
          }
          if (sDistrict) {
            if (!oDistMap[sDistrict]) oDistMap[sDistrict] = {value:sDistrict,name:sDistrict};
          }
        } else {
          log("missing %s %o %o",oDon.code,oObj,oDon);
        }
        oActCodes[oDon.code] = oWho;
      }
      $scope.oDays.push({name:oObj.name,objs:[oObj]});
      // 2013-07-14.ES1.CND.dp1
      //                         1       2       3         4         5         6
      var oR = oObj.name.match(/^([^-]+)-([^-]+)-([^.]+)[.]([^.]+)[.]([^.]+)[.]([^.]+)/);
      //log("match %s %o",oObj.name,oR);
      var nMIX = oR[2] - 1;
      $scope.oMonths[nMIX].objs.push(oObj);
    }
    for(var sVar in oDistMap) $scope.oDistricts.push(oDistMap[sVar]);
    for(var sVar in oActCodes) $scope.oActive.push(oActCodes[sVar]);

    $scope.oActive.sort(function(a,b) {
        var s1 = a.District;
        var s2 = b.District;
        if (s1 < s2) return -1;
        if (s1 == s2) return 0;
        return 1;
    });
    $scope.oDistricts.sort(function(a,b) {
        var s1 = a.District;
        var s2 = b.District;
        if (s1 < s2) return -1;
        if (s1 == s2) return 0;
        return 1;
    });

    log("Actives %o",$scope.oActive);
  }

  function getRows(sReport) {
    if ($scope.oObjRep.type != sReport) return [];
    if ($scope.oObjRep.type == 'active') return $scope.oActive;
    return sumRows(sReport,$scope.oObjRep.district);
  }

  function getName(oRow) {
    if (!oRow) return null;
    if (!oRow.name) return null;
    if (oRow.name.charAt(0) == '2') return oRow.name;
    return oRow.name+"("+oRow.objs.length+")";
  }

  function getNames(oRow) {
    var sStr = ""+oRow.LastName+", "+oRow.FirstName;
    return sStr;
  }

  function getPhones(oRow) {
    var sStr = "";
    if (oRow.HomePhone) sStr += " h:"+oRow.HomePhone;
    if (oRow.WorkPhone) sStr += " w:"+oRow.WorkPhone;
    if (oRow.CellPhone) sStr += " c:"+oRow.CellPhone;
    return sStr.trim();
  }

  function getAddress(oRow) {
    var sStr = "";
    if (oRow.Address1) sStr += ""+oRow.Address1;
    if (oRow.Address2) sStr += ", "+oRow.Address2;
    if (oRow.City) sStr += ", "+oRow.City;
    sStr = sStr.trim();
    if (sStr.charAt(0) == ',') sStr = sStr.substring(1);
    return sStr.trim();
  }

  function sumRows(sType,sDistrict) {
    var sStr = sType +"/"+sDistrict;
    if ($scope.sCache == sStr) return $scope.oRecs;
    var oObjs = $scope.oDays;
    if (sType == 'month') oObjs = $scope.oMonths;
    var oRecs = [];
    var oPat = new RegExp(sDistrict);
    var oSum = {name:"Total:"+sDistrict,CshCnt:0,CshAmt:0.00,ChqCnt:0,ChqAmt:0.00,TotCnt:0,TotAmt:0.00,NonCnt:0,NonAmt:0.00};
    for(var i=0,iMax=oObjs.length; i<iMax; i+=1) {
      var oLst = oObjs[i];
      var oRec = {name:oLst.name,CshCnt:0,CshAmt:0.00,ChqCnt:0,ChqAmt:0.00,TotCnt:0,TotAmt:0.00,NonCnt:0,NonAmt:0.00};
      oRecs.push(oRec);
      for(var j=0,jMax=oLst.objs.length; j<jMax; j+=1) {
        var oObj = oLst.objs[j];
        for(var k=0,kMax=oObj.details.donors.length; k<kMax; k+=1) {
          var oDon = oObj.details.donors[k];
          //log("process %o %o",oLst,oDon);
          if ((""+oDon.who.District).match(oPat) == null) continue;
          oRec.TotCnt += 1;
          oSum.TotCnt += 1;
          var nAmt = +oDon.amount
          oRec.TotAmt += nAmt;
          oSum.TotAmt += nAmt;
          if (oDon.tender == 'cash') {
            oRec.CshCnt += 1;
            oRec.CshAmt += nAmt;
            oSum.CshCnt += 1;
            oSum.CshAmt += nAmt;
          } else {
            oRec.ChqCnt += 1;
            oRec.ChqAmt += nAmt;
            oSum.ChqCnt += 1;
            oSum.ChqAmt += nAmt;
          }
        }
      }
    }
    oRecs.push(oSum);
    $scope.oRecs = [];
    for(var i=0,iMax=oRecs.length; i<iMax; i+=1) {
      var oRec = oRecs[i];
      oRec.CshAmt = ""+oRec.CshAmt.toFixed(2);
      oRec.ChqAmt = ""+oRec.ChqAmt.toFixed(2);
      oRec.TotAmt = ""+oRec.TotAmt.toFixed(2);
      oRec.NonAmt = ""+oRec.NonAmt.toFixed(2);
      if ((sType == 'month') || (oRec.TotCnt > 0)) $scope.oRecs.push(oRec);
    }
    $scope.sCache = sStr;
    return $scope.oRecs;
  }

}
