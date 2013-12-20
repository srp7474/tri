/*
 @license
 Copyright (c) 2013 by Steve Pritchard of Rexcel Systems Inc.
 This file is made available under the terms of the Creative Commons Attribution-ShareAlike 3.0 license
 http://creativecommons.org/licenses/by-sa/3.0/.
 Contact: public.pritchard@gmail.com
*/

// ut.js - Utility functions for cita apps

var _log_sw = null;

function log(p0,p1,p2,p3,p4,p5,p6,p7,p8,p9) {
  if (_log_sw == null) {
    _log_sw = ('true' == localStorage['.log']);
  }
  p0 = "ut"+arguments.length+":"+p0;
  switch(arguments.length) { // console.log.apply did not work
    case  1: console.log(p0/*,p1,p2,p3,p4,p5,p6,p7,p8,p9*/); break;
    case  2: console.log(p0,p1/*,p2,p3,p4,p5,p6,p7,p8,p9*/); break;
    case  3: console.log(p0,p1,p2/*,p3,p4,p5,p6,p7,p8,p9*/); break;
    case  4: console.log(p0,p1,p2,p3/*,p4,p5,p6,p7,p8,p9*/); break;
    case  5: console.log(p0,p1,p2,p3,p4/*,p5,p6,p7,p8,p9*/); break;
    case  6: console.log(p0,p1,p2,p3,p4,p5/*,p6,p7,p8,p9*/); break;
    case  7: console.log(p0,p1,p2,p3,p4,p5,p6/*,p7,p8,p9*/); break;
    case  8: console.log(p0,p1,p2,p3,p4,p5,p6,p7/*,p8,p9*/); break;
    case  9: console.log(p0,p1,p2,p3,p4,p5,p6,p7,p8/*,p9*/); break;
    case 10: console.log(p0,p1,p2,p3,p4,p5,p6,p7,p8,p9/**/); break;
    default: console.log("bad count "+p0,p1,p2,p3,p4,p5,p6,p7,p8,p9); break;
  }
}

function loadStyleSheet(sSheet) {
  /*if (angular) {
    var sOld = angular.element(document).find('head').find('link').eq(1).attr('href');
    //angular.element(document).find('head').find('link').eq(1).attr('title','new-dynamic');
    log("Loaded associated stylesheet "+sSheet+" old="+sOld);
  }*/
  if(document.createStyleSheet) { //IE support
     document.createStyleSheet(sSheet+".css");
  } else {
    var newSheet=document.createElement('link');
    newSheet.setAttribute('rel','stylesheet');
    newSheet.setAttribute('type','text/css');
    newSheet.setAttribute('href',sSheet+".css");
    document.getElementsByTagName('head')[0].appendChild(newSheet);
  }

}

function isEnabled(evt) {
  log("isEnabled %o",evt);
  return true;
}

// obsolete - use improved log
/*function dumpObj(arr,level) {
  var dumped_text = "";
  if(!level) level = 0;
  var level_padding = "";
  for(var j=0;j<level+1;j++) level_padding += "  ";

  if(typeof(arr) == 'object') {
    for(var item in arr) {
      var value = arr[item];
      if(typeof(value) == 'object') {
        dumped_text += level_padding + "'" + item + "' ...\n";
        dumped_text += dumpObj(value,level+1);
      } else {
        dumped_text += level_padding + "'" + item + "' => \"" + value + "\"\n";
      }
    }
  } else {
    dumped_text = "===>"+arr+"<===("+typeof(arr)+")";
  }
  return dumped_text;
}*/

// obsolete - use improved log
/*function dumpObjLog(obj,sMsg) {
  if (sMsg) console.log("msg:"+sMsg);
  console.log("***dumpObjLog***\r\n"+dumpObj(obj));
}*/

function getNowString() {
  var sDate = new Date().toISOString();
  sDate = sDate.replace(/[TZ:-]/g,"");
  sDate = sDate.replace(/[.]/,"-");
  return sDate.substring(0,8)+"-"+sDate.substring(8);
}

var oDates = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Non","Dec"];
function getNowChar() {
  var sDate =  getNowString();
  return sDate.substring(6,8)+"-"+oDates[+(sDate.substring(4,6))]+"-"+sDate.substring(0,4);
}


function getNowYMD() {
  return getYMD(new Date());
}

function getYMD(oDate) {
  var sDate = oDate.toISOString();
  sDate = sDate.replace(/[TZ:-]/g,"");
  sDate = sDate.replace(/[.]/,"-");
  return sDate.substring(0,4)+'-'+sDate.substring(4,6)+'-'+sDate.substring(6,8);
}


function maxStr(sStr,nMax) {
  if (!sStr) return sStr;
  if (sStr.length > nMax) return sStr.substring(0,nMax)+"...";
  return sStr;
}


