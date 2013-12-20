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

function ctrlMain($scope,servSess,servGAE,tblDEP,tblENV,tblDON,servCRUD,servREG) {
  log("Created ctrlMain for deps application");
  servGAE.setCust("deps");
  servSess.setTitle("Deposit Recording System");
  var oOpts = [{menu:"Admin Functions",func:xfrAdminFunctions,role:'admin'},{menu:"Deposit Summaries",func:printDepSum,role:'elder',sandbox:true}];
  servSess.setOptMenuItems(oOpts);

  function xfrAdminFunctions() {
    servSess.xfrAdminApp("deps",["TableDonors"]);
  }

  function printDepSum() {
    var oDepTab = servREG.findTable("Deposit");
    var oDonTab = servREG.findTable("Donor");
    var oDonMap = oDonTab.getDonorMap();
    var oObjs   = oDepTab.getTabProp().oObjs;
    var oHandler = function printReqHandler(event) {
      log("printDepSum called %o obj=%o tab=%o",event,oObjs,oDepTab);
      var oMsg = {verb:'deps:deps-sum-data',payload:{oObjs:oObjs,oMap:oDonMap,oProf:servSess.getProfile()}};
      event.source.postMessage(oMsg,"*");
    }
    servSess.createFormWindow('deps',oHandler,"Deps.htm","FormDepSum.htm");
  }

}

function ctrlDepsEdit($controller,$scope,servSess,servREC) {
  log("Created ctrlDepsEdit by extending ctrlCommEdit");
  var ctrl = $controller(ctrlCommEdit,{$scope:$scope});
}

