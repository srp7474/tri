/*
 @license
 Copyright (c) 2013 by Steve Pritchard of Rexcel Systems Inc.
 This file is made available under the terms of the Creative Commons Attribution-ShareAlike 3.0 license
 http://creativecommons.org/licenses/by-sa/3.0/.
 Contact: public.pritchard@gmail.com
*/
"use strict";

// ---------------------------------------------------------------------------
/* This forces angular to load the tables and their dependencies
 *
 * We rely on the implied dependency injection to haul in only the tables needed and
 * thus automatically configure the system menus and available actions.
 */

function ctrlMain($scope,servSess,servGAE,servREG,tblCHQS,tblCOA,tblSUP,tblREPS,servCRUD,servConfig) {
  log("Created ctrlMain for chqs application");
  servGAE.setCust("chqs");
  servSess.setTitle("Cheque Writer System");
  servSess.setLogonExit(logonExit);

  function xfrAdminFunctions() {
    servSess.xfrAdminApp("chqs");
  }

  function addNewChqSet() {
    log("add new chq set");
    var oRepTbl = servREG.findTable("REPS");
    if (!oRepTbl) return;
    var oRecs = servCRUD.getObjs(oRepTbl.getTabProp());
    log("Records tab=%o %o",oRepTbl,{array:oRecs});
    var oChqTbl = servREG.findTable("Cheque");
    var oTP = oChqTbl.getTabProp();
    var nChqNo = 0;
    for(var i=0,iMax=oRecs.length; i<iMax; i+=1) {
      var oRec = oRecs[i];
      var oNew = {};
      oTP.createExit(oNew);
      oNew.payee = oRec.payee;
      oNew.hstamt = '0.00';
      oNew.amt = (+oRec.amt).toFixed(2);
      if (i == 0) {
        nChqNo = oNew.chqno;
      } else {
        oNew.chqno = nChqNo + i;
      }
      oNew.lines.push({amt:oNew.amt,refdate:oNew.date,hstamt:'0.00',code:oRec.code,ref:oRec.ref,totamt:oNew.amt});
      var bIntermed = (i+1 == iMax)?false:true;
      oTP.recServ.insertRec(oTP,oNew,null,bIntermed);
    }
  }

  function logonExit(oProf) {
    log("logonExit called");
    var oOMs = [];
    if (oProf && oProf.repfile) {
      oOMs.push({menu:"Add Repeat Set",func:addNewChqSet,role:'admin'});
    }
    oOMs.push({menu:"Admin Functions",func:xfrAdminFunctions,role:'admin'});
    servSess.setOptMenuItems(oOMs);
  }
}

