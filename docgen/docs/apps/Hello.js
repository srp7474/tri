/*
 This is a sample application designed to run under the Triangular Infrastructure
 */
"use strict";

// ---------------------------------------------------------------------------
/* This forces angular to load the tables and their dependencies
 *
 * We rely on the implied dependency injection to haul in only the tables needed and
 * thus automatically configure the system menus and available actions.
 */

function ctrlMain($scope,servSess,servGAE,servREG,tblMSGS,servCRUD,servConfig) {
  log("Created ctrlMain for messages application");
  servGAE.setCust("msgs");
  servSess.setTitle("Message Board System");
  var oProf = servSess.getProfile();
  var oMenuCtrl = servSess.getListCtrl();

  var oOMs = [{menu:"Admin Functions",func:xfrAdminFunctions,role:'admin'}];
  servSess.setOptMenuItems(oOMs);

  function xfrAdminFunctions() {
    servSess.xfrAdminApp("msgs");
  }

}

//----------------------------------------------------------------------------
//-------------------------------- Message records ------------------------------
//----------------------------------------------------------------------------
oApp.factory('tblMSGS',['servREG','servGAE','servREC','servSess',function(servREG,servGAE,servREC,servSess) {
  var oFuncs = {};
  var nPrintChq = null;


  var oTabProp = {
       recTitle: 'Messages'
      ,recName:  'messages'
      ,recType:  'msg'
      ,lsName:   '-msgs'
      ,tabServ:  oFuncs    //self pointer
      ,recServ:  servREC
      ,order:    {col:'date', seq:'reverse'}
      ,cols:     [{type:'actions',    title:      'Actions'
                                     ,showEdit:   false
                                     ,addDefault: true
                  }
                 ,{col: 'time',       title:      'Time'
                                     ,showList:   false
                                     ,readonly:   true
                  }
                 ,{col: 'date',       title:      'Date'
                                     ,showList:   false
                                     ,readonly:   isReadOnly
                  }
                  ,{col: 'author',    title:      'Author'
                                     ,hint:       'str hint example'
                                     ,place:      'str placeholder'
                                     ,reqd:       true
                                     ,mask:       '[A-Za-z\\s\.\-]'
                  }
                 ,{col: 'type',       title:      'Type'
                                     ,type:      'cust'
                                     ,htmlCust:  'select.html'
                  }
                 ,{col: calcAge,      title:      'Age'
                                     ,listHint:   ageHint
                  }
                 ,{col: 'title',      title:      'Title'
                                     ,place:      titlePlace
                                     ,hint:       titleHint
                                     ,reqd:       10
                                     ,listHint:   textSum
                                     ,listMax:    60
                  }
                 ,{col: 'text',       title:      'Message'
                                     ,showList:   false
                                     ,type:      'cust'
                                     ,htmlCust:  'textarea.html'
                                     ,reqd:       30
                  }
                ]
      ,filters: [
                {type: 'mask',   field:    'author'  }
               ,{type: 'mask',   field:    'type'    }
               ,{type: 'cust',   field:    '_custmask'
                                ,title:    'Title/Text'
                                ,place:    'title search or =text search'
                                ,methCust: custMask
                }
                ]
      ,createExit          : createExit
      ,optActions          : [
                             {   click:     'printSelected()'
                                ,title:     'Press to print selected messages'
                                ,label:     'Print Selected Messages'
                                ,whatClass: 'canPrintSelected()'
                             }
                             ]
  };


  oFuncs.getTabProp       = function()     {return oTabProp;}
  oFuncs.printSelected    = function()     {printSelected();}
  oFuncs.canPrintSelected = function()     {return canPrintSelected();}

  servREG.registerTable(oFuncs);
  return oFuncs;

  // -------------------------------------------------------------------------

  function printSelected() {
    var oHandler = function printReqHandler(event) {
      log("printSelected Handler called %o",event);
      var oObjs = getSelectedObjs();
      var oMsg = {verb:'msgs:obj-data',payload:{objs:oObjs}};
      event.source.postMessage(oMsg,"*");
    }
    oGBL.msgHandler.msgs = oHandler;
    var sLocn = ""+window.location;
    sLocn = sLocn.replace(/Hello.htm/,"FormHello.htm");
    sLocn = sLocn.replace(/#/,"");
    log("locn="+sLocn);
    window.open(sLocn,"PrtHello-WebKit");
    var oObjs = getSelectedObjs();
    log("print selected "+oObjs.length);
  }

  function canPrintSelected() {
    var oObjs = getSelectedObjs();
    if (oObjs.length > 0) return 'c-action';
    return 'c-quiet';
  }

  function getSelectedObjs() {
    var oTAB = servSess.getTabServ();
    if (oTAB == null) return [];
    return oTAB.getSelObjs();
  }

  function custMask(oTab,oObjs,oData,oFil) {
    var sStr = oData[oFil.field] || '';
    if (sStr.substring(0,1) == '=') {
      return servSess.maskReduce(oObjs,sStr.substring(1),'text');
    } else {
      return servSess.maskReduce(oObjs,sStr,'title');
    }
  }

  function isReadOnly(scope,oCol) {
    return !servSess.isAdmin();
  }


  function titlePlace(scope,oCol) {
    return 'func place:'+oCol.getTitle();
  }
  function titleHint(scope,oCol) {
    return 'func hint:'+oCol.getTitle();
  }

  function ageHint(scope,oObj,oCol) {
    return 'Date:'+oObj.date+' time:'+oObj.time;
  }

  function textSum(scope,oObj,oCol) {
    var sStr = ""+oObj.text;
    if (sStr.length > 80) sStr = sStr.substring(0,80)+" ...";
    return sStr;
  }

  function calcAge(oObj,scope,oCol) {return tri.calcAgo(oObj.date,oObj.time);}

  function createExit(oObj) {
    var sNow = ""+getNowString();
    oObj.date      = sNow.substring(0,8);
    oObj.time      = sNow.substring(9,9+6);
    oObj.type      = 'technical';  // matches select in select.html template
    return true;
  }

}]);




