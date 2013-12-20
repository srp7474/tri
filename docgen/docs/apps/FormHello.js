"use strict";

// ---------------------------------------------------------------------------
function ctrlForm($scope,$rootScope,$templateCache) {
  $scope.bPrinted  = false;
  $scope.oAllObjs  = null;
  $scope.nPageIX   = 0;
  $scope.oPrtObjs  = [];
  $scope.oOptActions = [{whatClass:'nextBatch();', click:'prepareNextPage();', title:'move to next batch of messages',label:'Prepare next page'}];
  if (!window.opener) return;

  $scope.isLoaded         = function()               {return ($scope.oAllObjs != null);}

  $scope.nextBatch        = function()               {return nextBatch();}
  $scope.printPage        = function()               {$scope.bPrinted = true; window.print();}
  $scope.prepareNextPage  = function()               {prepareNextPage();}
  $scope.getDate          = function(oObj)           {return getDate(oObj);}

  log("ctrlForm now loaded opener="+(window.opener != null));

  hookMsgListener();
  tri.postToOpener({verb:"msgs:send-print-info"});
  return;

  // local functions
  function hookMsgListener() {
    tri.loadTemplates($rootScope,$templateCache);
    var oHandler = function(event) {
      if (event.data.verb) {
        if (event.data.verb == "msgs:obj-data") {
          $scope.oAllObjs   = event.data.payload.objs;
          $scope.oPrtObjs   = $scope.oAllObjs.slice(0,6);
          $scope.$digest();
        } else {
          console.log("spurious event msg ",event.data);
        }
      }
    }
    oGBL.msgHandler.msgs = oHandler;
  }

  // scoped functions
  function getDate(oObj) {
    return oObj.date.substring(0,4)
           +"-"+oObj.date.substring(4,6)
           +"-"+oObj.date.substring(6,8)
           +" "+oObj.time.substring(0,2)
           +":"+oObj.time.substring(2,4);
  }

  function nextBatch() {
    if (!$scope.oAllObjs) return 'c-quiet';
    if ($scope.nPageIX + 6 < $scope.oAllObjs.length) return 'c-action';
    return 'c-quiet';
  }

  function prepareNextPage() {
    $scope.nPageIX += 6;
    $scope.bPrinted = false;
    $scope.oPrtObjs   = $scope.oAllObjs.slice($scope.nPageIX,$scope.nPageIX+6);
  }

}
