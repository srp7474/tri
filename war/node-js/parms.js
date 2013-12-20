/*
 @license
 Copyright (c) 2013 by Steve Pritchard of Rexcel Systems Inc.
 This file is made available under the terms of the Creative Commons Attribution-ShareAlike 3.0 license
 http://creativecommons.org/licenses/by-sa/3.0/.
 Contact: public.pritchard@gmail.com
*/

/*
 * This utility takes the oPaerms table and produces the oOpt settings for this run.
 *
 * If an error occurs it executes printHelp which a details what is expected.
 *
 * oParms consists of 5 columns:
 *
 *  0 - The oOpt name to set
 *  1 - Value 'm' for mandatory or '.' for optional (later 'p' for property vals)
 *  2 - The commands line string expected
 *  3 - A help value (oOpt is string) of null (oOpt is boolean)
 *  4 - Help description
 *
 *  This was derived froms Parms.java, a small utility developed by
 *  Steve Pritchard  of Rexcel Systems Inc
 *
 */


(function () {

  var parms = {};

  /* ------------------------ Sample Definitions ------------------
  var oOpt = {
     sType     : 'default.type'
    ,sName     : 'default.name'
  }

  var oParms = [
   // 0            1     2        3            4
   // OptSw        Mand  Parm     Value        Help meaning
    ['bHelp'    ,  ".",  "-h"     ,null        ,"Generate this Help Information that you are now reading"  ]
   ,['sFile'    ,  "m",  "-file"  ,"dir"       ,"Work Directory"                                           ]
   ...
   ,['bVerbose' ,  ".",  "-v"     ,null        ,"Verbose mode"                                             ]
   ,['bReplace' ,  ".",  "-r"     ,null        ,"Replace components. ***DANGEROUS***"                      ]
  ];
  */

  parms.parms = function(argv,oOpt,oParms,bHelp) {

    if (argv == null) return printHelp();

    var oMap = {};
    if (!oOpt) oOpt = {};
    for(var i=0,iMax=oParms.length; i<iMax; i+=1) {
      var oP = oParms[i];
      if (typeof oOpt[oP[0]] == 'undefined') { // assign default values
        if (oP[3]) {
          oOpt[oP[0]] = null;
        } else {
          oOpt[oP[0]] = false;
        }
      }
      oMap[oP[2]] = {mand:(oP[1] == "m"),val:(oP[3] != null),fld:oP[0]};
    }
    var nLoop = 2;
    while(nLoop < argv.length) {
      var oM = oMap[argv[nLoop]];
      if (!oM) return error(nLoop,"Not known "+argv[nLoop]);
      oM.had = true;
      if (oM.val) {
        if (nLoop+1 < argv.length) {
          nLoop += 1;
          oOpt[oM.fld] = argv[nLoop];
        } else {
          return error(nLoop,"argv exhausted for "+argv[nLoop]);
        }
      } else {
        oOpt[oM.fld] = true;
      }
      nLoop += 1;
    }

    var sKeys = Object.keys(oMap);
    var bErr = false;
    if (!oOpt.bHelp) for(var i=0,iMax=sKeys.length; i<iMax; i+=1) {
      var oM = oMap[sKeys[i]];
      if (oM.mand && !oM.had) {
        console.log("Parm "+sKeys[i]+" required and not specified");
        bErr = true;
      }
    }
    if (bErr) return null;
    return oOpt;

    function error(nLoop,sErr) {
      console.log("ParmError at parm "+nLoop+":"+sErr);
      return null;
    }

    function printHelp() {
      for(var i=0,iMax=oParms.length; i<iMax; i+=1) {
        var oP = oParms[i];
        var sStr = (oP[2] + " " + (oP[3]!=null?oP[3]:"")+"                    ").substring(0,20);
        sStr += oP[4];
        if (oP[1] == 'm') sStr += " (mandatory)";
        console.log(sStr);
      }
    }
  }

  if (typeof module !== 'undefined' && module.exports) { // Node.js export, other not supported
    module.exports = parms;
  }

}());
