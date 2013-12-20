/*
 @license
 Copyright (c) 2013 by Steve Pritchard of Rexcel Systems Inc.
 This file is made available under the terms of the Creative Commons Attribution-ShareAlike 3.0 license
 http://creativecommons.org/licenses/by-sa/3.0/.
 Contact: public.pritchard@gmail.com
*/


/*
 * tri-server.js acts as a WebServer.  It was derived from webserver.js and has been
 * extended to handle the ajax calls used by TRI.js and waks.js.
 *
 * It uses a local file directory and sub-directories to store the files.  This is
 * loaded into a in-memory table during startup and maintained during execution.
 *
 *
 *
 */
var util    = require('util'),
    http    = require('http'),
    fs      = require('fs'),
    url     = require('url'),
    parms   = require('./parms'),
    events  = require('events');

var oParms = [
 // 0            1     2        3            4
 // OptSw        Mand  Parm     Value        Help meaning
  ['bHelp'    ,  ".",  "-h"     ,null        ,"Generate this Help Information that you are now reading"  ]
 ,['bQuit'    ,  ".",  "-quit"  ,null        ,"T/on command line q command"                              ]
 ,['sTriBase' ,  ".",  "-base"  ,"dir"       ,"Base directory for pages"                                 ]
 ,['sTriDir'  ,  ".",  "-db"    ,"dir"       ,"Locn of DB (after cwd of -base)"                          ]
 ,['sRootPage',  ".",  "-root"  ,"file"      ,"Default first page (index.html default)"                  ]
 ,['nHttpPort',  ".",  "-port"  ,"port"      ,"Port to listen on (8888 default)"                         ]
 ,['bVerbose' ,  ".",  "-v"     ,null        ,"Verbose mode"                                             ]
];

var oOpt = {
   sTriBase:    "./"
  ,sTriDir:     "./TRI-DB"
  ,sRootPage:   "def-app.htm"
  ,nHttpPort:   '80'
  ,bQuit:       false
}

// We keep a copy of the directory so that the WebServer events at most drill down one async level

var oDB = {
   oSuper: null
  ,oApps:  {}
}

var oProtRec = {// use deepCopy to clone
   type: null   // one of '$super', '$user', '$data'
  ,name: null   // name if user
  ,path: null   // full path
  ,data: null   // Contains data till operation done
  ,obj: null    // Contains data object for non-data types
  ,cts: null    // create timestamp
  ,uts: null    // update timestamp
}

var oProtApp = {// use deepCopy to clone
   name:  null  // name of app (key in oDB.oApps, folder name on storage)
  ,cts: null    // create timestamp
  ,files: {}    // Users (oRec object, {type}.{username} as key)
}


var oMeths = {};

function main() {
  if (oOpt.bQuit) {
    log("tri-server listening for q{CR}");
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', function(chunk) {
      var sLine = chunk.trim();
      if (sLine == 'q') {
        log("tri-server quitting");
        process.exit(0);
      }
      if (sLine == 'db') {
        log("-------DB dump------");
        log(""+util.inspect(oDB,{depth:5}));
        log("------end dump------");
      }
      if (sLine.substring(0,1) == 'f') {
        var sParts = sLine.split(/\s/);
        //console.log("parts "+sParts);
        var oRet = findData(sParts[1],sParts[2],sParts[3],sParts[4]);
        log("ret len="+oRet.length+"\r\n"+util.inspect(oRet,{depth:4}));
      }

    });
    process.stdin.on('end', function() {
      log("end.read");
    });
  }
  scanDB();
  new HttpServer({
     'GET':  createServlet(StaticServlet)
    ,'HEAD': createServlet(StaticServlet)
    ,'POST': createServlet(StaticServlet)
  }).start(oOpt.nHttpPort);
}

function escapeHtml(value) {
  return value.toString().
    replace('<', '&lt;').
    replace('>', '&gt;').
    replace('"', '&quot;');
}

function createServlet(Class) {
  var servlet = new Class();
  return servlet.handleRequest.bind(servlet);
}

/**
 * An Http server implementation that uses a map of methods to decide
 * action routing.
 *
 * @param {Object} Map of method => Handler function
 */
function HttpServer(handlers) {
  this.handlers = handlers;
  this.server = http.createServer(this.handleRequest_.bind(this));
}

HttpServer.prototype.start = function(port) {
  this.port = port;
  this.server.listen(port);
  util.puts('Http Tri-Server alive at http://localhost:' + port + '/');
};

HttpServer.prototype.parseUrl_ = function(urlString) {
  var parsed = url.parse(urlString);
  parsed.pathname = url.resolve('/', parsed.pathname);
  return url.parse(url.format(parsed), true);
};

HttpServer.prototype.handleRequest_ = function(req, res) {
  var logEntry = req.method + ' ' + req.url;
  if (req.headers['user-agent']) {
    if (oOpt.bVerbose) logEntry += ' ' + req.headers['user-agent'];
  }
  util.puts(logEntry);
  req.url = this.parseUrl_(req.url);
  var handler = this.handlers[req.method];
  if (!handler) {
    res.writeHead(501);
    res.end();
  } else {
    handler.call(this, req, res);
  }
};

/**
 * Handles static content.
 */
function StaticServlet() {}

StaticServlet.MimeMap = {
   'txt': 'text/plain'
  ,'html': 'text/html'
  ,'htm':  'text/html'
  ,'css':  'text/css'
  ,'xml':  'application/xml'
  ,'json': 'application/json'
  ,'js':   'application/javascript'
  ,'jpg':  'image/jpeg'
  ,'jpeg': 'image/jpeg'
  ,'gif':  'image/gif'
  ,'png':  'image/png'
  ,'svg':  'image/svg+xml'
  ,'wav':  'audio/x-wav'
  ,'zip':  'application/zip'
  ,'bin':  'application/octet-stream'
};

