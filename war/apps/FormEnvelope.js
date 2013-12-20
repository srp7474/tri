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
  if (!window.opener) return;

  $scope.oOptActions = [{whatClass:'nextBatch();', click:'prepareNextPage();', title:'move to next batch of envelopes',label:'Prepare next page'}];
  $scope.isLoaded         = function()               {return ($scope.oAllObjs != null);}

  $scope.isTrue           = function(b,sTrue,sFalse) {return b?(sTrue||'true'):(sFalse||'false');}
  $scope.getEnvPos        = function(nIX)            {return getEnvPos(nIX);}
  $scope.nextBatch        = function()               {return nextBatch();}
  $scope.prepareNextPage  = function()               {prepareNextPage();}
  $scope.printPage        = function()               {window.print();}

  log("ctrlPrt now loaded opener="+(window.opener != null));

  if (!window.opener) return;

  hookMsgListener();
  tri.postToOpener({verb:"envs:send-print-info"});
  return;


  function hookMsgListener() {
    log("Hooked message listener in FormEnvelope.js");
    tri.loadTemplates($rootScope,$templateCache);
    var oHandler = function(event) {
      console.log("return message evt=%o",event);
      if (event.data.verb) {
        if (event.data.verb == "envs:obj-data") {
          console.log("have envs-data ",event.data);
          $scope.oAllObjs   = event.data.payload.objs;
          $scope.oPrtObjs   = $scope.oAllObjs.slice(0,6);
          $scope.$digest();
        } else {
          console.log("spurious msg ",event.data);
        }
      }
    }
    oGBL.msgHandler.envs = oHandler;
  }

  function getEnvPos(nIX) {
    var sTop = ""+(Math.floor(nIX / 2) * 290)+"px";
    var sLft = ""+((nIX % 2) * 340)+"px";
    return  {position:'fixed',top:sTop,left:sLft,width:'300px',height:'250px'};
  }

  function nextBatch() {
    if (!$scope.oAllObjs) return 'c-quiet';
    if ($scope.nPageIX + 6 < $scope.oAllObjs.length) return 'c-action';
    return 'c-quiet';
  }

  function prepareNextPage() {
    log("prepare next page %s len=%s",$scope.nPageIX,$scope.oAllObjs.length);
    $scope.nPageIX += 6;
    $scope.oPrtObjs   = $scope.oAllObjs.slice($scope.nPageIX,$scope.nPageIX+6);
  }

}
