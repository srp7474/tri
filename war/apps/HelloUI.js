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
  servSess.setTitle("UI: Message Board System");

  var oOMs = [{menu:"Admin Functions",func:xfrAdminFunctions,role:'admin'}];
  servSess.setOptMenuItems(oOMs);

  function xfrAdminFunctions() {
    servSess.xfrAdminApp("msgs");
  }
}

// This custom controller is used by the Dialog mode viewer

function ctrlCustViewer($scope,servSess) {
  log("Created ctrlCustViewer");
  var nCur = 0;
  var oObjs = null;

  $scope.prepare  = prepare;
  $scope.doneEdit = doneEdit;
  $scope.next     = next;
  $scope.prev     = prev;
  $scope.getText  = getText;
  $scope.calcAge  = function() {if (!$scope.oObj) return ''; return tri.calcAgo($scope.oObj.date,$scope.oObj.time)}

  function prepare(objs) {
    oObjs = objs;
    log("prepare called "+oObjs.length);
    show(0);
  }

  function prev() {  // Handle Prev button
    if (nCur < 1) return;
    show(nCur-1);
    $scope.$digest();
  }
  function next() {  // Handle Next button
    if (nCur >= oObjs.length) return;
    show(nCur+1);
    $scope.$digest();
  }

  function show(n) {
    nCur = n;
    $scope.oObj = oObjs[nCur];
    log("viewing %o",$scope.oObj);
    var oPrev = $('.ui-viewer #but-prev');
    var oNext = $('.ui-viewer #but-next');
    if (nCur == 0) {
      oPrev.button('disable');
    } else {
      oPrev.button('enable');
    }
    if (nCur < oObjs.length-1) {
      oNext.button('enable');
    } else {
      oNext.button('disable');
    }
  }

  function doneEdit(oObj) {  // Replace the changed object in our list
    log("finished edit %o",oObj);
    for(var i=0,iMax=oObjs.length; i<iMax; i+=1) {
      if (oObjs[i].oaa == oObj.oaa) {
        oObjs[i] = oObj;
      }
    }
    $scope.oObj = oObj;
  }

  function getText() {       // Render the text in paragraphs using ng-repeat
    if (!$scope.oObj) return ['not-ready'];
    var oObj = $scope.oObj;
    if (!oObj.text) return ['no text'];
    var sLines = oObj.text.split(/\n/);
    return sLines;
  }

}


//----------------------------------------------------------------------------
//-------------------------------- Message records ------------------------------
//----------------------------------------------------------------------------
oApp.factory('tblMSGS',['servREG','servGAE','servREC','servSess','$rootScope',function(servREG,servGAE,servREC,servSess,$rootScope) {
  var oFuncs = {};

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
      ,primeList           : primeList
      ,dlgRenderExit       : dlgRenderExit
      ,optActions          : [
                             {   click:     'viewSelected()'
                                ,title:     'Press to view selected messages'
                                ,label:     'View Selected Messages'
                                ,whatClass: 'canViewSelected()'
                             }
                             ]
  };

  oFuncs.getTabProp       = function()     {return oTabProp;}
  oFuncs.viewSelected     = function()     {viewSelected();}
  oFuncs.canViewSelected  = function()     {return canViewSelected();}

  servREG.registerTable(oFuncs);
  return oFuncs;

  // -------------------------------------------------------------------------

  var oViewScope = null;

  function primeList(scope,oTP) {
    oTP.oCRUD.setDlgEdit(750,800); //Activates Dialog mode for the editor
  }


  // Called to render the Editor.  Lets us modify the Dialog Window.  Note that
  // AngularJS attributres inserted here will be of non-effect.
  function dlgRenderExit(oDlgEdit,oObj,sEditType) {
    //log("dlgRenderExit taken %o",oObj);
    var oDlg = oDlgEdit.oDlg;
    var sTitle = oObj.title || '** Create New Message **';
    if (sTitle.length > 50) sTitle = sTitle.substring(0,50)+"...";
    oDlg.dialog("option","title","EDIT:"+sTitle);
    $('div.pair#Date input',oDlg).each(function() {
      var oThis = this;
      $(this).attr('id','inp-Date');
      var sDate = oObj.date;
      var oDP = $(this).datepicker({
           dateFormat:'yymmdd'
          ,defaultDate:sDate
          ,onClose:function(sDateText,inst) {
                     oObj.date = sDateText;         // Update the object field
                     $rootScope.$digest();          // angularJS update
                   }
      });
      var oF = function() {$(oThis).datepicker('destroy');};
      oDlgEdit.finals.push(oF);  // we will need to close the Datepicker
    });
    if (oViewScope) {  //If editing from within the Dialog Viewer need to update its object cache
      oDlgEdit.finals.push(function() {oViewScope.doneEdit(oObj);});
    }
  }

  function viewSelected() { // Open the Dialog Viewer
    log("view selected");
    var oObjs = getSelectedObjs();
    if (oObjs.length == 0) return;
    var oDlg = $("#dlg-viewer");
    oDlg.dialog({ autoOpen: false, modal:true, dialogClass: "ui-viewer"
      ,title:'VIEW: '+'View Message Set'
      ,width:700, height:750, resizable:false
      ,buttons: [{text:'Prev',click:dlgPrev,id:'but-prev'},{text:"Next",click:dlgNext,id:'but-next'},{text:"EDIT",click:dlgEdit}]
      ,close:function() {
        oViewScope = null;
        log("ViewDialog closing");
      }
    });
    oDlg.dialog("open");
    oViewScope = $('#ui-viewer',oDlg).scope();
    log("view-scope %o",oViewScope);
    oViewScope.prepare(oObjs);

    function dlgNext() {
      oViewScope.next(); //forward call
    }

    function dlgPrev() {
      oViewScope.prev();  //forward call
    }

    function dlgEdit() {
      var oObj = oViewScope.oObj;
      log("edit record "+oObj);
      oTabProp.oCRUD.editRecord(oObj.oaa);
      $rootScope.$digest();  //update angular fields
    }
  }

  function canViewSelected() {
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
