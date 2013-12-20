node botize.js -in ..\..\war\partials -out ..\..\war\seo -template  ..\..\war\seo\seo-template.htm  -app-out ..\..\war\appspage.html  -app-temp ..\..\war\seo\seo-appspage.htm


if %errorlevel% == 0 node botize.js -in ..\..\war\partials -out ..\..\node\seo -template ..\..\node\seo\seo-template.htm -app-out ..\..\node\appspage.html -app-temp ..\..\node\seo\seo-appspage.htm

