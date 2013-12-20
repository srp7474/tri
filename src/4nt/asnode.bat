@echo off
rem Copies tri/war to node for deployment


copy /u /SE ..\..\war\css\*.*              ..\..\node\css
copy /u /SE ..\..\war\apps\*.*             ..\..\node\apps
copy /u /SE ..\..\war\css\*.*              ..\..\node\css
copy /u /SE ..\..\war\font\*.*             ..\..\node\font
copy /u /SE ..\..\war\grunt-scripts\*.*    ..\..\node\grunt-scripts
copy /u /SE ..\..\war\img\*.*              ..\..\node\img
copy /u /SE ..\..\war\js\*.*               ..\..\node\js
copy /u /SE ..\..\war\partials\*.*         ..\..\node\partials
copy /u /SE ..\..\war\TRI-DB\*.*           ..\..\node\TRI-DB

copy /u ..\..\war\email-addr.jpg           ..\..\node
copy /u ..\..\war\fav-docs0.ico            ..\..\node
copy /u ..\..\war\favicon.ico              ..\..\node
copy /u ..\..\war\robots.txt               ..\..\node
copy /u ..\..\war\SrcDisplay.html          ..\..\node
copy /u ..\..\war\tri-doc.ico              ..\..\node

copy ..\..\variants\index-node.html        ..\..\node\index.html


rem copy /u ..\..\war\apps\node-js\tri-server.js  ..\..\node\node-js

node nawk.js -in ..\..\war\node-js\tri-server.js -out ..\..\node\node-js\tri-server.js -rep /def-app.htm/appspage.html
copy /u ..\..\war\node-js\parms.js    ..\..\node\node-js