//----------------------------------------------------------------------------
//-------------------------------- Cheque records ------------------------------
//----------------------------------------------------------------------------
oApp.factory('tblCHQS',['$rootScope','servREG','servGAE','servREC','servSess',function($rootScope,servREG,servGAE,servREC,servSess) {
  var oFuncs = {};
  var nPrintChq = null;

  var oTabProp = {
       recTitle: 'Cheque'
      ,recName:  'chq'
      ,recType:  'chqs'
      ,lsName:   '-chqs'
      ,tabServ:  oFuncs    //self pointer
      ,recServ:  servREC
      ,order:    {col:'chqno'}
      ,cols:     [{type:'actions',    title: 'Actions'      ,showEdit:false, addDefault:false,
                         actions:[{label:'edit',click:'editRecord(oRow.oaa)',title:'',methClass:getAnchorClass,whatClass:'getAnchorClass(this,oRow,oA);'}
                                 ,{label:'drop',click:'dropRecord(oRow.oaa)',title:'',methClass:getAnchorClass,whatClass:'getAnchorClass(this,oRow,oA);',role:'admin'}
                                 ,{label:'print',method:printCheque,click:'printCheque(this,oRow)',methClass:getAnchorClass,whatClass:'getAnchorClass(this,oRow,oA);'}
                                 ,{label:'voided',click:'',methClass:getAnchorClass,whatClass:'getAnchorClass(this,oRow,oA);'}
                                 ]
                  }
                 ,{col: 'chqno',      title: 'ChqNo'        ,showEdit:false}
                 ,{col: 'date',       title: 'Y-M-D'        ,showEdit:false}
                 ,{col: showAmt,      title: 'Amount'       ,showEdit:false}
                 ,{col: 'payee',      title: 'Payee'        ,showEdit:false}
                 ,{col: getLineCount, title: 'Lines'        ,showEdit:false}
                 ,{col: balErr,       title: 'BalErr'       ,showEdit:false}
                 ,{col: 'dummy',      title: 'chq-edit'    ,showList:false,type:'cust',showEdit:true, reqd:false, htmlCust:'chequeEdit.html', hideLabel:true}
                ]
      ,filters: [
                 {type: 'cust',   field:'_custmask', title:'cust-mask', place:'payee search or =chqno', methCust: custMask}
                ,{type: 'chkbox', field:'_custprt',  title:'Show All: ', methCust: custPrt}
                ]
      ,validate            : validateCheque
      ,createExit          : createExit
      ,fileKey             : fileKey
      ,fileKeyRef          : 'chqfile'
      //,getEditRecordExit   :getEditRecordExit
      ,saveRecordExit      :saveRecordExit
      ,primeList           :primeList
      ,primeEdit           :primeEdit
  };

  oFuncs.getTabProp  = function()            {return oTabProp;}
  oFuncs.getSupMap   = function()            {return getSupMap();}
  servREG.registerTable(oFuncs);
  return oFuncs;

  // -------------------------------------------------------------------------

  function primeList(scope,oTP) {
    log("primeList scope=%o oTP=%o",scope,oTP);
    if ((scope.oSel) && (!('_custPrt' in scope.oSel))) {
      scope.oSel._custprt = '0';
      scope.oSel._custvoid = '0';
      log("setCustPrt %o flag=%s",scope,scope.oSel._custprt);
    }
    nPrintChq = null;
  }

  function getSupMap() {
    var oSupMap = {};
    var oChqs = oTabProp.oCRUD.getObjs(oTabProp);
    for(var i=0,iMax=oChqs.length; i<iMax; i+=1) {
      var oChq =oChqs[i];
      oSupMap[oChq.payee] = true;
    }
    return oSupMap;
  }

  function primeEdit(scope,oTP,oObj) {
    log("primeEdit scope=%o oTP=%o obj=%o",scope,oTP,oObj);
    scope.getChqAmt      = getChqAmt;
    scope.getHSTAmt      = getHSTAmt;
    scope.getAmtTot      = getAmtTot;
    scope.getTotHST      = getTotHST;
    scope.getTotTot      = getTotTot;
    scope.getTotAmt      = getTotAmt;
    scope.addNewLine     = addNewLine;
    scope.removeLine     = removeLine;
    scope.testShowSups   = testShowSups;
    scope.getCurSups     = getCurSups;
    scope.supClick       = supClick;
    scope.codeClick      = codeClick;
    scope.getAddrLine    = getAddrLine;
    scope.insertLine     = insertLine;
    scope.getCurCOAs     = getCurCOAs;
    scope.setAmtFocus    = setAmtFocus;
    scope.setRefFocus    = setRefFocus;
    scope.setSaveFocus   = setSaveFocus;
    scope.printCheque    = printCheque;
                         // prime variables
    scope.bShowSups      = false;
    scope.bLocked        = false;
    if (!servSess.isAdmin()) {
      if (oObj && oObj.bPrinted) scope.bLocked = true;
    }
    return oObj;
  }

  function printCheque(scope,oChq) {
    log("printChq scope=%o obj=%o",scope,oChq);
    var oHandler = function printReqHandler(event) {
      var sVerb = event.data.verb;
      if (sVerb == "chqs:send-print-info") {
        log("printReqHandler called %o obj=%o",event,oChq);
        var oAddr = getAddress(oChq);
        var oMsg = {verb:'chqs:chqs-data',payload:{oObj:oChq,fmt:0,addr:oAddr}};
        event.source.postMessage(oMsg,"*");
      } else if (sVerb == "chqs:void-chq") {
        log("renum chq %s cur=%s",event.data.chqno,oChq,chqno);
        if (oChq.chqno == event.data.chqno) {
          scope.nPrintChq = null;
          var oNew = renumChq(oChq);
          var oAddr = getAddress(oChq);
          var oMsg = {verb:'chqs:chqs-data',payload:{oObj:oNew,fmt:0,addr:oAddr}};
          event.source.postMessage(oMsg,"*");
          servSess.getListCtrl().nPrintChq = null;
          $rootScope.$digest();
        } else {
          log("logic error lost chq %o "+oChq);
        }
      } else if (sVerb == "chqs:printed-chq") {
        if (oChq.chqno == event.data.chqno) {
          var oTP = oTabProp;
          oChq.bPrinted = true;
          nPrintChq = null;
          oTP.recServ.insertRec(oTP,oChq,oChq.oaa);
          servSess.getListCtrl().nPrintChq = null;
          $rootScope.$digest();
        } else {
          log("logic(1) error lost chq %o "+oChq);
        }
      } else {
        log("printReqHandler spurious verb %s",sVerb);
      }
    }
    servSess.createFormWindow('chqs',oHandler,"Chqs.htm","FormCheque.htm");
  }

  function createExit(oObj) {
    var sNow = ""+getNowYMD();
    oObj.chqno     = getNextChqNo();
    oObj.date      = sNow;
    oObj.lines      = [];
    setPayeeFocus();
    return true;
  }

  function getNextChqNo() {
    var oChqs = oTabProp.oCRUD.getObjs(oTabProp);
    var nNext = 0;
    for(var i=0,iMax=oChqs.length; i<iMax; i+=1) {
      var oChq = oChqs[i];
      if (+oChq.chqno > nNext) nNext = +oChq.chqno;
    }
    return nNext + 1;
  }

  function saveRecordExit(oRec) {
    log("saveRecordExit.1 %o",oRec);
    for(var i=0,iMax=oRec.lines.length; i<iMax; i+=1) {
      var oLine = oRec.lines[i];
      delete oLine.bShowCode;
      delete oLine.amtErr;
    }
    return oRec;
  }

  function renumChq(oChq) {
    var oTP = oTabProp;
    log("located chq %i for void-chq request",oChq.chqno);
    var oNew = angular.copy(oChq);
    oChq.bVoid = true;
    oNew.chqno = +oNew.chqno + 1;
    oNew.bPrinted = false;
    //oChq.bPrinted = true;
    var oChqs = oTP.oCRUD.getObjs(oTP);
    for(var i=0,iMax=oChqs.length; i<iMax; i+=1) {
      var oC = oChqs[i];
      if (+oC.chqno > oChq.chqno) {
        oC.chqno += 1;
        log("Renum "+oC.chqno);
      }
    }
    oTP.recServ.insertRec(oTP,oNew,null);
    return oNew;
  }

  function testShowSups(scope) {
    log("testShowSups scope=%o",scope);
    return scope.bShowSups;
  }

  function supClick(scope,oSup) {
    if (!scope.oObj) return;
    scope.oObj.payee = oSup.name;
    scope.$parent.bShowSups = false;
    insertLine(scope.oObj);
    //if ($scope.moveNext) $scope.moveNext('Sup');
  }

  function codeClick(scope,oObj,oLine,oCoa) {
    log("codeClick scope=%o obj=%o line=%o coa=%o",scope,oObj,oLine,oCoa);
    oLine.code = oCoa.code+" "+oCoa.name;
    oLine.bShowCode = false;
    setTimeout(function(){setAmtFocus(oObj,oLine)},0);
  }

  function getCurSups(scope,sMask) {
    var oTab = servREG.findTable('Suppliers');
    if (oTab == null) return [];
    var oTP = oTab.getTabProp();
    var oSups = oTP.oCRUD.getObjs(oTP);
    if (oSups == null) return [];
    var oSelSups = [];
    if (!sMask) return oSelSups;
    if (sMask.trim().length == 0) return oSelSups;
    var oMaskRG = new RegExp('^'+sMask,"i");
    for(var i=0,iMax=oSups.length; i<iMax; i+=1) {
      var oSup = oSups[i];
      if (oSup.name.match(oMaskRG) != null) oSelSups.push(oSup);
    }
    if (scope) {
      scope.sAutoName = null;
      if (oSelSups.length == 1) {
        scope.sAutoName = oSelSups[0].name;
      }
    }
    //log("returning sups len=%i, scope=%o mask=%s",oSelSups.length,scope,sMask);
    return oSelSups;
  }

  function getAddress(oChq) {
    var oSups = getCurSups(null,oChq.payee);
    if (oSups.length == 0) return null;
    return getAddrLine(oSups[0],"<br>");
  }

  function getAddrLine(oSup,sEOL) {
    if (!sEOL) sEOL = "\r\n";
    var sStr = "";
    sStr = addFld(sStr,oSup.street1,sEOL);
    sStr = addFld(sStr,oSup.street2,sEOL);
    sStr = addFld(sStr,oSup.city,sEOL);
    sStr = addFld(sStr,oSup.prov,', ');
    sStr = addFld(sStr,oSup.zip,', ');
    return sStr;
  }

  function getCurCOAs(scope,oObj,oLine) {
    var oTab = servREG.findTable('COA');
    if (oTab == null) return [];
    var oTP = oTab.getTabProp();
    var oCOAs = oTP.oCRUD.getObjs(oTP);
    var sMask = oLine.code;
    var oSelCOAs = [];
    if (!sMask) return [];
    if (sMask.length > 4) return [];
    var oMaskRG = new RegExp('^'+sMask,"i");
    for(var i=0,iMax=oCOAs.length; i<iMax; i+=1) {
      var oCOA = oCOAs[i];
      if (oCOA.code.match(oMaskRG) != null) oSelCOAs.push(oCOA);
    }
    scope.sAutoName = null;
    if (oSelCOAs.length == 1) {
      oLine.bShowCode = false;
      scope.sAutoName = oSelCOAs[0].code+" " + oSelCOAs[0].name;
      oLine.code = scope.sAutoName;
      setTimeout(function(){setAmtFocus(oObj,oLine)},0);
    }
    return oSelCOAs;
  }

  function addFld(sStr,sFld,sSep) {
    if (!sFld) return sStr;
    if (sStr.length > 0) sStr += sSep;
    sStr += sFld.trim();
    return sStr;
  }

  function showAmt(oObj,scope,oCol) {
    if (!oObj) return null;
    if (!oObj.amt) return null;
    return (+oObj.amt).toFixed(2);
    //log("showAmt %o %o %o",oObj,p1,p2);
  }

  function fileKey() {
    var oProf = servSess.getProfile();
    if (!oProf) return "no-prof";
    if (!oProf.chqfile) return "no-chq-file";
    return oProf.chqfile;
  }

  function getAnchorClass(scope,oObj,oA) {
    //log("printChq called %o",oObj);
    if (oA.label == 'voided') {
      if (oObj.bVoid) return 'c-quiet';
      return "hide";
    }
    if (oA.label == 'edit') return "c-action";
    if (oA.label == 'print') {
      //log("printChq called %s scope=%o obj=%o a=%o printChq=%o",oObj.chqno,scope,oObj,oA,nPrintChq);
      if (oObj.bVoid) return 'hide';
      if (oObj.bPrinted) return "c-quiet";
      if (nPrintChq == oObj.chqno) return "c-action"; //First non-printed cheque
      if (!nPrintChq) {  //called multiple times so cannot use binary switch.  Use local-global vbl to avoid nested scopes.
         nPrintChq = oObj.chqno;
         return "c-action";
      }
      return "c-quiet";
    }
    return "c-action";
  }

  function validateCheque(scope,oObj,oCopy,fnValStd,fnEditErr) {
    log("validateChq scope=%o obj=%o",scope,oObj);
    if (!oObj.payee) return fnEditErr("payee required");
    var sPayee = oObj.payee.trim();
    if ((sPayee.length > 0) && (sPayee.length < 4)) return fnEditErr('invalid payee '+sPayee);
    if (oObj.lines.length == 0) return fnEditErr("add lines");
    oObj.amt = getChqAmt(oObj);
    if (!oObj.amt || (+oObj.amt == 0)) return fnEditErr("Amount cannot be zero");
    for(var i=0,iMax=oObj.lines.length; i<iMax; i+=1) {
      var oLine = oObj.lines[i];
      if (!oLine.code || (oLine.code.trim() == '')) return fnEditErr("Line "+(i+1)+" has no code");
      if (oLine.code && (oLine.code.trim().length < 6)) return fnEditErr("Line "+(i+1)+" code not valid: "+oLine.code);
    }
    oObj.hstamt = (+getHSTAmt(oObj)).toFixed(2);
    if ((oObj.amt != oCopy.amt) && (oObj.bPrinted)) return fnEditErr("Cannot change amount of printed cheque new="+oObj.amt+" old="+oCopy.amt);
    delete oObj.tag;
    return true;
  }

  function balErr(oChq,scope,oCol) {
    if (!oChq.amt) return 'N';
    if (+oChq.amt == +getTotTot(oChq)) return 'N';
    log("balErr chq=%o amt=%s tot=%s",oChq,oChq.amt,getTotTot(oChq));
    return 'Y';
  }

  function getLineCount(oObj) {
    //log("getLineCount %o",p1);
    if (oObj.lines) return oObj.lines.length;
    return 0;
  }

  function custMask(oTab,oObjs,oData,oFil) {
    var sStr = oData[oFil.field] || '';
    if (sStr.trim() == '') return oObjs;
    var sFlds = ['payee'];
    var oMask = new RegExp(sStr,"i");
    if (sStr.substring(0,1) == '=') {
      if (sStr.length > 1) {
        oMask = new RegExp('^'+sStr.substring(1),"i");
        sFlds = ['chqno'];
      }
    }
    var oNew = [];
    for(var i=0,iMax=oObjs.length; i<iMax; i+=1) {
      var oObj = oObjs[i];
      var bUse = false;
      for(var j=0,jMax=sFlds.length; j<jMax; j+=1) {
        var sFld = sFlds[j];
        if (oObj[sFld] && ((""+oObj[sFld]).match(oMask) != null)){
          bUse = true;
          break;
        }
      }
      if (bUse) oNew.push(oObj);
    }
    return oNew;
  }

  function dummy() {}

  function custPrt(oTab,oObjs,oData,oFil) {
    var sStr = oData[oFil.field] || '0';
    log("custPrt %s data=%o tab=%o",sStr,oData,oTab);
    if (sStr == '1') return oObjs;
    var oNew = [];
    for(var i=0,iMax=oObjs.length; i<iMax; i+=1) {
      var oObj = oObjs[i];
      if (oObj.bPrinted) continue;
      oNew.push(oObj);
    }
    return oNew;
  }

  function getHSTAmt(oLine) {
    if (oLine.code == 'HST') return +oLine.amt;
    if (oLine.HST && oLine.HST == 'H') return (+oLine.amt * 0.13).toFixed(2);
    return 0.00;
  }

  function getAmtTot(oLine) {
    return (+getHSTAmt(oLine)) + (+oLine.amt);
  }

  function getTotHST(oChq) {
    var oLines = getLines(oChq);
    var dTot = 0.00;
    for(var i=0,iMax=oLines.length; i<iMax; i+=1) {
      var oLine = oLines[i];
      dTot += (+getHSTAmt(oLine));
    }
    return dTot.toFixed(2);
  }

  function getTotTot(oChq) {
    var oLines = getLines(oChq);
    var dTot = 0.00;
    for(var i=0,iMax=oLines.length; i<iMax; i+=1) {
      var oLine = oLines[i];
      dTot += (+getAmtTot(oLine));
    }
    return dTot.toFixed(2);
  }

  function getTotAmt(oChq) {
    var oLines = getLines(oChq);
    var dTot = 0.00;
    for(var i=0,iMax=oLines.length; i<iMax; i+=1) {
      var oLine = oLines[i];
      dTot += (+oLine.amt);
    }
    return dTot.toFixed(2);
  }

  function getChqAmt(oChq) {
    return getTotTot(oChq);
  }

  function isBalError(oChq) {
    if (!oChq.amt) return true;
    if (+oChq.amt != getTotTot(oChq)) return true;
    return false;
  }

  // This function normalizes lines
  function getLines(oChq) {
    var oLines = [];
    if (oChq) {
      for(var i=0,iMax=oChq.lines.length; i<iMax; i+=1) {
        var oLine = oChq.lines[i];
        oLine.hstamt = (+getHSTAmt(oLine)).toFixed(2);
        oLine.totamt = (+getAmtTot(oLine)).toFixed(2);
        if (oLine.code != 'HST') {
          oLines.push(oLine);
        }
      }
    }
    return oLines;
  }

  function removeLine(oChq,oLine) {
    log("removeLine %o linee=%o",oChq,oLine);
    var oLines = [];
    for(var i=0,iMax=oChq.lines.length; i<iMax; i+=1) {
      var oL = oChq.lines[i];
      if (oL != oLine) oLines.push(oL);
      log("remove oL=%o line=%o lines=%i",oL,oLine,oLines.length);
    }
    oChq.lines = oLines;
  }

  function insertLine(oObj) {
    if (oObj.lines.length == 0) addNewLine(oObj);
  }

  function addNewLine(oObj) {
    var nIX = oObj.lines.length;
    oObj.lines.push({amt:0.00,refdate:oObj.date});
    setTimeout(function(){setCodeFocus(nIX);},0); // delay so focus takes because DOM is built
  }

  function setCodeFocus(nIX) {
    var oInp =  document.getElementById('code-'+nIX);
    if (oInp && (oInp.value.trim().length == 0)) {
      oInp.focus();
    }
  }

  function setRefFocus(oObj,oLine) {
    var sEditType = oTabProp.oCRUD.getEditType();
    if (sEditType == 'Edit') return;
    var nIX = getLineIX(oObj,oLine);
    var oInp =  document.getElementById('RefFld-'+nIX);
    if (oInp) oInp.focus();
  }

  function setSaveFocus(oObj,oLine) {
    var sEditType = oTabProp.oCRUD.getEditType();
    log("setSaveFocus %s %o %o",sEditType,oObj,oLine);
    if (sEditType == 'Edit') return;
    var oA =  document.getElementById('edit-save');
    if (oA) setTimeout(function(){oA.focus();},0); // delay so focus takes because DOM is built
  }

  function setPayeeFocus() {
    var oInp =  document.getElementById('payee');
    if (oInp) setTimeout(function(){oInp.focus();},0); // delay so focus takes because DOM is built
  }


  function setAmtFocus(oObj,oLine) {
    var sEditType = oTabProp.oCRUD.getEditType();
    log("setAmtFocus %s %o %o",sEditType,oObj,oLine);
    if (sEditType == 'Edit') return;
    var nIX = getLineIX(oObj,oLine);
    var oInp =  document.getElementById('RawAmt-'+nIX);
    if (oInp && (!oInp.value || (+oInp.value == 0))) {
      log("setAmtFocus %o",oInp);
      oInp.focus();
    }
  }

  function getLineIX(oObj,oLine) {
    for(var i=0,iMax=oObj.lines.length; i<iMax; i+=1) {
      var oL = oObj.lines[i];
      if (oL == oLine) return i;
    }
    return -1;
  }

}]);