StaticServlet.prototype.handleRequest = function(req, res) {
  var self = this;
  var path = ('./' + req.url.pathname).replace('//','/').replace(/%(..)/g, function(match, hex){
    return String.fromCharCode(parseInt(hex, 16));
  });
  var parts = path.split('/');
  if (parts[parts.length-1].charAt(0) === '.')
    return self.sendForbidden_(req, res, path);
  //log("doing path:"+path);
  if ((req.method == 'POST') && (path.substring(0,7) == './gems/')) {
    return self.handleAjax_(req, res, path);
  }
  fs.stat(path, function(err, stat) {
    if (err)
      return self.sendMissing_(req, res, path);
    if (stat.isDirectory()) {
      //return self.sendDirectory_(req, res, path);
      if (path == './') {
        return self.sendFile_(req, res, path+oOpt.sRootPage);
      } else {
        self.sendForbidden_(req, res, path);
      }
    }
    return self.sendFile_(req, res, path);
  });
}

StaticServlet.prototype.sendError_ = function(req, res, error) {
  res.writeHead(500, {
      'Content-Type': 'text/html'
  });
  res.write('<!doctype html>\n');
  res.write('<title>Internal Server Error</title>\n');
  res.write('<h1>Internal Server Error</h1>');
  res.write('<pre>' + escapeHtml(util.inspect(error)) + '</pre>');
  util.puts('500 Internal Server Error');
  util.puts(util.inspect(error));
};

StaticServlet.prototype.sendMissing_ = function(req, res, path) {
  path = path.substring(1);
  res.writeHead(404, {
      'Content-Type': 'text/html'
  });
  res.write('<!doctype html>\n');
  res.write('<title>404 Not Found</title>\n');
  res.write('<h1>Not Found</h1>');
  res.write(
    '<p>The requested URL ' +
    escapeHtml(path) +
    ' was not found on this server.</p>'
  );
  res.end();
  util.puts('404 Not Found: ' + path);
};

StaticServlet.prototype.sendForbidden_ = function(req, res, path) {
  path = path.substring(1);
  res.writeHead(403, {
      'Content-Type': 'text/html'
  });
  res.write('<!doctype html>\n');
  res.write('<title>403 Forbidden</title>\n');
  res.write('<h1>Forbidden</h1>');
  res.write(
    '<p>You do not have permission to access ' +
    escapeHtml(path) + ' on this server.</p>'
  );
  res.end();
  util.puts('403 Forbidden: ' + path);
};

StaticServlet.prototype.sendRedirect_ = function(req, res, redirectUrl) {
  res.writeHead(301, {
      'Content-Type': 'text/html',
      'Location': redirectUrl
  });
  res.write('<!doctype html>\n');
  res.write('<title>301 Moved Permanently</title>\n');
  res.write('<h1>Moved Permanently</h1>');
  res.write(
    '<p>The document has moved <a href="' +
    redirectUrl +
    '">here</a>.</p>'
  );
  res.end();
  util.puts('301 Moved Permanently: ' + redirectUrl);
};

StaticServlet.prototype.sendFile_ = function(req, res, path) {
  var self = this;
  var file = fs.createReadStream(path);
  res.writeHead(200, {
    'Access-Control-Allow-Origin':'*',  //allows file:// mode testing
    'Content-Type': StaticServlet.
      MimeMap[path.split('.').pop()] || 'text/plain'
  });
  if (req.method === 'HEAD') {
    res.end();
  } else {
    file.on('data', res.write.bind(res));
    file.on('close', function() {
      res.end();
    });
    file.on('error', function(error) {
      self.sendError_(req, res, error);
    });
  }
};

StaticServlet.prototype.sendDirectory_ = function(req, res, path) {
  var self = this;
  if (path.match(/[^\/]$/)) {
    req.url.pathname += '/';
    var redirectUrl = url.format(url.parse(url.format(req.url)));
    return self.sendRedirect_(req, res, redirectUrl);
  }
  fs.readdir(path, function(err, files) {
    if (err)
      return self.sendError_(req, res, error);

    if (!files.length)
      return self.writeDirectoryIndex_(req, res, path, []);

    var remaining = files.length;
    files.forEach(function(fileName, index) {
      fs.stat(path + '/' + fileName, function(err, stat) {
        if (err)
          return self.sendError_(req, res, err);
        if (stat.isDirectory()) {
          files[index] = fileName + '/';
        }
        if (!(--remaining))
          return self.writeDirectoryIndex_(req, res, path, files);
      });
    });
  });
};

StaticServlet.prototype.writeDirectoryIndex_ = function(req, res, path, files) {
  path = path.substring(1);
  res.writeHead(200, {
    'Content-Type': 'text/html'
  });
  if (req.method === 'HEAD') {
    res.end();
    return;
  }
  res.write('<!doctype html>\n');
  res.write('<title>' + escapeHtml(path) + '</title>\n');
  res.write('<style>\n');
  res.write('  ol { list-style-type: none; font-size: 1.2em; }\n');
  res.write('</style>\n');
  res.write('<h1>Directory: ' + escapeHtml(path) + '</h1>');
  res.write('<ol>');
  files.forEach(function(fileName) {
    if (fileName.charAt(0) !== '.') {
      res.write('<li><a href="' +
        escapeHtml(fileName) + '">' +
        escapeHtml(fileName) + '</a></li>');
    }
  });
  res.write('</ol>');
  res.end();
};

