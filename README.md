tri
===

#### Triangular Booster for Angular.js build components ####

This repo contains the tools (windows based) that are used to build the Triangular web sites
components for the [Google App Engine Variant](http://tri-demo.appspot.com) and [Node.js
Variant](http://tri-demo.nodejitsu.com) variants.

**NOTE** This differs from the actual zips that can be downloaded from these sites.  The
components in this repo are used to build those download zips and to build the documentation and
examples contained on those sites.

#### Directory Structure ####
```
bats        Bat files for command lines processes
data        data - mkdir if needed
debug       internal work area
docgen      Documentation source
icons       Icon source
java        CitaMethods.java.  Use site .jar files to rebuild
keep        Staged TRI.db
lib         java jar files
node        Staging area for node variant.  mkdir if needed
prod        Staging area for GAE variant.  mkdir if needed
src         more tools plus 4NT!! format .bat files
temp        staging area for zips. mkdir if required
variants    Files that change based on variant
war         Source area for sites.  See .gitignore for subfolders that are generated
            and might need mkdir
```
!! [See TCC/LE at jpsoft.com](http://jpsoft.com/)

**!data!tri.files.txt** This file contains a list of all files in the directory at the time of the
last backup.




#### Important .bats folder files ####

```
run-tri.bat run node.js tri-server
run-ws.bat  run node.js web-server for peek at docgen output
ugly.bat    Uglify TRI.js
waks.bat    waks.bat utility
```

#### Important .src/4nt folder files ####

```
waks-in/                Eliminated as contained confidential data
waks-rdy/               mask.js output
asnode.bat              create node.js site variant
botize.bat              create seo folder (Documentation search engines can see)
botize.js               pgm used by botize.bat
chqs.bat                mask chqs file
deps.bat                mask deps file
docs.bat                copy generated docs to site needed location
donors.bat              mask donors file
masker.js               pgm used to mask input files
mjar.bat                make jars needed
names.txt               names to use in masking operations
nawk.js                 quick and dirty node.js awk like utility
parms.js                early version of yapp (see github)
prod.bat                create GAE site and upload to GAE
seedrandom-master.zip   Used by masker
seedrandom.js           Used by masker
trizip.bat              WinZip batch mode to create site zips
trizipx.txt             file list for trizip (GAE variant)
trizipxn.txt            file list for trizip (Node.js variant)
```