//----------------------------------------------------------------------------
//-------------------------------- Deposit records ------------------------------
//----------------------------------------------------------------------------
oApp.factory('tblDEP',['servREG','servGAE','servTBL','servSess','servCRUD','$rootScope','servConfig',function(servREG,servGAE,servTBL,servSess,servCRUD,$rootScope,servConfig) {
  var oFuncs = {};

  var donors = {
       base:    'donors'
      ,cols:    [ {col: 'actions',    title: 'Actions', type:'action',methods:[{name:'edit',method:editExistDonor},{name:'drop',method:dropDonor}],hint:getDonorTitle}
                 ,{col: 'code',       title: 'Code'         ,readonly:true,showList:true ,hint:getDonorTitle}
                 ,{col: getDonorName, title: 'Donor' }
                 ,{col: getAmt,       title: '$'         }
                 ,{col: getTender,    title: 'How'     }
                 ,{col: getLines,     title: '#'         }
                ]
  }

  var donedit = {
       base:    'oDonEdit'
      ,cols:    [ {col: 'actions' ,showEdit:true  ,htmlEdit: 'actions.html',methCancel         :cancelEditDonor
                                                                           ,methSave           :saveEditDonor
                                                                           ,methCanSave        :methCanSave
                                                                           }
                 ,{col: 'code'    ,showEdit:true  ,htmlEdit: 'code.html'}
                 ,{col: 'tender'  ,showEdit:true  ,htmlEdit: 'tender.html' ,methBill           :methBill
                                                                           ,methChangeTender   :methChangeTender
                                                                           ,methResetTally     :methResetTally
                                                                           }
                 ,{col: 'amount'  ,showEdit:true  ,htmlEdit: 'amount.html' ,methAmtChange      :methAmtChange
                                                                           ,methToggleTally    :methToggleTally
                                                                           ,methAmtFocus       :methAmtFocus
                                                                           ,methAmtBlur        :methAmtBlur
                                                                           }
                 ,{col: 'desigs'  ,showEdit:true  ,htmlEdit: 'desigs.html' ,methOptions        :methOptions
                                                                           ,methHasSubcodes    :methHasSubcodes
                                                                           ,methGetSubcodes    :methGetSubcodes
                                                                           ,methHasAcctChange  :methHasAcctChange
                                                                           ,methDesigAmtBlur   :methDesigAmtBlur
                                                                           ,methDesigAmtFocus  :methDesigAmtFocus
                                                                           }
                 ,{col: 'note'    ,showEdit:true  ,htmlEdit: 'note.html'}
                ]
  }

  var oTabProp = {
       recTitle: 'Deposit'
      ,recName:  'deposit'
      ,recType:  'dep'
      ,lsName:   "-deps"
      ,tabServ:  oFuncs    //self pointer
      ,recServ:  servTBL
      ,order:    {col:'name',seq:'reverse'}
      ,cols:     [{type:'actions',    title: 'Actions'      ,showEdit:false, addDefault:false,
                         actions:[{label:'edit',click:'editRecord(oRow.oaa)',title:'',methClass:getAnchorClass,whatClass:'getAnchorClass(this,oRow,oA);'}
                                 ,{label:'drop',click:'dropRecord(oRow.oaa)',title:'',methClass:getAnchorClass,whatClass:'getAnchorClass(this,oRow,oA);'}
                                 ,{label:'print',method:printFormDeposit,click:'printFormDeposit(this,oRow)',methClass:getAnchorClass,whatClass:'getAnchorClass(this,oRow,oA);'}
                                 ]
                  }
                 ,{col: 'name',       title: 'FileName'     ,many:false                    ,  readonly:true }
                 ,{col: 'counter1',   title: 'Counter1'     ,showList:false ,showEdit:false,  readonly:true }
                 ,{col: 'counter2',   title: 'Counter2'     ,showList:false ,showEdit:false,  readonly:true }
                 ,{col:  counters,    title: 'Counters'     ,showEdit:true  ,showList:true                  }
                 ,{col:  cashTot,     title: 'Cash'         ,field:'cashTot',showEdit:true,showList:false }
                 ,{col:  chequeTot,   title: 'Cheque'       ,showEdit:true  ,showList:false               }
                 ,{col:  totalTot,    title: 'Total'        ,showEdit:true  ,showList:false               }
                 ,{col:  'currency',  title: 'Acct'         ,readonly:true  ,showList:true,showEdit:true } // morphed to be acct to handle BKS acct
                 ,{col:  'src',       title: 'Src'          ,readonly:true  ,showList:true,showEdit:false }
                 ,{col:  'cashSum',   title: 'Cash'         ,readonly:true  ,showList:true,showEdit:false }
                 ,{col:  'chequeSum', title: 'Cheque'       ,readonly:true  ,showList:true,showEdit:false }
                 ,{col:  depositTot,  title: 'Deposit$'     ,readonly:true  ,showList:true,showEdit:false }
                 ,{col:  'note',      title: 'Note'         ,reqd:false     ,showList:false             }
                 ,{col:  'edit-don',  title: 'Edit Donor'   ,type:'panel',showList:false,scope:'oDonEdit',objName:'oPanel.oDonEdit',schema:donedit,showEdit:showDonorEdit, htmlCSS:'donor-edit.css', cssid:'css-edp',legend:'Donor'}
                 ,{col:  'donors',    title: 'Donors'       ,type:'list', schema:donors,showEdit:true,showList:false}
                ]
      ,editActions       : []
      ,validate          : validateDeposit
      ,createExit        : createExit
      ,getEditRecordExit : getEditRecordExit
      ,menuWhen          : testDoubleLogin
      ,cacheLoadExit     : cacheLoadExit
      ,addDonorLine      : addDonorLine  // allow callback from Donor click
      ,primeEdit         : primeEdit
  };

  var oInfo  = servConfig.getInfo();
  var  accts = oInfo.accts;

  oFuncs.getTabProp  = function()            {return oTabProp;}
  servREG.registerTable(oFuncs);
  return oFuncs;

  // -------------------------------------------------------------------------

  function primeEdit(scope,oTP,oObj) {
    log("primeEdit scope=%o oTP=%o obj=%o",scope,oTP,oObj);
    scope.setAddFocus    = setAddFocus;
    scope.sAutoName      = '';//force autotab to take
    scope.sEditSuppName  = 'donors-list.html';
    return oObj;
  }

  function getAnchorClass(scope,oObj,oA) {
    //log("isActive %o anchor=%o",oObj,oA);
    if (oA.label == 'print') return 'c-action';
    if (oA.label == 'edit') {
      var oDate = new Date();
      var sToday = getNowYMD();
      var sYest  = getYMD(new Date(oDate.getTime()-(24*60*60*1000)));
      if (oObj && oObj.details && oObj.details.name) {
        var sFileDate = oObj.details.name.substring(0,10);
        if (sFileDate == sToday) return 'c-action';
        if (sFileDate == sYest) return 'c-action';
      }
      if (servSess.isSandboxMode()) return 'c-action';
      //log("isActive %o anchor=%o yest=%s today=%s",oObj,oA,sYest,sToday);
    }
    if (oA.label == 'drop') {
      var oProp = servSess.getProfile();
      if (oProp.role && oProp.role.indexOf("admin") >= 0) return 'c-action';
      if (servSess.isSandboxMode()) return 'c-action';
    }
    return 'c-quiet';
  }

  function testDoubleLogin() {
    var sUser1 = servSess.getUser();
    var sUser2 = servSess.getUser2();
    if (!sUser1) return false;
    if (!sUser2) return false;
    //log("testDoubleLogin "+sUser1+" "+sUser2);
    if (sUser1 != sUser2) return true;
    return false;
  }

  // This only is called before the first save
  function changeCurrency(scope,oObj,$event) {
    log('Change currency obj=%o evt=%o',oObj,$event);
    oObj.currency = getOtherCurrency(oObj);
    oObj.name = oObj.name.replace(/(USD|CND|BKS)/,oObj.currency);
    oObj.KeyName   = servGAE.getCust()+"/"+oTabProp.recType+"/"+oObj.name;
  }

  function getOtherCurrency(oObj) {
    var sCur = getCurrency(oObj);
    if (sCur == 'CND') return "USD";
    if (sCur == 'USD') return "BKS";
    return 'CND';
  }

  function getCurrency(oObj) {
    if (!oObj) return "CND";
    if (!oObj.currency) return "CND";
    return oObj.currency;
  }

  function validateDeposit(scope,oObj,oCopy,fnValStd,fnEditErr) {
    if (oObj.donors.length == 0) return fnEditErr("add donors");
    if (scope.oPanel.oDonEdit) return false; // no error but do not allow save
    return true;
  }

  function getUserID(oObj) {
    var sStr = oObj.KeyName;
    var nIX = sStr.lastIndexOf("/");
    return sStr.substring(nIX+1);
  }

  function findAcct(sAcct) {
    for(var i=0; i < accts.length; i+= 1) {
      if (sAcct == accts[i].code) return accts[i];
    }
    return null;
  }

  function getDonorTitle(oObj) {
    if (!oObj.donor) return '';
    return (oObj.donor.address+"\r\n"+oObj.donor.phones).trim();
  }

  function methHasSubcodes(scope,oObj,nRow) {
    if (nRow >= oObj.desigs.length) return false;
    //log("HasSubCodes "+nRow+" "+oObj.desigs[nRow].acct);
    var oAcct = findAcct(oObj.desigs[nRow].acct);
    if (!oAcct) return false;
    if (oAcct.subcodes) return true;
    return false;
  }

  function methHasAcctChange(scope,oObj,nRow) {
    if (nRow >= oObj.desigs.length) return;
    log("HasAcctChange "+nRow+" "+oObj.desigs[nRow].acct+" "+oObj.desigs[nRow].subacct);
    oObj.desigs[nRow].subacct = null;
  }

  function methGetSubcodes(scope,oObj,nRow) {
    if (nRow >= oObj.desigs.length) return [];
    log("HasSubCodes "+nRow+" "+oObj.desigs[nRow].acct);
    var oAcct = findAcct(oObj.desigs[nRow].acct);
    if (!oAcct) return [];
    if (!oAcct.subcodes) return [];
    var oOpts = [{name:'--assign--',value:null}];
    for(var i=0; i < oAcct.subcodes.length; i+= 1) {
      oOpts.push({value:oAcct.subcodes[i],name:oAcct.subcodes[i]});
    }
    return oOpts;
  }

  function methOptions(scope,oObj,nRow) {
    if (nRow >= oObj.desigs.length) return [];
    var oOpts = [];
    for(var i=0; i < accts.length; i+= 1) {
      oOpts.push({value:accts[i].code,name:accts[i].name});
    }
    return oOpts;
  }

  function methCanSave(scope,oObj) {
    log("methCanSave called "+scope.$id+" noval="+scope.oPanel.state.bNoValidate);
    if (scope.oPanel.state.bNoValidate) return false;
    setTallyTotal(scope);
    if (!validate(scope,oObj)) return false;
    return true;
  }

  function validate(scope,oObj) {
    scope.oPanel.state.errorMsg = null;
    if (oObj.code && oObj.code.substring(0,2) == '**') {
      if (!oObj.note) return withError(scope,"Note is required for donor code "+oObj.code);
    }
    if (oObj.amount && (oObj.amount == 0)) return withError(scope,"Amount required");
    if (oObj.tender == 'cash') {
      var sTally = (+(scope.oPanel.state['tally-total'])).toFixed(2);
      var sAmt  = (+(oObj.amount)).toFixed(2);
      if (sTally != sAmt) {
        var sDiff = (+sTally - +sAmt).toFixed(2);
        return withError(scope,"Tally:"+sTally+" Cash:"+sAmt+" Difference:"+sDiff);
      }
      oObj.tallystr = getTallyStr(scope);
      log("TallyStr "+oObj.tallystr);
    }
    var sTot = calcTotDesig(scope,oObj,true);
    if (sTot != null) {
      var sTotAmt = (+oObj.amount).toFixed(2);
      if (sTotAmt != sTot) {
        var sDiff = (+sTot - +sTotAmt).toFixed(2);
        return withError(scope,"Designated="+sTot+" exceeds "+sTotAmt+" by "+sDiff);
      }
    }
    for(var i=0,iMax=oObj.desigs.length; i<iMax; i++) {
      var oDesig = oObj.desigs[i];
      var oAcct = findAcct(oDesig.acct);
      if (oAcct == null) return withError(scope,"Missing account code "+oDesig.acct);
      if (oAcct.subcodes && (oDesig.subacct == null)) {
        return withError(scope,"Subacct not assigned for "+oDesig.acct);
      }
    }
    return true;
  }

  function withError(scope,sMsg) {
    scope.oPanel.state.errorMsg = sMsg;
    return false;
  }

  function setAddFocus(oObj) {
    var oA =  document.getElementById('action-add-donor');
    log("setAddFocus obj=%o A=%o %s",oObj,{A:oA},typeof oA);
    if (oA) setTimeout(function(){oA.focus();},0); // delay so focus takes because DOM is built
  }

  function showDonorEdit(scope,oObj) {
    var bRet = false;
    if (scope.oPanel.oDonEdit) bRet = true;
    //if (bRet) log("showDonorEdit "+oObj.name+" scope="+scope.$id+" ret="+bRet+" lines="+scope.oPanel.oDonEdit.lines);
    return bRet;
  }

  function dropDonor(scope,oObj,sIndex) {
    log('drop donor ix='+sIndex+" of "+scope.oObj.donors.length+" in "+scope.oObj.name);
    scope.oObj.donors = removeObj(scope.oObj.donors,scope.oObj.donors[sIndex]);
    scope.oObj.cash = null; // trigger recalc
    scope.oObj.cheque = null;
  }

  function printFormDeposit(scope,oObj) {
    var oDonTab = servREG.findTable("Donor");
    var oDonMap = oDonTab.getDonorMap();
    var oHandler = function printReqHandler(event) {
      log("printReqHandler called %o obj=%o",event,oObj);
      var oMsg = {verb:'deps:deps-data',payload:{oObj:oObj,oInfo:oInfo,oMap:oDonMap}};
      event.source.postMessage(oMsg,"*");
    }
    servSess.createFormWindow('deps',oHandler,"Deps.htm","FormDeposit.htm?oaa="+oObj.oaa);
  }

  function editExistDonor(scope,oObj,sIndex) {
    editDonor(scope,oObj,"Edit",sIndex);
  }

  function editDonor(scope,oObj,sMode,sIndex) {
    if (scope.oPanel.oDonEdit) return;
    scope.oPanel.state = {errorMsg:null, bNoValidate:false};
    var oEditObj = angular.copy(oObj);
    scope.oPanel.state.oOrig = oObj;
    scope.oPanel.state.ix = sIndex;
    if (sMode == "Add") {
      scope.grabFocus = grabFocus;
    } else {
      scope.grabFocus = null;
    }
    //scope.trigger = ""+(new Date().getTime()); //ngModel value
    scope.bNoValidate = false;
    log('edit donor '+oObj.tender+" "+oObj.amount+" trigger="+scope.trigger+" lines="+oObj.lines+" mode="+sMode+" scope="+scope.$id+" index="+sIndex);
    log("donor ",oObj);
    scope.oPanel.oDonEdit = oEditObj;
    scope.oPanel.sMode = sMode;
    if (sMode == "Edit") loadTallyStr(scope,oEditObj.tallystr);
  }

  function grabFocus(scope,oElem,sTagID) {
    log("grabFocus called "+sTagID);
    var oInp =  document.getElementById(sTagID);
    if (oInp) {
      oInp.focus();
    }
  }

  function cancelEditDonor(scope,oDon) {
    log('cancel edit donor '+oDon.tender+" scope="+scope.$id);
    scope.oPanel.oDonEdit = null;
    scope.oPanel.state = {errorMsg:null, bNoValidate:false};
  }

  function saveEditDonor(scope,oDon) {
    var oObjEdit = servCRUD.getObjEdit();
    var nEditIX = servCRUD.getEditIX();
    log('save edit donor %s %s obj=%o oe=%o ix=%s don=%o',oDon.tender,oDon.code,scope.oObj,oObjEdit,nEditIX,oDon);
    if (scope.oPanel.sMode == "Add") {
      scope.oObj.donors.push(oDon);
    } else {
      scope.oObj.donors[scope.oPanel.state.ix] = oDon;
    }
    scope.oPanel.oDonEdit = null;
    scope.oPanel.state = {errorMsg:null, bNoValidate:false};
    scope.oObj.cash = null; // trigger recalc
    scope.oObj.cheque = null;

    cashTot(oObjEdit); // update fields
    chequeTot(oObjEdit);
    oTabProp.recServ.insertRec(oTabProp,oObjEdit,nEditIX,true); // do intermedate persist
    oTabProp.editActions = []; // T/off account switch now committed

    var oInp =  document.getElementById("_custmask");
    if (oInp) {
      oInp.focus();
    }
  }

  function methBill(scope,oObj,sFlag) {
    log("methBill "+scope.oPanel.state[sFlag]+" "+sFlag);
  }

  function methAmtChange(scope,oObj) {
    log("methAmtChange "+scope.oPanel.oDonEdit.amount+" "+scope.$id+" "+oObj.amount);
    if (oObj.tender == 'cash') scope.oPanel.state.showTally = true;
  }

  function methAmtFocus(scope,oObj) {
    log("methAmtFocus "+scope.$id+" "+oObj.amount);
    scope.oPanel.state.bNoValidate = true;
    scope.$apply();
  }

  function methAmtBlur(scope,oObj) {
    var sNew = (+oObj.amount).toFixed(2)
    log("methAmtBlur "+scope.$id+" "+oObj.amount+" "+sNew);
    oObj.amount = sNew;
    estimateTally(scope,oObj,true);
    oObj.desigs.length = 1;
    oObj.desigs[0].amt = oObj.amount;
    scope.oPanel.state.bNoValidate = false;
    scope.$apply();
  }

  function methDesigAmtFocus(scope,oObj) {
    log("methDesigAmtFocus "+scope.$id+" "+oObj.amount);
    scope.oPanel.state.bNoValidate = true;
    scope.$apply();
  }

  function methDesigAmtBlur(scope,oObj,nRow) {
    var sAmt = (+oObj.desigs[nRow].amt).toFixed(2);
    oObj.desigs[nRow].amt = sAmt;
    var sTot = calcTotDesig(scope,oObj,false);
    var sTotAmt = (+oObj.amount).toFixed(2);
    log("methDesigAmtBlur "+scope.$id+" "+oObj.amount+" row="+nRow+" d-tot="+sTot+" tot="+sTotAmt);
    if ((+sAmt > 0) && (+sTot < +sTotAmt) && (oObj.desigs.length < 4)) {
      var sRem = (+sTotAmt - +sTot).toFixed(2);
      oObj.desigs.push({amt:sRem,acct:getBestAcct(oObj,['R005','R705','R706','R701']),subacct:null});
    }
    if ((+sAmt == 0) && (nRow > 0)) {
      oObj.desigs = removeObj(oObj.desigs,oObj.desigs[nRow]);
    }
    scope.oPanel.state.bNoValidate = false;
    scope.$apply();
  }

  function getBestAcct(oObj,sAccts) {
    for(var j=0,jMax=sAccts.length; j<jMax; j += 1) {
      var bUsed = false;
      for(var i=0,iMax=oObj.desigs.length; i<iMax; i+=1) {
        if (oObj.desigs[i].acct == sAccts[j]) {
          bUsed = true;
          break;
        }
      }
      if (!bUsed) return sAccts[j];
    }
    return sAccts[0];
  }

  function calcTotDesig(scope,oObj,bNullFind) {
    var nAmt = 0;
    for(var i=0,iMax=oObj.desigs.length; i<iMax; i++) {
      if (oObj.desigs[i].amt == null) {
        if (bNullFind) return null;
      } else {
        nAmt += +oObj.desigs[i].amt;
      }
    }
    return nAmt.toFixed(2);
  }

  function methChangeTender(scope,oObj) {
    log("methChangeTender "+oObj.tender);
    scope.oPanel.state.showTally = (oObj.tender == 'cash');
  }

  function methToggleTally(scope,oObj) {
    log("methToggleTally "+oObj.tender);
    scope.oPanel.state.showTally = !scope.oPanel.state.showTally;
  }

  function methResetTally(scope,oObj) {
    log("methResetTally "+oObj.tender);
    scope.oPanel.state[500]    = 0;
    scope.oPanel.state[100]    = 0;
    scope.oPanel.state[50]     = 0;
    scope.oPanel.state[20]     = 0;
    scope.oPanel.state[10]     = 0;
    scope.oPanel.state[5]      = 0;
    scope.oPanel.state['coin'] = 0;
  }

  function getTallyStr(scope) {
    var sStr = "";
    sStr = assignStr(scope,sStr,500);
    sStr = assignStr(scope,sStr,100);
    sStr = assignStr(scope,sStr,50);
    sStr = assignStr(scope,sStr,20);
    sStr = assignStr(scope,sStr,10);
    sStr = assignStr(scope,sStr,5);
    sStr = assignStr(scope,sStr,'coin');
    return sStr.trim();
  }

  function loadTallyStr(scope,sTallyStr) {
    if (!sTallyStr) return;
    var sParts = sTallyStr.split(" ");
    log("tallystr "+sTallyStr+" "+sParts.length);
    for(var i=0,iMax=sParts.length; i<iMax; i+=1) {
      var sItem = sParts[i].split("=");
      scope.oPanel.state[sItem[0]] = sItem[1];
    }
  }

  function assignStr(scope,sStr,nBill) {
    if (!scope.oPanel.state[nBill]) return sStr;
    return sStr + " "+nBill+"="+scope.oPanel.state[nBill];
  }

  function estimateTally(scope,oObj,bReset) {
    if (bReset) {
      scope.oPanel.state[500] = null;
      scope.oPanel.state[100] = null;
      scope.oPanel.state[50] = null;
      scope.oPanel.state[20] = null;
      scope.oPanel.state[10] = null;
      scope.oPanel.state[5] = null;
      scope.oPanel.state['coin'] = null;
    }
    var nRem = oObj.amount;
    //nRem = assign(scope,nRem,500);
    nRem = assign(scope,nRem,100);
    nRem = assign(scope,nRem,50);
    nRem = assign(scope,nRem,20);
    nRem = assign(scope,nRem,10);
    nRem = assign(scope,nRem,5);
    if (nRem > 0) scope.oPanel.state['coin'] = nRem.toFixed(2);
  }

  function assign(scope,nRem,nBill) {
    if (nRem >= nBill) {
      var nNum = Math.floor(nRem / nBill);
      scope.oPanel.state[nBill] = nNum;
      //log("Doing "+nBill+" num="+nNum+" rem="+nRem);
      nRem -= nBill * nNum;

    }
    return +nRem;
  }

  function setTallyTotal(scope) {
    var nTot = 0;
    nTot += (scope.oPanel.state[500] || 0) * 500;
    nTot += (scope.oPanel.state[100] || 0) * 100;
    nTot += (scope.oPanel.state[50]  || 0) * 50;
    nTot += (scope.oPanel.state[20]  || 0) * 20;
    nTot += (scope.oPanel.state[10]  || 0) * 10;
    nTot += (scope.oPanel.state[5]   || 0) * 5;
    nTot += +(scope.oPanel.state['coin'] || 0);
    scope.oPanel.state['tally-total'] = nTot.toFixed(2);
    //log("set TallyTotal "+nTot);
  }

  function getDonorName(oObj) {
    if (oObj.donor) return oObj.donor.name;
    return "?Last, ?First";
  }

  function getAmount(oObj) {
    return oObj.amount;
  }

  function getAmt(oObj) {
    return (+(oObj.amount)).toFixed(2);
  }

  function getTender(oObj) {
    if (oObj.tender == 'cheque') return 'chq';
    return 'cash';
  }


  function getLines(oObj) {
    return ""+oObj.desigs.length;
  }


  function getEditRecordExit(oaa) {
    var oObj = oTabProp.oObjs[oaa];
    return oObj.details;
  }

  function createExit(oObj) {
    var sNow       = ""+getNowYMD();
    var sDPx       = nextDPx(sNow);
    var sSrc       = getSource();
    oObj.name      = sNow+"."+sSrc+".CND."+sDPx;
    oObj.counter1  = servSess.getUser();
    oObj.counter2  = servSess.getUser2();
    oObj.cash      = null;
    oObj.cheque    = null;
    oObj.currency  = "CND";
    oObj.donors    = [];
    oObj.dummy     = null;
    oObj.KeyName   = servGAE.getCust()+"/"+oTabProp.recType+"/"+oObj.name;
    oTabProp.editActions = [{click:changeCurrency,text:'Switch Account'}]; // Allow account switch
    return true;
  }

  function getSource() {
    var oProf = servSess.getProfile();
    if (!oProf || !oProf.src) return "DEM";
    return oProf.src;
  }

  function nextDPx(sNow) {
    var nNext = 0;
    if (!oTabProp.oObjs) return 1;
    for(var i=0,iMax=oTabProp.oObjs.length; i<iMax; i+=1) {
      var oObj = oTabProp.oObjs[i];
      //2013-06-25.ES1.CND.dp1
      var sParts = oObj.name.split(/[.]/);
      log("inspect "+oObj.name+" "+sNow+" "+sParts[0]+" "+sParts[3]);
      if (sParts[0] == sNow) {
        var nMax = +(sParts[3].substring(2));
        if (nMax > nNext) nNext = nMax;
      }
    }
    return "dp"+(nNext+1);
  }

  function cacheLoadExit(sFile,oRec) {
    var sParts = sFile.split(/[.]/);
    var oObj   = {name:sFile,src:sParts[1],currency:sParts[2],counter1:""+oRec.counter1,counter2:""+oRec.counter2,acct:"?",cashSum:oRec.cash,chequeSum:oRec.cheque,details:oRec};
    log("cacheLoadExit %s rec=%o obj=%o",sFile,oRec,oObj);
    return oObj;
  }

  function depositTot(oObj) {
    return (+oObj.cashSum + +oObj.chequeSum).toFixed(2);
  }

  function addDonorLine(scope,oDonor) {
    if (scope.oPanel.oDonEdit) return;
    log("addDonorLine clicked "+scope.$id+" "+oDonor.code+" obj=%o evt=%o %s",scope.oObj,$rootScope.oCurEvent,typeof $rootScope.oCurEvent);
    var dAmt = 0.00;
    var sTender = 'cheque';
    if ($rootScope.oCurEvent  && ($rootScope.oCurEvent.type == 'click') && $rootScope.oCurEvent.shiftKey) sTender = 'cash';
    var oDon = {code:oDonor.code,donor:oDonor,amount:dAmt,tender:sTender};
    oDon.desigs = [{amt:null,acct:'R000',subacct:null}];
    editDonor(scope,oDon,"Add");
  }

  function counters(oObj) {
     if (!oObj) return null;
    return oObj.counter1+"/"+oObj.counter2;
  }

  function cashTot(oObj) {
    if (!oObj) return 0;
    if (!oObj.donors) return 0;
    var nAmt = 0;
    if (oObj.cash != null) return oObj.cash;
    for(var i=0,iMax=oObj.donors.length; i<iMax; i+=1) {
      var oDon = oObj.donors[i]
      if (oDon.tender == 'cash') {
        nAmt += +oDon.amount;
      }
    }
    oObj.cash = nAmt.toFixed(2);
    return oObj.cash;
  }

  function chequeTot(oObj) {
    if (!oObj) return 0;
    if (!oObj.donors) return 0;
    var nAmt = 0;
    if (oObj.cheque != null) return oObj.cheque;
    for(var i=0,iMax=oObj.donors.length; i<iMax; i+=1) {
      var oDon = oObj.donors[i]
      if (oDon.tender == 'cheque') {
        nAmt += +oDon.amount;
      }
    }
    oObj.cheque = nAmt.toFixed(2);
    return oObj.cheque;
  }

  function totalTot(oObj) {
    return (+chequeTot(oObj) + +cashTot(oObj)).toFixed(2);
  }

}]);