// Tri-Ajax Support

StaticServlet.prototype.handleAjax_ = function(req, res, path) {
  //console.log('AjaxReq:',req.method);
  //if (error) return writeError(res,error);

  var sBody = "";

  req.on('data',function(chunk) {
    if (oOpt.bVerbose) log("read "+chunk.toString().length+" bytes");
    sBody += chunk.toString();
  });

  req.on('end',function() {
    if (oOpt.bVerbose)  log("read end");
    if (sBody.substring(0,5) != 'json=') {
      writeError(400,res,' Bad post data');
      return;
    }
    if (oOpt.bVerbose) console.log("body:",sBody.length);
    var oObj = JSON.parse(decodeURI(sBody.substring(5)));
    var oExec   = oObj.EXEC;
    var oAuth   = oExec.auth;
    var oPL     = oExec.payload;
    var sMeth   = oExec.ajaxMeth;
    if (oOpt.bVerbose) console.log("auth:",oAuth);
    if (oOpt.bVerbose) console.log("method:",sMeth);
    var sStr = '';
    if (oPL) sStr = JSON.stringify(oPL);
    if (sStr.length > 30) sStr = sStr.substring(0,30) + '...';
    log("AJAX:"+sMeth+" app="+oAuth.cust+" user="+oAuth.user+" PL="+sStr);
    if (oMeths['ajax'+sMeth]) {
      oMeths['ajax'+sMeth](sMeth,req,res,oExec,oAuth,oPL);
    } else {
      writeError(501,res,' Method '+sMeth+' not implemented');
    }
  });


  function writeRes(res) {
    res.writeHead(200, {
        'Content-Type': 'text/html'
    });
    res.write('<!doctype html>\n');
    res.write('<title>its good</title>\n');
    res.write('<h1>OK</h1>');
    util.puts('Ajax handled');
  }

};

function writeGood(res) {
  res.writeHead(200, {
      'Content-Type': 'text/html'
  });
  res.write('<!doctype html>\n');
  res.write('<title>its good</title>\n');
  res.write('<h1>OK</h1>');
  res.end();
  util.puts('Ajax handled');
}

function writeFAIL(res,sFail,sFailType) {
  res.writeHead(200, {
      'Content-Type': 'text/html'
  });
  var oFail = {status:'FAIL','status-message':sFail,'node-js':true,'status-ts':getTimeStamp()};
  if (sFailType) {
    oFail.RESULT={STATUS:sFailType,CODE:sFail};
  }
  res.write(''+JSON.stringify(oFail)+'\n');
  res.end();
  util.puts('Ajax FAIL handled: '+sFail);
}

function writeGOOD(res,sGood,oRec,sStat,sCode,oRes,oProf) {
  res.writeHead(200, {
      'Content-Type': 'text/html'
  });
  var oGood = {status:'GOOD','status-message':sGood,'node-js':true,'status-ts':getTimeStamp()};
  if (sStat) {
    if (!oRes) oRes = {};
    oGood.RESULT = oRes;
    if (oProf) oGood.RESULT.PROFILE = oProf;
    oRes.STATUS = sStat;
    oRes.CODE = sCode;
    if (oRec) oRes.RECORD = oRec;
  }
  res.write(''+JSON.stringify(oGood)+'\n');
  res.end();
  util.puts('Ajax GOOD handled: '+sGood);
}

function writeError(code,res,sErr) {
  //console.log('AjaxRes:',res);
  res.writeHead(code, {
      'Content-Type': 'text/html'
  });
  res.write('<!doctype html>\n');
  res.write("<title>Server Error:"+sErr+"</title>\n");
  res.write("<h1>Server Error:"+sErr+"</h1>\n");
  res.write('<pre>' + sErr + '</pre>');
  util.puts(''+code+' Ajax server error '+sErr);
  res.end();
}

function log(sMsg) {console.log(sMsg);}

function deepCopy(oObj) { //expensive but we hardly use it
  return JSON.parse(JSON.stringify(oObj));
}

function adler32(data) {
  var MOD_ADLER = 65521;
  var a = 1, b = 0;

  var len = data.length;

  for (var i = 0; i < len; i++) {
    a += data.charCodeAt(i);
    b += a;
  }

  a %= MOD_ADLER;
  b %= MOD_ADLER;

  return (b << 16) | a;
}

function makePassword(sPass) {
  return ''+adler32(sPass+"x"+sPass+oDB.oSuper.obj.mangle);
}

function makeManglerStr() {
  var sStr = 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var sPrime = ''+new Date().getTime();
  var sSeed = sPrime;
  var sAns = '';
  for(var i=0,iMax=16; i<iMax; i+=1) {
    var n = adler32(sSeed);
    sAns += sStr.charAt(n % sStr.length);
    sSeed = sAns + i + sPrime;
  }
  //log("makeMangle "+sAns+" "+sPrime+" "+sSeed);
  return sAns;
}

function validateSuperUser(res,oAuth) {
  if (!oDB.oSuper) return 'lost superuser record';
  if (oAuth.password.charAt(0) == '=') { // change password request
    var  sParts = oAuth.password.substring(1).split("/");
    log("try "+sParts[0]+" vs "+oDB.oSuper.obj.password);
    if ((sParts[0] == ''+oDB.oSuper.obj.password) && (sParts.length == 2)) {
      var sES1 = makePassword(sParts[1]);
      oDB.oSuper.obj.password = sES1;
      oDB.oSuper.data = JSON.stringify(oDB.oSuper.obj);
      writeData(null,oDB.oSuper,null); // background write
      log("SuperUser password changed to "+sParts[1]+" "+sES1);
      return null; // Its good
    } else {
      return 'SuperUser credentials bad for password change'
    }
  }
  var sPass = makePassword(oAuth.password);
  if (sPass != oDB.oSuper.obj.password) return 'SuperUser credentials bad';
  return null;
}

