var fs   = require("fs");
var http = require("http");
var https = require("https");
var oDocs = require("./../../war/js/docs-setup.js");

// globals
var sParm  = null;
var sDirIn  = null;
var sDirOut  = null;
var sTemplate  = null;
var sTempStr  = null;
var sAppTemp  = null; // appspage.html template
var sAppOut  = null;
var sAnchors = "";
var oAnchors = {};
var oPassed  = {};
// These have been checked manually and work but do not work within the botizer
oPassed["http://angularjs.org/"] = true;
oPassed["http://www.google.com/analytics/"] = true;
oPassed["http://www.oracle.com/technetwork/java/javase/downloads/java-se-jre-7-download-432155.html"] = true;
oPassed["http://localhost:8882/apps/MyApp.htm"] = true;
oPassed["http://localhost:8882/apps/tri/TriBoot.htm"] = true;
oPassed["https://cloud.google.com/products/app-engine"] = true;

log("botize.js running");


process.argv.forEach(function(sVal, index, array) {
  if (sVal.charAt(0) == '-') {
    sParm = sVal;
  } else {
    if (sParm == '-in') {
      sDirIn = sVal;
    } else if (sParm == '-out') {
      sDirOut = sVal;
    } else if (sParm == '-template') {
      sTemplate = sVal;
    } else if (sParm == '-app-out') {
      sAppOut = sVal;
    } else if (sParm == '-app-temp') {
      sAppTemp = sVal;
    } else if (index < 2) {
    } else {
      log("skipped "+sVal+" index="+index+" parm="+sParm);
    }
  }
});

console.log("in=%s out=%s template=%s",sDirIn,sDirOut,sTemplate);
console.log("appTemp=%s appOut=%s ",sAppTemp,sAppOut);
sTempStr = loadTemplate(sTemplate);

//    {
//      "section": "overview",
//      "id": "index",
//      "shortName": "Overview",
//      "type": "overview",
//      "keywords": "access actions adapted add address adds ajax algorithms angularjs app appealing application applications apply appname approach architecture attempted attempts authentication autheticated authorization bandwidth banking based basis began behaved behavoirs benefits best better boilerplate boost bright browser browsers bulk burden business cache candidates capabilities capability changed changes chore clicking client closely code codebase coding common compliant complicated component components conceived configures considerable consists constraints contents control copy create creating criteria cross-domain crud css current customization customized data database datastore deal debug debugging default deferred define defined definition definitions delete demonstration deps derives described design designed detailed detected detection developer difficult dirty display documentation domain drive driven drupal dynamic early easily easy edit effort efforts elements eliminating engine entire enumerated environment essentially expended exposed extended extending extensively extra fact factoring field file files filter filtered filtering flexibility flexible follow form format formats formulate forward friendly functionality google great guidelines handcrafted heard hello help high history hosted html html5 http idea implementation improvements improves inactivity industry infrastructure injection inside intent interconnected interfaces introduction javascript jooma joomla jquery js json jsps junior key knowledge language languages layers learn level limit limitation limited lines link list localstorage location logic login main maintain maintaining maintenance major management maximize meaning meant menu message methodoligies methodologies methodology methods millions mind minutes modern moves multiple node object opposed optionally order org overcomes overview parameters parser pass patterns performed persist persistance person php pleased populates post potential powerful practiced prevent problem processing productivity profile profiles programmers programming progress proponent provided providing ready realized record records reduced reduces reducing references relaxed remove render repeatedly report reporting reports required requirements requires requiring responsiveness restrictions retrieval retrofit reusable role roles running schema schemas scheme secondary secure security selected server servers service services set signed simple simplifying simultaneously single single-page software specfics special specific specifics splitting step straight strides subset substituted success summarize summarized support supports synchronization system table tables takes technologies templating thin thousands thwarting tied tool tri typical understood update updates usage user velocity views weaknesses web work working workload writing written years"
//   },

for(var i=0,iMax=NG_DOCS.pages.length; i<iMax; i+=1) {
  var oPage = NG_DOCS.pages[i];
  //log("Doing "+oPage.section+" "+oPage.shortName);
  //if (oPage.section != 'apps') continue;
  processPage(oPage.section,oPage.shortName,oPage.id,oPage.shortName);
}

writeAppsPage();

checkLinks();

return;

function writeAppsPage() {
  var sStr = loadTemplate(sAppTemp);
  var sStr1 = sStr.replace(/##anchors##/m,sAnchors);
  fs.writeFileSync(sAppOut,sStr1);
  log("Wrote "+sAppOut+" size="+sStr1.length);
}

function loadTemplate(sFile) {
  var sStr1 = ""+fs.readFileSync(sFile);
  //log("Template\r\n"+sStr1);
  return sStr1;
}

function processPage(sSect,sDesc,sFile,sPage) {
  sFile = sFile.replace(/:/g,'.');
  var sStr1 = ""+fs.readFileSync(sDirIn+"\\"+sSect+"\\"+sFile+".html");
  //log("Template\r\n"+sStr1);
  var sStr2 = fixPage(sStr1,sSect,sDesc,sFile,sPage);
  writeSeoPage(sSect,sDesc,sFile+".htm",sStr2,sPage);
}

function fixPage(sStr,sSect,sDesc,sFile,sPage) {
  sStr = sStr.replace(/href="([^"]+)"/gm,function(s,ss) {return 'href="'+fixStr(s,ss)+'"';});
  return sStr;
  function fixStr(sS,sStrs) {
    var s = sStrs;
    if ((s.substring(0,5) == 'http:') || (s.substring(0,6) == 'https:')) {
      registerLink(s,sSect,sDesc,sFile,sPage);
      return s;
    }
    if (s.charAt(0) == '#') { // local hashmark
      var nIX = sStr.indexOf('id="'+s.substring(1)+'"');
      if (nIX < 0) {
        //log("NOT Found "+s+" in "+sSect+"/"+sFile);
        registerLink(s,sSect,sDesc,sFile,sPage);
      }
      return s;
    }
    if (s.substring(0,8) == 'tri/img/') { // images
      var sLink = "/apps/"+s;
      registerLink(sLink,sSect,sDesc,sFile,sPage);
      return sLink;
    }
    if (s.indexOf(".css") > 0) { // css
      var sLink = "/apps/"+s;
      registerLink(sLink,sSect,sDesc,sFile,sPage);
      return sLink;
    }

    if (s.substring(0,7) == 'mailto:') { // mailing address - assume OK
      //registerLink(sLink,sSect,sDesc,sFile,sPage);
      return s;
    }
    var sSuf = ".htm";
    if (s.substring(1).indexOf("/") < 0) sSuf = "/index.htm";
    var nIX = s.indexOf("#");
    s = s.replace(/:/g,'.');
    if (nIX > 0) {
      s = s.substring(0,nIX)+sSuf+s.substring(nIX);
    } else {
      s += sSuf;
    }
    //console.log("fix "+sStrs+" --->  "+s+" "+sStr);
    var sLink = "/seo"+s;
    registerLink(sLink,sSect,sDesc,sFile,sPage);
    return sLink;
  }
}