function escape_utf8(sData) {
  if (sData == '' || sData == null) return '';
  var sBuf = '';
  var bs = new Array();
  for(var i=0; i<sData.length; i++){
    var c = sData.charCodeAt(i);
    var c1 = sData.charAt(i);
    var nLen = 0;
    if (c < 0x80) {
      if ((c < 0x21) || (c1 == '+') || (c1 == '%') || (c1 == '?') || (c1 == '&')) {    // 1 byte special
        bs[0] = c;
        nLen  = 1;
      } else {                // 1 byte regular
        sBuf += c1;
      }
    } else if (c < 0x800) {   // 2 bytes
      bs[0] = 0xC0 | ((c & 0x7C0) >>> 6);
      bs[1] = 0x80 | (c & 0x3F);
      nLen = 2;
    } else if (c < 0x10000) { // 3 bytes
      bs[0] = 0xE0 | ((c & 0xF000) >>> 12);
      bs[1] = 0x80 | ((c & 0xFC0) >>> 6);
      bs[2] = 0x80 | (c & 0x3F);
      nLen = 3;
    } else {                  // 4 bytes
      bs[0] = 0xF0 | ((c & 0x1C0000) >>> 18);
      bs[1] = 0x80 | ((c & 0x3F000) >>> 12);
      bs[2] = 0x80 | ((c & 0xFC0) >>> 6);
      bs[3] = 0x80 | (c  & 0x3F);
      nLen = 4;
    }
    for(var j=0; j<nLen; j++){
      var b = bs[j];
      sBuf += '%';
      sBuf += asHex((b & 0xF0) >>> 4);
      sBuf += asHex(b &0x0F);
    }
  }
  return sBuf;
}

function asHex(nNib){
  var chars = '0123456789ABCDEF';
  return chars.charAt(nNib);
}

// Convert numbers to words
// copyright 25th July 2006, by Stephen Chapman http://javascript.about.com
// permission to use this Javascript on your web page is granted
// provided that all of the code (including this copyright notice) is
// used exactly as shown (you can change the numbering system if you wish)

// American Numbering System
var th = ['','thousand','million', 'billion','trillion'];
// uncomment this line for English Number System
// var th = ['','thousand','million', 'milliard','billion'];

var dg = ['zero','one','two','three','four', 'five','six','seven','eight','nine'];
var tn = ['ten','eleven','twelve','thirteen', 'fourteen','fifteen','sixteen', 'seventeen','eighteen','nineteen'];
var tw = ['twenty','thirty','forty','fifty', 'sixty','seventy','eighty','ninety'];
function toWords(s) {
  s = (+s).toFixed(2);
  s = s.toString();
  s = s.replace(/[\, ]/g,'');
  if (s != parseFloat(s)) return 'not a number';
  var x = s.indexOf('.');
  if (x == -1) x = s.length;
  if (x > 15) return 'too big';
  var n = s.split('');
  var str = '';
  var sk = 0;
  var sAnd = '';
  for (var i=0; i < x; i++) {
    if ((x-i)%3==2) {
      str += sAnd;
      sAnd = '';
      if (n[i] == '1') {
        str += tn[Number(n[i+1])] + ' ';
        i++;
        sk=1;
      } else if (n[i]!=0) {
        str += tw[n[i]-2] + ' ';
        sk=1;
      }
    } else if (n[i]!=0) {
      str += dg[n[i]] +' ';
      if ((x-i)%3==0) {
        str += 'hundred ';
        sAnd = ' and ';
      }
      sk=1;
    }
    if ((x-i)%3==1) {
      if (sk) str += th[(x-i-1)/3] + ' ';
      sk=0;
    }
  }
  if (x != s.length) {
    str += " and " + s.substring(x+1) + "/100";
  }
  if ((str.indexOf('thousand') > 0) && (str.indexOf('hundred') < 0)) {
    str = str.replace(/thousand/,'thousand and');
  }
  str = str.replace(/\s+/g,' ');
  str = str.replace(/and and/,'and');
  return str;
}

function removeObj(oObjs,oObj) {
  var oNew = [];
  for(var sVar in oObjs) {
    var oRec = oObjs[sVar];
    if (!(oRec === oObj)) oNew.push(oRec);
  }
  return oNew;
}

function fmt(sHtml) {
  var oStk = [];
  while(sHtml.length > 0) {
    var oR = sHtml.match(/^((<[^>]+>)|([^<]+))/);
    if (oR == null) return "match failed at "+sHtml;
    oStk.push(oR[1]);
    sHtml = sHtml.substring(oR[1].length);
  }
  return oStk.join("\r\n");
}

function getFuncName(oFunc) {
  if (typeof oFunc != 'function') throw "oFunc not a function";
  var sFunc = ""+oFunc;
  var oR = sFunc.match(/function\s([^(]+)/);
  if (oR == null) throw "goofed with "+sFunc;
  return oR[1];
}