function makeDir(res,sApp,callback) {
  fs.mkdir(oOpt.sTriDir+"/"+sApp,function(err) {
    if (err) {
      writeFAIL(res,'makaDir failed');
      callback(false);
    } else {
      callback(true);
    }
  });
}

function writeData(res,oRec,callback) {
  if (oOpt.bVerbose) log("Write "+oRec.data.length+" chars to "+oRec.path);
  fs.writeFile(oRec.path,oRec.data,function(err) {
    oRec.data = null;
    if (err) {
      if (res) {
        writeFAIL(res,"writeData "+oRec.path+" failed");
      } else {
        log("writeData "+oRec.path+" failed");
      }
      if (callback) callback(false);
    } else {
      fs.stat(oRec.path,function(err,oStat) {
        if (!err) {
          oRec.uts = oStat.mtime.getTime();
        }
        if (callback) callback(true);
      });
    }
  });
}

function readData(res,oRec,callback) {
  if (oRec.data) { // being written so use temp copy
    if (oOpt.bVerbose) log("callback "+oRec.data.length);
    callback(true,oRec.data);
  } else {         // read store copy
    fs.readFile(oRec.path,'utf8',function(err,data) {
      if (oOpt.bVerbose) console.log("readfrom "+oRec.path);
      if (err) {
        writeFAIL(res,"readData "+oRec.path+" failed");
        callback(false);
      } else {
        if (oOpt.bVerbose) console.log("readdata:"+data.length);
        callback(true,data);
      }
    });
  }
}

function getTimeStamp() {
  var sDate = new Date().toISOString();
  sDate = sDate.replace(/[TZ:-]/g,"");
  sDate = sDate.replace(/[.]/,"-");
  var sRet = sDate.substring(0,4)+'-'+sDate.substring(4,6)+'-'+sDate.substring(6,8);
  sRet += ' '+sDate.substring(8,10)+':'+sDate.substring(10,12)+':'+sDate.substring(12,14);
  sRet += ' '+(((sDate.substring(15)-0) / 1000.0).toFixed(3))+'ms';
  return sRet;
}

function findData(sType,sApp,sRecType,sRecName,oRet) {
  if (!oRet) oRet = [];
  if (sApp == '$') {
    var sApps = Object.keys(oDB.oApps);
    for(var i=0,iMax=sApps.length; i<iMax; i+=1) {
      findData(sType,sApps[i],sRecType,sRecName,oRet);
    }
    return oRet;
  }
  var oApp = oDB.oApps[sApp];
  if (!oApp) return oRet;
  var sKeys = Object.keys(oApp.files);
  if (oOpt.bVerbose) console.log("app.keys",sKeys);
  if (!sRecType) sRecType = "%";
  if (!sRecName) sRecName = "%";
  var sMask = sRecType+"."+sRecName;
  if (sType == "$user") sMask = "%";
  var nIX = sMask.indexOf("%");
  if (nIX >= 0) sMask = sMask.substring(0,nIX);
  for(var i=0,iMax=sKeys.length; i<iMax; i+=1) {
    var oRec = oApp.files[sKeys[i]];
    var oOut = {};
    if (oRec.type != sType) continue;
    if (nIX < 0) {
      if (oRec.name != sMask) continue;
    } else {
      if ((sMask.length >= 0) && (oRec.name.substring(0,nIX) != sMask)) continue;
    }
    oOut.GekID = 1;
    if (oRec.type == '$user') {
      oOut.KeyName = '*/'+sApp+'/'+oRec.name;
      oOut.DataFld = JSON.stringify(oRec.obj);
    } else {
      oOut.KeyName = sApp+"/"+oRec.name.replace(/\./,'/');
    }
    oOut.CreateTS = oRec.cts;
    oOut.UpdateTS = oRec.uts;
    if (oOpt.bVerbose) console.log("out=",oOut);
    oRet.push(oOut);
  }
  return oRet;
}

// -------------------- Authorization related
function validateToken(oAuth) {
  var sRecName = "$user."+oAuth.user;
  var oApp = oDB.oApps[oAuth.cust];
  var oRec = null;
  if (oApp) oRec = oApp.files[sRecName];
  if (!oRec) return "not-in-user-table";
  var oUser = oRec.obj;
  if (!oUser.token) return "token-does-not-exist";
  if (oAuth.token != oUser.token) return "token-does-not-exist";
  return oUser;
}

function validatePassword(oUser,sPassword) {
  var sGiven = makePassword(sPassword);
  var sNeed =  oUser.password;
  if (!sNeed.match(/^-?[0-9]+$/)) { // new password
    sNeed = makePassword(oUser.password);
    oUser.password = sNeed;
  }
  if (oOpt.bVerbose) log("Valididate "+sPassword+" "+sGiven+" "+sNeed);
  return (sNeed == sGiven);
}