function registerLink(sLink,sSect,sDesc,sFile,sPage) {
  if (!oAnchors[sLink]) oAnchors[sLink] = [];
  var oLink = {page:sPage,file:sFile,sect:sSect};
  oAnchors[sLink].push(oLink);
  return;
}

function writeSeoPage(sSect,sDesc,sFile,sStr,sPage) {
  var sTitle = 'Triangular: '+sSect.charAt(0).toUpperCase()+sSect.substring(1);
  if (sPage) sTitle += ' - '+sPage;
  var sStr1 = sTempStr.replace(/##title##/m,sTitle);
  var sStr1 = sStr1.replace(/##body##/m,sStr);
  var sPath = sDirOut + "\\"+sSect;
  //log("output "+sPath);
  if (!fs.existsSync(sPath)) {
    fs.mkdirSync(sPath);
  }
  fs.writeFileSync(sPath+'\\'+sFile,sStr1);
  log("Wrote sect="+sSect+" "+sFile+" size="+sStr.length);
  var sAnchor = '<a href="/seo/'+sSect+'/'+sFile+'">' + sTitle + "</a>";
  sAnchors += sAnchor + "<br>\r\n";
}

// It is easier for us to check the links than Google
function checkLinks() {
  var sKeys = Object.keys(oAnchors);
  log("Checking links num="+sKeys.length);
  checkLink(false,0,sKeys);
}

function checkLink(bHadErr,nNext,sKeys) {
  if (nNext < sKeys.length) {
    var sKey = sKeys[nNext];
    var oLinks = oAnchors[sKey];
    if (sKey.charAt(0) != '#') {
      bHadErr |= checkLinkWorks(bHadErr,sKey,oLinks,nNext,sKeys);
    } else {
      bHadErr |= checkHashWorks(bHadErr,sKey,oLinks,nNext,sKeys);
    }
  } else {
    log("botize.js ending Errors="+bHadErr);
    if (bHadErr) {
      process.exit(4);
    }
  }
  return bHadErr;
}

function checkHashWorks(bHadErr,sLink,oLinks,nNext,sKeys) {
  var oHashLink = oAnchors[sLink];
  if (oHashLink) {
    log("HASHTAG error "+sLink);
    logLinks(oLinks);
    bHadErr = true;
  }
  bHadErr |= checkLink(bHadErr,nNext+1,sKeys);
  return bHadErr;
}

function checkLinkWorks(bHadErr,sLink,oLinks,nNext,sKeys) {
  var options = {
    hostname: 'localhost',
    port: 8882,
    path: sLink,
    method: 'GET'
  };
  var sProt = "http";

  var oR = sLink.match(new RegExp("^(http://|https://)([^/]+)(.+)"));
  if (oR) {
    if (oPassed[sLink]) {
      return checkLink(bHadErr,nNext+1,sKeys);
    } else {
      //log("Special "+oR[1]+" "+oR[2]+" "+oR[3]);
      sProt = oR[1];
      options = {hostname:oR[2],path:oR[3]};
    }
  }

  if (sProt != 'http') {
    var req = https.request(options, handler);
  } else {
    var req = http.request(options, handler);
  }

  req.on('error', function(e) {
    console.log('ERROR: '+sProt+' request: ' + e.message);
    log("  link:"+sLink);
    logLinks(oLinks);
    bHadErr = true;
    checkLink(bHadErr,nNext+1,sKeys);
  });
  req.end();
  return bHadErr;

  function handler(res) {
    //console.log('STATUS: ' + res.statusCode);
    //console.log('HEADERS: ' + JSON.stringify(res.headers));
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      //console.log('BODY: ' + chunk.length);
    });
    res.on('end', function () {
      //console.log('END: seen');
      if (res.statusCode != 200) {
        log("FAILED "+ res.statusCode+" "+options.path);
        log("  link:"+sLink);
        logLinks(oLinks);
        bHadErr = true;
      }
      bHadErr |= checkLink(bHadErr,nNext+1,sKeys);
    });
  }
}

function logLinks(oLinks) {
  for(var i=0,iMax=oLinks.length; i<iMax; i+=1) {
    var oLink = oLinks[i];
    log("  "+(i+1)+" sect="+oLink.sect+" file="+oLink.file+"  page="+oLink.page);
  }
}

function deepCopy(oObj) {
  return JSON.parse(JSON.stringify(oObj));
}


function log(sMsg) {
  console.log(sMsg);
}