//----------------------------------------------------------------------------
//------------------------- Chart of Accounts records ------------------------
//----------------------------------------------------------------------------
oApp.factory('tblCOA',['servREG','servGAE','servREC','servSess',function(servREG,servGAE,servREC,servSess) {
  var oFuncs = {};

  var oTabProp = {
       recTitle: 'COA'
      ,recName:  'cit'
      ,recType:  'coa'
      ,lsName:   '-coas'
      ,tabServ:  oFuncs    //self pointer
      ,recServ:  servREC
      ,order:    {col:'code'}
      ,cols:     [{type:'actions',    title: 'Actions'      ,showEdit:false, addDefault:true}
                 ,{col: 'code',       title: 'Code'         ,showEdit:false}
                 ,{col: 'name',       title: 'Name'         ,showEdit:false}
                 ,{col: 'HST',        title: 'HST'         ,showEdit:false}
                ]
      ,filters: [
                 {type: 'mask',   field: 'code'}
                ,{type: 'mask',   field: 'name'}
                ]
      ,menuWhen          : testRepFile
  };


  oFuncs.getTabProp  = function()            {return oTabProp;}
  servREG.registerTable(oFuncs);
  return oFuncs;


  function testRepFile() {
    if (servSess.isAdmin()) return true;
    return false;
  }

}]);