function validateUserPassword(oAuth,sUser,sPassword,bPrimary,bJustValidate) {
  var sRecName = "$user."+sUser;
  if (oOpt.bVerbose) log("recname "+sRecName+" ");
  var oApp = oDB.oApps[oAuth.cust];
  var oRec = null;
  if (oApp) oRec = oApp.files[sRecName];
  if (oOpt.bVerbose) console.log("Have User ",oAuth.cust,oRec);
  if (!oRec) return "not-in-auth-table primary="+bPrimary;
  var oUser = oRec.obj;
  var sOldPassword = oUser.password;
  if (!validatePassword(oUser,sPassword)) {
    return "mismatches-password-value primary="+bPrimary;
  }
  if (bJustValidate) return oUser;
  if (bPrimary) {
    var sToken = adler32(sRecName+process.hrtime()[1]);
    oUser.token = sToken;
  }
  if (bPrimary || (!sOldPassword != oUser.password)) {
    oRec.data = JSON.stringify(oUser);
    writeData(null,oRec,null); // background write
  }
  if (oOpt.bVerbose) console.log("OK user ",oUser);
  return oUser;
}

function performLogin(oAuth) {
  var oX = validateUserPassword(oAuth,oAuth.user,oAuth.password,true);
  if (typeof oX == 'string') return oX;
  var oUser = oX;
  if (oUser.double == 'true') {
    oX = validateUserPassword(oAuth,oAuth.user2,oAuth.password2,false);
    if (typeof oX == 'string') return oX;
  }
  return oUser;
}

function checkAuth(oAuth,bAdmin) {
  var sRecName = "$user."+oAuth.user;
  var oApp = oDB.oApps[oAuth.cust];
  var oRec = null;
  if (oApp) oRec = oApp.files[sRecName];
  if (!oRec) return "user-not-in-auth-table";
  var oUser = oRec.obj;
  if (oAuth.token != oAuth.token) return 'expired-token'; // NOTE: GAE version does not do this test.
  if (bAdmin) {
    if (!oUser.role || oUser.role.indexOf('admin') < 0) return "User not authorized for operation";
  }
  return oUser;
}


function makeProfile(oUser) {
  var oProf = deepCopy(oUser);
  delete oProf.token;
  delete oProf.password;
  return oProf;
  oRet.PROFILE = oProf;
}

function getAppStatus(sApp) {
  var oList = [];
  var oRet = {DataStat:{RECORD:oList,CODE:'found',STATUS:'OK'}};
  var oApp = oDB.oApps[sApp];
  if (!oApp) return oRet;
  var sKeys = Object.keys(oApp.files);
  for(var i=0,iMax=sKeys.length; i<iMax; i+=1) {
    var oRec = oApp.files[sKeys[i]];
    if (oRec.type == '$user') continue;
    var sKeyName = sApp+"/"+oRec.name.replace(/\./,"/");
    var oOut = {CreateTS:oRec.cts,GekID:1,UpdateTS:oRec.uts,KeyName:sKeyName};
    oList.push(oOut);
  }
  if (oOpt.bVerbose) log("getAppStatus "+sApp+" "+oList.length+" entries ");
  return oRet;
}

function mapReqKey(oAuth,oPL) {
  var sParts = oPL.KeyName.split("/");
  var oX = checkAuth(oAuth,sParts[0] == '*');
  if (typeof oX == 'string') return oX;
  var oUser = oX;
  var sApp = sParts[0];
  var sRecName = '$data.'+sParts[1]+'.'+sParts[2];
  if (sParts[0] == '*') {
    sApp = sParts[1];
    sRecName = '$user.'+sParts[2];
  }
  var oApp = oDB.oApps[sApp];
  if (!oApp) return "App "+sApp+" does not exist",'AUTH-ERR';
  var oReq = {app:oApp,user:oUser,reckey:sRecName};
  oReq.rec = oApp.files[sRecName];
  return oReq;
}

function mapRecName(oPL,oAuth) {
  var sType = '$data';
  if (oPL.KeyName.substring(0,2) == '$/') sType = '$user';
  if (oPL.KeyName.substring(0,2) == '*/') sType = '$user';
  var sParts = oPL.KeyName.split("/");
  if (sType == '$user') {
    var sRecName = sType +'.' + sParts[2];
    return {app:sParts[1],recname:sRecName,name:sParts[2]}
  } else {
    var sRecName = sType +'.' + sParts[1] + '.' + sParts[2];
    return {app:oAuth.cust,recname:sRecName,name:sParts[1] + '.' + sParts[2]}
  }
}


//--------------------------------------------------------------
// ------------------- Ajax Method Handlers --------------------
//--------------------------------------------------------------

// -------------------- Browser Requests -----------------------
oMeths.ajaxValidateToken = function(sMeth,req,res,oExec,oAuth,oPL) {
  var oX = validateToken(oAuth);
  if (typeof oX == 'string') {
    writeFAIL(res,oX,'AUTH-ERR');
    return;
  }
  var oUser = oX;
  var oRet = getAppStatus(oAuth.cust);
  oRet.user  = ''+oAuth.user;
  var oProf = makeProfile(oUser);
  writeGOOD(res,'validate OK',null,"OK","found",oRet,oProf);
}

oMeths.ajaxLogin = function(sMeth,req,res,oExec,oAuth,oPL) {
  var oX = performLogin(oAuth);
  if (typeof oX == 'string') {
    writeFAIL(res,oX,'AUTH-ERR');
    return;
  }
  var oUser = oX;
  var oRet = getAppStatus(oAuth.cust);
  oRet.token = ''+oUser.token;
  oRet.user  = ''+oAuth.user;
  oRet.PROFILE = makeProfile(oUser);
  writeGOOD(res,'login OK',null,"OK","found",oRet);
}

