"use strict";

log("src-display active");

function ctrlSource($scope,$http) {
  var sURL = ""+window.location;
  var nIX = sURL.indexOf("src=");
  var sSrc = sURL.substring(nIX+4);
  var n = sURL.indexOf("/SrcDisplay.html");
  var sLink = sURL.substring(0,n) + "/" + sSrc;
  $scope.sSrcName = sSrc;
  $scope.sLink  = sLink;
  document.title = "Triangular Source File: " +sSrc;

  loadSourceFile($scope,sLink,fOK,fFail);


  function loadSourceFile($scope,sSrcLink,fOK,fFail) {
    $http.get(sSrcLink).
      success(function(data,status) {
        fOK(data,status);
      }).
      error(function(data,status) {
        fFail(data,status);
      }
    );
  }

  function fOK(data,status) {
    console.log("src load OK data=%s stat=%o",data.length,status);
    var sText = ""+data;
    $scope.source = sText;
  }

  function fFail(data,status) {
    console.log("src load Failed data=%o stat=%o",data,status);
  }
}