//----------------------------------------------------------------------------
//------------------------- Repeated Cheques records ------------------------
//----------------------------------------------------------------------------
oApp.factory('tblREPS',['servREG','servGAE','servREC','servSess',function(servREG,servGAE,servREC,servSess) {
  var oFuncs = {};

  var oTabProp = {
       recTitle: 'REPS'
      ,recName:  'repeat'
      ,recType:  'repeat'
      ,lsName:   '-repeats'
      ,tabServ:  oFuncs    //self pointer
      ,recServ:  servREC
      ,order:    {col:'payee'}
      ,cols:     [{type:'actions',    title: 'Actions'      ,showEdit:false, addDefault:true}
                 ,{col: 'payee',      title: 'Payee'        ,showEdit:true}
                 ,{col: 'amt',        title: 'Amount'       ,showEdit:true}
                 ,{col: 'code',       title: 'Code'         ,showEdit:true}
                 ,{col: 'ref',        title: 'Ref'          ,showEdit:true}
                ]
      ,fileKey             : fileKey
      ,fileKeyRef          : 'repfile'
      ,menuWhen          : testAdmin
  };


  oFuncs.getTabProp  = function()            {return oTabProp;}
  servREG.registerTable(oFuncs);
  return oFuncs;

  function testAdmin() {
    var oProf = servSess.getProfile();
    if (!oProf) return false;
    if (!oProf.repfile) return false;
    return true;
  }

  function fileKey() {
    var oProf = servSess.getProfile();
    if (!oProf) return null;
    if (!oProf.repfile) return null;
    return oProf.repfile;
  }

}]);

