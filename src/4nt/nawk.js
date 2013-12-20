
// Nodejs variant of Triangular WAKS utility

var fs     = require("fs");
var parms  = require('./parms');

var oOpt  = {}
var oReps = []
var sInFile = null;
var sOutFile = null;

var oParms = [
 // 0            1     2        3            4
 // OptSw        Mand  Parm     Value        Help meaning
  ['bHelp'    ,  ".",  "-h"     ,null        ,"Generate this Help Information that you are now reading"  ]
 ,['sIn'      ,  "m",  "-in"    ,"inpfile"   ,"Input File"                                               ]
 ,['sOut'     ,  "m",  "-out"   ,"outfile"   ,"Output File"                                              ]
 ,['sReps'    ,  "m",  "-rep"   ,"url"       ,"Replacements /find/rep[;!find2!rep2]"                     ]
 ,['bV'       ,  ".",  "-v"     ,null        ,"Verbose mode - show changes"                              ]
];


function main() {
  log("nawk.js running");
  loadInput();
  getReps();
  applyReps();
  writeOutput();
  log("nawk.js ending");
}

function loadInput() {
  sInFile = ""+fs.readFileSync(oOpt.sIn);
  if (oOpt.bV) log("File "+oOpt.sIn+" "+sInFile.length+" bytes");
}

function writeOutput() {
  fs.writeFileSync(oOpt.sOut,sOutFile);
  if (oOpt.bV) log("File "+oOpt.sOut+" "+sOutFile.length+" bytes");
}


function applyReps() {
  sOutFile = sInFile;
  for(var i=0,iMax=oReps.length; i<iMax; i+=1) {
    var oRep = oReps[i];
    var oRE = new RegExp(oRep.find,"g");
    sOutFile = sOutFile.replace(oRE,oRep.rep);
  }
}


function getReps() {
  var sReps = oOpt.sReps.split(";");
  for(var i=0,iMax=sReps.length; i<iMax; i+=1) {
    var sRep = sReps[i];
    var sParts = sRep.substring(1).split(sRep.charAt(0));
    if (sParts.length !== 2) {
      throw Error("Bad rep format "+sRep);
    }
    oReps.push({find:sParts[0],rep:sParts[1]});
    console.log("findObj %o",oReps[0]);
  }
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
  log("NAWK Parameters:");
  parms.parms(null,null,oParms);
  return;
} else {
  if (oOpt.bVerbose) {
    log("Base Page Dir: "+process.cwd());
    console.log("Run Options\r\n",oOpt);
  }
  main();
}





