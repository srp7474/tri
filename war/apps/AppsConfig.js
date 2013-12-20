/*
 @license
 Copyright (c) 2013 by Steve Pritchard of Rexcel Systems Inc.
 This file is made available under the terms of the Creative Commons Attribution-ShareAlike 3.0 license
 http://creativecommons.org/licenses/by-sa/3.0/.
 Contact: public.pritchard@gmail.com
*/
"use strict";
// ---------- Singleton To Provide Customization information
oApp.factory('servConfig',[function() {
  var oFuncs    = {};

  var accts = [
     {code:"R000",name:"General"}
    ,{code:"R005",name:"Workers"}
    ,{code:"R150",name:"Gifts from Other Sources"}
    ,{code:"R300",name:"Rent"}
    ,{code:"R400",name:"Books"}
    ,{code:"R701",name:"Bldg Improvement"}
    ,{code:"R705",name:"Missionary Work"
         ,subcodes:[
              "Uganda"
             ,"Kenya"
             ,"Nigeria"
             ,"Other"
          ]
     }
    ,{code:"R706",name:"Designated for:"
         ,subcodes:[
              "Gospel"
             ,"Children"
             ,"JAM"
             ,"Young People"
             ,"CITYouth"
             ,"College"
             ,"Kid's Nite"
             ,"Kid's Camp"
             ,"Needy Saints"
             ,"Fellowship Jrnl"
             ,"Furniture"
             ,"Other"
          ]
     }
    ,{code:"E320",name:"Training"
         ,subcodes:[
              "Disciples"
             ,"Psalms"
             ,"Other"
          ]
     }
  ];

  var oInfo  = {
     bank        : 'Fake Bank'
    ,bankAddr    : 'Centre Branch\r\n5555 Yonge Street\r\nNorth York,Ont, M2N 5X2\r\nPhone: 416-555-7757'
    ,acctHolder  : 'Church in Toronto'
    ,acctUSD     : '24882-001 4668-991'
    ,acctCND     : '24882-001 1664-992'
    ,acctBKS     : '24882-001 1664-993'
    ,accts       : accts
  };

  oFuncs.getStartPage = function() {return "apps/Hello.htm";}  // required

  // following are optional.  Remove them to trigger default action/value.
  oFuncs.getInfo          = function() {return oInfo;}            // Application information
                                                                  // guest will be autofilled
  oFuncs.getAutoFill      = function() {return {user:'guest',password:'guest'};}
  oFuncs.getSite          = function() {return "TRI-Demo";}       // Site prefix in title
  return oFuncs;

}]);

function gaTracking() {
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
  if ((""+document.location).indexOf('appspot.com') > 0) {
    ga('create', 'UA-44929138-1', 'tri-demo.appspot.com'/*,{cookieDomain:'none'}*/);
  } else {
    ga('create', 'UA-44929138-3', 'tri-demo.nodejitsu.com'/*,{cookieDomain:'none'}*/);
  }
  ga('send', 'pageview');
}