//----------------------------------------------------------------------------
//------------------------------ Suppliers records ---------------------------
//----------------------------------------------------------------------------
oApp.factory('tblSUP',['servREG','servGAE','servREC','servSess',function(servREG,servGAE,servREC,servSess) {
  var oFuncs = {};
  var oSupMap = null;

  var oTabProp = {
       recTitle: 'Suppliers'
      ,recName:  'cit'
      ,recType:  'suppliers'
      ,lsName:   '-suppliers'
      ,tabServ:  oFuncs    //self pointer
      ,recServ:  servREC
      ,order:    {col:'name'}
      ,cols:     [{type:'actions',    title: 'Actions'      ,showEdit:false, addDefault:false
                   ,actions:
                   [{label:'edit',click:'editRecord(oRow.oaa)',title:'',methClass:getAnchorClass,whatClass:'getAnchorClass(this,oRow,oA);'}
                   ,{label:'drop',click:'dropRecord(oRow.oaa)',title:'',methClass:getAnchorClass,whatClass:'getAnchorClass(this,oRow,oA);'}
                   ]}
                 ,{col: 'name',       title: 'Name'         ,showEdit:true,showList:true, many:false}
                 ,{col: 'street1',    title: 'Street1'      ,showEdit:true,showList:false}
                 ,{col: 'street2',    title: 'Street2'      ,showEdit:true,showList:false,reqd:false}
                 ,{col: 'city',       title: 'City'         ,showEdit:true,showList:false}
                 ,{col: 'prov',       title: 'Prov.'        ,showEdit:true,showList:false}
                 ,{col: 'zip',        title: 'ZipCode'      ,showEdit:true,showList:false,reqd:false}
                 ,{col: getAddr,      title: 'Address'      ,showEdit:false}
                ]
      ,filters: [{type: 'mask',   field: 'name'}
                ,{type: 'mask',   field: getAddr}
                ]
  };

  oFuncs.getTabProp  = function()            {return oTabProp;}
  servREG.registerTable(oFuncs);
  return oFuncs;

  function getAddr(oObj) {
    return oObj.street1;
  }

  function getAnchorClass(scope,oObj,oA) {
    if (oA.label == 'edit') return 'c-action';
    if (oA.label == 'drop') {
      if (oSupMap == null) {
        var oDonTab = servREG.findTable("Cheque");
        oSupMap = oDonTab.getSupMap();
        log("loaded oSupMap %o",oSupMap);
      }
      if (oObj.name in oSupMap) return 'c-quiet';
      return 'c-action';
    }
    return 'c-quiet';
  }

}]);

