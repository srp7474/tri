
// Nodejs variant of Triangular WAKS utility

var fs     = require("fs");
var http   = require("http");
var util   = require("util");
var parms  = require('./parms');

var oOpt = {}

var oParms = [
 // 0            1     2        3            4
 // OptSw        Mand  Parm     Value        Help meaning
  ['bHelp'    ,  ".",  "-h"     ,null        ,"Generate this Help Information that you are now reading"  ]
 ,['sFile'    ,  "m",  "-file"  ,"dir"       ,"Work Directory"                                           ]
 ,['sUrl'     ,  "m",  "-url"   ,"url"       ,"URL of app server"                                        ]
 ,['sCust'    ,  "m",  "-cust"  ,"cust"      ,"Cust part of key"                                         ]
 ,['sUser'    ,  "m",  "-user"  ,"user"      ,"SuperUser id"                                             ]
 ,['sPW'      ,  "m",  "-pw"    ,"password"  ,"SuperUser password"                                       ]
 ,['sType'    ,  "m",  "-type"  ,"type"      ,"Type part of key (2nd part)"                              ]
 ,['sName'    ,  "m",  "-name"  ,"name"      ,"Name part of key (3rd part)"                              ]
 ,['bShip'    ,  ".",  "-ship"  ,null        ,"Ship mode, else read"                                     ]
 ,['bVerbose' ,  ".",  "-v"     ,null        ,"Verbose mode"                                             ]
 ,['bReplace' ,  ".",  "-r"     ,null        ,"Replace components. ***DANGEROUS***"                      ]
];



var RemoteDir = {
   sRemKeyName: null
  ,sLocKeyName : null
}
var oRDs = [];
var oOpt = null;



function main(argv) {
  log("waks.js running");
  makeRequest(formatFindRequest(oOpt.sCust+"/%"),function(oRes) {
    saveRemDir(oRes);
    processRequest(function() {
      log("waks.js ending");
    });
  });
}

function processRequest(callback) {
  var sKey = oOpt.sCust + "/" + oOpt.sType.replace("*","%") + "/" + oOpt.sName.replace("*","%");
  if (oOpt.bShip) {
    log("Doing ship");
    shipFiles(sKey,callback);
  } else {
    fetchFiles(sKey,callback);
  }
}

function fetchFiles(sKey,callback) {
  if (sKey.substring(0,2) == "$/") sKey = "*"+sKey.substring(1);
  var nIX = sKey.indexOf("%");
  if (nIX > 0) sKey = sKey.substring(0,nIX);
  var oList = [];
  for(var i=0,iMax=oRDs.length; i<iMax; i+=1) {
    var oRD = oRDs[i];
    if (nIX > 0) {
      if (oRD.sRemKeyName.substring(0,sKey.length) == sKey)  oList.push(oRD);
    } else {
      if (oRD.sRemKeyName == sKey)  oList.push(oRD);
    }
  }
  log("Fetching "+sKey+" "+oList.length+" files match");
  listExec(oList,0,[],fetchFile,listExec,function(oResult) {
    log("---- Local Writes completed ----");
    callback();
  });
}

function shipFiles(sKey,callback) {
  var sParts = sKey.split("/");
  var sMatch = sParts[0]+"-"+sParts[1]+"-" + sParts[2];
  var nIX = sMatch.indexOf("%");
  if (nIX >= 0) sMatch = sMatch.substring(0,nIX);
  var oList = [];
  var sFiles = fs.readdirSync(oOpt.sFile);
  for(var i=0,iMax=sFiles.length; i<iMax; i+=1) {
    var sFile = sFiles[i];
    if (!sFile.match(/\.json\.txt$/)) continue;
    if (sFile.substring(0,sMatch.length) == sMatch) {
      var oRec = canSend(sFile);
      if (oRec) oList.push(oRec);
    }
  }
  console.log("Sending "+oList.length+" files");
  listExec(oList,0,[],shipFile,listExec,function(oResult) {
    log("---- Ships completed ----");
    callback();
  });
}

function shipFile(oList,nPos,oResult,fnExec,fnRep,fnEnd) {
  var oReq = oList[nPos];
  log("Shipping "+oReq.key+" "+oReq.file);
  makeRequest(formatShipRequest(oReq),function(oRes) {
    if (oRes.status == 'GOOD') {
      log("File "+oReq.file+" "+oReq.verb+" server as "+oReq.key);
      listExec(oList,nPos+1,oResult,fnExec,fnRep,fnEnd);
    } else {
      console.log("File ship FAILED Response\r\n",oRes);
      listExec(oList,nPos+1,oResult,fnExec,fnRep,fnEnd);
    }
  });
}

function canSend(sFile) {
  var sParts = sFile.split("-");
  var sKey = sParts[0] + "/" + sParts[1] + "/";
  var nIX = sFile.indexOf(".json.txt");
  sKey = sKey + sFile.substring(sKey.length,nIX);
  if (sKey.charAt(0) == "$") sKey = "*" + sKey.substring(1);
  for(var i=0,iMax=oRDs.length; i<iMax; i+=1) {
    var oRD = oRDs[i];
    if (oRD.sRemKeyName == sKey) {
      if (!oOpt.bReplace) {
        log(sKey+" EXISTS ON SERVER, use -r option to replace");
        return null;
      } else {
        return {key:sKey,file:sFile,verb:"REPLACED on"};
      }
    }
  }
  return {key:sKey,file:sFile,verb:'shipped to'};
}


function listExec(oList,nPos,oResult,fnExec,fnRep,fnEnd) {
  if (nPos >= oList.length) {
    fnEnd(oResult);
  } else {
    fnExec(oList,nPos,oResult,fnExec,fnRep,fnEnd);
  }
}


