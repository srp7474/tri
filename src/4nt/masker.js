var fs = require("fs");
var oRandom = require("./seedrandom.js");

// globals
var sParm = null;
var sNameFile = null;
var sChqFile = null;
var sSupFile = null;
var sDirIn  = null;
var sDirOut  = null;
var sDons  = [];
var sDeps  = null;
var sFiles = [];
var oMales = [];
var oFemales = [];
var oSurnames = [];
var oStreets = [];
var oBusNames = [];
var oBusTypes = [];
var oBusLocns = [];
var oBusDups  = {};
var oMapPayee  = {};
var oDonMap  = {};
var s0 = "                                               ";
var sBlank = s0 + s0 + s0 + s0 + s0;

log("masker.js running");
Math.seedrandom("hello.");// Use "hello." as the seed.
log(Math.random());       // Always 0.9282578795792454
log(Math.random());       // Always 0.3752569768646784


process.argv.forEach(function(sVal, index, array) {
  if (sVal.charAt(0) == '-') {
    sParm = sVal;
  } else {
    if (sParm == '-files') {
      sFiles.push(sVal);
    } else if (sParm == '-chq') {
      sChqFile = sVal;
    } else if (sParm == '-sup') {
      sSupFile = sVal;
    } else if (sParm == '-names') {
      sNameFile = sVal;
    } else if (sParm == '-in') {
      sDirIn = sVal;
    } else if (sParm == '-out') {
      sDirOut = sVal;
    } else if (sParm == '-dons') {
      sDons.push(sVal);
    } else if (sParm == '-deps') {
      sDeps = sVal;
    } else if (index < 2) {
    } else {
      log("skipped "+sVal+" index="+index);
    }
  }
});
log("Files "+sFiles.length+" names="+sNameFile);
processNameFile(sNameFile);
if (sFiles.length > 0) {
  processFile(sFiles[0]);
  processFile(sFiles[1]);
  processFile(sFiles[2]);
} else if (sDeps != null) {
  processDepsFile();
} else if (sChqFile != null) {
  processChqFile();
} else {
  log("what to do?");
}

function processDepsFile() {
  log("processDepsFile "+sDeps);
  for(var i=0,iMax=sDons.length; i<iMax; i+=1) {
    var sDon = sDons[i];
    loadDonor(sDon);
  }
  log("DonorMap size="+Object.keys(oDonMap).length);
  fixDepositFiles(sDeps);
}

function loadDonor(sFile) {
  var sStr1 = ""+fs.readFileSync(sDirOut + "\\"+ sFile);
  var oDons = JSON.parse(sStr1);
  log("load Donor "+sFile+" entries="+oDons.length);
  for(var i=0,iMax=oDons.length; i<iMax; i+=1) {
    var oDon = oDons[i];
    //if (i == 0) console.log("Donor %o",oDon);
    oDonMap[oDon.Code] = oDon;
  }
}

function fixDepositFiles(sFileMask) {
  var sFiles = fs.readdirSync(sDirIn);
  console.log("directory ",sFileMask);
  for(var i=0,iMax=sFiles.length; i<iMax; i+=1) {
    var sFile = sFiles[i];
    if (sFile.substring(0,sFileMask.length) == sFileMask) {
      fixDepositFile(sFile);
    }
  }
}

function fixDepositFile(sFile) {
  var sStr1 = ""+fs.readFileSync(sDirIn + "\\"+ sFile);
  var oDep = JSON.parse(sStr1);
  console.log("Fix Deposit "+sFile+" size="+sStr1.length);
  for(var i=0,iMax=oDep.donors.length; i<iMax; i+=1) {
    var oDon = oDep.donors[i];
    if (oDon.code != "**.UK00") {
      oDon.donor = fixDonor(oDon.code,i);
    }
  }
  var sNewStr = JSON.stringify(oDep);
  fs.writeFileSync(sDirOut + "\\"+ sFile,sNewStr);
  console.log("   Wrote "+sFile+" size="+sNewStr.length);
}

