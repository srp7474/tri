/*
 @license
 Copyright (c) 2013 by Steve Pritchard of Rexcel Systems Inc.
 This file is made available under the terms of the Creative Commons Attribution-ShareAlike 3.0 license
 http://creativecommons.org/licenses/by-sa/3.0/.
 Contact: public.pritchard@gmail.com
*/
"use strict";

log("loading tblDON factory code");
oGBL.optTables.push("tblDON");

//----------------------------------------------------------------------------
//------------------------------- Donor records -----------------------------
//----------------------------------------------------------------------------
oApp.factory('tblDON',['servREG','servREC','servSess','servCRUD',function(servREG,servREC,servSess,servCRUD) {
  log("Running tblDON factory");
  var oFuncs = {};
  var sPhoneMask = '^[0-9]{3}-[0-9]{3}-[0-9]{4}(x[0-9]+)?$';
  var oTabProp = {
       recTitle: 'Donor'
      ,recName:  'donor%'  // % is chunked flag
      ,recType:  'donor'
      ,lsName:   "-donors" // derived
      ,tabServ:  oFuncs    //self pointer
      ,recServ:  servREC
      ,order:    getName
      ,cols:    [{type:'actions',     title: 'Actions'           ,showEdit:false, addDefault:true}
                 ,{col: 'Code',       title: 'Code'              ,many:false,showList:false}
                 ,{col: 'FirstName',  title: 'FirstName'         ,showList:false}
                 ,{col: 'LastName',   title: 'LastName'          ,showList:false}
                 ,{col: 'actions',    title:  getTitle           ,showCust:true, type:'action',method:useDonor,label:'<==', showList:false}
                 ,{col: getName,      title: 'Name'              ,showCust:true  ,showList:true}
                 ,{col: getPhones,    title: 'Phones'            ,showCust:true  ,showList:true}
                 ,{col: 'District',   title: 'District'          ,showCust:true  ,showList:true}
                 ,{col: 'HomePhone',  title: 'HomePhone'         ,showList:false ,reqd:false ,mask:sPhoneMask}
                 ,{col: 'CellPhone',  title: 'CellPhone'         ,showList:false ,reqd:false ,mask:sPhoneMask}
                 ,{col: 'WorkPhone',  title: 'WorkPhone'         ,showList:false ,reqd:false ,mask:sPhoneMask}
                ]
      ,filters: [
                  //{type: 'mask',   field: getName}
                  {type: 'cust',   field:'_custmask', title:'cust-mask', place:'name or phone or address mask', methCust: custMask}
                 ,{type: 'mask',   field: 'District'}
                ]
      ,menuWhen          : testAdmin
  };

  oFuncs.getTabProp  = function()            {return oTabProp;}
  oFuncs.getDonorMap = function()            {return getDonorMap();}
  servREG.registerTable(oFuncs);
  return oFuncs;

  function testAdmin() {
    var sLocn = ""+window.location;
    if (sLocn.indexOf("Admin.htm") > 0) return true;
    return false; /*servSess.isAdmin();*/
  }

  function getDonorMap() {
    var oTP = oTabProp;
    var oObjs = servCRUD.getObjs(oTP);
    log("getDonorMap %o",oObjs.slice(0,5));
    var oMap = {};
    for(var i=0,iMax=oObjs.length; i<iMax; i+=1) {
      var oObj = oObjs[i];
      oMap[oObj.Code] = oObj;
    }
    return oMap;
  }

  function getName(oObj) {
    return oObj.LastName+", "+oObj.FirstName;
  }

  function getTitle(oObj) {
    return (""+oObj.Code+"\r\n"+getAddress(oObj)).trim();
  }

  function getPhones(oObj) {
    var sStr = '';
    if (oObj.HomePhone) sStr += " h:"+phone(oObj.HomePhone);
    if (oObj.CellPhone) sStr += " c:"+phone(oObj.CellPhone);
    if (oObj.WorkPhone) sStr += " w:"+phone(oObj.WorkPhone);
    return sStr.trim();
  }

  function getAddress(oObj,nMax) {
    if (!nMax) nMax = 999;
    var sStr = '';
    sStr += maxStr(oObj.Address1,nMax);
    if(oObj.Address2) sStr += "\r\n"+maxStr(oObj.Address2,nMax);
    var sCity = (oObj.City || '');
    var sZipCode = (oObj.ZipCode || '');
    var sSep = " ";
    if ((sCity.length+sZipCode.length) > 19) sSep = "\r\n";
    sStr += "\r\n"+sCity+sSep+sZipCode;
    return sStr.trim();
  }

  function maxStr(sStr,nMax) {
    sStr = sStr || "";
    if (sStr.length < nMax) return sStr;
    return sStr.substring(0,nMax-2) + "...";
  }

  function phone(numstr) {return ""+numstr;}

  function custMask(oTab,oObjs,oData,oFil) {
    var sStr = oData[oFil.field] || '';
    //log("custMask for called ",oTab.props.recTitle+" data="+oData[oFil.field]+" sStr="+sStr);
    if (sStr.trim() == '') return oObjs;
    var oResult = sStr.match(/^([0-9]+\s*[a-zA-Z])|([0-9]+$)/);
    var sFlds = ['LastName','FirstName'];
    var oMask = new RegExp(sStr,"i");
    if (oResult) {
      if (oResult[1]) {
        sFlds = ['Address1'];
        //log("address search");
      } else {
        var sMask = '^' + sStr.substring(0,3);
        sStr =  (sStr.length > 3)?sStr.substring(3):"";
        if (sStr.length > 0) {
          sMask += '-' + sStr.substring(0,3);
          sStr =  (sStr.length > 3)?sStr.substring(3):"";
        }
        if (sStr.length > 0) {
          sMask += '-' + sStr;
        }
        //log("tel search "+sStr+" "+sMask);
        oMask = new RegExp(sMask,"i");
        sFlds = ['HomePhone','CellPhone','WorkPhone']
      }
    }
    var oNew = [];
    for(var i=0,iMax=oObjs.length; i<iMax; i+=1) {
      var oObj = oObjs[i];
      var bUse = false;
      for(var j=0,jMax=sFlds.length; j<jMax; j+=1) {
        var sFld = sFlds[j];
        if (oObj[sFld] && (oObj[sFld].match(oMask) != null)){
          bUse = true;
          break;
        }
      }
      if (bUse) oNew.push(oObj);
    }
    return oNew;
  }

  function useDonor(scope,oObj) {
    log("use donor clicked "+getName(oObj)+" "+scope.oTAB.props.recTitle+" "+oObj.Code+" scope=%o %s",scope,scope.$id);
    var oDonor = {code:oObj.Code, name:getName(oObj), phones:getPhones(oObj).replace(/ /,'\r\n'), address:getAddress(oObj,19)};
    //dumpObjLog(oDonor,"Donor record");
    scope.oTAB.props.addDonorLine(scope,oDonor,oObj);
  }

}]);
