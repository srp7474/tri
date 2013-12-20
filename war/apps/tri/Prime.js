/*
 @license
 Copyright (c) 2013 by Steve Pritchard of Rexcel Systems Inc.
 This file is made available under the terms of the Creative Commons Attribution-ShareAlike 3.0 license
 http://creativecommons.org/licenses/by-sa/3.0/.
 Contact: public.pritchard@gmail.com
*/
"use strict";

function ctrlMain($scope,servSess,servGAE,servConfig,$http) {
  log("Created ctrlMain for boot application");
  $scope.bConfigured = false;
  setContext();

  function setContext() {
    var sURL = ("http://"+window.location.host)+"/gems/boot/ajax.ajax";
    var sStr = ""+window.location.search;
    if (sStr != "?jam=true") {
      servGAE.setURL(sURL);
      log("Prime URL="+sURL);
      servGAE.validateStore(storeOK,storeNAK);
    } else {
      log("jammed to prime position");
    }

    function storeOK(status,data) {
      log("StoreOK status=%o data=%o",status,data);
      $scope.bConfigured = true;
      $http.get("/index.html").    // if we have doc then it is our apps pkg so load doc.
        success(function(data,status) {
          var sURL = ("http://"+window.location.host)+"/index.html?page=apps";
          window.location = sURL;
        }).                        // else its a standard application
        error(function(data,status) {
          log("pageStart "+servConfig.getStartPage());
          var sURL = ("http://"+window.location.host)+"/"+servConfig.getStartPage();
          window.location = sURL;
        }
      );
    }

    function storeNAK(status,data) {
      log("StoreOK status=%o data=%o",status,data);
      $scope.bConfigured = false;
      var sURL = ("http://"+window.location.host)+"/apps/tri/TriBoot.htm";
      window.location = sURL;
    }
  }
}