function fixDonor(sCode,i) {
  var oDon = oDonMap[sCode];
  //if (i % 7 == 0) console.log("Donotr %o",oDon);
  if (oDon == null) {
    log("********Code "+sCode+" not found");
    return { code: sCode, name: 'not-known, ukn', phones: '', address: '' };
  } else {
    return {code:sCode, name:getName(oDon), phones:getPhones(oDon).replace(/ /,'\r\n'), address:getAddress(oDon,19)};
  }
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

function getName(oObj) {
  return oObj.LastName+", "+oObj.FirstName;
}


function processChqFile() {
  log("processChqFile "+sChqFile+" "+sSupFile);
  var oNewChqs = [];
  var oNewSups = [];
  var sStr1 = ""+fs.readFileSync(sDirIn + "\\"+ sChqFile);
  var oChqs = JSON.parse(sStr1);
  var sStr2 = ""+fs.readFileSync(sDirIn + "\\"+ sSupFile);
  var oSups = JSON.parse(sStr2);
  log("  chqs="+oChqs.length+" sups="+oSups.length);

  //console.log("--------  chqs %o ",oChqs[0]);
  for(var i=0,iMax=oChqs.length; i<iMax; i+=1) {
    var oChq = oChqs[i];
    if (oChq.chqno == '004839') continue;
    var oNew = deepCopy(oChq);
    changePayee(oNew);
    log((""+oChq.chqno+" "+oChq.payee+sBlank).substring(0,50)+oNew.payee);
    oNewChqs.push(oNew);
  }
  //for(var i=0,iMax=10; i<iMax; i+=1) {
  //console.log("--------  sups %o ",oSups[i]);
  //}
  for(var i=0,iMax=oSups.length; i<iMax; i+=1) {
    var oSup = oSups[i];
    var oNew = deepCopy(oSup);
    changeBusname(oNew);
    if (oNew.street1) oNew.street1 = fixAddress(oNew.street1);
    var sLines0 = displaySup(oSup);
    var sLines1 = displaySup(oNew);
    log("---------------------------------------");
    for(var j=0,jMax=sLines0.length; j<jMax; j+=1) {
      var sLine0 = sLines0[j] || '';
      var sLine1 = sLines1[j] || '';
      var sLine = (sLine0 + sBlank).substring(0,40) + sLine1;
      log(sLine);
    }
    oNewSups.push(oNew);
  }
  var sNewStr = JSON.stringify(oNewChqs);
  fs.writeFileSync(sDirOut + "\\"+ sChqFile,sNewStr);
  sNewStr = JSON.stringify(oNewSups);
  fs.writeFileSync(sDirOut + "\\"+ sSupFile,sNewStr);

}

function processFile(sFile) {
  log("processFile "+sFile);
  var sStr = ""+fs.readFileSync(sDirIn + "\\"+ sFile);
  log("File length="+sStr.length);
  var oObjs = JSON.parse(sStr);
  console.log("oObjs %s",oObjs.length);
  var oNewObjs = [];
  for(var i=0,iMax=oObjs.length; i<iMax; i+=1) {
    var oObj = oObjs[i];
    //if (i == 0) console.log("%o",oObj);
    var oNew = deepCopy(oObj);
    oNew = maskifyDonor(oNew);
    var sLines0 = display(oObj);
    var sLines1 = display(oNew);
    if ((oObj.DonorType == "BUS") || (oObj.DonorType == "CHR")) {
      log("--------------------------------------- "+oObj.Code);
      for(var j=0,jMax=sLines0.length; j<jMax; j+=1) {
        var sLine0 = sLines0[j] || '';
        var sLine1 = sLines1[j] || '';
        var sLine = (sLine0 + sBlank).substring(0,40) + sLine1;
        log(sLine);
      }
    }
    oNewObjs.push(oNew);
  }
  var sNewStr = JSON.stringify(oNewObjs);
  fs.writeFileSync(sDirOut + "\\"+ sFile,sNewStr);
}

function displaySup(oSup) {
  var sLines = [];
  sLines.push(oSup.name);
  if (oSup.street1 && oSup.street1.trim().length > 0)  sLines.push(oSup.street1.trim());
  if (oSup.street2 && oSup.street2.trim().length > 0)  sLines.push(oSup.street2.trim());
  return sLines;
}

function display(oObj) {
  var sLines = [];
  var sGen = oObj.DonorType || "BRO";
  var sFirstName = oObj.FirstName || "";
  var sLastName  = oObj.LastName || "?";
  var sAltName   = oObj.AltName || "";
  var sName = sLastName.trim();
  if (sFirstName.trim().length > 0) sName += ", "+sFirstName;
  if (sAltName.trim().length > 0) sName += " ("+sAltName+")";
  sLines.push(sGen+":"+sName);
  if (oObj.Address1 && oObj.Address1.trim().length > 0)  sLines.push(oObj.Address1.trim());
  if (oObj.HomePhone) sLines.push("Home:"+oObj.HomePhone);
  if (oObj.WorkPhone) sLines.push("Work:"+oObj.WorkPhone);
  if (oObj.CellPhone) sLines.push("Cell:"+oObj.CellPhone);
  return sLines;
}

function maskifyDonor(oObj) {
  var sGen = oObj.DonorType || "BRO";
  oObj.DonorType = sGen;
  if (sGen == "BRO") {
    asPerson(oObj,oMales,oSurnames);
  } else if (sGen == "SIS") {
    asPerson(oObj,oFemales,oSurnames);
  } else if (sGen == "FAM") {
    asFamily(oObj,oMales,oFemales,oSurnames);
  } else if (sGen == "CHR") {
    asBusiness(oObj);
  } else if (sGen == "BUS") {
    asBusiness(oObj);
  } else {
    oObj.DonorType = "BRO";
    asPerson(oObj,oMales,oSurnames);
  }
  if (oObj.HomePhone) oObj.HomePhone = fixPhone(oObj.HomePhone);
  if (oObj.WorkPhone) oObj.WorkPhone = fixPhone(oObj.WorkPhone);
  if (oObj.CellPhone) oObj.CellPhone = fixPhone(oObj.CellPhone);

  if (oObj.Address1) oObj.Address1 = fixAddress(oObj.Address1);

  return oObj;
}

function fixPhone(sPhone) {
  var oMask = /^[0-9]{3}-[0-9]{3}-[0-9]{4}(x[0-9]+)?$/;
  var map = '1352279448';
  if (sPhone.match(oMask) == null) return '';
  var sNew = '';
  for(var i=0,iMax=sPhone.length; i<iMax; i+=1) {
    var c = sPhone.charAt(i);
    if ((i < 4) || (c == '-')) {
      sNew += c;
    } else {
      sNew += map[+c];
    }
  }
  return sNew;
}

function fixAddress(sAddr) {
  var oMask = /^([0-9]+)/;
  var sNum = "101A";
  var oR = sAddr.match(oMask);
  if (oR) sNum = oR[1];
  return sNum + " " + oStreets[getIndex(oStreets.length)];
}


function asPerson(oObj,oTab,oSurnames) {
  var sOld = oObj.FirstName || '';
  var sAlt = oObj.AltName;
  oObj.LastName  = oSurnames[getIndex(oSurnames.length)].toUpperCase();
  oObj.FirstName = oTab[getIndex(oTab.length)];
  if ((sOld.indexOf("(") > 0) || sAlt) {
    oObj.AltName = oTab[getIndex(oTab.length)];
  } else {
    delete oObj.AltName;
  }
}

function asFamily(oObj,oMale,oFemale,oSurnames) {
  delete oObj.AltName;
  oObj.LastName  = oSurnames[getIndex(oSurnames.length)].toUpperCase();
  oObj.FirstName = oMales[getIndex(oMales.length)] + " & " + oFemales[getIndex(oFemales.length)];
}

function asBusiness(oObj) {
  if (oObj.LastName == "ANONYMOUS") return;
  oObj.LastName = getBusName();
  oObj.FirstName = "";
  oObj.AltName = "";
}

function changePayee(oChq) {
  var sPayee = oChq.payee.trim();
  if (oMapPayee[sPayee]) {
    oChq.payee = oMapPayee[sPayee];
    return;
  }
  var sParts = oChq.payee.trim().split(" ");
  if (sParts.length > 2) {
    oChq.payee = getBusName();
    oMapPayee[sPayee] = oChq.payee;
  } else {
    var oTab = [oMales,oMales,oMales,oFemales,oFemales,oMales][getIndex(6)];
    var sLastName  = oSurnames[getIndex(oSurnames.length)];
    var sFirstName = oTab[getIndex(oTab.length)];
    oChq.payee = sFirstName + " "+sLastName;
    oMapPayee[sPayee] = oChq.payee;
  }
}

function changeBusname(oSup) {
  var sPayee = oSup.name.trim();
  if (oMapPayee[sPayee]) {
    oSup.name = oMapPayee[sPayee];
    return;
  }
  var sParts = oSup.name.trim().split(" ");
  if (sParts.length > 2) {
    oSup.name = ""+getBusName();
    oMapPayee[sPayee] = oSup.name;
  } else {
    var oTab = [oMales,oMales,oMales,oFemales,oFemales,oMales][getIndex(6)];
    var sLastName  = oSurnames[getIndex(oSurnames.length)];
    var sFirstName = oTab[getIndex(oTab.length)];
    oSup.name = ""+sFirstName + " "+sLastName;
    oMapPayee[sPayee] = oSup.name;
  }
}


function getBusName() {
  while(true) {
    var sName = oBusNames[getIndex(oBusNames.length)].trim();
    var sType = oBusTypes[getIndex(oBusTypes.length)].trim();
    var sLocn = oBusLocns[getIndex(oBusLocns.length)].trim();
    var sBusName = (sName + " " + sType + " " +sLocn).trim();
    if (!oBusDups[sBusName]) {
      oBusDups[sBusName] = true;
      return sBusName;
    }
  }
}

function getIndex(nMax) {
  var nNum = Math.random() * (nMax - 1);
  return nNum.toFixed(0);
}


function processNameFile(sFile) {
  var sStr = ""+fs.readFileSync(sFile);
  //log(sStr);
  var sLines = sStr.split(/\r\n|\r|\n/g);
  var oA = null;
  for(var i=0,iMax=sLines.length; i<iMax; i+=1) {
    var sLine = sLines[i].trim();
    if (sLine == '') continue;
    if (sLine == '-') sLine = '';
    if (sLine.charAt(0) == '*') {
      log("doing cat:"+sLine);
      if (sLine == "**male") {
        oA = oMales;
      } else if (sLine == "**female") {
        oA = oFemales;
      } else if (sLine == "**surname") {
        oA = oSurnames;
      } else if (sLine == "**Streets") {
        oA = oStreets;
      } else if (sLine == "**bus-names") {
        oA = oBusNames;
      } else if (sLine == "**bus-locn") {
        oA = oBusLocns;
      } else if (sLine == "**bus-type") {
        oA = oBusTypes;
      } else {
        log("whats this");
      }
    } else {
      if (oA == null) continue;
      oA.push(sLine);
    }
  }
  log("Counts: f="+oFemales.length+" m="+oMales.length+" sur="+oSurnames.length+" str="+oStreets.length+" bus="+oBusNames.length+"/"+oBusTypes.length+"/"+oBusLocns.length);
}

function deepCopy(oObj) {
  return JSON.parse(JSON.stringify(oObj));
}


function log(sMsg) {
  console.log(sMsg);
}