oMeths.ajaxChangePassword = function(sMeth,req,res,oExec,oAuth,oPL) {
  var oX = checkAuth(oAuth);
  if (typeof oX == 'string') {
    writeFAIL(res,oX,'AUTH-ERR');
    return;
  }
  var oX = validateUserPassword(oAuth,oAuth.user,oAuth.password,true,true);
  if (typeof oX == 'string') {
    writeFAIL(res,oX,'AUTH-ERR');
    return;
  }
  var oApp = oDB.oApps[oAuth.cust];
  if (!oApp) {
    writeFAIL(res,"Lost app "+oAuth.cust,'AUTH-ERR');
    return;
  }
  var sRecName = '$user.'+oAuth.user;
  var oRec = oApp.files[sRecName];
  if (!oRec) {
    writeFAIL(res,"Lost user rec for "+sRecName,'AUTH-ERR');
    return;
  }
  oRec.obj.password = oPL.NewPassword;
  oRec.data = JSON.stringify(oRec.obj);
  if (oOpt.bVerbose) console.log("rec ",oRec);
  writeData(res,oRec,function(bOK) {
    if (bOK) {
      var oRet = {STATUS:'OK'};
      oRet.PROFILE = makeProfile(oRec.obj);
      writeGOOD(res,'write OK',null,"OK","found",oRet);
    } else {
      writeFAIL(res,"UserRec "+sRecName+" write failure"+oApp.name);
    }
  });
}

oMeths.ajaxFindUserData = function(sMeth,req,res,oExec,oAuth,oPL) {
  var oX = checkAuth(oAuth);
  if (typeof oX == 'string') {
    writeFAIL(res,oX,'AUTH-ERR');
    return;
  }
  var oUser = oX;
  if (!oUser.role || oUser.role.indexOf('admin') < 0) {
    writeFAIL(res,"User not authorized",'AUTH-ERR');
    return;
  }
  var oRet = findData('$user',oAuth.cust,null,null);
  writeGOOD(res,'users for aps '+oAuth.cust+' returned',oRet,"OK","found");
}

oMeths.ajaxFindCitaData = function(sMeth,req,res,oExec,oAuth,oPL) {
  var oX = checkAuth(oAuth);
  if (typeof oX == 'string') {
    writeFAIL(res,oX,'AUTH-ERR');
    return;
  }
  var oUser = oX;
  if (oOpt.bVerbose) console.log(oPL);
  var sParts = oPL.KeyName.split("/");
  var oRet = findData('$data',oAuth.cust,sParts[1],sParts[2]);
  writeGOOD(res,'data for aps '+oAuth.cust+' returned',oRet,"OK","found");
}



oMeths.ajaxReadCitaData = function(sMeth,req,res,oExec,oAuth,oPL) {
  var oReq = mapReqKey(oAuth,oPL);
  if (typeof oReq == 'string') {
    writeFAIL(res,oReq,'AUTH-ERR');
    return;
  }
  var oUser = oReq.user;
  var oApp  = oReq.app;
  var oRec  = oReq.rec;
  if (oRec) {
    readData(res,oRec,function(bOK,data) {
      if (bOK) {
        var oRet = {STATUS:'OK',CODE:'found',UpdateTS:oRec.uts,RECORD:{DataFld:data,GekID:1,KeyName:oPL.KeyName}};
        writeGOOD(res,'read OK',null,"OK","found",oRet);
      } else {
        writeFAIL(res,"DataRec "+oReq.reckey+" read failure"+oApp.name);
      }
    });
  } else {
    writeFAIL(res,"DataRec "+oReq.reckey+" does not exist in app "+oApp.name,'AUTH-ERR');
  }
}

oMeths.ajaxSendCitaData = function(sMeth,req,res,oExec,oAuth,oPL) {
  var oReq = mapReqKey(oAuth,oPL);
  if (typeof oReq == 'string') {
    writeFAIL(res,oReq,'AUTH-ERR');
    return;
  }
  var oUser = oReq.user;
  var oApp  = oReq.app;
  var oRec  = oReq.rec;
  var sStat = 'updated';
  if (!oRec) { // New record to create
    sStat = 'new';
    oRec = deepCopy(oProtRec);
    oRec.type = oReq.reckey.substring(0,5);
    oRec.path = oOpt.sTriDir+"/"+oApp.name+"/"+oReq.reckey+".json.txt";
    oRec.name = oReq.reckey.substring(6);
    oApp.files[oReq.reckey] = oRec;
  }
  oRec.data = oPL.DataFld;
  if (oRec.type == '$user') { //user record
    oRec.obj = JSON.parse(oPL.DataFld);
  }
  writeData(res,oRec,function(bOK) {
    if (bOK) {
      var oRet = {STATUS:'OK',CODE:sStat,UpdateTS:oRec.uts,RECORD:{DataFld:oPL.DataFld,GekID:1,KeyName:oPL.KeyName}};
      writeGOOD(res,'write OK',null,"OK","found",oRet);
    } else {
      writeFAIL(res,"DataRec "+oReq.reckey+" write failure"+oApp.name);
    }
  });
}

oMeths.ajaxDeleteKey = function(sMeth,req,res,oExec,oAuth,oPL) {
  var oReq = mapReqKey(oAuth,oPL);
  if (typeof oReq == 'string') {
    writeFAIL(res,oReq,'AUTH-ERR');
    return;
  }
  var oUser = oReq.user;
  var oApp  = oReq.app;
  var oRec  = oReq.rec;
  if (oRec) {
    fs.unlink(oRec.path,function(err) {
      if (!err) {
        var oRet = {STATUS:'OK',CODE:'deleted'};
        writeGOOD(res,'delete OK',null,"OK","found",oRet);
        delete oApp.files[oReq.reckey];
      } else {
        writeFAIL(res,"DataRec "+oReq.reckey+" delete failure"+oApp.name);
      }
    });
  } else {
    writeFAIL(res,"DataRec for delete "+oReq.reckey+" does not exist in app "+oApp.name,'AUTH-ERR');
  }
}



