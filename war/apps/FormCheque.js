/*
 @license
 Copyright (c) 2013 by Steve Pritchard of Rexcel Systems Inc.
 This file is made available under the terms of the Creative Commons Attribution-ShareAlike 3.0 license
 http://creativecommons.org/licenses/by-sa/3.0/.
 Contact: public.pritchard@gmail.com
*/
"use strict";
var oApp = angular.module('app',[]);

// ---------------------------------------------------------------------------
function ctrlForm($scope,$rootScope,$templateCache) {
  $scope.bPrinted = false;
  $scope.bVoided  = false;
  $scope.oPrtChq  = null;

  $scope.oOptActions = [{whatClass:'isPrinted();', click:'voidRenum();', title:'Void this cheque',label:'Void & renumber'}];
  if (!window.opener) return;

  $scope.isLoaded      = function()       {return ($scope.oPrtChq != null);}

  $scope.voidRenum     = function()       {return voidRenum();}
  $scope.printPage     = function()       {printChq();}
  $scope.isPrinted     = function()       {return tri.isTrue($scope.bPrinted,'c-quiet','c-action');}
  $scope.getPrtFormat  = function()       {return $scope.nPrtFmt;}
  $scope.getCurChq     = function()       {return $scope.oPrtChq;}
  $scope.dateDigits6   = function()       {if (!$scope.oPrtChq) return ""; return dateDigits6();}
  $scope.dateDigits8   = function()       {if (!$scope.oPrtChq) return ""; return dateDigits8();}
  $scope.alphaAmount   = function(nMin)   {if (!$scope.oPrtChq) return ""; return minStr(formatAmtLine(),nMin);}
  $scope.numAmount     = function()       {if (!$scope.oPrtChq) return ""; return $scope.oPrtChq.amt;}
  $scope.payee         = function(nMin)   {if (!$scope.oPrtChq) return ""; return minStr($scope.oPrtChq.payee,nMin);}
  $scope.addrLine      = function()       {if (!$scope.oPrtChq) return ""; return addrLine();}
  $scope.ref           = function(nMin)   {if (!$scope.oPrtChq) return ""; return minStr(ref(),nMin);}
  $scope.chqno         = function()       {if (!$scope.oPrtChq) return ""; return chqno();}
  $scope.isTrue        = function(b,sTrue,sFalse) {return b?(sTrue||'true'):(sFalse||'false');}

  log("ctrlForm now loaded opener="+(window.opener != null));

  if (!window.opener) return;

  hookMsgListener();
  tri.postToOpener({verb:"chqs:send-print-info"});
  return;

  function hookMsgListener() {
    log("Hooked message listener in FormCheque.js");
    tri.loadTemplates($rootScope,$templateCache);

    var oHandler = function(event) {
      if (event.data.verb) {
        if (event.data.verb == "chqs:chqs-data") {
          console.log("have chqs-data ",event.data);
          $scope.oPrtChq    = event.data.payload.oObj;
          $scope.nPrtFmt    = event.data.payload.fmt;
          $scope.addrLines  = event.data.payload.addr;
          $scope.$digest();
        } else {
          console.log("spurious msg ",event.data);
        }
      }
    }
    oGBL.msgHandler.chqs = oHandler;
  }

  function printChq() {
    log("called printChq "+$scope.bPrinted);
    if ($scope.bPrinted) return;  //when-active logic failed to trigger? reverted to this
    $scope.bPrinted = true;
    var bResult = window.print();
    log("printed %o",bResult);
    tri.postToOpener({verb:"chqs:printed-chq",chqno:""+$scope.oPrtChq.chqno});
  }

  function voidRenum() {
    if ($scope.bPrinted) return;  //when-active logic failed to trigger? reverted to this
    if ($scope.bVoided) return;   //when-active logic failed to trigger? reverted to this
    $scope.bVoided = true;
    log("voidRenum chq "+$scope.oPrtChq.chqno+" request");
    tri.postToOpener({verb:"chqs:void-chq",chqno:""+$scope.oPrtChq.chqno});
  }

  function addrLine() {
    return $scope.addrLines;
  }

  function ref() {
    var sStr = "";
    if ($scope.oPrtChq.lines[0].ref) sStr += $scope.oPrtChq.lines[0].ref;
    return sStr;
  }

  function chqno() {
    //include chq so we can validate on right page
    var oChq = $scope.oPrtChq;
    var sStr = ""+oChq.chqno;
    return sStr;
  }

  function dateDigits8() { // for jane bmo cheques
    // 0    5  8
    // 2012-03-25
    var sDate = $scope.oPrtChq.date;
    //log("date is "+sDate);
    var sStr = sDate.charAt(5)+" " // MM
             + sDate.charAt(6)+" "
             + sDate.charAt(8)+" " // DD
             + sDate.charAt(9)+" "
             + sDate.charAt(0)+" " // YYYY
             + sDate.charAt(1)+" "
             + sDate.charAt(2)+" "
             + sDate.charAt(3)+" ";
    return sStr;
  }
  function dateDigits6() {  // for srp bmo cheques
    // 0    5  8
    // 2012-03-25
    var sDate = $scope.oPrtChq.date;
    //log("date is "+sDate);
    var sStr = sDate.charAt(2)+""  // YY
             + sDate.charAt(3)+" "
             + sDate.charAt(5)+""  // MM
             + sDate.charAt(6)+" "
             + sDate.charAt(8)+""  // DD
             + sDate.charAt(9)+" ";
    return sStr;
  }

  function minStr(sStr,nMin) {
    if (!nMin) return sStr;
    var s = '                                        ';
    s = s + s + s;
    return (sStr+s).substring(0,nMin);
  }

  function formatAmtLine() {
    return "**"+toWords($scope.oPrtChq.amt);
  }

}
