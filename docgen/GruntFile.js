
/*global module:false*/
module.exports = function (grunt) {

   // Project configuration.
  grunt.initConfig({
     pkg: grunt.file.readJSON('package.json')
    ,ngdocs: {
      options: {
         dest: 'docs'
        ,scripts: ['angular.js','/data/tri/war/apps/tri/ut.js','/data/tri/war/apps/tri/TRI.min.js']
        ,html5Mode: true
        ,startPage: '/overview'
        ,title: "Triangular: AngularJS Booster"
        ,navTemplate:'navTemplate.html'
        ,analytics: {
              account: 'UA-44929138-2',
              domainName: 'tri-demo.appspot.com'
        }
        ,discussions: {
              shortName: 'tri-demo',
              url: 'http://tri-demo.appspot.com',
              dev: false
        }
      }
      ,overview: {
        src: ['./overview/*.ngdoc'],
        title: 'Overview'
      }
      ,guide: {
        src: ['./guide/*.ngdoc'],
        title: 'Guide'
      }
      ,tutorial: {
        src: ['./tutorial/*.ngdoc'],
        title: 'Tutorial'
      }
      ,apps: {
        src: ['./apps/*.ngdoc'],
        title: 'Apps'
      }
      ,api: {
         src: ['../war/apps/tri/TRI.js', './api/*.ngdoc', '!../war/apps/tri/angular.*.js']
        ,title: 'API Ref:'
      }
      ,version: {
         src: []
        ,title: 'Version:'+getDateStamp()
      }
    }
  });

  grunt.loadNpmTasks('grunt-ngdocs');

  grunt.registerTask('default',['ngdocs']);

  function getDateStamp() {
    var sHex = '0123456789ABCDEF';
    //var sDate = new Date().toISOString();
    //sDate = sDate.replace(/[TZ:-]/g,"");
    //sDate = sDate.replace(/[.]/,"-");
    //return sDate.substring(8,10)+":"+sDate.substring(10,12)+":"+sDate.substring(12,14);
    var fs = require("fs");
    var sStr = ""+fs.readFileSync('./VerStr.txt');
    var sDate = new Date().toISOString();
    sDate = sDate.replace(/[TZ:-]/g,"");
    sDate = sDate.replace(/[.]/,"-");
    var sECID = sDate.substring(3,4) + (""+sHex.charAt(+(sDate.substring(4,6)))) + sDate.substring(6,8);
    sDate = sDate.replace(/[TZ:-]/g,"");
    // 0 2    7
    // 0.0000.0
    var sOldStr = sStr.trim();
    var sNewStr = sStr.substring(0,2) + sECID + ".0";
    if (sNewStr.substring(0,6) == sOldStr.substring(0,6)) {
      sNewStr = sNewStr.substring(0,6) + "." + (+(sOldStr.substring(7)) + 1);
    }
    console.log("getting timestamp "+sStr.trim()+" "+sDate+" "+sNewStr);
    fs.writeFileSync('./VerStr.txt',sNewStr+"\r\n");
    return sNewStr;
  }

};