function fetchFile(oList,nPos,oResult,fnExec,fnRep,fnEnd) {
  var oRD = oList[nPos];
  log("fetching "+oRD.sLocKeyName+" "+oRD.sRemKeyName);
  var sFile = oOpt.sFile + "\\" + oRD.sLocKeyName + ".json.txt";
  log("fetching "+sFile);
  var sVerb = "Create";
  if (fs.existsSync(sFile)) {
    if (oOpt.bReplace) {
      sVerb = "Replace";
    } else {
      log("**NOT REPLACED**, use -r to overwrite "+sFile);
      listExec(oList,nPos+1,oResult,fnExec,fnRep,fnEnd);
      return;
    }
  }
  makeRequest(formatReadRequest(oRD.sRemKeyName),function(oRes) {
    if (oRes.status == 'GOOD') {
      log("Write record "+oRes.RESULT.RECORD.DataFld.length);
      fs.writeFile(sFile,oRes.RESULT.RECORD.DataFld,function(err) {
        if (!err) log("File written OK");
        listExec(oList,nPos+1,oResult,fnExec,fnRep,fnEnd);
      });
    } else {
      console.log("FAILED Response\r\n",oRes);
      listExec(oList,nPos+1,oResult,fnExec,fnRep,fnEnd);
    }
  });
}

function saveRemDir(oRes) {
  //console.log("Response:\r\n"+util.inspect(oRes,{depth:4}));
  for(var i=0,iMax=oRes.RESULT.RECORD.length; i<iMax; i+=1) {
    var oRec = oRes.RESULT.RECORD[i];
    if (oOpt.bVerbose) console.log("rec:\r\n",oRec);
    var oRD = deepCopy(RemoteDir);
    oRD.sRemKeyName = oRec.KeyName;
    oRD.sLocKeyName = oRec.KeyName.replace(/\//g,"-").replace(/\*/g,"$");
    oRDs.push(oRD);
  }
  if (oOpt.bVerbose) console.log("done:\r\n",oRDs);
}

function makeRequest(oAjax,responder) {
  var sData = 'json='+encodeURI(JSON.stringify(oAjax));
  //log("sData:"+sData.substring(0,340));
  //3log("sData-end:"+sData.substring(sData.length-40));
  log('URL:'+oOpt.sUrl);
  var oR = oOpt.sUrl.match(/^http:\/\/([^:\/]+)(:([0-9]+))?(\/gems\/cita\/ajax.ajax)$/);
  if (!oR) {
    log("Bad URL format"+oOpt.sUrl);
    process.exit(99);
    return;
  }
  var options = {
     hostname: oR[1]
    ,port: oR[3]
    ,path: "/gems/cita/ajax.ajax"
    ,method: 'POST'
    ,headers: {
       'Content-Type': 'application/x-www-form-urlencoded',
       'Content-Length': sData.length
    }
  };

  var req = http.request(options, handler);

  req.on('error', function(e) {
    console.log('ERROR: ' + e.message);
  });
  req.write(sData);
  if (oOpt.bVerbose) log("writeReq "+sData.length);
  req.end();

  var sBody = "";

  function handler(res) {
    if (oOpt.bVerbose) console.log('STATUS: ' + res.statusCode);
    if (oOpt.bVerbose) console.log('HEADERS: ',res.headers);
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      if (oOpt.bVerbose) console.log('BODY: ' + chunk.length);
      sBody += chunk;
    });
    res.on('end', function () {
      if (oOpt.bVerbose) console.log('END: seen');
      //console.log("BODY:"+sBody);
      if (res.statusCode != 200) {
        log("FAILED "+ res.statusCode+" "+options.path);
      } else {
        var oRes = JSON.parse(sBody);
        responder(oRes);
      }
    });
  }
}

function formatShipRequest(oReq) {
  var sData = fs.readFileSync(oOpt.sFile+"\\"+oReq.file,'utf8');
  var oPL   = {};
  oPL.KeyName = oReq.key;
  oPL.DataFld = sData;
  log("Shipping "+sData.length+" bytes");
  return formatAjaxRequest("WaksSendCitaData",oPL);
}

function formatFindRequest(sKey) {
  var oPL   = {};
  oPL.KeyName = sKey
  return formatAjaxRequest("WaksFindCitaData",oPL);
}


function formatReadRequest(sKey) {
  var oPL   = {};
  oPL.KeyName = sKey
  return formatAjaxRequest("WaksReadCitaData",oPL);
}

function formatAjaxRequest(sMeth,oPL) {
  var oAjax = {};
  var oExec = {};
  var oAuth = {};
  oAjax.EXEC = oExec;
  oExec.auth = oAuth;
  oExec.ajaxMeth = sMeth;
  oExec.payload = oPL;
  oAuth.cust = oOpt.sCust;
  oAuth.user = oOpt.sUser;
  oAuth.password = oOpt.sPW;
  oAjax.AjaxID = 'WAKS-call-js';
  return oAjax;
}



function deepCopy(oObj) {
  return JSON.parse(JSON.stringify(oObj));
}


function log(sMsg) {
  console.log(sMsg);
}

oOpt = parms.parms(process.argv,oOpt,oParms);
if (!oOpt) {
  parms.parms(null,null,oParms);
  log("quitting due to errors");
  process.exit(4);
}
if (oOpt.bHelp) {
  log("WAKS Parameters:");
  parms.parms(null,null,oParms);
  return;
} else {
  if (oOpt.bVerbose) {
    log("Base Page Dir: "+process.cwd());
    console.log("Run Options\r\n",oOpt);
  }
  main();
}