//----------------------------------------------------------------------------
//----------------------------------------------------------------------------
// example of app specific directive
//----------------------------------------------------------------------------
//----------------------------------------------------------------------------

oApp.directive('amount', function() {
  return {
    restrict: 'A', // only activate on element attribute
    require: '?ngModel', // get a hold of NgModelController
    priority: 500,
    link: function(scope, element, attrs, ngModel) {
      if(!ngModel) return; // do nothing if no ng-model
      var sFld  = attrs.amount;
      var sNext = attrs.next;
      element.bind('focus', function() {
        focus();
      });
      element.bind('blur', function() {
        validate(null);
      });
      // Listen for change events to enable binding
      element.bind('keyup', function(oEvt) {
        if (oEvt.keyCode == 13) { // enter
          validate(sNext);
        }
      });

      // Write data to the model
      function focus() {
        ngModel.$setViewValue("");
        element.val("");
        scope[sFld].amtErr = null;
      }

      function validate(sNext) {
        var sVal = ngModel.$modelValue;
        if (!sVal || (sVal.trim() == '')) sVal = '0';
        scope[sFld].amtErr = null;
        if (+sVal == 0) scope[sFld].amtErr = 'amt zero';
        if (!scope[sFld].amtErr) {
          if (sVal.match(/^([0-9]*)?[.]?([0-9]*)?$/) == null) scope[sFld].amtErr = "Bad amt: "+sVal;
        }
        var sDec = "";
        if (!scope[sFld].amtErr) {
           sDec = (0 + (+sVal)).toFixed(2);
        }
        log("keyup fld="+sFld+" amount="+ngModel.$modelValue+" "+scope[sFld].amtErr+" val="+sVal+" ix="+scope.$index+" dec="+sDec);
        if (!scope[sFld].amtErr) {
          if (sVal != sDec) {
            element.val(sDec);
            ngModel.$setViewValue(sDec);
          }
        }
        if (sNext && (!scope[sFld].amtErr)) {
          scope.$eval(sNext);
        }
        scope.$digest();  // trigger another cycle
        scope.$parent.$digest();  // trigger another cycle
      }

    }
  };
});