// --------------------- WAKS Interface ------------------------
oMeths.ajaxWaksFindCitaData = function(sMeth,req,res,oExec,oAuth,oPL) {
  var sErr = validateSuperUser(res,oAuth);
  if (sErr) {
    writeFAIL(res,sErr);
    return;
  }
  var sType = '$data';
  if (oPL.KeyName.substring(0,2) == '$/') sType = '$user';
  var oRet = findData(sType,oAuth.cust,null,null);
  writeGOOD(res,'apps '+sType+' returned',oRet,"OK","found");
}

oMeths.ajaxWaksSendCitaData = function(sMeth,req,res,oExec,oAuth,oPL) {
  var sErr = validateSuperUser(res,oAuth);
  if (sErr) {
    writeFAIL(res,sErr);
    return;
  }
  var oMap = mapRecName(oPL,oAuth);
  var sRecName = oMap.recname;
  var oApp = oDB.oApps[oMap.app];
  if (!oApp) {
    writeFAIL(res,'App '+oMap.app+" not defined");
    return;
  }
  if (oOpt.bVerbose) console.log("payload:",oPL.KeyName,oPL.DataFld.length);
  var sType = '$data';
  var oRec = oApp.files[sRecName];
  var sStat = 'updated';
  if (!oRec) {
    sStat = 'new';
    oRec = deepCopy(oProtRec);
    oRec.type = sType;
    oRec.path = oOpt.sTriDir+"/"+oApp.name+"/"+sRecName+".json.txt";
    oRec.name = oMap.name;
    oApp.files[oRec.type+"."+oRec.name] = oRec;
  }
  oRec.data = oPL.DataFld;
  writeData(res,oRec,function(bOK) {
    if (bOK) {
      var oRet = JSON.parse(oPL.DataFld);
      writeGOOD(res,'Cita Record',oRet,"OK",sStat);
    }
  });
}

oMeths.ajaxWaksReadCitaData = function(sMeth,req,res,oExec,oAuth,oPL) {
  var sErr = validateSuperUser(res,oAuth);
  if (sErr) {
    writeFAIL(res,sErr);
    return;
  }
  var oMap = mapRecName(oPL,oAuth);
  var sRecName = oMap.recname;
  var oApp = oDB.oApps[oMap.app];
  if (!oApp) {
    writeFAIL(res,'App '+oMap.app+" not defined");
    return;
  }
  var oRec = oApp.files[sRecName];
  var sStat = 'found';
  if (!oRec) {
    writeFAIL(res,'Record '+sRecName+" does not exist in app "+oMap.app);
  } else {
    readData(res,oRec,function(bOK,data) {
      if (bOK) {
        if (oOpt.bVerbose) console.log("data:"+data.length);
        var oRet = {DataFld:data};
        writeGOOD(res,'Cita Record',oRet,"OK",sStat);
      }
    });
  }
}


// ------------------ DataStore Management ---------------------

oMeths.ajaxValidateStore = function(sMeth,req,res,oExec,oAuth,oPL) {
  if (!oDB.oSuper) {
    writeFAIL(res,'not-primed');
  } else {
    writeGOOD(res,'validateStore primed');
  }
}


oMeths.ajaxPrimeStore = function(sMeth,req,res,oExec,oAuth,oPL) {
  fs.mkdir(oOpt.sTriDir,function(err) {
    if (err) {
      log("dir "+oOpt.sTriDir+" already exists");
    }
    var oRec = deepCopy(oProtRec);
    oDB.oSuper = oRec;
    oRec.type = '$super';
    oRec.name = oAuth.user;
    oRec.path = oOpt.sTriDir+"/$super."+oAuth.user+'.json.txt';
    oRec.obj  = {mangle:makeManglerStr()};
    oRec.obj.password = makePassword(oAuth.password);
    oRec.data = JSON.stringify(oRec.obj);
    writeData(res,oRec,function(bOK) {
      if (bOK) {
        writeGOOD(res,'primeStore OK');
      }
    });
  });
}

oMeths.ajaxSuperLogin = function(sMeth,req,res,oExec,oAuth,oPL) {
  var sErr = validateSuperUser(res,oAuth);
  if (sErr) {
    writeFAIL(res,sErr);
  } else {
    writeGOOD(res,'validateStore primed');
  }
}

oMeths.ajaxListApps = function(sMeth,req,res,oExec,oAuth,oPL) {
  var sApps = Object.keys(oDB.oApps);
  if (sApps.length == 0) {
    writeFAIL(res,'ListApps found no apps');
    return;
  }
  var oResult = [];
  for(var i=0,iMax=sApps.length; i<iMax; i+=1) {
    var oApp = oDB.oApps[sApps[i]];
    if (oOpt.bVerbose) log("Processing app "+oApp.name+" "+util.inspect(oApp));
    var sFiles = Object.keys(oApp.files);
    for(var j=0,jMax=sFiles.length; j<jMax; j+=1) {
      var oRec = oApp.files[sFiles[j]];
      if (oOpt.bVerbose) log("Processing "+util.inspect(oRec));
      if (oRec.type == '$user') {
        var oUser = oRec.obj;
        if (oUser.role && oUser.role.indexOf('admin') >= 0) {
          var oRet = {app:oApp.name,user:oRec.name};
          oResult.push(oRet);
        }
      }
    }
  }
  writeGOOD(res,'apps returned',oResult,"OK","found");
}

oMeths.ajaxAddAdminUser = function(sMeth,req,res,oExec,oAuth,oPL) {
  if (!oPL.User.match(/[a-zA-Z][a-zA-Z0-9\.]/)) {
    writeFAIL(res,'cannot add ill-formed userid '+oPL.User);
    return;
  }
  var sErr = validateSuperUser(res,oAuth);
  if (sErr) {
    writeFAIL(res,sErr);
  } else {
    if (!oDB.oApps[oPL.AppID]) {
      if (!oPL.AppID.match(/^[a-z][a-z0-9]+$/)) {
         writeFAIL(res,'cannot add ill-formed appid '+oPL.AppID);
      }
      makeDir(res,oPL.AppID,function(bOK) {
        if (bOK) {
          oDB.oApps[oPL.AppID] = deepCopy(oProtApp);
          oDB.oApps[oPL.AppID].name = oPL.AppID;
          addAdminUser();
        }
      });
    } else {
      addAdminUser();
    }
  }

  function addAdminUser() {
    var oApp = oDB.oApps[oPL.AppID];
    var sUserKey = '$user.'+oPL.User;
    if (oApp.files[sUserKey]) {
      writeFAIL(res,"App="+oPL.AppID+" user="+oPL.User+" already configured");
      return;
    }
    var oRec = deepCopy(oProtRec);
    oRec.type = '$user';
    oRec.name = oPL.User;
    oRec.path = oOpt.sTriDir+"/"+oPL.AppID+"/"+sUserKey+'.json.txt';
    oRec.obj  = {password:makePassword(oPL.NewPassword),role:'admin'};
    oRec.data = JSON.stringify(oRec.obj);
    oApp.files[sUserKey] = oRec;
    writeData(res,oRec,function(bOK) {
      if (bOK) {
         writeGOOD(res,'AddAdminUser OK');
      }
    });
  }
}

// This traverses the database at startup time.  It gives us the chance
// to handle file contention.
//
// Since this is used only during startup we cheat and use Sync modes.
//
function scanDB() {
  var sDir = oOpt.sTriDir;
  log("scanDB starting "+sDir);
  makeManglerStr();
  try {
    var sFiles = fs.readdirSync(sDir);
  } catch (e) {
    log("Needs priming");
    return;
  }
  for(var i=0,iMax=sFiles.length; i<iMax; i+=1) {
    var sFile = sFiles[i];
    var oR = sFile.match(/^([$][^\.]+)\.([a-zA-Z][a-zA-Z0-9\.]+)\.json\.txt$/);
    if (oR && oR[1] == '$super') {
      oDB.oSuper = loadUser(oR[1],sDir+"/"+sFile);
      oDB.oSuper.name = 'super-user';
      if (!oDB.oSuper.obj.mangle) throw new Error('SuperUser missing mangle string');
    } else {
      if (sFile.match(/^[a-z][a-z0-9]+$/)) {
        var oStat = fs.statSync(sDir + "/" + sFile);
        if (oStat.isDirectory()) {
          oDB.oApps[sFile] = deepCopy(oProtApp);
          var oApp = oDB.oApps[sFile];
          oApp.name = sFile;
          oApp.cts  = oStat.ctime.getTime();
          loadAppFiles(oApp,sDir + "/" + sFile);
        } else {
          log("superfluous dir file ignored "+sFile);
        }
      } else {
        log("ill-formed directory name ignored "+sFile);
      }
    }
  }
  log("scanDB completed ");
}

function loadAppFiles(oApp,sDir) {
  var sFiles = fs.readdirSync(sDir);
  for(var i=0,iMax=sFiles.length; i<iMax; i+=1) {
    var sFile = sFiles[i];
    var oR = sFile.match(/^([$][^\.]+)\.([a-zA-Z][a-zA-Z0-9-\.]+)\.json\.txt$/);
    var oStat = fs.statSync(sDir + "/" + sFile);
    if (oR && oR[1] == '$user') {
      var oUser = loadUser(oR[1],sDir+"/"+sFile);
      oUser.name = oR[2];
      oApp.files['$user.'+oUser.name] = oUser;
      oUser.cts = oStat.ctime.getTime();
      oUser.uts = oStat.mtime.getTime();
    } else if (oR && oR[1] == '$data') {
      var oRec = deepCopy(oProtRec);
      oRec.type = oR[1];
      oRec.path = sDir+"/"+sFile;
      oRec.name = oR[2];
      oRec.cts = oStat.ctime.getTime();
      oRec.uts = oStat.mtime.getTime();
      oApp.files['$data.'+oRec.name] = oRec;
      //var sStr = fs.readFileSync(oRec.path);
      //log("loading user "+sFile+" "+sStr);
      //oRec.obj = JSON.parse(sStr);
    } else {
      log("Superfluous app file ignored "+sFile+" in "+sDir);
    }
  }
}

function loadUser(sType,sFile) {
  var oRec = deepCopy(oProtRec);
  oRec.type = sType;
  oRec.path = sFile;
  var sStr = fs.readFileSync(sFile);
  if (oOpt.bVerbose) log("loading user "+sFile+" "+sStr);
  oRec.obj = JSON.parse(sStr);
  return oRec;
}


// Must be last,
log("starting tri-server");
oOpt = parms.parms(process.argv,oOpt,oParms);
if (!oOpt) {
  parms.parms(null,null,oParms);
  log("quitting due to errors");
  process.exit(4);
}
if (oOpt.bHelp) {
  parms.parms(null,null,oParms);
  return;
} else {
  process.chdir(oOpt.sTriBase);
  if (oOpt.bVerbose) {
    log("Base Page Dir: "+process.cwd());
    console.log("Run Options\r\n",oOpt);
  }
  main();
}
