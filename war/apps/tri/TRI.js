/*
 @license
 Copyright (c) 2013 by Steve Pritchard of Rexcel Systems Inc.
 This file is made available under the terms of the Creative Commons Attribution-ShareAlike 3.0 license
 http://creativecommons.org/licenses/by-sa/3.0/.
 Contact: public.pritchard@gmail.com
*/

/* jshint laxcomma: true */
/* jshint eqnull: true */
/* jshint loopfunc: true */

// TRI.js - the heart of the Triangular system.

/**
 * @ngdoc overview
 * @name tri
 *
 * @description
 * The file TRI.js provides the complete code base for **Triangular**
 */

// Note servConfig is defined here but defined in AppsConfig.js
/**
 * @ngdoc service
 * @name tri.servConfig
 *
 * @description
 * Provides app customization that can be easily swapped in and out by changing just one file. It means that one set
 * of application code can be used in multiple sites.
 *
 * This is normally defined in {@link /guide/appsconfig AppsConfig.htm} and loaded by the {@link /guide/appname-html AppName.htm File}.
 *
 * Additional functions such as `getInfo` can be added following the same pattern.
 */
/**
 * @ngdoc
 * @name tri.servConfig#getInfo
 * @methodOf tri.servConfig
 *
 * @returns {Object} Application dependant information object
 *
 * @description
 * **Optional:** returns {Object} Application dependant information object
 */
/**
 * @ngdoc
 * @name tri.servConfig#getAutoFill
 * @methodOf tri.servConfig
 *
 * @returns {Object} null or `{guest:'username',password:'password'}`
 *
 * @description
 * **Optional:** Returns an object that is used to autofill the login page. A null return value or non-existant function will disable the autofill option.
 */
/**
 * @ngdoc
 * @name tri.servConfig#getSite
 * @methodOf tri.servConfig
 *
 * @returns {string} computed string
 *
 * @description
 * **Optional:** Returns the site prefix that can be displayed in the browser title
 */
/**
 * @ngdoc
 * @name tri.servConfig#getStartPage
 * @methodOf tri.servConfig
 *
 * @returns {string} computed string
 *
 * @description
 * **Required:** Returns the first page of the application to use when not specified on the URL.
 */
(function () {
   "use strict";
}());

//"use strict";
var oApp = angular.module('app',[],function($rootScopeProvider) {
  $rootScopeProvider.digestTtl(10); // can increase if wanted
  if (oGBL) {
    log("app module has been built templates="+(oGBL.templates?oGBL.templates.length:0));
  }
});

hookMsgListener();
//angular.bootstrap(angular.element(document).find('html'),["app"]);
/**
 * @ngdoc property
 * @name tri.property:oGBL
 *
 * @description
 * `oGBL` represents the single global variable used to make available global data and functions to all component types of the Triangular system.
 *
 * The standard values stored in `oGBL` include:
 *
 *  <span style='display:inline-block; width:100px; margin-left:10px;'>`msgHandler`</span>The {@link /api/tri.method:hookMsgListener Event Message Handler} handlers<br>
 *  <span style='display:inline-block; width:100px; margin-left:10px;'>`optTables`</span>The optional role based tables loaded in a selective fashion. See 'Admin.js'<br>
 *  <span style='display:inline-block; width:100px; margin-left:10px;'>`templates`</span>The templates loaded by {@link /api/tri.method:hookMsgListener hookMsgListener}
 * and used by the {@link /api/tri.directive:macro Macro} directive.
 *
 */
var oGBL = {msgHandler:{},optTables:[]};

/**
 * @ngdoc function
 * @name tri.method:hookMsgListener
 *
 * @description
 * This function is called during the initialzation of tri.js and performs several
 * housekeeping functions:
 *
 * * Builds a windows message event listener with processing routines for standard messages and
 *   the abilty to recognize and schedule custom message event handlers
 * * Using this message event handler it loads and caches the templates from 'AppsBase.htm'.
 * * Using this message event handler it loads and caches the templates in the custom .HTM files tagged in section "cust-templates"
 *
 * The messages are routed according to a prefix which is a string separated by a `:`.  The handler is expected to be in
 * `oGBL.msgHandler[sPref]` where `sPref` is the string before the `:`.
 *
 * If no prefix exists they are assumed to be system messages which are processed in the following manner.
 * <style type="text/css">
 *   code.srp1-label {display:inline-block; width:150px; margin-left:-150px;}
 *   span.srp1-propdef {display:inline-block; margin-left:150px;}
 * </style>
 *
 * <span class=srp1-propdef><code class=srp1-label>sys-close-page</code>The
 * {@link /guide/form-page-design Form Page} has closed.
 * </span>
 *  <br><br>
 * <span class=srp1-propdef><code class=srp1-label>sys-get-template</code>{@link /guide/form-page-design Form Page}
 *   requires a template. This message will be received in the primary page.
 *   Responds with `sys-put-template` which will be seen in secondary page. The message includes the requested template.
 * </span>
 * <br><br>
 * <span class=srp1-propdef><code class=srp1-label>sys-put-template</code>See in the secondary page.
 *   Stores the template sent into `$templateCache` where it is picked up by `ng-include` in "forms-panel.html" in `AppsBase.htm`.
 * </span>
 * <br><br>
 * <span class=srp1-propdef><code class=srp1-label>sys-templates</code>Obsolete code.
 *   Replaced `sys-get-template/sys-put-template` and by `ng-include` in "forms-panel.html" in `AppsBase.htm`.
 * </span>
 * <br><br>
 */
function hookMsgListener() {
  var oNoTmps = document.getElementById("body-no-templates");
  var sHtml = null;
  log("Hooked message listener app=%o notmps=%o",oApp,oNoTmps);
  window.addEventListener("message", function(event) {
    if ((""+event.origin) == 'http://disqus.com') return;
    log("messageEvent origin "+event.origin);
    log("messageEvent ",event);
    if (event.data.verb) {
      if (event.data.verb == "sys-templates") {
        log("have sys-templates "+event.data.payload.length,event.data);
        oGBL.templates = event.data.payload;
        var oCust = document.getElementById("cust-templates");
        if (oCust) {
          var oPREs = angular.element(oCust).find('pre');
          log("  children %o find %o",angular.element(oCust),angular.element(oCust).find('pre'));
          var oTMPs = oGBL.templates; //suffix custom templates
          for(var i=0,iMax=oPREs.length; i < iMax; i+=1) {
            var oPRE = oPREs.eq(i);
            if (!oPRE.hasClass('template')) continue;
            var sID = oPRE.attr('id');
            sHtml= oPRE.html();
            var oTMP = {id:sID,html:sHtml};
            oTMPs.push(oTMP);
          }
        }
        log("Issue Angular bootstrap");
        angular.bootstrap(angular.element(document).find('body'),["app"]);
        return;
      } else if (event.data.verb == "sys-close-page") {
        event.source.close();
      } else if (event.data.verb == "sys-get-template") {
        sHtml = oGBL.$templateCache.get(event.data.payload.name);
        var oPL = event.data.payload;
        var oMsg = {verb:'sys-put-template',payload:{name:oPL.name,html:sHtml,id:oPL.id}};
        event.source.postMessage(oMsg,"*");
      } else if (event.data.verb == "sys-put-template") {
        tri.postTemplate(event);
      } else {
        var sPref = event.data.verb.match(/^([^:]+)/)[1];
        if (oGBL.msgHandler[sPref]) {
          oGBL.msgHandler[sPref](event);
        } else {
          log("spurious sys: messageEvent verb=%s pref=%s evt=%o",event.data.verb,sPref,event);
        }
      }
    } else {
      log("tri.js spurious messageEvent ",event);
    }
  }, false);
}

// ---------------------------------------------------------------------------
// -------------------------------- Objects ----------------------------------
// ---------------------------------------------------------------------------

//---------------------------------- Col -------------------------------------
/**
 * @ngdoc object
 * @name tri.object.Col
 *
 * @description
 * Provides an object rendition of the {@link /guide/table Static Col} defined in the `Table` object
 * defined in the Javascript file.
 *
 * Referred to in this documentation as the dynamic instance of the `Col` object.
 *
 * The public methods attached to the `Col` object and described herein are
 * accessible from the HTML code assuming a `Col` object is available.
 *
 */
/**
 * @ngdoc constructor
 *
 * @name tri.object.Col#Col
 * @methodOf tri.object.Col
 * @param {Object} props Properties array used to define the column in static object.
 * @description
 * Constructor of the the `Col` object. Performs the following functions:
 *
 * * classifies the `Col` type into 'virt' (col property points to a function) or 'field'
 * * assigns a `cid` property that makes the each column unique in the entire system across
 * all Tables.
 * * Builds a column map table based on the `cid`
 *
 *
 */
function Col(props) {
  for(var i in props) {
    this[i] = props[i];
  }
  if (!this.type) { //classify untyped
    if (typeof this.col == 'function') {
      this.type = 'virt';
    } else {
      this.type = 'field';
    }
  }
  //log("New Col "+this.getTitle());
  Col.nNextCid += 1;
  this.cid = Col.nNextCid;
  Col.oCidMap[this.cid] = this;
}

// ---------------- Static Methods
Col.nNextCid = 0;
Col.oCidMap = {};
Col.getCol = function(cid) {return Col.oCidMap[cid];};

Col.asObjects = function(oCols) {
  if (oCols[0].cid) return oCols; // already transformed
  //log("transform col objects "+oCols[0].title);
  var oNew = [];
  for(var i = 0; i < oCols.length; i += 1) {
    oNew[i] = new Col(oCols[i]);
    if (oNew[i].schema) oNew[i].schema.cols = Col.asObjects(oNew[i].schema.cols);
    //log("  col "+i+" type "+oNew[i].type+" "+oNew[i].getTitle());
  }
  return oNew;
};

// --------------- Public Methods
Col.prototype = (function() {
  return {
     constructor    : Col
    ,getTitle       : getTitle
    ,getField       : getField
    ,getID          : getID
    ,select         : select
    ,getValue       : getValue
    ,getActions     : getActions
    ,getListHint    : getListHint
    ,getHint        : getHint
    ,getPlace       : getPlace
    ,action         : action
  };

  // --------------------------- implementations -----------------------------
/**
 * @ngdoc
 *
 * @name tri.object.Col#getTitle
 * @methodOf tri.object.Col
 * @description
 * Returns the `Col` title
 * @returns {string} `Col` name used for public display
 *
 */
  function getTitle() {
    if (this.title) return this.title;
    return ""+this.col;
  }

/**
 * @ngdoc
 *
 * @name tri.object.Col#getField
 * @methodOf tri.object.Col
 * @description
 * Returns field name in table column is related to. For type = 'virt'
 * the constant '_field_' is returned.
 * @returns {string} related field name
 *
 */
  function getField() {
    if (this.field) return this.field;
    if (this.type != 'virt') return this.col;
    return "_field_";
  }


/**
 * @ngdoc
 *
 * @name tri.object.Col#getHint
 * @methodOf tri.object.Col
 * @description
 * Returns the hint field that is added to {@link /api/tri.controller:ctrlCommEdit Standard Editor} input fields as a 'title=' string.
 * If `hint` in the column definition is a function it is called with the signature `this.hint(scope,this)`. Otherwise the string value is returned.
 * @returns {string} computed hint.
 *
 */
  function getHint(scope) {
    if (!this.hint) return '';
    if (typeof this.hint == 'function') {
      return this.hint(scope,this);
    } else {
      return ''+this.hint;
    }
  }

/**
 * @ngdoc
 *
 * @name tri.object.Col#getListHint
 * @methodOf tri.object.Col
 * @description
 * Returns the hint field that is added to the list columns of the {@link /api/tri.controller:ctrlCommList Lister}.
 * The field is assumed to be a function  which is called with signature `this.listHint(scope,oObj,this)` where
 * `oObj` is the row being displayed.
 * @returns {string} computed hint.
 *
 */
  function getListHint(scope,oObj) {
    if (!this.listHint) return '';
    return this.listHint(scope,oObj,this); // only makes sense to be a function
  }

/**
 * @ngdoc
 *
 * @name tri.object.Col#getPlace
 * @methodOf tri.object.Col
 * @description
 * Returns the place-holder field that is added to {@link /api/tri.controller:ctrlCommEdit Standard Editor} input fields as a 'placeHolder=' string.
 * If `place` in the column definition is a function it is called with the signature `this.place(scope,this)`. Otherwise the string value is returned.
 * @returns {string} computed place-holder.
 *
 */
  function getPlace(scope) {
    if (!this.place) return '';
    if (typeof this.place == 'function') {
      return this.place(scope,this);
    } else {
      return ''+this.place;
    }
  }

/**
 * @ngdoc
 *
 * @name tri.object.Col#getID
 * @methodOf tri.object.Col
 * @description
 * Returns the `getTitle` value with blanks replaced by '-'.  Used in the HTML
 * templates to create element IDs based on the column name that can be refenced in the CSS.
 * @returns {string} title modified
 *
 */
  function getID() {
    return (""+getTitle.call(this)).replace(/ /,'-');
  }

/**
 * @ngdoc
 *
 * @name tri.object.Col#getActions
 * @methodOf tri.object.Col
 * @description
 * Builds an array of Action objects from a `Col` whose type is 'actions'. The
 * following algorithm is used to build the array.
 *
 * * returns an empty array if the type is not 'actions'
 * * Adds defualt `editRecord` and `dropRecord` actions unless the
 * `Col` addDefault property is false
 * * hooks the `methClass`, `method`, `click`, `whatClass` function pointers into the $scope.
 *
 * @param {scope} $scope of HTML caller
 * @param {Object} oObj obsolete. not referenced.
 * @returns {Object[]} array of Action objects
 *
 */
  function getActions(scope,oObj) {
    var i, iMax;
    if (this.type != 'actions') return [];
    if (!this.oActs) {
      this.oActs = [];
      if (!this.actions || this.addDefault) {
        this.oActs = [{label:'edit',click:'editRecord(oRow.oaa)',title:''}
                     ,{label:'drop',click:'dropRecord(oRow.oaa)',title:''}
                     ];
      }
      if (this.actions) {
        var oProf = scope.oServSess.getProfile();
        log("add custom actions prof=%o actions=%o",oProf,this.actions);
        if (oProf) for(i=0,iMax=this.actions.length; i<iMax; i+=1) {
          var oAct = this.actions[i];
          if (oAct.role) {
            if (oProf.role && (oProf.role.indexOf(oAct.role) >= 0)) this.oActs.push(oAct);
          } else {
            this.oActs.push(oAct);
          }
        }
      }
      log("oActs length %o"+this.oActs.length,{array:this.oActs});
    }
    for(i=0,iMax=this.oActs.length; i<iMax; i+=1) {
      var oA = this.oActs[i];
      if (oA.method) {
        scope[getFuncName(oA.method)] = oA.method;
        //log("hooked "+getFuncName(oA.method)+" to "+oA.method);
      }
      if (oA.methClass) {
        scope[getFuncName(oA.methClass)] = oA.methClass;
        //log("hooked methClass "+getFuncName(oA.methClass)+" to "+oA.methClass);
      }
      if (oA.click) scopeAddMethod(scope,oA.click);
      if (oA.whatClass) scopeAddMethod(scope,oA.whatClass);
    }
    return this.oActs;
  }

  function scopeAddMethod(scope,sMeth) {
    if (!this) return;
    var oR = sMeth.match(/^([^(]+)/);
    if (oR) {
      if (typeof this[oR[1]] == 'function') {
        scope[oR[1]] = this[oR[1]];
      }
    }
  }

/*
 * obsolete
 */
  function action(scope,oMeth,oObj) {
    log("action called "+oMeth);
  }

/**
 * @ngdoc
 *
 * @name tri.object.Col#select
 * @methodOf tri.object.Col
 * @description
 * Extends the supplied array of `Col` objects with this `Col` if it matches
 * the sType parameter which can have the following values:
 *
 * * '=list' - matches columns of type not 'list' and whose 'showList' value returns true.
 * * '=edit' - matches columns of type 'virt', 'action', 'list' and 'actions'
 * and whose default 'showEdit' value returns true else those whose specified showEdit value returns 'true'
 * * '=cust' - matches columns of type '=cust' or whose specified 'showCust' value returns true.
 * * null - matches all columns
 *
 * @param {Object} scope caller scope
 * @param {Object[]} oCols array of `Col` objects to extend
 * @param {string} sType to match against `Col` type.  sType = null matches all.
 *
 */
  function select(scope,oCols,sType) {
    if (sType == null) {
      oCols.push(this);
    } else if (sType == '=edit') {
      //log("selecting "+this.title+" "+this.type);
      if ((this.type == 'virt') || (this.type == 'action') || (this.type == 'list') || (this.type == 'actions')) {
        if (showEdit(this,false)) oCols.push(this);
      } else {
        if (showEdit(this,true)) {
          oCols.push(this);
        }
      }
    } else if (sType == '=list') {
      if (this.type != 'list') {
        if (!('showList' in this) || (this.showList)) {
          oCols.push(this);
        }
      }
    } else if (sType == '=cust') {
      if (('showCust' in this) && (this.showCust)) oCols.push(this);
    } else {
      if (sType == this.type) oCols.push(this);
    }

    function showEdit(oCol,bDef) {
      if (!('showEdit' in oCol)) return bDef;
      if (!oCol.showEdit) return false;
      if (typeof oCol.showEdit == 'function') return oCol.showEdit(scope,scope.oObj);
      return true;
    }
  }

/**
 * @ngdoc
 *
 * @name tri.object.Col#getValue
 * @methodOf tri.object.Col
 * @description
 * Returns the value of oObj for the `Col`.  Invokes any necessary functions
 * to calculate the value. If the `nMax` field is present the computed string
 * is checked that is does not exceed that length.  If it does it is shortened and
 * the string `...` added such that the string's length equals the `nMax` field.
 * @param {Object} scope The present scope
 * @param {Object} oObj the data object to extract the `Col` from.
 * @param {number} nMax optional max string length returned
 * @returns {string} the computed value
 *
 */
  function getValue(scope,oObj,nMax) {
    if (!oObj) return null;
    try {
      var sVal = '';
      if (typeof this.col == 'function') {
        sVal = this.col(oObj,scope,this);
        } else {
        //if ('oneOf' in oCol) return mapValue(oObj,oCol);
        if (this.type == 'method') {
          return "<a href=''>method</a>"; // not used
        }
        sVal = ""+oObj[this.col];
      }
      if (angular.isNumber(nMax)) {
        if (sVal.length > nMax) {
          sVal = sVal.substring(0,nMax - 4) + " ...";
        }
      }
      return sVal;
    } catch (e) {
      log("getValue failed "+e+" col=%o obj=%o scope=%o",this,oObj,scope);
    }
  }

}()); // end Col prototype


//--------------------------------- Table ------------------------------------
/**
 * @ngdoc object
 * @name tri.object.Table
 *
 * @description
 * Provides an object rendition of the {@link /guide/table Static Table} object
 * defined in the Javascript file.
 *
 * Referred to in this documentation as the dynamic instance of the `Table` object.
 *
 * The public methods attached to the `Table` object and described herein are
 * accessible form the HTML code assuming a `Table` object is available.
 *
 */
/**
 * @ngdoc constructor
 *
 * @name tri.object.Table#Table
 * @methodOf tri.object.Table
 * @param {Object} props Properties array. Equivalent to oTabProps in static object.
 * @param {Object} $scope under which table is connected
 * @param {Object} servCRUD object pointer.  Needed to prevent circular references.
 * @description
 * Constructor of the the `Table` object. Performs the following functions:
 *
 * * The oTabProps are copied to props
 * * Filters are migrated and a Limit 50 is added if Limit is not specfied
 * * Dynamic {@link /api/tri.object.Col Col} objects are also created.
 *
 */
function Table(props,scope,oCRUD) {
  var i, iMax;
  for(i in props) {
    //log("migrate "+i);
    this[i] = props[i];
  }
  this.props = this.getTabProp();                // migrate properties
  this.props.oCRUD = oCRUD;
  if(!this.props.oSel) this.props.oSel = {};     // Work field for filters
  this.scope = scope || null;
  if (this.scope) {
    this.scope.oSel = this.props.oSel;           // Set up ptr in scope for faster angular access
    log("oSel ptr established "+this.scope.$id,this.props.oSel);
  }
  if (!this.props.bMigrated) {
    //log(">>>>>>>>>Objectize "+this.props.recTitle);
    this.props.bMigrated = true;
    this.props.cols = Col.asObjects(this.props.cols);
    // inject inject limit filter
    if (!this.props.filters) this.props.filters = [];
    if ((this.props.filters.length === 0) || (this.props.filters[0].type != 'limit')) {
      this.props.filters.unshift({type:'limit',init:50,title:'Limit',name:'_limit'});
    }
    for(i=0,iMax=this.props.filters.length; i<iMax; i+=1) {
      this.props.filters[i] = new Filter(this.props.filters[i]).normalize(this);
    }
  }
}

// --------------- Public Methods
Table.prototype = (function() {
  return {
     constructor    : Table
    ,getTitle       : getTitle
    ,toString       : toString
    ,getFilters     : getFilters
    ,getObjs        : getObjs
    ,getSelObjs     : getSelObjs
    ,findCol        : findCol
    ,getTableCols   : getTableCols
    ,getEditActions : getEditActions
    ,getOptActions  : getOptActions
  };

  // --------------------------- implementations -----------------------------
/**
 * @ngdoc
 *
 * @name tri.object.Table#getTitle
 * @methodOf tri.object.Table
 * @description
 * Returns the recTitle value
 * @returns {string} recTitle
 *
 */
  function getTitle() {
    if (this.props.recTitle) return this.props.recTitle;
    return "?table?";
  }

/**
 * @ngdoc
 *
 * @name tri.object.Table#getFilters
 * @methodOf tri.object.Table
 * @description
 * Builds an array of Filters that match sType
 * @param {string} sType The filter type to match. Null means all filters.
 * @returns {Object[]} array of Filters objects
 *
 */
  function getFilters(sType) {
    //log("getFilters "+sType+" "+this.props.recTitle);
    var oFils = [];
    if (!this.props.selector || !this.props.selector._filters) return oFils;
    for(var i in this.props.selector._filters) {
      var oFil = this.props.selector._filters[i];
      if ((!sType) || (oFil.type == sType)) {
        oFils.push(oFil);
        //log("  use filter "+i+" type="+oFil.type+" "+oFil.field);
      }
    }
    //log("getFilters "+sType+" "+this.props.selector._filters.length+" ret="+oFils.length);
    return oFils;
  }
/**
 * @ngdoc
 *
 * @name tri.object.Table#getOptActions
 * @methodOf tri.object.Table
 * @description
 * Returns an array of optional actions specified in the props object.
 * @param {Object} $scope Scope under which call is made. The pointer to the click function
 * and whatClass function will be added to the scope.
 * @returns {Object[]} array of Action objects
 *
 */
  function getOptActions(scope) {
    if (!this.props.optActions) return [];
    log("get OptActions %o"+this.props.recTitle,this.props.optActions);
    return hookOptActions(this,this.props.optActions,scope);
  }

  function hookOptActions(oThis,oActs,scope) {
    for(var i=0,iMax=oActs.length; i<iMax; i+=1) {
      var oA = oActs[i];
      if (oA.click)     scopeAddMethod(oThis,scope,oA.click);
      if (oA.whatClass) scopeAddMethod(oThis,scope,oA.whatClass);
    }
    return oActs;
  }

  function scopeAddMethod(oThis,scope,sMeth) {
    log("Hooking "+sMeth+" to "+scope.$id+" this=%o",oThis);
    var oR = sMeth.match(/^([^(]+)/);
    if (oR) {
      if (typeof oThis[oR[1]] == 'function') {
        scope[oR[1]] = oThis[oR[1]];
      }
    }
  }


/**
 * @ngdoc
 *
 * @name tri.object.Table#getEditActions
 * @methodOf tri.object.Table
 * @description
 * Returns an array of custom actions pertaining to the Edit operation on a data object in the table.
 * @param {Object} $scope Scope under which call is made. The pointer to the click function
 * and whatClass function will be added to the scope.
 * @param {Object} oObj The object beding edited.
 * @returns {Object[]} array of Action objects
 *
 */
  function getEditActions(scope,oObj) {
    //  ,editActions       : [{click:'changeCurrency($event)',text:'Change to $CND'}]
    if (!this.props.editActions) return [];
    if (this.props.editActions.oActs && (this.props.editActions.oEditObj == oObj)) return this.props.editActions.oActs;
    this.props.editActions.oActs = [];
    this.props.editActions.oEditObj = oObj;
    for(var i=0,iMax=this.props.editActions.length; i<iMax; i+=1) {
      var oDef = this.props.editActions[i];
      var oA = {click:getFuncName(oDef.click)+"(this,oObj,$event)"};
      scope[getFuncName(oDef.click)] = oDef.click;
      if (typeof oDef.text == 'function') {
        oA.text = oDef.text(scope,oObj);// never tested functionality
      } else {
        oA.text = oDef.text;
      }
      this.props.editActions.oActs.push(oA);
    }
    return this.props.editActions.oActs;
  }

/**
 * @ngdoc
 *
 * @name tri.object.Table#getObjs
 * @methodOf tri.object.Table
 * @description
 * Returns an array of all the data objects for the Table.
 * @returns {Object[]} array of data objects
 *
 */
  function getObjs() {
    var oTP = this.props;
    return oTP.oCRUD.getObjs(oTP);
  }

/**
 * @ngdoc
 *
 * @name tri.object.Table#getSelObjs
 * @methodOf tri.object.Table
 * @description
 * Reduces the entire sorted set by the filter logic.  The results are cached because this function is called many times during a $digest
 * operation. Changes to the Filters or data contents of the `Table` automatically cleanse the cache.
 * @returns {Object[]} array of data objects
 *
 */
  function getSelObjs() {
    var oTP = this.props;
    var oObjs = oTP.oCRUD.getObjs(oTP);
    var oData = this.props.oSel; // User supplied data
    oData._objs = oObjs.length;
    if (angular.equals(this.props.oPrevSel,oData)) {
      //log("Select "+oTP.recTitle+" objects max="+oObjs.length+" fastExit="+this.props.oPrevSelObjs.length);
      return this.props.oPrevSelObjs;
    }
    this.props.oPrevSel = angular.copy(oData);
    log("Select "+oTP.recTitle+" objects max="+oObjs.length+" filters="+oTP.filters.length+" data=%o objs=%o",oData,{array:oObjs});
    if (!oData) return oObjs;
    for(var i in oTP.filters) {
      var oFil = oTP.filters[i];
      if (oFil.type == "mask") oObjs  = maskReduce.call(this,oObjs,oData,oFil);
      if (oFil.type == "state") oObjs = stateReduce.call(this,oObjs,oData,oFil);
      if (oFil.methCust) {
        var oMeth = oFil.methCust;
        oObjs  = oMeth(this,oObjs,oData,oFil);
      }
    }
    if ('_limit' in oData) {
      if (oObjs.length > oData._limit) oObjs = oObjs.slice(0,oData._limit);
    }
    log("  selected %i objs=%o",oObjs.length,{array:oObjs});
    this.props.oPrevSelObjs = oObjs;
    return oObjs;
  }

/**
 * @ngdoc
 *
 * @name tri.object.Table#findCol
 * @methodOf tri.object.Table
 * @description
 * Returns a {@link /api/tri.object.Col Col} whose col matches sCol
 * @param {Object} sCol The column name to match
 * @returns {Object} {@link /api/tri.object.Col Col} object
 *
 */
  function findCol(sCol) {
    var oTP = this.props;
    for(var i in oTP.cols) {
      var oCol = oTP.cols[i];
      if (oCol.col === sCol) return oCol;
    }
    return null;
  }

/**
 * @ngdoc
 *
 * @name tri.object.Table#findCol
 * @methodOf tri.object.Table
 * @description
 * Returns a {@link /api/tri.object.Col Col} array whose col type sType
 * @param {Object} sType The column type to match
 * @returns {Object[]} {@link /api/tri.object.Col Col} object array
 *
 */
  function getTableCols(sType) {
    var oTP = this.props;
    if (!oTP) return [];
    if (!oTP.cols) return [];
    return iterateCols.call(this,this.scope,oTP.cols,sType);
  }

  // ------------------------- local private functions -----------------------
  // These functions should be accessed with the Javascript call method so that
  // 'this' can be passed in.

  function maskReduce(oObjs,oData,oFil) {
    var oCol = findCol.call(this,oFil.field);
    if (oCol == null) return oObjs;
    var sMask = oData[oFil.field];
    if (!sMask || (""+sMask.trim() === '')) return oObjs;
    //log("maskReduce "+oCol.title+" "+sMask);
    var oMask = new RegExp(sMask,"i");
    var oNewObjs = [];
    for(var i in oObjs) {
      var oRec = oObjs[i];
      var sFld = oCol.getValue(null,oRec);
      if ((""+sFld).match(oMask) != null) {
        oNewObjs.push(oRec);
      }
    }
    return oNewObjs;
  }

  function stateReduce(oObjs,oData,oFil) {
    var oCol = findCol.call(this,oFil.field);
    if (!oData[oFil.field]) return oObjs;
    var oStat = oData[oFil.field].status;
    if (!oStat) {
      log("no status field");
      return oObjs;
    }
    if (oStat.open) return [];
    //log("status "+oStat.mode+" "+oStat.list.length+" "+oFil.field+" col="+oCol.col);
    if (oStat.list.length === 0) return oObjs;
    var oNewObjs = [];
    var oMap = {};
    for(var j in oStat.list) {
      var sVal = oStat.list[j];
      var sOptVal = oStat.tri[0].options[sVal].value;
      //log("status optval="+sOptVal+" val="+sVal+" j="+j);
      oMap[sOptVal] = true;
    }
    for(var i in oObjs) {
      var oRec = oObjs[i];
      var sFld = oRec[oFil.field];
      //log("Test "+sFld+" "+oRec.tag+" "+oRec.oaa);
      if (oStat.mode == 'INCL') {
        if (oMap[sFld]) oNewObjs.push(oRec);
      } else {
        if (!oMap[sFld]) oNewObjs.push(oRec);
      }
    }
    return oNewObjs;
  }

  function iterateCols(scope,oColDefns,sType) {
    var oCols = [];
    for(var i in oColDefns) {
      var oCol = oColDefns[i];
      oCol.select(scope,oCols,sType);
    }
    return oCols;
  }


}()); // end Table prototype


//-------------------------------- Filter ------------------------------------
/**
 * @ngdoc object
 * @name tri.object.Filter
 *
 * @description
 * Provides an object rendition of the {@link /guide/table Static Filter} defined in the `Table` object
 * defined in the Javascript file.
 *
 * Referred to in this documentation as the dynamic instance of the `Filter` object.
 *
 * The public methods attached to the `Filter` object and described herein are
 * accessible from the HTML code assuming a `Filter` object is available.
 *
 * **Note** The `Filter` object uses a variable `oSel` which is placed in the
 * {@link /api/tri.controller:ctrlCommList Lister} scope and saved in the related `Table` at appropriate times
 * as `Table` context is changed.  In this way the mask settings can be preserved across `Table` switches.
 *
 */
/**
 * @ngdoc constructor
 *
 * @name tri.object.Filter#Filter
 * @methodOf tri.object.Filter
 * @param {Object} props Properties array used to define the filter in static object.
 * @description
 * Constructor of the the `Filter` object. Performs the following functions:
 *
 * * copies the properties from the static object
 *
 * <br>
 * The `normalize` function should subsequently be called to establish other values
 *
 */
function Filter(props) {
  for(var i in props) {
    this[i] = props[i];
  }
}

// --------------- Public Methods
Filter.prototype = (function() {
  return {
     constructor  : Filter
    ,normalize    : normalize
  };

/**
 * @ngdoc
 *
 * @name tri.object.Filter#normalize
 * @methodOf tri.object.Filter
 * @param {Object} oTab `Table` in which `Filter` resides
 * @description
 * Normalizes the `Filter` object by perfroming the following functions:
 *
 * * Sets the `col` value by finding the related `Col` value
 * * determines the `title` value
 * * determines the `init` value
 *
 *
 */
  function normalize(oTab) {
    try {
      if (this.type == 'mask') {
        this.col = oTab.findCol(this.field);
        if (!this.col) {
          this.title = "?"+this.field;
        } else {
          this.title = this.col.getTitle();
        }
      }
      if (this.init) oTab.props.oSel[this.name] = this.init;
      log("---- normalize "+oTab.props.recTitle+" "+this.type+" name="+this.name+" fld="+this.field+" col="+this.col+" title="+this.title+" init="+this.init);
    } catch(e) {
      log("filter trap "+e,this);
    }
    return this;
  }

}()); // end Filter prototype


// ---------------------------------------------------------------------------
// --------------------------- Directives ------------------------------------
// ---------------------------------------------------------------------------

/**
 * @ngdoc directive
 * @name tri.directive:autocomplete
 *
 * @description
 * Uses a related table field to provide a list of matching entries
 * based on partial input.
 * The `switch-name` is a boolean that determines whether the list of partial matches should be shown.
 * The subsequent `<div>` displays the selected objects that match the partial input.
 * When one is clicked the the `click-function` populates the related input field.
 * The `repeat-expr` returns the list of selected objects.
 * The optional `next='expr' names a function that focuses on the next DOM element when the input is complete.
 *
 * @usage
 * <input autocomplete="switch-name">
 * <div ng-show='switch-name'>
     <div class=supplier ng-repeat='oObj in repeat-expr' ng-click='click-func(oObj)'>
       <span style='display:inline-block; width:100px;'>{{oObj.fld1}}</span>{{oObj.fld2}}
     </div>
   </div>
 * @example
    <doc:example>
      <doc:source>
       <script>
         function Ctrl($scope) {
           $scope.bShowSups = true;
           $scope.oObj = {payee:'no-payee'};
           $scope.oSups = [{name:'IBM',where:'New York'}
                    ,{name:'Xerox',where:'California'}
                    ,{name:'Google',where:'California'}
                    ,{name:'Apple',where:'California'}
                    ,{name:'Microsoft',where:'Washington'}
                    ];
           $scope.getCurSups = function(sPayee) {
             log("getting curSups");
             return $scope.oSups;
           }
           $scope.supClick = function(oSup) {
             $scope.oObj.payee =  oSup.name;
           }
         }
       </script>
       <div><b>Note: examples do not execute yet until TRI.js hooked in properly to doc environment</b></div>
       <div ng-app='app' ng-controller="Ctrl">
         <span class=note>Payee:</span>
           <input type=text autocomplete=bShowSups next=insertLine(oObj) id=payee ng-model=oObj.payee placeholder='enter payee name (will auto-complete)'>
           <!-- Supplier sub-list -->
           <div id=sup-scroll ng-show='bShowSups'>
             <div class=supplier ng-repeat='oSup in getCurSups(oObj.payee)' ng-class-even="'div-even'" ng-class-odd="'div-odd'" ng-click='supClick(oSup)'>
               <span style='display:inline-block; width:100px;'>{{oSup.name}}</span>{{oSup.where}}
             </div>
           </div>
          </span>
        </div>
      </doc:source>
    </doc:example>
 *
 * @element ANY
 * @restrict A
 */
oApp.directive('autocomplete', function() {
  return {
    restrict: 'A',       // only activate on element attribute
    require: '?ngModel', // get a hold of NgModelController
    priority: 500,
    link: function(scope, element, attrs, ngModel) {
      log("keyup autocomplete linker");
      if(!ngModel) return; // do nothing if no ng-model
      var sFlag = attrs.autocomplete;
      var sNext = attrs.next;
      element.bind('focus', function() {
        focus();
      });
      // Listen for change events to enable binding
      element.bind('keyup', function(oEvt) {
        if (scope.sAutoName != null) {
          if (oEvt.keyCode == 13) { // enter
            log("keyup auto="+scope.sAutoName+" next="+sNext+" flag="+sFlag);
            ngModel.$setViewValue(scope.sAutoName);
            element.val(scope.sAutoName);
            setFlag(false);
            if (sNext) scope.$eval(sNext);
            var oPrev = scope;
            var oPar = scope.$parent;
            while(oPar) {
              oPrev = oPar;
              oPar = oPar.$parent;
            }
            oPrev.$digest();  // trigger another cycle.  Needed to refresh error state way up the scope tree
          }
        }
      });

      // Write data to the model
      function focus() {
        ngModel.$setViewValue("");
        element.val("");
        scope.sAutoName = null;
        setFlag(true);
        log("focus autocomplete scope=%o flag=%s next=%s",scope,sFlag,sNext);
        scope.$digest();  // trigger another cycle
      }

      function setFlag(b) {
        if (!sFlag) return;
        var sParts = sFlag.split(".");
        //log("sFlag %s sParts %o",sFlag,sParts);
        if (sParts.length == 1) scope[sParts[0]] = b;
        if (sParts.length == 2) scope[sParts[0]][sParts[1]] = b;
      }
    }
  };
});

/**
 * @ngdoc directive
 * @name tri.directive:autotab
 *
 * @description
 * Allows the next element to be tabbed to when input is complete indicated by the use of the 'enter' key.
 * The `autotab=expr' names a function that focuses on the next DOM element when the input is complete.
 *
 * @usage
 * <input ... autotab=function-to-set-focus>
 * @example
    <doc:example>
      <doc:source>
       <script>
         function Ctrl($scope) {
           $scope.setSaveFocus = function((oObj,oLine) {
             var sEditType = oTabProp.oCRUD.getEditType();
             log("setSaveFocus %s %o %o",sEditType,oObj,oLine);
             if (sEditType == 'Edit') return;
             var oA =  document.getElementById('edit-save');
             if (oA) setTimeout(function(){oA.focus();},0); // delay so focus takes because DOM is built
         }
       </script>
       <div><b>Note: examples do not execute yet until TRI.js hooked in properly to doc environment</b></div>
       <input id=RefFld-{{$index}} ng-model='oLine.ref' autotab=setSaveFocus(oObj,oLine)>
       <!-- ... -->
       <a id=edit-save class='sz-90 adj-rgt' href="" when-active="editSave();" ng-class='dirtyClass()'>{{dirtyMsg()}}</a>
      </doc:source>
    </doc:example>
 *
 * @element ANY
 * @restrict A
 */
oApp.directive('autotab', function() {
  return {
    restrict: 'A', // only activate on element attribute
    priority: 500,
    link: function(scope, element, attrs, ngModel) {
      var sNext = attrs.autotab;
      // Listen for change events to enable binding
      element.bind('keyup', function(oEvt) {
        if (oEvt.keyCode == 13) { // enter
          log('autotab event %o',oEvt);
          if (scope.sAutoName != null) {
            if (sNext) scope.$eval(sNext);
            scope.$digest();  // trigger another cycle
          }
        }
      });
    }
  };
});



/**
 * @ngdoc directive
 * @name tri.directive:scopeVar
 *
 * @description
 * Used to assign a variable within the scope to a certain value based on
 * an evaluation.  The `vbl` name is set to the value returned by `expr`
 *
 * @usage
 *  <ANY ... scope-var='vbl = expr'>
 * @example
    <doc:example>
      <doc:source>
       <script>
         function Ctrl($scope) {
           $scope.useTable = function((oObj,oLine) {
           }
         }
       </script>
       <div><b>Note: examples do not execute yet until TRI.js hooked in properly to doc environment</b></div>
       <div id=donors-list ng-show="hasSession() && isSect('CommList') && inEdit()" scope-var='oDonTab = useTable("Donor","oDonSel")'>
      </doc:source>
    </doc:example>
 *
 * @element ANY
 * @restrict A
 */
oApp.directive('scopeVar', function($parse) {
  return {
     restrict: 'A'           // only activate on
    ,link: function(scope, element, attrs, ngModel) {
      var sExpr=attrs.scopeVar;
      var nIX = sExpr.indexOf("=");
      var sVar  = sExpr.substring(0,nIX).trim();
      var sFunc = sExpr.substring(nIX+1).trim();
      log("scopeVar called var="+sVar+" func:"+sFunc);
      var oFunc = $parse(sFunc);
      scope.$watch(
         function() {
           if (scope[sVar]) {
             //log("quick exit "+sVar+" scope="+scope.$id+" "+sFunc+" varPtr=%o",scope[sVar]);
             return scope[sVar];
           }
           var oTab = oFunc(scope);
           //log("return scopeVar "+sVar+" scope="+scope.$id+" "+sFunc+" oTab=%o",oTab);
           return oTab;
         }
        ,function(oNew,oOld) {
           //log("**** differs "+oNew+" "+oOld+" scope="+scope.$id+(oNew?" title="+oNew.getTitle():"")+" "+sFunc);
           scope[sVar] = oNew;
         }
      );
    }
  };
});

/**
 * @ngdoc directive
 * @name tri.directive:whenActive
 *
 * @description
 * Used to disable the function of link when it is not active based on the class values not
 * including 'c-quiet'.  It means the functions called never have to check if they are disabled as
 * the call is never made if the link is deemed inactive.
 * @usage
 *  <A ... when-active='function-to-execute'>
 * @example
    <doc:example>
      <doc:source>
       <script>
         function Ctrl($scope) {
           $scope.changeCurrency = function() {
           }
         }
       </script>
       <div><b>Note: examples do not execute yet until TRI.js hooked in properly to doc environment</b></div>
       <a class='c-action sz-90 adj-rgt' href="" when-active="changeCurrency();">Change to ${{getOtherCurrency()}}</a>
      </doc:source>
    </doc:example>
 *
 * @element A
 * @restrict A
 */
oApp.directive('whenActive', function($rootScope) {
  return function(scope, oE, oAttrs) {
    var sFunc = oAttrs.whenActive;
    //log("whenActive bind %o func=%s",oE,sFunc);
    oE.bind('click', function(evt) {
      var bActive = !oE.hasClass('c-quiet');
      log("whenActive click scope=%s %o %o func=%s active="+bActive,scope.$parent.$id,evt,oE,sFunc);
      if (!bActive) return;
      if (angular.isDefined(window.ga)) ga('send','event','action','click',sFunc);
      $rootScope.oCurEvent = evt;
      scope.$apply(sFunc);
    });
  };
});

/**
 * @ngdoc directive
 * @name tri.directive:focusClear
 *
 * @description
 * Used to execute a function, typically to clear the contents of an input field, when it receives focus.
 * @usage
 *  <input ... focus-clear='function-to-execute'>
 * @example
    <doc:example>
      <doc:source>
       <script>
         function Ctrl($scope) {
           $scope.changeCurrency = function() {
           }
         }
       </script>
       <div><b>Note: examples do not execute yet until TRI.js hooked in properly to doc environment</b></div>
       <input  focus-clear='oSubC.methAmtFocus(this,$MODOBJ$)'>
      </doc:source>
    </doc:example>
 *
 * @element input
 * @restrict A
 */
oApp.directive('focusClear', function($parse) {
  return {
     restrict: 'A'           // only activate on
    ,require: '?ngModel'     // get a hold of NgModelController
    ,link: function(scope, element, attrs, ngModel) {
      if(!ngModel) return; // do nothing if no ng-model
      var sFocus=attrs.focusClear;
      var oFunc = null;
      if (sFocus && (sFocus.length > 0)) oFunc = $parse(sFocus);
      element.bind('focus', function() {
        //log("focus called scope="+scope.$id+" method="+oFunc);
        ngModel.$setViewValue(null);
        element[0].value = "";
        if (oFunc) oFunc(scope);
      });
    }
  };
});



/**
 * @ngdoc directive
 * @name tri.directive:blurEvent
 *
 * @description
 * Used to invoke a function when an element loses focus.  The `blur-next` function if specified is executed
 * when the control reads an 'enter' key.  It is used to set the focus to the next element.
 * @usage
 *  <input ... blur-event='function-to-execute' blur-next='function-to-execute'>
 * @example
    <doc:example>
      <doc:source>
       <script>
         function Ctrl($scope) {
           $scope.changeCurrency = function() {
           }
         }
       </script>
       <div><b>Note: examples do not execute yet until TRI.js hooked in properly to doc environment</b></div>
       <input id=inp-grab-focus type=text ng-model='$MODEL$'  blur-next=setAddFocus(oObj) blur-event='oSubC.methAmtBlur(this,$MODOBJ$)'>
      </doc:source>
    </doc:example>
 *
 * @element A
 * @restrict A
 */
oApp.directive('blurEvent', function($parse) {
  return {
     restrict: 'A'           // only activate on
    ,link: function(scope, element, attrs, ngModel) {
      var sBlur=attrs.blurEvent;
      var sNext = attrs.blurNext;
        //log("blur called "+sBlur);
      var oFunc = $parse(sBlur);
      element.bind('blur', function() {
        oFunc(scope);
      });
      element.bind('keypress', function(oEvt) {
        //log("keypress "+oEvt.charCode);
        if (oEvt.charCode == 13) {
          oFunc(scope); // trigger blur handler
          if (sNext) scope.$eval(sNext);
        }
      });
    }
  };
});

/**
 * @ngdoc directive
 * @name tri.directive:macro
 *
 * @description
 * Used to provide HTML manipulation and insertion.  Used for tempolates and to disable sections of code.
 *
 * The raw HTML passes through a modification cycle where the `alter` and other standard $word$ strings are
 * replaced with new values just before the final insertion.
 *
 * Note that the new HTML can itself contain `macro` directives.  That is, the `macro` directive is recursive.
 *
 * The value `<img-defer ...>`  are replaced by `<img ...>`.  This defers the loading
 * of the images until the template is actually used.  It also defers loading until the template is positioned under the correct
 * base URL.  Refer to {@link /guide/templates#theloadprocess Template Load Process}
 *
 * The `alter` param consists of a repeated group of pairs.
 * Refer to {@link /api/tri.object.Tri#applyAlters tri.applyAlters} for the format.
 *
 * @usage
 *  <macro fetch='template-name.html' alter='fromstr/tostr;....' col='' mode='' marker='' obj='' objref=''></macro>
 * @param {string} alter Alters the raw HTML string before insertion using RegExp patterns. Refer to {@link /api/tri.object.Tri#applyAlters tri.applyAlters} for the format.
 * @param {string} col Used internally in conjuction with the `mode` parameter to generate standard HTML chunks. Also used
 * to extract the field name of the column.  The $MODEL$ will be replaced by this field name.
 * @param {string} fetch Template name to fetch.  If not specified the `col` and `mode` params are
 * used to manufacture a standard block of HTML to insert.
 * @param {string} marker used to create HTML comments in the generated code containing the marker string for diagnostic purposes.
 * @param {string} mode Used internally in conjuction with the `mode` parameter to generate standard HTML chunks.
 * @param {string} obj The string $MODOBJ$ will be replaced by this value known as `sObj`.
 * @param {string} objref The object reference `sObj` is set by evaluation of the `objref` string.
 * @example
    <doc:example>
      <doc:source>
       <script>
         function Ctrl($scope) {
           $scope.changeCurrency = function() {
           }
         }
       </script>
       <div><b>Note: examples do not execute yet until TRI.js hooked in properly to doc environment</b></div>
         <macro fetch='apps-header.html'></macro>
         <macro fetch='apps-login.html' alter='System Login/Donation Recording System Login;SINGLE/DOUBLE'></macro>
         <macro col='oSubC' objref=oCol.objName mode='Edit' marker=mark-2a></macro>
       </doc:source>
    </doc:example>
 *
 * @element MACRO
 * @restrict E
 */

oApp.directive('macro',['$compile','$templateCache',"$timeout",function($compile,$templateCache,$timeout) {
  //log("installed macro directive");
  var oCache = {};           // For $compile results
  return {
     restrict: 'E'           // only activate on
    ,require: '?ngModel'     // get a hold of NgModelController
    ,replace: true
    ,transclude: false
    ,scope:false
    ,compile:compiler
  };

  function compiler(oElem,oAttr) {
    var sHint = '';
    var i, iMax;
    return {
      pre: function ($scope, oElem, oAttr, oCtrl) {
        if (oAttr.optFetch) return;   // un-altered macro
        if (oAttr.optFetch01) return; // un-altered macro
        if (oAttr.optFetch02) return; // un-altered macro
        var sFetch = oAttr.fetch || null;
        var sCol  = oAttr.col || null;
        var sAlter = oAttr.alter || null;
        var sMode = oAttr.mode || 'List';
        var sMarker = oAttr.marker || 'no-marker';
        var sObj  = oAttr.obj || 'oObj';
        var sObjRef = oAttr.objref || null;
        if (sObjRef) sObj = $scope.$eval(sObjRef);
        var oCol  = null;
        var sField = null;
        if (sCol) {
          oCol  = $scope[oAttr.col];
          sField = oCol.getField();
        }
        var sHtml = null;
        //log("pre-linker col="+sCol+" col=%o obj=%s objRef=%s mode=%s scope=%s marker=%s field=%s",oCol,sObj,sObjRef,sMode,$scope.$id,sMarker,sField);
        if (sFetch) {
          if (oGBL.templates) { // first time convert templates to cache version
            log("convert templates ",oGBL.templates);
            for(i=0,iMax=oGBL.templates.length; i<iMax; i+=1) {
              var oTMP = oGBL.templates[i];
              var sBest = compileReady(oTMP.html);
              sBest = "<!-- template "+oTMP.id+" $MARKER$ -->" + sBest;
              $templateCache.put(oTMP.id,sBest);
              //log("Add "+oTMP.id+" %o to templates",oTMP)
            }
            oGBL.$templateCache = $templateCache; // backfill ref for hookMsgListener
            oGBL.templates = null;
          }
          //log("macro fetch="+sFetch+" alter="+sAlter);
          sHtml = $templateCache.get(sFetch);
          if (!sHtml) {
            sHtml = "<!-- gen.0 $MARKER$ --><span class=warn>lost "+sFetch+" template</span>";
            log("fetch HTML "+sFetch+" not located");
          }
        } else {
          sHtml = "<!-- gen.1 $MARKER$ --><span>{{"+sCol+".getValue(this,"+sObj+")}}</span>";
          if (sMode == 'Edit') sHtml = "<!-- gen.2 $MARKER$ --><input type=text name="+oCol.getID()+">";
          if (oCol["html"+sMode]) {
            sHtml = $templateCache.get(oCol["html"+sMode]);
            if (sHtml == null) sHtml = "<!-- gen.3 $MARKER$ --><span class=warn>lost "+oCol["html"+sMode]+" template</span>";
          } else {
            if (oCol.type == 'action') {
              sHtml = "";
              for(i=0;i<oCol.methods.length;i += 1) {
                var oA = oCol.methods[i];
                if (i > 0) sHtml += "&nbsp;&nbsp;";
                var nRow = 'null';
                if (oAttr.row) nRow = ""+oAttr.row;
                //sHtml += "<a class='c-action sz-90' when-active=\"methodClick("+sCol+","+i+","+sObj+","+nRow+")\">"+oA.name+"</a>";
                var sFuncName = getFuncName(oCol.methods[i].method);
                $scope[sFuncName] = oCol.methods[i].method;
                sHtml += "<a class='c-action sz-90' when-active=\""+sFuncName+"(this,"+sObj+","+nRow+")\">"+oA.name+"</a>";
              }
              sHtml = "<!-- gen.4 $MARKER$ -->"+sHtml;
            }
          }
        }
        if (sHtml == null) {
          sHtml = "<!-- gen.0 $MARKER$ --><span class=warn>no HTML data col="+sCol+" mode="+sMode+"</span>";
          log("no HTML col="+sCol+" fetch="+sFetch+" scope=%o col=%o",$scope,oCol);
        }

        // Insert Model
        if (!sFetch) {
          if (sHtml.indexOf("$MODEL$") > 0) {
            var sModel = sObj+"['"+sField+"']";
            sHtml = sHtml.replace(/[$]MODEL[$]/g,sModel);
            //log("MODEL html "+sHtml+" col=%o field="+sField,oCol);
          }
          if (sHtml.indexOf("$MODOBJ$") > 0) {
            sHtml = sHtml.replace(/[$]MODOBJ[$]/g,sObj);
          }
          if (oCol.hint) {
            if (typeof oCol.hint == 'function') {
              sHint = '';
              var nIX = sHtml.indexOf(">");
              sHint = " title='{{("+sCol+".hint)("+sObj+")}}'";
            } else {
              sHint = oCol.hint;
            }
            sHtml = sHtml.replace(/(<[a-zA-Z][^ >]*)(.)/g,"$1 "+sHint+"$2");
          }
        }
        if (sHtml.indexOf("$MARKER$") > 0){
          sHtml = sHtml.replace(/[$]MARKER[$]/g,sMarker);
        }
        if (sHtml.indexOf("<img-defer") > 0){ // delay loading of AppBase.html images (Made lowercase by Chrome not sure about FF)
          //log("Fix up IMG-DEFER");
          sHtml = sHtml.replace(/(<\/?)img-defer/gi,"$1img");
        }
        if (sAlter) sHtml = tri.applyAlters(sHtml,sAlter);

        var oLinkFn = null;
        oLinkFn = $compile(sHtml);
        var oNewElem = oLinkFn($scope);
        oElem.replaceWith(oNewElem);
        if ($scope.grabFocus) {
          var oResult = sHtml.match(/<!--\sgrab-focus=([^ ]+)/);
          if (oResult != null) {  // This lets us grab set the focus when the element renders.
            oElem.sGrabFocus = oResult[1];
          }
        }
      }
      ,post:function ($scope, oElem, oAttr, oCtrl) {
        //log("post-linker "+oAttr["col"]+" "+oAttr.col+" scope="+$scope.$id+"/"+$scope.$parent.$id+"/"+$scope.$parent.$parent.$id+"/"+$scope.$parent.$parent.$parent.$id);
        if (oElem.sGrabFocus) {
          $timeout(function() {
            $scope.grabFocus($scope,oElem,oElem.sGrabFocus); // call user function
          },0);
        }
      }
    };
  }

  function compileReady(sRawHtml) {
    var sStr = "";
    var sLines = sRawHtml.split(/\n/);
    if (sLines.length > 1) {
      // $compile hates blanks
      //log("split compiler "+sLines.length);
      sStr = "";
      for(var i=0;i<sLines.length; i+=1) {
        var sLine = sLines[i].trim();
        sStr += sLine;
      }
    } else {
      return sRawHtml;
    }
    return sStr;
  }

}]);


/* This may be obsolete - could not find usage
 * @ngdoc directive
 * @name tri.directive:colRows
 *
 * @description
 * Uses to establish watches on specified columns.
 */
oApp.directive('colRows', function() {
  //log("installed col-rows directive");
  return {
    restrict: 'A', // only activate on element attribute
    require: '?ngModel', // get a hold of NgModelController
    priority: 500,
    link: function postLink(scope, oEl, attrs, ngModel) {
      var sFld = attrs.colRows;
      log("postlink "+oEl.attr('colRows')+" rows="+sFld+" "+oEl.attr('class'));

      attrs.$observe('ngModel',function(value) {
        log('colRows now '+value);
      });
    }
  };
});


/* document later when Mems added
 * @ngdoc directive
 * @name tri.directive:triState
 *
 * @description
 * Used to build a tri-state control.
 */
oApp.directive('triState', function($timeout) {
  //log("installed tri-state directive");
  return function(scope, oTri, attrs) {
    $timeout(function() {
      var ngModel = attrs.ngModel;
      var sFld = attrs.triState;
      var oFil = scope.getFilter(sFld);
      var oOpts = scope.getRefColOpt(oFil);
      log("Build select options "+oTri.attr('id')+" DOMid="+oTri[0].id+" "+ngModel+" opts="+oOpts.length);
      var sStr = "";
      if (!scope.oSel) scope.oSel = {};
      if (!scope.oSel[oFil.field]) scope.oSel[oFil.field] = {};
      if (!scope.oSel[oFil.field].status) scope.oSel[oFil.field].status = {open:false,mode:'INCL',list:[]};
      var oStat = scope.oSel[oFil.field].status;
      oStat.tri = oTri;
      sStr += "<option class='dummy green0' value=x>"+scope.getColTitle(oFil)+"</option>";
      var sClass = 'black';
      for(var i in oOpts) {
        var oOpt = oOpts[i];
        sStr += "<option class="+sClass+" title='"+oOpt.title+"' value="+oOpt.value+">"+oOpt.name+"</option>";
      }
      sStr += "<option class=dummy value=x></option>"; // will be under buttons
      sStr += "<option class=dummy value=x></option>";
      sStr += "<option class=dummy value=x></option>";

      oTri.html(sStr);
      oTri.after("<button id=but-id-3 class='tri-but-tri'>&gt;</button>");
      var oButTri = oTri.next();
      oButTri.after("<button id=but-id-1 class='tri-but-grn hide'>=</button>");
      var oButGrn = oButTri.next();
      oButGrn.after("<button id=but-id-2 class='tri-but-red hide'>~</button>");
      var oButRed = oButGrn.next();
      log("Button "+oButTri.attr('id'));
      oButTri[0].onclick = function() {
        if (!oStat.open) { // open tri-select box
          oStat.open = true;
          oButTri.text("X");
          oButRed.removeClass("hide");
          oButGrn.removeClass("hide");
          oTri.attr('multiple','1');
          oTri[0].options[0].selected = false;
          fixOption0();
        } else {                            // close tri-select box
          oStat.open = false;
          oButRed.addClass("hide");
          oButGrn.addClass("hide");
          oButTri.text(">");
          oTri.removeAttr('multiple');  // Note this turns off all but 1 selected option
          oStat.list = [];
          var sTitle = '';
          for(var i in oTri[0].options) {
            if (oTri[0].options[i].value) {
              var oOpt = oTri[0].options[i];
              if (oOpt.triSelected) {
                oStat.list.push(i);
                sTitle += ","+oOpt.text;
              }
            } else {
              //log("opt "+i+" "+oTri[0].options[i]);
            }
          }
          if (oStat.list.length > 0) {
            oTri[0].options[0].text  = scope.getColTitle(oFil)+':'+oStat.mode;
            oTri[0].title = (oStat.mode=='INCL'?'Include:':'Exclude:')+sTitle.substring(1);
          } else {
            oTri[0].options[0].text = scope.getColTitle(oFil)+': idle';
            oTri[0].title = 'no selected values';
          }
          oTri[0].options[0].value = ""+(new Date().getTime()); //ngModel value
          oTri[0].options[0].selected = true;
          scope.$apply(ngModel); // force update of model dependencies
        }
        log("clicked button for "+oTri[0].id+" "+oButTri.attr('class'));
      };

      oButRed[0].onclick = function() {
        oStat.mode = 'EXCL';
        fixOption0();
        fixOptionClasses();
      };

      oButGrn[0].onclick = function() {
        oStat.mode = 'INCL';
        fixOption0();
        fixOptionClasses();
      };

      function fixOption0() {
        oTri[0].options[0].text = scope.getColTitle(oFil)+':'+oStat.mode;
        var oAO = oTri.find('option').eq(0);
        oAO.removeClass('green0');
        oAO.removeClass('red0');
        oAO.addClass(oStat.mode=='INCL'?'green0':'red0');
        //log("opt0 "+oAO.attr('class')+" "+oTri[0].options[0].value);
      }

      function fixOptionClasses() {
        var nIX = -1;
        for(var i in oTri[0].options) {
          if (oTri[0].options[i].value) {
            nIX += 1;
            var oOpt = oTri[0].options[i];
            var oAO = oTri.find('option').eq(nIX);
            if (oOpt.triSelected) {
              //log("Fix class "+oAO.text()+" "+oOpt.text+" "+oAO.attr('class'));
              oAO.removeClass('red green black');
              oAO.addClass(oStat.mode=='INCL'?'green':'red');
            } else {
              if (nIX > 0) {
                oAO.removeClass('red green');
                oAO.addClass('black');
              }
            }
          }
        }
      }

      oTri[0].onchange = function() {
        //log("On change ------ ");
        var nIX = -1;
        for(var i in oTri[0].options) {
          if (oTri[0].options[i].value) {
            nIX += 1;
            var oOpt = oTri[0].options[i];
            var oAO = oTri.find('option').eq(nIX);
            //log("opt "+i+" "+oOpt.value+" "+oOpt.text+" "+oOpt.triSelected+" "+oAO.text()+" "+nIX);
            if (oOpt.selected) {
              oOpt.selected = false;
              if ((oOpt.value != 'x') && (nIX !== 0)) {
                if (oOpt.triSelected) {
                  oOpt.triSelected = false;
                } else {
                  oOpt.triSelected = true;
                }
              }
            }
          }
        }
        fixOptionClasses();
      };


    },1000);
    var sFld = attrs.triState;
    log("connected tristate to "+sFld);
  };
});


// ---------------------------------------------------------------------------
// ----------------------------- Services ------------------------------------
// ---------------------------------------------------------------------------

/**
 * @ngdoc service
 * @name tri.servREG
 *
 * @description
 * Registration service for application tables.
 *
 * Note that two formats for the table is used internally.  The first,
 * the static object definition, is a reference to the static Javascript definition.
 * The second, the
 */
oApp.factory('servREG',function() {
  log("Creating registry service");
  var oTabs  = [];

  var oFuncs = {};
/**
 * @ngdoc
 * @name tri.servREG#registerTable
 * @methodOf tri.servREG
 *
 * @param {Object} tab - static table definition
 *
 * @description
 * Register tab (static object form)
 */
  oFuncs.registerTable      = function(tab)      {registerTab(tab);};
/**
 * @ngdoc
 * @name tri.servREG#getTables
 * @methodOf tri.servREG
 *
 * @returns {Object[]} of registered tables
 *
 * @description
 * Return array of registered tables
 */
  oFuncs.getTables          = function()         {return oTabs;};
/**
 * @ngdoc
 * @name tri.servREG#findTable
 * @methodOf tri.servREG
 *
 * @param {string} sTable - recTitle of table to locate
 * @returns {Object} of table or null
 *
 * @description
 * Return specific table whose `recTitle` is called `sTable`
 */
  oFuncs.findTable          = function(sTable)   {return findTable(sTable);};
  return oFuncs;

  function registerTab(tab) {
    oTabs.push(tab);
    log("Registering table "+tab.getTabProp().recTitle+" Tables="+oTabs.length);
  }

  function findTable(sTable) {
    for(var i=0,iMax=oTabs.length; i<iMax; i+=1) {
      var oTD = oTabs[i];
      if (oTD.getTabProp().recTitle == sTable) return oTD;
    }
    return null;
  }

});


/**
 * @ngdoc service
 * @name tri.servCRUD
 *
 * @description
 * Provides Create/Read/Update/Delete services for tables.  These are the common
 * functions required by both {@link /api/tri.servREC servREC} and {@link /api/tri.servTBL servTBL} services.
 *
 * To prevent circular references the `servCRUD` function pointer is forwarded to `servREC` and `servTBL` during initialization.
 *
 * Also refer to {@link /guide/records Record Storage}
 */
/**
 * @ngdoc
 * @name tri.servCRUD#hookCtrlEdit
 * @methodOf tri.servCRUD
 *
 * @param {Object} ctrl The standard or replacement {@link /api/tri.controller:ctrlCommEdit Edit Controller} used to edit the current {@link /guide/data Data Object}.
 *
 * @description
 * Sets the current editor for the current selected {@link /guide/data Data Object}. When this is called a second time
 * it assumes the second instance is the JQueryUI Dialog  instance and saves it in `oDlgCtrlEdit`.
 *
 */
/**
 * @ngdoc
 * @name tri.servCRUD#inDlgEdit
 * @methodOf tri.servCRUD
 *
 * @returns {Boolean} Returns the bInEdit current value
 *
 * @description
 * Returns whether both the system {@link /api/tri.controller:ctrlCommEdit Edit Controller} is active and the Dialog mode is true.
 *
 */
/**
 * @ngdoc
 * @name tri.servCRUD#setDlgEdit
 * @methodOf tri.servCRUD
 *
 * @param {Number} nWid Pixel width of Dialog window
 * @param {Number} nHgt Pixel height of Dialog window
 *
 * @description
 * Sets the system to use the Dialog editor when {@link /api/tri.servCRUD#editRecord servCRUD.editRecord} is called.  Assumes both JQuery and JQuery have been loaded by the
 * .htm page.
 *
 * To disable the Dialog mode once set call with `nWid` and `nHgt` set to null.
 *
 */

/**
 * @ngdoc
 * @name tri.servCRUD#getCtrlEdit
 * @methodOf tri.servCRUD
 *
 * @param {Boolean} bDlg If true returns oDlgCtrlEdit else returns oCtrlEdit

 * @returns {Object} The standard or replacement {@link /api/tri.controller:ctrlCommEdit Edit Controller} used to edit the current {@link /guide/data Data Object}.
 *
 * @description
 * Gets the current editor for the current selected {@link /guide/data Data Object}. In actuality this is the $scope pointer
 * for the {@link /api/tri.controller:ctrlCommEdit Edit Controller}
 *
 */
/**
 * @ngdoc
 * @name tri.servCRUD#getEditObj
 * @methodOf tri.servCRUD
 *
 * @returns {Object} Returns the {@link /guide/data Data Object} being edited or null.
 *
 * @description
 * Returns the {@link /guide/data Data Object} being edited or null.
 *
 */
/**
 * @ngdoc
 * @name tri.servCRUD#getEditIX
 * @methodOf tri.servCRUD
 *
 * @returns {Object} The `nEditIX` value.
 *
 * @description
 * Returns the `nEditIX` value. This value is the `oaa` value for 'Edit' mode or null for 'Create' mode.
 * See {@link /guide/records Record Storage} for a description of `oaa`.
 *
 */
/**
 * @ngdoc
 * @name tri.servCRUD#getTabProp
 * @methodOf tri.servCRUD
 *
 * @returns {Object} The `Table.props` value.
 *
 * @description
 * Returns the {@link /api/tri.servSess#getTabProp servSess.getTabProp} returned value.
 *
 */
oApp.factory('servCRUD',['$rootScope','servREC','servGAE','servREG','servSess',function($rootScope,servREC,servGAE,servREG,servSess) {        // --------------- CRUD management

  var bInEdit      = false;
  var nEditIX      = 0;
  var sEditType    = null;
  var oCtrlEdit    = null;
  var oDlgCtrlEdit = null;
  var oObjEdit     = null;
  var oObjCopy     = null;
  var oDlgEdit     = null;

  var oFuncs = {};
  oFuncs.hookCtrlEdit          = function(ctrl)                {if (!oCtrlEdit) oCtrlEdit = ctrl; else oDlgCtrlEdit = ctrl;};
  oFuncs.getCtrlEdit           = function(bDlg)                {return bDlg?oDlgCtrlEdit:oCtrlEdit;};
  oFuncs.inEdit                = function(oTP)                 {return inEdit();};
  oFuncs.inDlgEdit             = function()                    {return (oDlgEdit != null) && inEdit();};
  oFuncs.setDlgEdit            = function(nWid,nHgt)           {oDlgEdit = null; if (nWid && nHgt) oDlgEdit = {width:nWid, height:nHgt};};
  oFuncs.getAppStatKey         = function()                    {return getAppStatKey();};
  oFuncs.getEditType           = function(oTP)                 {return getEditType;};
  oFuncs.getObjEdit            = function()                    {return oObjEdit;};
  oFuncs.getEditIX             = function()                    {return nEditIX;};
  oFuncs.syncLocalData         = function(scope,sToken,oData)  {syncLocalData(scope,sToken,oData);};
  oFuncs.refreshNonCachedTable = function(oT,oTbl,oTP)         {refreshNonCachedTable(oT,oTbl,oTP);};
  oFuncs.refreshTableCache     = function(bPartial)            {refreshTableCache(bPartial);};
  oFuncs.getTabProp            = function()                    {return servSess.getTabProp();};
  oFuncs.getObj                = function(oTP,oaa)             {return getObj(oTP,oaa);};
  oFuncs.getObjs               = function(oTP)                 {return getObjs(oTP);};
  //oFuncs.getSelObjs            = function()                    {return getSelObjs();}
  oFuncs.editRecord            = function(oaa)                 {editRecord(oaa);};
  oFuncs.makeRecord            = function()                    {makeRecord();};
  oFuncs.dropRecord            = function(oaa)                 {dropRecord(oaa);};
  oFuncs.editCancel            = function()                    {editCancel();};
  oFuncs.editSave              = function(scope)               {editSave(scope);};
  oFuncs.dirtyMsg              = function(scope)               {return dirtyMsg(scope);};
  oFuncs.dirtyClass            = function(scope)               {return dirtyClass(scope);};

  servREC.setCRUD(oFuncs); // allow servREC to callback to functions
  servSess.setCRUD(oFuncs); //   ,, servSess     ,,
  return oFuncs;

/**
 * @ngdoc
 * @name tri.servCRUD#syncLocalData
 * @methodOf tri.servCRUD
 *
 * @param {Object} scope caller scope
 * @param {string} sToken The user token obtained by the logon process
 * @param {Object} oData A Javascript Object containing the `servGAE` response data.
 *
 * @description
 * When `oData` is null the logoff cleanup process is invoked.
 *
 * When `oData` is not null the following happens:
 *
 * * the Boolean `bPartial` is set to `true` if `scope` is null, else `bPartial` is set to `false`.
 * * The `matchTable` routine is invoked to match the `oData` table and the current cached data for the `Table` for each `Table` or
 * table chunk in the `oData` record.
 * * the application status is updated using the {@link /api/tri.servSess#setStatus servSess.setStatus} function.
 * * the display status is updated using the `refreshLocalCache` function with `bPartial` set as defined above.
 *
 */
  function syncLocalData(scope,sToken,oData) {
    var bPartial = (scope == null); // partial reload for table type refresh
    var oStat = getAppStatus();
    oStat.token = sToken;
    oStat.user  = servSess.getUser();
    oStat.user2 = servSess.getUser2();
    log("syncLocalData tok=%s data=%o stat=%o",sToken,oData,oStat);
    if (!oData.DataStat) {
      servGAE.setToken(null);
      servSess.setSession(false);
      servSess.setSect(null);
      servSess.setStatus(null);
      delete localStorage['.user-token'];
      if (scope != null) {
        scope.sErrMsg = "Expected DataStat object";
        scope.$digest();
      }
      return;
    }
    for(var i=0,iMax=oData.DataStat.RECORD.length; i<iMax; i+=1) {
      var oRec = oData.DataStat.RECORD[i];
      //log("match %s %s %s",oRec.GekID,oRec.KeyName,oRec.UpdateTS);
      matchTable(oStat,oRec);
    }
    log("registering stat=%o",oStat);
    servSess.setStatus(oStat);
    refreshLocalCache(bPartial);
  }

  function matchTable(oStat,oRec) {
    var sParts = oRec.KeyName.split("/");
    for(var sVar in oStat.tables) {
      var oTbl = oStat.tables[sVar];
      if (oTbl.recType == sParts[1]) {
        if (oTbl.fileKey == sParts[2]) {
          //log("  easy-hit "+sParts[1]+" to "+oTbl.recName+" "+oTbl.recType+" "+oTbl.fileKey);
          flagTable(oTbl,oRec,sParts[2]);
        } else if (oTbl.fileKey[0] == "@") {
          var sFileKey = servSess.getProfile()[oTbl.fileKey.substring(1)];
          if (sFileKey == sParts[2]) {
            //log("  hard-hit "+sParts[1]+" to "+oTbl.recName+" "+oTbl.recType+" "+oTbl.fileKey+" "+sFileKey);
            flagTable(oTbl,oRec,sParts[2]);
          }
        } else if (oTbl.type == "chunk") {
          var sMat = oTbl.fileKey.replace(/%/,"[0-9]+");
          //log("  matching "+oTbl.fileKey+" and "+sParts[1]+" "+oRec.KeyName+" "+sParts[2]+" "+sMat);
          if ((new RegExp(sMat)).test(sParts[2])) {
            //log(" hit %o %o key=",oTbl,oRec,oRec.KeyName);
            flagTable(oTbl,oRec,sParts[2]);
          }
        } else if (oTbl.type == "table") {
          //log("table match %s rec=%o tbl=%o",oRec.KeyName,oRec,oTbl);
          flagTable(oTbl,oRec,sParts[2]);
        } else {
          log("table match failure rec=%o tbl=%o",oRec,oTbl);
        }
      }
    }
  }

  function flagTable(oTbl,oRec,sRecKey) {
    if (!oTbl.map) oTbl.map = {};
    oTbl.map[sRecKey] = {UpdateTS:oRec.UpdateTS,GekID:oRec.GekID};
  }

/**
 * @ngdoc
 * @name tri.servCRUD#getAppStatKey
 * @methodOf tri.servCRUD
 *
 * @returns {Object[]} A application status object array used to build localStorage unique keys.
 *
 * @description
 * Returns an array containing the following values.
 *
 * * 0: The localStorage key to use.
 * * 1: The current application ID (See {@link /api/tri.servGAE#getCust servGAE.getCust}}
 * * 2: The lowercase portion of the .htm page used to access the application.
 *
 */
  function getAppStatKey() {
    var sCust = servGAE.getCust();
    var sLocn = ""+window.location;
    var oR = sLocn.match(/\/([a-zA-Z0-9]+)[.]htm/);
    var sApp = oR[1].toLowerCase();
    var sLSKey = '.status-'+sCust+'-'+sApp;
    return [sLSKey,sCust,sApp];
  }

  function getAppStatus() {
    var sStrs = getAppStatKey();
    var sLSKey = sStrs[0];
    var sCust  = sStrs[1];
    var sApp   = sStrs[2];
    var oStat = {key:sLSKey,cust:sCust,app:sApp,tables:{}};
    if (localStorage[sLSKey]) {
      oStat = JSON.parse(localStorage[sLSKey]); //use existing else build new
    }
    var oTbls = servREG.getTables();
    for(var i=0,iMax=oTbls.length; i<iMax; i+=1) {
      var oTbl = oTbls[i];
      var oTP  = oTbl.getTabProp();
      var sName = oTP.recTitle;
      if (!oStat.tables[sName]) {
        var sType = 'table';
        if (oTP.recServ.isCombined()) {
          sType = 'record';
          if (oTP.recName.indexOf("%") > 0) sType = 'chunk';
        }
        var sFileKey = oTP.recName;
        if (oTP.fileKeyRef)  sFileKey = "@"+oTP.fileKeyRef;
        var oT = {name:sName,type:sType,recType:oTP.recType,recName:oTP.recName,fileKey:sFileKey,lsName:oTP.lsName};
        oStat.tables[sName] = oT;
      }
    }
    localStorage[sLSKey] = JSON.stringify(oStat);
    return oStat;
  }

  function refreshLocalCache(bPartial,bNewCache) {
    var oStat = servSess.getStatus();
    log("refreshLocalData start sandbox=%s stat=%o",servSess.isSandboxMode(),oStat);
    for(var sV in oStat.tables) {
      var oTbl = oStat.tables[sV];
      var oTab = servREG.findTable(oTbl.name);
      var oTP  = oTab.getTabProp();
      oTP.statTbl = oTbl;
      oTP.oCRUD   = oFuncs;
      if (!oTbl.lsName) continue; // no cache like for User table
      var sLSKey = "."+oStat.app+oTbl.lsName+"-cache";
      var oCache = null;
      if (localStorage[sLSKey]) {
        oCache = JSON.parse(localStorage[sLSKey]);
      } else {
        oCache = {key:sLSKey,map:{}};
        bNewCache = true;
      }
      for(var sVar in oTbl.map) {
        if (!(sVar in oCache.map) || (oCache.map[sVar].UpdateTS != oTbl.map[sVar].UpdateTS)) {
          log("refreshTable=%s tbl=%o cache=%o bPartial=%s sandbox=%s new=%s",sVar,oTbl,oCache,bPartial,servSess.isSandboxMode(),bNewCache);
          if (!bNewCache && servSess.isSandboxMode() && !oTP.recServ.isCombined()) continue; // do not reload in sandbox mode to handle dropped table objects
          servGAE.getKeyData(oTbl.recType,sVar,
            function(oObjs,oResult) {
              log("goodRead tbl=%o cache=%o objs=%o result=%o var=%s",oTbl,oCache,{array:oObjs},oResult,sVar);
              if (oTbl.map[sVar].UpdateTS != oResult.UpdateTS) {
                log("Strange result tbl=%o cache=%o objs=%o result=%o",oTbl,oCache,{array:oObjs},oResult);
              } else {
                if (!oCache.map[sVar]) oCache.map[sVar] = {};
                oCache.map[sVar].UpdateTS = oTbl.map[sVar].UpdateTS;
                oCache.map[sVar].GekID    = oTbl.map[sVar].GekID;
                oCache.map[sVar].KeyName  = oResult.RECORD.KeyName;
                if (oTP.cacheLoadExit) oObjs = oTP.cacheLoadExit(sVar,oObjs);
                oCache.map[sVar].oObjs    = oObjs;
                localStorage[sLSKey] = JSON.stringify(oCache);
                refreshLocalCache(bPartial,bNewCache); //restart next one
              }
            }
           ,function(status,data) {
              log("failRead tbl=%o cache=%o status=%o data=%o",oTbl,oCache,status,data);
            }
          );
          return;  // wait for read to complete
        }
      }
    }
    log("refreshLocalData completed partial=%s sandbox=%s",bPartial,servSess.isSandboxMode());
    refreshTableCache(bPartial);
  }

/**
 * @ngdoc
 * @name tri.servCRUD#refreshTableCache
 * @methodOf tri.servCRUD
 *
 * @param {Boolean} bPartial true if doing partial refresh
 *
 * @description
 * This ensures the internal cache for a `Table` and the localStorage values
 * are synchronized.
 *
 * Special processing takes place to preserve {@link /guide/sandbox Sandboxed values}.
 *
 */
  function refreshTableCache(bPartial) {
    var oStat = servSess.getStatus();
    var oObjs, sKeys, i, iMax, sKey, oObj;
    for(var sV in oStat.tables) {
      var oT = oStat.tables[sV];
      if (!oT.map && oT.lsName) continue; // partial reload for table type refresh after update
      var oTbl = servREG.findTable(oT.name);
      var oTP  = oTbl.getTabProp();
      var sName = oTP.recTitle;
      var sLSKey = "."+oStat.app+oT.lsName+"-cache";
      if (oT.type == 'chunk') {
        oTP.oChunks = [];
        oTP.nNextChunk = 0;
      }
      if ((oT.type == 'table') || (oT.type == 'record')) {
        oTP.oObjs = [];
      }
      if (!oT.lsName) {// special User table handling
        refreshNonCachedTable(oT,oTbl,oTP);
      } else if (localStorage[sLSKey]) {
        var oCache = JSON.parse(localStorage[sLSKey]);
        sKeys = Object.keys(oT.map);
        sKeys.sort();
        log("refresh table lsKey=%s oT=%o oTbl=%o oTP=%o cache=%o keys=%o partial=%s",sLSKey,oT,oTbl,oTP,oCache,{array:sKeys},bPartial);
        //log("  cache=%o keys=%o",oCache,{array:sKeys});
        for(i=0,iMax=sKeys.length; i<iMax; i+=1) {
          sKey = sKeys[i];
          if (oT.type == 'record') {
            oObjs = oCache.map[sKey].oObjs;
            oTP.recServ.setObjs(oTP,oObjs);
            log("refresh Table=%s type=%s count=",sKey,oT.name,oT.type,oObjs.length);
          } else if (oT.type == 'chunk') {
            oObjs = oCache.map[sKey].oObjs;
            oTP.oChunks.push({ls:sKey,oObjs:[]});
            oTP.recServ.addChunk(oTP,oObjs,oTP.nNextChunk);
            oTP.nNextChunk += 1;
          } else if (oT.type == 'table') {
            if (oCache.map[sKey]) { // missing for sandboxed drop
              oObj = angular.copy(oCache.map[sKey].oObjs);
              oObj.KeyName = oCache.map[sKey].KeyName; // For drop operation etc
              oObj.GekID   = oCache.map[sKey].GekID;
              oTP.oObjs.push(oObj);
            }
            //log("TableMode oCache=%o key=%s",oCache,sKey);
          } else {
            log("Strange table type "+oT.type+" "+oT.name);
          }
        }
        if (oT.type == 'table') { //remove dropped objects from cache
          sKeys = Object.keys(oCache.map);
          var bDropped = false;
          for(i=0,iMax=sKeys.length; i<iMax; i+=1) {
            sKey = sKeys[i];
            if (!oT.map[sKey]) {
              if (servSess.isSandboxMode()) {
                log("sandboxMode kept in cache "+sKey);
                oObj = angular.copy(oCache.map[sKey].oObjs);
                oTP.oObjs.push(oObj);
              } else {
                log("drop from cache "+sKey);
                delete oCache.map[sKey];
                bDropped = true;
              }
            }
          }
          if (bDropped) {
            log("reduced cache saved "+sLSKey);
            localStorage[sLSKey] = JSON.stringify(oCache);
          }
        }
        if (bPartial) {
          servREC.refreshSignal("rsR",oTP);
          setTimeout(function(){$rootScope.$digest();},0);
        }
      }
    }
  }

/**
 * @ngdoc
 * @name tri.servCRUD#refreshNonCachedTable
 * @methodOf tri.servCRUD
 *
 * @param {Object} oT The {@link /guide/table Static Table} object diagnostic logging
 * @param {Object} oTbl The dynamic {@link /api/tri.object.Table Table} object for diagnostic logging
 * @param {Object} oTP The `oTbl` `props` value
 *
 * @description
 * The `servGAE` routines are used to synchronize the loacal cache and the server storage.  This
 * is required for non-cached storage such as the `User` table.  The timestamp data in the server is used to ensure
 * that the current in memory data is valid.
 *
 *
 */
  function refreshNonCachedTable(oT,oTbl,oTP) {
    oTP.oObjs = [];
    log("refresh User table oT=%o oTbl=%o oTP=%o",oT,oTbl,oTP);
    var oUserTP = oTP; // preserve because it changes before completion
    servGAE.issueFindFile(oUserTP.recType,oUserTP.recName,
      function(status,data) {
        processGoodFind(oUserTP,status,data);
      }
      ,function(status,data){
        log("find failed stat=%o data=%o",status,data);
      }
    );
  }

  function processGoodFind(oTP,status,data) {
    var oObjs = [];
    for(var sVar in data.RESULT.RECORD) {
      var oRec = angular.copy(data.RESULT.RECORD[sVar]);
      if (oRec.DataFld) {
        oRec.obj = JSON.parse(oRec.DataFld);
        delete oRec.DataFld;
        oObjs.push(oRec);
      }
    }
    servREC.setObjs(oTP,oObjs);
    log("processed good find stat=%o data=%o objs=%o oTP=%o",status,data,{array:oObjs},oTP);
  }

/**
 * @ngdoc
 * @name tri.servCRUD#dirtyMsg
 * @methodOf tri.servCRUD
 *
 *
 * @description
 *
 * The `canSave` function is called which ensures the object is deemed 'dirty' and that the validation
 * returns `true` (both the standard validation looking for required fields and any optional validation specified in the `Table`
 * `validate` function pointer.  if `true` the text 'Save Changes' is returned.
 * If not the text 'Make Changes' is retuned.
 */
  function dirtyMsg() {
    var oTP = servSess.getTabProp();
    if (oTP == null) return "?";
    if (canSave(oTP,oDlgEdit?oDlgCtrlEdit:oCtrlEdit)) return 'Save Changes';
    return 'Make Changes';
  }

/**
 * @ngdoc
 * @name tri.servCRUD#dirtyClass
 * @methodOf tri.servCRUD
 *
 *
 * @description
 *
 * The `canSave` function is called which ensures the object is deemed 'dirty' and that the validation
 * returns `true` (both the standard validation looking for required fields and any optional validation specified in the `Table`
 * `validate` function pointer.  if `true` the text 'c-action' is returned.
 * If not the text 'c-quiet' is retuned.  This latter value typically caused the control to behave as if it is disabled.  See
 * {@link /api/tri.directive:whenActive whenActive}.
 */
  function dirtyClass() {
    var oTP = servSess.getTabProp();
    if (oTP == null) return "c-quiet";
    if (canSave(oTP,oDlgEdit?oDlgCtrlEdit:oCtrlEdit)) return 'c-action';
    return 'c-quiet';
  }

/**
 * @ngdoc
 * @name tri.servCRUD#inEdit
 * @methodOf tri.servCRUD
 *
 * @param {Object} oTP ignored - a left over.
 * @returns {Boolean} Returns the bInEdit current value
 *
 * @description
 * Returns whether the system {@link /api/tri.controller:ctrlCommEdit Edit Controller} is active.
 *
 */
  function inEdit()      {  return bInEdit; }
/**
 * @ngdoc
 * @name tri.servCRUD#getEditType
 * @methodOf tri.servCRUD
 *
 * @param {Object} oTP ignored - a left over.
 * @returns {string} Returns whether the edit mode is 'Edit' or 'Create'
 *
 * @description
 * Returns whether the edit mode is 'Edit' or 'Create'. This mode is set by either `editRecord` or `makeRecord' respectively.
 *
 */
  function getEditType() {  return sEditType; }

/**
 * @ngdoc
 * @name tri.servCRUD#editRecord
 * @methodOf tri.servCRUD
 *
 * @param {Object} oaa The <b>O</b>bject <b>A</b>ccess <b>A</b>ddress. A string or number determining the required record.  See {@link /guide/records Record Storage} for a description of `oaa`.
 *
 *
 * @description
 * 'Edit' mode is entered and the standard {@link /api/tri.controller:ctrlCommEdit Edit Controller} is activated.
 * The {@link /api/tri.servSess#getTabProp servSess.getTabProp} provides the `Table` environment which if null causes the
 * request to be ignored.
 *
 * If {@link /api/tri.servCRUD#setDlgEdit servCRUD.setDlgEdit} has been callled with non-null parameters the Dialog mode will be activated.
 *
 * A copy of the {@link /guide/data Data Object} to be edited is made either using the `angular.copy` function or
 * by calling the `getEditRecordExit` function specified in the `Table` definition.
 *
 * If specified in the `Table` defintion the `primeEdit` function is called with the copy of the {@link /guide/data Data Object}.
 *
 * A copy of the {@link /guide/data Data Object} being edited is made for change detection.
 */
  function editRecord(oaa) {
    var oTP = servSess.getTabProp();
    if (oTP == null) return;
    log("editRecord TP=%o oaa=%s",oTP,oaa);
    bInEdit = true;
    nEditIX = oaa;
    sEditType = 'Edit';
    if (oTP.getEditRecordExit) {
      oObjEdit = oTP.getEditRecordExit(oaa);
    } else {
      oObjEdit = angular.copy(getObj(oTP,oaa));
    }
    invokeEditor(oTP);
  }

/**
 * @ngdoc
 * @name tri.servCRUD#makeRecord
 * @methodOf tri.servCRUD
 *
 * @description
 * 'Create' mode is entered and the standard {@link /api/tri.controller:ctrlCommEdit Edit Controller} is activated.
 * The {@link /api/tri.servSess#getTabProp servSess.getTabProp} provides the `Table` environment which if null causes the
 * request to be ignored.
 *
 * A new {@link /guide/data Data Object} is created and the `getNextTag` function is called to get the next `tag` property in the object.
 * The `tag` assigned is the maximum found in the object collection plus 1.

 *
 * If specified in the `Table` defintion the `createExit` function is called with the new {@link /guide/data Data Object}.
 * If the `createExit` function does not return a `true condition` the `editCancel` routine is called.
 *
 * If specified in the `Table` defintion the `primeEdit` function is called with the new {@link /guide/data Data Object}.
 *
 * A copy of the {@link /guide/data Data Object} being edited is made for change detection.
 */
  function makeRecord() {
    var oTP = servSess.getTabProp();
    if (oTP == null) return;
    bInEdit = true;
    nEditIX = null;
    sEditType = 'Create';
    oObjEdit = {tag:getNextTag(oTP)};
    if (oTP.createExit) {
      if (!oTP.createExit(oObjEdit)) {
        editCancel(oTP);
        return;
      }
    }
    invokeEditor(oTP);
  }

  function invokeEditor(oTP) {
    if (oTP.primeEdit) oObjEdit = oTP.primeEdit(oDlgEdit?oDlgCtrlEdit:oCtrlEdit,oTP,oObjEdit);
    oObjCopy = angular.copy(oObjEdit);
    var oCE = null;
    if (oDlgEdit != null) { //EC3B22 - allow Dlg Mode. Assume Jquery, JqueryUI loaded
      var sTitle = 'dlgRenderExit not defined';
      oDlgEdit.oTP = oTP;
      oDlgEdit.oDlg = $("#dlg-editor");
      oDlgEdit.finals = [];
      oDlgEdit.cansave = false;
      oDlgEdit.oDlg.dialog({ autoOpen: false, modal:true, dialogClass: "ui-editor"
        ,title:'EDIT: '+sTitle
        ,width:oDlgEdit.width, height:oDlgEdit.width, resizable:false
        ,buttons: [{text:'Save',click:dlgSaveRecord,id:'but-save',disabled:true},{text:"Cancel Edit",click:dlgEditCancel,id:'but-cancel'}]
      });
      oDlgEdit.oDlg.dialog("open");
      oDlgEdit.oBut = $('.ui-dialog #but-save');
      if (oTP.dlgRenderExit) oTP.dlgRenderExit(oDlgEdit,oObjEdit,sEditType);
      oCE = oDlgCtrlEdit;
    } else {
      oCE = oCtrlEdit;
    }
    if (oCE) {
      oCE.oObj = oObjEdit;
      oCE.sEditErr = null;
    }
  }

  function dlgCanSave(bCanSave) {
    if (!oDlgEdit)      return bCanSave;
    if (!oDlgEdit.oBut) return bCanSave;
    if (oDlgEdit.cansave == bCanSave) return bCanSave;
    oDlgEdit.cansave = bCanSave;
    if (bCanSave) {
      oDlgEdit.oBut.button('enable');
    } else {
      oDlgEdit.oBut.button('disable');
    }
    return bCanSave;
  }

  function dlgSaveRecord(what) {
    if (!oDlgEdit) return;
    log("Dialog save record %o %s",what,oDlgEdit.cansave);
    if (!oDlgEdit.cansave) return;
    oDlgEdit.oTP.recServ.insertRec(oDlgEdit.oTP,oObjEdit,nEditIX);
    bInEdit = false;
    nEditIX = null;
    sEditType = null;
    oObjEdit = null;
    oObjCopy = null;
    if (oDlgCtrlEdit) {
      oDlgCtrlEdit.oObj = null;
      oDlgCtrlEdit.sEditErr = null;
    }
    dlgCleanup();
    $rootScope.$digest();
  }

  function dlgCleanup() {
    for(var i=0,iMax=oDlgEdit.finals.length; i<iMax; i+=1) {
      oDlgEdit.finals[i]();
    }
    oDlgEdit.oDlg.dialog("close");
    oDlgEdit.oDlg = null;
  }


  function dlgEditCancel(what) {
    log("Dialog edit cancel %o",what);
    editCancel();
    if (!bInEdit) {
      dlgCleanup();
    }
  }


  function getNextTag(oTP) {
    var oRecs = getObjs(oTP);
    var nTag = 0;
    for(var sVar in oRecs) {
      var oRec = oRecs[sVar];
      var tag = +oRec.tag;
      if (tag > nTag) nTag = tag;
    }
    return nTag + 1;
  }


/**
 * @ngdoc
 * @name tri.servCRUD#editCancel
 * @methodOf tri.servCRUD
 *
 * @description
 * The current 'Edit' or 'Create' activity is canceled and the standard {@link /api/tri.controller:ctrlCommEdit Edit Controller} is made dormant.
 * `oTP` is resolved using
 * the {@link /api/tri.servSess#getTabProp servSess.getTabProp} returned value. If `oTP` is still null the request is ignored.
 *
 * If the {@link /guide/data Data Object} is deemed 'dirty' the User is asked to confirm about the loss of the changes.
 *
 * <b>Note:</b> For operations where intermediate results are saved the cancel operation will only revert back to the
 * last intermediate save operation.
 */
  function editCancel(oTP) {
    oTP = servSess.getTabProp();
    if (oTP == null) return;
    if (isDirty()) {
      if (!confirm('Press OK if you are willing to lose changes to '+oTP.recName+' record')) return;
    }
    bInEdit = false;
    nEditIX = null;
    sEditType = null;
    oObjEdit = null;
    oObjCopy = null;
    var oCE = oDlgEdit?oDlgCtrlEdit:oCtrlEdit;
    if (oCE) {
      oCE.oObj = null;
      oCE.sEditErr = null;
    }
  }

/**
 * @ngdoc
 * @name tri.servCRUD#editSave
 * @methodOf tri.servCRUD
 *
 * @param {scope} $scope of caller, usually the {@link /api/tri.controller:ctrlCommEdit Edit Controller}
 *
 *
 * @description
 * The current 'Edit' or 'Create' activity is saved and the standard {@link /api/tri.controller:ctrlCommEdit Edit Controller} is made dormant.
 * `oTP` is resolved using
 * the {@link /api/tri.servSess#getTabProp servSess.getTabProp} returned value. If `oTP` is still null the request is ignored.
 *
 * Before the save takes place the `canSave` function is called which ensures the object is deemed 'dirty' and that the validation
 * returns `true` (both the standard validation looking for required fields and any optional validation specified in the `Table`
 * `validate` function pointer.  If not the operation is ignored except for the warning fields the validation cycle might create.
 */

  function editSave(scope) {
    var oTP = servSess.getTabProp();
    if (oTP == null) return;
    log("editSave scope=%o, TP=%o, oObjEdit=%o",scope,oTP,oObjEdit);
    if (!canSave(oTP,scope)) return;
    oTP.recServ.insertRec(oTP,oObjEdit,nEditIX);
    bInEdit = false;
    nEditIX = null;
    sEditType = null;
    oObjEdit = null;
    oObjCopy = null;
    var oCE = oDlgEdit?oDlgCtrlEdit:oCtrlEdit;
    if (oCE) {
      oCE.oObj = null;
      oCE.sEditErr = null;
    }
  }

/**
 * @ngdoc
 * @name tri.servCRUD#dropRecord
 * @methodOf tri.servCRUD
 *
 * @param {Object} oaa The <b>O</b>bject <b>A</b>ccess <b>A</b>ddress. A string or number determining the required record.  See {@link /guide/records Record Storage} for a description of `oaa`.
 *
 * @description
 * The User is asked to confirm deletion of the {@link /guide/data Data Object} as this action is irreversible.
 * The {@link /api/tri.servSess#getTabProp servSess.getTabProp} provides the `Table` environment which if null causes the
 * request to be ignored.
 *
 * If confirmed the {@link /guide/data Data Object} is removed from localStorage and the server storage.
 *
 * Special processing is invoked when dealing with {@link /guide/sandbox Sandboxed Data}.
 */
  function dropRecord(oaa) {
    log("Drop record "+oaa);
    if (!confirm('Press OK if you wish to remove record from the system.\r\nThis action is not reversible.')) return;
    var oTP = servSess.getTabProp();
    if (oTP == null) return;
    var oT = oTP.statTbl;
    var oObj = getObj(oTP,oaa);
    if (!oObj) return;
    log("Drop record oaa=%s oTP=%o tbl=%o obj=%o",oaa,oTP,oT,oObj);
    if (oT.type == "table") {
      dropTableRecord(oT,oTP,oObj,oaa);
    } else {
      dropRecordRecord(oTP,oObj,oaa);
    }
  }

 function dropRecordRecord(oTP,oObj,oaa) {
    var oNew;
    if (oTP.oChunks) {
      var nChunk = oTP.oChunks.length - 1; // Use last for new records.  Assume samller for now. Otherwise build new chunk
      var oRecs = null;
      var sParts = oaa.split('.');
      nChunk = +sParts[0];
      var oChunk = oTP.oChunks[nChunk];
      oNew = removeObj(oTP.oChunks[nChunk].oObjs,oObj,nChunk);
      oTP.oChunks[nChunk].oObjs = oNew;
      //oTP.recServ.saveRecords(oTP,oNew,oChunk.ls,oChunk.ls,true);
      oTP.recServ.saveRecords(oTP,oNew,oChunk.ls,oTP.lsName,true);
    } else {
      oNew = removeObj(oTP.oObjs,oObj,null);
      oTP.oObjs = oNew;
      var sFileKey = oTP.recName;
      if (oTP.fileKey) sFileKey = oTP.fileKey();
      oTP.recServ.saveRecords(oTP,oNew,sFileKey,oTP.lsName,true);
    }
    log("dropped oaa="+oaa+" from "+oTP.recName);
    //refreshSignal(oTP);
  }

  function dropTableRecord(oT,oTP,oObj,oaa) {
    if (servSess.isSandboxMode()) {
      servSess.setConfirmMsg("Record dropped in sandbox");
      var sParts = oTP.oCRUD.getAppStatKey();
      var sCache = "."+sParts[2]+oTP.lsName+"-cache";
      var oCache = null;
      if (localStorage[sCache]) oCache = JSON.parse(localStorage[sCache]);
      log("sandbox drop oTP=%o obj=%o oaa=%s cache=%o",oTP,oObj,oaa,oCache);
      if (oCache) {
        delete oCache.map[oObj.name];
        localStorage[sCache] = angular.toJson(oCache);
        log("cacheUpdated cache=%o oTP.cache=%o obj=%o",oCache,{objs:oTP.oCache},oObj);
        delete oTP.oCache;
        oTP.oCRUD.refreshTableCache(true);
        oTP.oCRUD.getObjs(oTP);
        oTP.oPrevSel = null;
        oTP.cycle = ""+(new Date()).getMilliseconds();
      }
    } else {
      servGAE.dropObj(oObj,goodDrop,failedDrop);
    }
    function goodDrop(status,data)   {
      servSess.setConfirmMsg("Record drop successful");
      if (oT.lsName == null) {
        var oTbl = servREG.findTable(oT.name);
        refreshNonCachedTable(oT,oTbl,oTP);
      } else {
        servGAE.issueFindFile(oTP.recType,"%",
          function(status,data) {
            log("drop/find good stat=%o data=%o",status,data);
            var oData = {DataStat:{RECORD:data.RESULT.RECORD}};
            oTP.oCRUD.syncLocalData(null,servGAE.getToken(),oData);
          }
          ,function(status,data){
            log("find failed stat=%o data=%o",status,data);
          }
        );
      }
      return;
    }

    function failedDrop(status,data) {
      servSess.setErrorMsg("Record drop failed:"+data['status-message']);
      return;
    }
  }

  function isDirty() {
    if (!oObjEdit) return false;
    if (!oObjCopy) return false;
    return !angular.equals(oObjEdit,oObjCopy);
  }

  function canSave(oTP,scope) {
    if (!validate(oTP,scope)) return dlgCanSave(false);
    if (!isDirty()) return dlgCanSave(false);
    return dlgCanSave(true);
  }

  function validate(oTP,scope) {
    oCtrlEdit.sEditErr = null;
    if (oDlgCtrlEdit) oDlgCtrlEdit.sEditErr = null;
    if (!oObjEdit) return true;
    if (!oTP) return true;
    if (oTP.validate) return oTP.validate(scope,oObjEdit,oObjCopy,validateStd,editError);
    return validateStd(oTP);
  }

  function validateStd(oTP) {
    for(var sVar in oTP.cols) {
      var oCol= oTP.cols[sVar];
      //log("validate col "+oCol.col);
      if (typeof oCol.col == 'function') continue;
      if (oCol.type == 'list') continue;
      if (oCol.type == 'actions') continue;
      if (oCol.type == 'action') continue;
      var bData = true;
      if (!(oCol.col in oObjEdit) || (oObjEdit[oCol.col] == null) || (oObjEdit[oCol.col].length === 0)) bData = false;
      if (!('reqd' in oCol) || (oCol.reqd)) {
        if (!(oCol.col in oObjEdit) || (oObjEdit[oCol.col] == null)) return editError("Field '"+oCol.col+"' required");
        var nMin = 0;
        if (angular.isNumber(oCol.reqd)) nMin = oCol.reqd;
        if (oObjEdit[oCol.col].length <= nMin) return editError("Required field '"+oCol.col+"' blank or too short");
      }
      if (('many' in oCol) && (!oCol.many)) {
        if (bData) {
          if (isDuplicate(oTP,oObjEdit,oCol)) return editError("Duplicate value for field '"+oCol.col+"'");
        }
      }
      if (('mask' in oCol) && bData) {
        var oMask = new RegExp(oCol.mask);
        if (oObjEdit[oCol.col].match(oMask) == null) return editError("Wrong data format in field '"+oCol.col+"'");
      }
      if (('type' in oCol) && (oCol.type == 'property')) {
        var bOK = true;
        angular.forEach(oObjEdit[oCol.col],function(value,key) {
          if ((value == null) || (value.trim().length === 0)) {
            bOK = editError("Property '"+key+"' has no value");
          }
        });
        if (!bOK) return false;
      }
    }
    return true;
  }

  function isDuplicate(oTP,oRec,oCol) {
    var sCol = oCol.col;
    if (!(sCol in oRec)) return false;
    var oRecs = getObjs(oTP);
    var sFld = ""+oRec[sCol];
    if (!('case' in oCol) || (oCol.case)) {
      sFld = sFld.toUpperCase();
    }
    for(var sVar in oRecs) {
      var oObj = oRecs[sVar];
      if (oRec.oaa == oObj.oaa) continue;
      var sStr = oObj[sCol];
      if ((sStr === undefined) || (sStr === null)) sStr = "";
      if (!('trim' in oCol) || (oCol.trim)) sStr = sStr.trim(); //incase fld is not trimmed
      if (!('case' in oCol) || (oCol.case)) sStr = sStr.toUpperCase();
      if (sStr === sFld) return true;
    }
    return false;
  }


  function editError(sErrMsg) {
    oCtrlEdit.sEditErr = sErrMsg;
    if (oDlgCtrlEdit) oDlgCtrlEdit.sEditErr = sErrMsg;
    return false;
  }

/**
 * @ngdoc
 * @name tri.servCRUD#getObj
 * @methodOf tri.servCRUD
 *
 * @param {Object} oTP The `oTbl` `props` value
 * @param {Object} oaa The <b>O</b>bject <b>A</b>ccess <b>A</b>ddress. A string or number determining the required record.  See {@link /guide/records Record Storage} for a description of `oaa`.
 *
 * @returns {Object} the {@link /guide/data Data Object} addressed by `oaa`
 *
 * @description
 * Returns the addressed object from the `oTP` object cache. If `oTP` is null `oTP` is resolved using
 * the {@link /api/tri.servSess#getTabProp servSess.getTabProp} returned value. If `oTP` is still null a `null` is returned.
 *
 *
 */
  function getObj(oTP,oaa) {
    if (!oTP) oTP = servSess.getTabProp();
    if (!oTP) return null;
    if (typeof oaa == 'string') { //assume chunked table
      var sParts = oaa.split('.');
      return (oTP.oChunks[sParts[0]]).oObjs[sParts[1]];
    } else {
      return oTP.oObjs[oaa];
    }
  }

/**
 * @ngdoc
 * @name tri.servCRUD#getObjs
 * @methodOf tri.servCRUD
 *
 * @param {Object} oTP The `oTbl` `props` value
 *
 * @returns {Object[]} the {@link /guide/data Data Object} collection.
 *
 * @description
 * Returns the {@link /guide/data Data Object} collection for the specified `Table`.
 *
 * Each {@link /guide/data Data Object} is assigned the `oaa` value prior to sorting but after merging all the chunked data.
 * Refer to {@link /guide/records Record Storage} for a description of `oaa` and a description of chunked data.
 *
 * If the `order`  is specified in the
 * `Table` definition the rows are sorted in that sequence.
 *
 * Since this function is called many times during a $digest cycle the returned set is cached.  The $digest routines add a $$hash marker
 * so that the cached value is known to be valid.
 *
 */
  function getObjs(oTP) {
    var sVar, oRec;
    if (!oTP) oTP = servSess.getTabProp();
    if (!oTP) return [];
    if (oTP.oCache) return oTP.oCache;
    oTP.oCache =  [];
    if (oTP.oChunks) { // chunked table
      log("getChunks "+oTP.oChunks.length+" "+oTP.recTitle);
      for(var i in oTP.oChunks) {
        var oChunk = oTP.oChunks[i];
        for(sVar in oChunk.oObjs) {
          if ((typeof sVar == 'string') && (sVar.charAt(0) == '$')) continue;
          oRec = oChunk.oObjs[sVar];
          oRec.oaa = ""+i+"."+sVar;
          oTP.oCache.push(oRec);
        }
      }
    } else {           // simple table
      for(sVar in oTP.oObjs) {
        if ((typeof sVar == 'string') && (sVar.charAt(0) == '$')) continue;
        oRec = oTP.oObjs[sVar];
        oRec.oaa = +sVar;
        oTP.oCache.push(oRec);
      }
    }
    if (oTP.order) {
      var xCol = null;
      var bReverse = false;
      if (angular.isString(oTP.order)) {
        xCol = oTP.order;
      } else if (angular.isFunction(oTP.order)) {
        xCol = oTP.order;
      } else {
        xCol = oTP.order.col;
        bReverse = ("reverse" == oTP.order.seq);
        log("using reverse sort "+xCol+" "+oTP.order.seq+" "+(typeof oTP.order));
      }
      var oCol = findCol(oTP,xCol);
      if (oCol) {
        var s1 = null;
        var s2 = null;
        oTP.oCache.sort(function(a,b) {
          if (typeof oCol.col == 'function') {
            s1 = oCol.col(a).toUpperCase();
            s2 = oCol.col(b).toUpperCase();
          } else {
            s1 = (""+a[oCol.col]).toUpperCase();
            s2 = (""+b[oCol.col]).toUpperCase();
          }
          if (bReverse) {
            if (s1 < s2) return 1;
            if (s1 == s2) return 0;
            return -1;
          } else {
            if (s1 < s2) return -1;
            if (s1 == s2) return 0;
            return 1;
          }
        });
      } else {
        log("Sort col %s not found %o",xCol,oTP);
      }
    }
    return oTP.oCache;
  }

  function findCol(oTP,sCol) {
    for(var i in oTP.cols) {
      var oCol = oTP.cols[i];
      if (oCol.col === sCol) return oCol;
    }
    return null;
  }


}]);

// Session management
/**
 * @ngdoc service
 * @name tri.servSess
 *
 * @description
 * Provides app session management based on the user login status.  It is the single service that maintains overall application context.
 *
 * Its functionality includes:
 *
 * * User inactivity timeout functions.
 * * User authorization validation functions
 * * Current  `Table` context management
 * * Menu function utilities
 * * Miscellaneous utility functions
 *
 * The {@link /api/tri.controller:ctrlCommEdit Edit Controller} and {@link /api/tri.controller:ctrlCommList List Controller} often reflect function calls in their
 * scope to the matching calls in `servSess`.
 */
/**
 * @ngdoc
 * @name tri.servSess#setCRUD
 * @methodOf tri.servSess
 *
 * @param {Object} crud Pointer to `servCRUD`.
 *
 * @description
 * Sets the `servSess` `oCRUD` pointer to crud so the `servSess` has access to the common `servCRUD` routines.  Required to prevent circular definitions.
 */
/**
 * @ngdoc
 * @name tri.servSess#hasSession
 * @methodOf tri.servSess
 *
 * @returns {Boolean} bSession status
 *
 * @description
 * Returns whether a valid session exists.  ie.  The User is properly logged in and validated.
 */
/**
 * @ngdoc
 * @name tri.servSess#getErrorMsg
 * @methodOf tri.servSess
 *
 * @returns {string} Returns the current `sErrorMsg` value
 *
 * @description
 * Acts as a convenient way to store contextual error conditions that can be presented to the user.
 */
/**
 * @ngdoc
 * @name tri.servSess#setErrorMsg
 * @methodOf tri.servSess
 *
 * @param {string} msg value to store in `sErrorMsg`
 *
 * @description
 * Works in partnership with {@link /api/tri.servSess#getErrorMsg getErrorMsg}.
 */
/**
 * @ngdoc
 * @name tri.servSess#setLogonExit
 * @methodOf tri.servSess
 *
 * @param {Function} logonexit value to store in `oLogonExit`
 *
 * @description
 * The `oLogonExit` is called at the completion of a user `login' if it is not null.
 * It is used for example to add menu options based on a User's profile information.
 * See Chq.js in the Apps application as an example of how this facility is used.
 */
/**
 * @ngdoc
 * @name tri.servSess#setBootExit
 * @methodOf tri.servSess
 *
 * @param {Function} bootexit value to store in `oBootExit`
 *
 * @description
 * The `oBootExit` is called during the **Triangular** application startup.
 * It allows modification of the system environment before too much happens.  It is used by
 * `TriBoot.js` to use a special ajax API to determine whether the Datastore is primed.
 */
/**
 * @ngdoc
 * @name tri.servSess#getBootExit
 * @methodOf tri.servSess
 *
 * @returns {Function} The value stored with {@link /api/tri.servSess#setBootExit servSess.setBootExit}
 *
 * @description
 * returns the value stored with {@link /api/tri.servSess#setBootExit servSess.setBootExit}
 *
 */
/**
 * @ngdoc
/**
 * @ngdoc
 * @name tri.servSess#getListCtrl
 * @methodOf tri.servSess
 *
 * @returns {Object} The standard or replacement {@link /api/tri.controller:ctrlCommList List Controller} used to list the current `Table`.
 *
 * @description
 * Gets the current {@link /api/tri.controller:ctrlCommList List Controller} for the current selected `Table` (see {@link /api/tri.servSess#useTable useTable}. In actuality this is the $scope pointer
 * for the {@link /api/tri.controller:ctrlCommList List Controller} which is set with the `hookListListener` function.
 *
 */
/**
 * @ngdoc
 * @name tri.servSess#getConfirmMsg
 * @methodOf tri.servSess
 *
 * @returns {string} Returns the current `sConfirmMsg` value
 *
 * @description
 * Acts as a convenient way to store contextual status that confirms to the User that
 * an operation has completed (such as `changePassword`)
 */
/**
 * @ngdoc
 * @name tri.servSess#setConfirmMsg
 * @methodOf tri.servSess
 *
 * @param {string} msg value to store in `sConfirmMsg`
 *
 * @description
 * Works in partnership with {@link /api/tri.servSess#getConfirmMsg getConfirmMsg}.
 */
/**
 * @ngdoc
 * @name tri.servSess#getProfile
 * @methodOf tri.servSess
 *
 * @returns {Object} User profile (properties object)
 *
 * @description
 * Returns the User profile information set with the {@link /api/tri.servSess#setSession setSession} method call.
 */
/**
 * @ngdoc
 * @name tri.servSess#setUser
 * @methodOf tri.servSess
 *
 * @param {string} sDbl 'DOUBLE' or 'SINGLE' depending on login mode. See {@link /api/tri.servGAE#login login}.
 * @param {string} user Userid sets `sUser`
 * @param {string} user2 Userid2 or null sets `sUser2`
 *
 * @description
 * Sets the current user(s) names environment
 */
/**
 * @ngdoc
 * @name tri.servSess#getUser
 * @methodOf tri.servSess
 *
 * @returns {string} `sUser` value
 *
 * @description
 * Returns the current `sUser` value set with {@link /api/tri.servSess#setUser setUser} method call
 */
/**
 * @ngdoc
 * @name tri.servSess#getUser2
 * @methodOf tri.servSess
 *
 * @returns {string} `sUser2` value
 *
 * @description
 * Returns the current `sUser2` value set with {@link /api/tri.servSess#setUser setUser} method call
 */
/**
 * @ngdoc
 * @name tri.servSess#isDouble
 * @methodOf tri.servSess
 *
 * @returns {Boolean} whether `sDouble` value equals 'DOUBLE'
 *
 * @description
 * Tests the current `sDouble` value set with {@link /api/tri.servSess#setUser setUser} method call
 */
/**
 * @ngdoc
 * @name tri.servSess#isPrtApp
 * @methodOf tri.servSess
 *
 * @returns {Boolean} `bPrtApp` setting
 *
 * @description
 * appears to be obsolete
 */
/**
 * @ngdoc
 * @name tri.servSess#getToken
 * @methodOf tri.servSess
 *
 *
 * @returns {string} The token value returned from the `login` function
 *
 * @description
 *
 * Returns the value set with `setToken`. See {@link /guide/server-inter Server Interface}
 * for more details on this value.
 */
/**
 * @ngdoc
 * @name tri.servSess#setToken
 * @methodOf tri.servSess
 *
 *
 * @param {string} tok The token value returned from the `login` function
 *
 * @description
 *
 * Sets the internal `sToken` value used to validate all server requests. See {@link /guide/server-inter Server Interface}
 * for more details on this value.
 */
/**
 * @ngdoc
 * @name tri.servSess#getSect
 * @methodOf tri.servSess
 *
 *
 * @returns {string} The `sSect` value set with {@link /api/tri.servSess#setSect setSect}
 *
 * @description
 *
 * Returns the `sSect` value set with {@link /api/tri.servSess#setSect setSect}.
 */
/**
 * @ngdoc
 * @name tri.servSess#isSect
 * @methodOf tri.servSess
 *
 *
 * @param {string} sect The section value to comapre `sSect` with.
 * @returns {Boolean} The `sSect` value matches `sect`
 *
 * @description
 *
 * Tests whether we are in a particular section.  Used to hide/show HTML sections within the HTML code.
 */
/**
 * @ngdoc
 * @name tri.servSess#getTabServ
 * @methodOf tri.servSess
 *
 *
 * @returns {Object} The `oTAB` value set with {@link /api/tri.servSess#setSect setSect}
 *
 * @description
 *
 * Returns the `oTAB` value set with {@link /api/tri.servSess#setSect setSect}.
 */
/**
 * @ngdoc
 * @name tri.servSess#setOptMenuItems
 * @methodOf tri.servSess
 *
 *
 * @param {Object[]} list An array objcts used to insert Menu items into the left side menu.
 *
 * @description
 *
 * This function is used to insert Menu items into into the left side menu.  Each {Object} in list
 * is formatted with the following properties:
 *
 *
 *
 *  <span style='display:inline-block; width:100px; margin-left:10px;'>`menu`</span><i>(string} Text to show in menu</i><br>
 *  <span style='display:inline-block; width:100px; margin-left:10px;'>`func`</span><i>{Function} name to call</i><br>
 *  <span style='display:inline-block; width:100px; margin-left:10px;'>`role`</span><i>{string} role string</i>
 */
/**
 * @ngdoc
 * @name tri.servSess#getOptMenuItems
 * @methodOf tri.servSess
 *
 *
 * @returns {Object[]} The array set with {@link /api/tri.servSess#setOptMenuItems setOptMenuItems}
 *
 * @description
 *
 * Returns fhe array set with {@link /api/tri.servSess#setOptMenuItems setOptMenuItems}. Refer there for format details.
 */
/**
 * @ngdoc
 * @name tri.servSess#setTitle
 * @methodOf tri.servSess
 *
 *
 * @param {string} title The value to set
 *
 * @description
 *
 * Sets the value of `sTitle` to `title`. Refer also to {@link /api/tri.servSess#getTitle servSess.getTitle}
 */
/**
 * @ngdoc
 * @name tri.servSess#setDevpMode
 * @methodOf tri.servSess
 *
 *
 * @description
 * Sets the value of `bDevpMode` to `true`
 *
 * Marks the system as 'development mode' which may activate certain functions such as detailed logging.
 */
/**
 * @ngdoc
 * @name tri.servSess#setStatus
 * @methodOf tri.servSess
 *
 * @param {Object} stat Status value(s) to set
 *
 *
 * @description
 * Sets the internal `oStat` to `status`
 *
 * This is used during system initialization to synchronize the localStorage cache and the server
 * database.
 */
/**
 * @ngdoc
 * @name tri.servSess#getStatus
 * @methodOf tri.servSess
 *
 * @returns {Object} Status value(s) previously set with {@link /api/tri.servSess#setStatus setStatus}
 *
 *
 * @returns {Object} Status value(s) previously set with {@link /api/tri.servSess#setStatus setStatus}
 *
 * @description
 * This is used during system initialization to synchronize the localStorage cache and the server
 * database.
 */
/**
 * @ngdoc
 * @name tri.servSess#getIdleSecs
 * @methodOf tri.servSess
 *
 * @returns {number} current value of `nIdleSecs`
 *
 * @description
 * This is used as part of the user inactivity timeout functionality.
 * It returns the number of seconds the user has had no browser activity.
 */
/**
 * @ngdoc
 * @name tri.servSess#hookIdleListener
 * @methodOf tri.servSess
 *
 * @param {Object} ctrl The controller that handles the  timout functionality.
 *
 * @description
 * Sets the `oIdleListener` to `ctrl`.
 * In actuality this is the $scope pointer for the controller.
 *
 * In practice the {@link /api/tri.controller:ctrlMenu Menu Controller} is used to handle the timout functionaity.  It has to handle 2 functions that are called
 * by a timer event handler.
 *
 * * `pulse` - called every second
 * * `autoLogoff` - called when `nIdleSecs` exceeds `nIdleMax`.
 *
 * Refer also to {@link /api/tri.servSess#getIdleSecs getIdleSecs} and {@link /api/tri.servSess#getIdleLeft getIdleLeft}
 *
 */
/**
 * @ngdoc
 * @name tri.servSess#hookListListener
 * @methodOf tri.servSess
 *
 * @param {Object} ctrl The standard or replacement {@link /api/tri.controller:ctrlCommList List Controller} used to list the current `Table` {@link /guide/data Data Object}s.
 *
 * @description
 * Sets the `oListListener` to `ctrl`, the current {@link /api/tri.controller:ctrlCommList List Controller}.
 * In actuality this is the $scope pointer for the {@link /api/tri.controller:ctrlCommList List Controller}.
 *
 */
/**
 * @ngdoc
 * @name tri.servSess#hookMenuListener
 * @methodOf tri.servSess
 *
 * @param {Object} ctrl The standard or replacement {@link /api/tri.controller:ctrlMenu Menu Controller}.
 *
 * @description
 * Sets the `oMenuListener` to `ctrl`, the current {@link /api/tri.controller:ctrlMenu Menu Controller}.
 * In actuality this is the $scope pointer for the {@link /api/tri.controller:ctrlMenu Menu Controller}.
 *
 */
oApp.factory('servSess',['servREC','servGAE','servREG','servConfig',function(servREC,servGAE,servREG,servConfig) {        // --------------- Session service
  var bSession       = false;
  var bDevpMode      = false;
  var sTitle         = "to be defined";
  var sErrorMsg      = null;
  var sConfirmMsg    = null;
  var sToken         = null;
  var oPrtChq        = null;
  var oLogonExit     = null;
  var oBootExit      = null;
  var oProf          = null;
  var sDouble        = null; // Login mode
  var sUser          = null;
  var sUser2         = null; // for double login
  var sSect          = null;
  var oTAB           = null;
  var oOptMenuItems  = [];
  var nIdleSecs      = 0;
  var nIdleMax       = 65;
  var oIdleListener  = null;
  var oListListener  = null;
  var nClear         = null;
  var oStatus        = null; // App Status Block
  var oCRUD          = null;   //bi-directional link to servCRUD

  var oFuncs = {};
  oFuncs.setCRUD             = function(crud)                {oCRUD = crud;};
  oFuncs.hasSession          = function()                    {return bSession;};
  oFuncs.canChangePassword   = function()                    {return canChangePassword();};
  oFuncs.setSession          = function(bSess,oP)            {setSession(bSess,oP);};
  oFuncs.getErrorMsg         = function()                    {return sErrorMsg;};
  oFuncs.setErrorMsg         = function(msg)                 {sErrorMsg = msg;};
  oFuncs.setLogonExit        = function(logonexit)           {oLogonExit = logonexit;};
  oFuncs.setBootExit         = function(bootexit)            {oBootExit = bootexit;};
  oFuncs.getBootExit         = function()                    {return oBootExit;};
  oFuncs.getListCtrl         = function()                    {return oListListener;};
  oFuncs.getConfirmMsg       = function()                    {return sConfirmMsg;};
  oFuncs.setConfirmMsg       = function(msg)                 {sConfirmMsg = msg;};
  oFuncs.getProfile          = function()                    {return oProf;};
  oFuncs.setUser             = function(sDbl,user,user2)     {sDouble = sDbl; sUser = user; sUser2 = user2;};
  oFuncs.getUser             = function()                    {return sUser;};
  oFuncs.getUser2            = function()                    {return sUser2;};
  oFuncs.isDouble            = function()                    {return (sDouble == 'DOUBLE');};
  oFuncs.isSandboxMode       = function()                    {return isSandboxMode();};
  oFuncs.isAdmin             = function()                    {return isAdmin();};
  oFuncs.isRole              = function(sRole)               {return isRole(sRole);};
  oFuncs.isPrtApp            = function()                    {return bPrtApp;};
  oFuncs.getToken            = function()                    {return sToken;};
  oFuncs.setToken            = function(tok)                 {sToken = tok;};
  oFuncs.getSect             = function()                    {return sSect;};
  oFuncs.getTabServ          = function()                    {return oTAB;};
  oFuncs.setSect             = function(sect,tabdef)         {setSect(sect,tabdef);};
  oFuncs.isSect              = function(sect)                {return sSect == sect;};
  oFuncs.setOptMenuItems     = function(list)                {oOptMenuItems = list;};
  oFuncs.getOptMenuItems     = function()                    {return getOptMenuItems();};
  oFuncs.getTitle            = function()                    {return getTitle();};
  oFuncs.getSandboxMsg       = function()                    {return getSandboxMsg();};
  oFuncs.setTitle            = function(title)               {sTitle = title;};
  oFuncs.setDevpMode         = function()                    {bDevpMode = true;};
  oFuncs.setStatus           = function(stat)                {oStatus = stat;};
  oFuncs.getStatus           = function()                    {return oStatus;};
  oFuncs.xfrAdminApp         = function(sApp,sTbls)          {xfrAdminApp(sApp,sTbls);};
  oFuncs.createFormWindow    = function(pref,hand,page,form) {createFormWindow(pref,hand,page,form);};
  oFuncs.maskReduce          = function(oObjs,sMask,sFld)    {return maskReduce(oObjs,sMask,sFld);};

  // common CRUD support interface
  oFuncs.getTabProp          = function()                    {return getTabProp();};
  oFuncs.useTable            = function(scope,table,sel)     {return useTable(scope,table,sel);};

  oFuncs.getIdleSecs         = function()                    {return nIdleSecs;};
  oFuncs.getIdleLeft         = function()                    {return getIdleLeft();};
  oFuncs.hookIdleListener    = function(ctrl)                {oIdleListener = ctrl;};
  oFuncs.hookListListener    = function(ctrl)                {oListListener = ctrl;};
  oFuncs.hookMenuListener    = function(ctrl)                {oMenuListener = ctrl;};

  return oFuncs;

/**
 * @ngdoc
 * @name tri.servSess#setSession
 * @methodOf tri.servSess
 *
 * @param {Boolean} bSess Whether session is valid (login OK) or invalid (logoff or timeout)
 * @param {Object} oP User profile data (properties array from the server for the logged in User)
 *
 * @description
 * Sets `bSession` to `bSess` and `oProf` to `oP`.  Used to signal whether a session exists or not.
 *
 * If the `oLogonExit` is non-null it is called with `oP` as the parameter.
 */
  function setSession(bSess,oP) {
    bSession = bSess;
    oProf = oP;
    if (oP) log("setSession Profile",oProf);
    if (bSess) {
      if (getAutoLogSecs() > 0) {
        initTimeOutManager();
        nIdleMax = getAutoLogSecs();
      } else {
        log("AutoLogoff disabled for "+sUser);
      }
    } else {
      if (nClear != null) {
        window.clearInterval(nClear);
        nClear = null;
      }
    }
    if (oLogonExit) oLogonExit(oProf);
  }

  function initTimeOutManager() {
    document.onclick     = function() {haveActivity();};
    document.onmousemove = function() {haveActivity();};
    document.onkeypress  = function() {haveActivity();};
    nClear = window.setInterval(checkIdleTime,1000);

    function haveActivity() {
      if (bSession && (nIdleSecs > 120)) {  // Activity after 2 mins idle
        nIdleSecs = 0;
        revalidateToken();
      }
      nIdleSecs = 0;
    }
  }

  function revalidateToken() {
    var sToken = null;
    if (localStorage['.user-token']) sToken = localStorage['.user-token'];
    if (sToken == null) return;
    servGAE.validateToken(sUser,sToken,good,fail);
    function good(status,data) {
      log("revalidate succeeded");
    }
    function fail(status,data) {
      log("revalidate failed");
      if (oIdleListener) oIdleListener.autoLogoff();
    }
  }


  function checkIdleTime() {
    nIdleSecs += 1;
    //log("idle "+nIdleSecs+" max="+nIdleMax);
    if (oIdleListener) {
      if (nIdleMax && (nIdleSecs > nIdleMax)) oIdleListener.autoLogoff();
      if (nIdleMax && (nIdleSecs > (nIdleMax-60))) oIdleListener.pulse();
      if (nIdleSecs == 1) oIdleListener.pulse(); // to refesh after warning
    }
  }

/**
 * @ngdoc
 * @name tri.servSess#canChangePassword
 * @methodOf tri.servSess
 *
 * @returns {Boolean} `true` if can change password.
 *
 * @description
 * If a double login exists or we are in {@link /guide/sandbox Sandbox Mode} the password cannot be changed (false).
 * Otherwise it can (true).
 *
 * Refer to {@link /api/tri.servGAE#login login} for more details about the double login.
 */
  function canChangePassword() {
    if (isSandboxMode()) return false;
    if (!bSession) return false;
    if ((sUser2 != sUser) && sUser2) return false;
    return true;
  }


/**
 * @ngdoc
 * @name tri.servSess#getIdleLeft
 * @methodOf tri.servSess
 *
 * @returns {number} number of seconds left before a timeout occurs.
 *
 * @description
 * Returns the number of seconds left before a timeout occurs. This is calculated
 * by subtracting `nIdleSecs` from the `nIdleMax` value (determined by the User profile)
 *
 * If the User does not timeout a `null` is returned.
 *
 * If there are no seconds left a value of 0 is returned.
 *
 */
  function getIdleLeft() {
    if (nIdleMax && (nIdleSecs > nIdleMax)) return 0;
    if (nIdleMax && (nIdleSecs >= (nIdleMax-60))) {
      var nRet = nIdleMax - nIdleSecs;
      if ((nRet == 59) || (nRet == 20)) {
        var oAudio = document.getElementById("audio-alert");
        if (oAudio) oAudio.play();
      }
      return nRet;
    }
    return null;
  }


/**
 * @ngdoc
 * @name tri.servSess#xfrAdminApp
 * @methodOf tri.servSess
 *
 * @param {string} sApp Application ID to login under
 * @param {string[]} sTbls List of Tables the Adnin App should add to its menu.
 *
 * @description
 * Transfers to the `Admin.htm` page.  It leaves a breadcrumb so that the Admin.htm application
 * can return.
 *
 */
  function xfrAdminApp(sApp,sTbls) {
    if (oCRUD.inEdit()) return;
    var sURL = ""+window.location;
    var nIX = sURL.indexOf("/apps");
    localStorage._admin_app_return = sURL.substring(nIX);
    var sNewURL = sURL.substring(0,nIX)+"/apps/tri/Admin.htm?cust="+sApp;
    if (sTbls) {
      var sSep = "&tables=";
      for(var i=0,iMax=sTbls.length; i<iMax; i+=1) {
        sNewURL += sSep + sTbls[i];
        sSep = ';';
      }
    }
    log("XAF "+sURL+" new="+sNewURL);
    window.location = sNewURL;
  }

/**
 * @ngdoc
 * @name tri.servSess#createFormWindow
 * @methodOf tri.servSess
 *
 * @param {string} sPref message prefix for oHandler
 * @param {string} oHandler custom message handler
 * @param {string} sPage current page name
 * @param {string} sForm Form page name
 *
 * @description
 * * Registers the `oHandler` in {@link /api/tri.property:oGBL oGBL} with a prefix of `sPref`
 * * Creates the new URL substituting `sForm` for `sPage` in the current URL
 * * Opens a window with that new URL
 *
 */
  function createFormWindow(sPref,oHandler,sPage,sForm) {
    oGBL.msgHandler[sPref] = oHandler;
    var sLocn = ""+window.location;
    sLocn = sLocn.replace(sPage,sForm);
    sLocn = sLocn.replace(/#/,"");
    var sFormID = sForm;
    var nIX = sForm.indexOf(".");
    if (nIX > 0) sFormID = sForm.substring(0,nIX);
    log("locn="+sLocn+" form="+sFormID);
    window.open(sLocn,sFormID+"-NewTab");
  }


/**
 * @ngdoc
 * @name tri.servSess#getTitle
 * @methodOf tri.servSess
 *
 * @returns {string} `sTitle` value plus conditional prefix.
 *
 * @description
 * Returns the `sTitle` set with {@link /api/tri.servSess#setTitle setTitle}.
 *
 * It {@link /api/tri.servConfig#getSite servConfig.getSite} returns a value this is prefixed to `sTitle` before returning the value.
 *
 * If the `bDevpMode` is set with
 * {@link /api/tri.servSess#setDevpMode setDevpMode} then a 'd:' prefix is added to the returned value
 * to easily differentiate between production and develepment where many broswer windows or tabs might be open.
 *
 * This call also updates the DOM title value.
 */
  function getTitle() {
    var sStr = sTitle || "no-app-title";
    var sSite = null;
    if (servConfig.getSite) sSite = servConfig.getSite();
    if (sSite) sStr = sSite + " - " + sStr;
    if (bDevpMode) sStr = "d:"+sStr;
    document.title = sStr;
    //log("getTitle "+sStr+" servConfig %o",servConfig);
    return sStr;
  }


/**
 * @ngdoc
 * @name tri.servSess#getSandboxMsg
 * @methodOf tri.servSess
 *
 * @returns {String} The computed value
 *
 * @description
 * returns an empty string if {@link /api/tri.servSess#isSandboxMode servSess.isSandboxMode} is false or
 *
 *`***Sandbox mode: no updates applied to server***`
 *
 * if {@link /api/tri.servSess#isSandboxMode servSess.isSandboxMode} is true
 *
 * This is used to add to the standard application title.
 *
 */
  function getSandboxMsg() {
    if (isSandboxMode())  return "***Sandbox mode: no updates applied to server***";
    return "";
  }


  function getOptMenuItems() {
    var oList = [];
    for(var i=0,max=oOptMenuItems.length;i < max;i += 1) {
      var oMenu = oOptMenuItems[i];
      if (!oMenu.role) {
        oList.push(oMenu);
      } else {
        var sRole  = "";
        if (oProf && oProf.role) sRole = oProf.role;
        if (sRole.indexOf(oMenu.role) >= 0) {
          oList.push(oMenu);
        } else {
          if (oMenu.sandbox && isSandboxMode()) oList.push(oMenu);
        }
      }
    }
    return oList;
  }

/**
 * @ngdoc
 * @name tri.servSess#useTable
 * @methodOf tri.servSess
 *
 * @returns {Object} The current dynamic {@link /api/tri.object.Table Table} object.
 *
 * @param {Object} scope current caller scope
 * @param {string} sTable table name (title) to find
 * @param {Object} sel previous/default selection (filter) context
 *
 * @description
 * This function is pivitol in setting the Triangular current `Table` context. It sets the internal
 * `oTAB` variable.
 *
 * If `sTable` is null the `scope` parameter value is assigned to the existing `oTAB` object `scope` value.
 *
   * If `sTable` is not null an attempt to match `sTable` against the `recTitle` value in the  array of registered tables (see {@link /api/tri.servREG#registerTable registerTable}) is made.
 * if sucessful a new dynamic {@link /api/tri.object.Table Table} object is created from the static copy and assigned to `oTAB`.  If a match is not made `oTAB` is set to null.
 *
 * If `oTAB` at this point is null a return of `null` is made.
 *
 * The `scope.oSel` value is updated with the existing `oTAB.props.oSel` value.  A copy is preserved in the static copy so that settings and values are remembered
 * across `Table` changes.
 *
 * The the `oTAB.props.primeList` function exists it is called.
 */
  function useTable(scope,sTable,sel) {
    if (sTable) {
      var oTabs = servREG.getTables();
      for(var i=0,iMax=oTabs.length; i<iMax; i+=1) {
        var oTD = oTabs[i];
        //log("Try "+sTable+" == "+oTD.getTabProp().recTitle);
        if (oTD.getTabProp().recTitle == sTable) {
          //log("Found "+sTable+" i="+i);
          var oTab = new Table(oTD,scope,oCRUD);
          if ((oTab.props.oSel) && (sel)) {
            scope[sel] = oTab.props.oSel;
            log("use defined Table sel="+sel+" scope="+scope.$id,scope[sel]);
          }
          return oTab;
        }
      }
      return null;
    }
    if (oTAB == null) return null;
    oTAB.scope = scope;
    if (oTAB.props.oSel) {
      scope.oSel = oTAB.props.oSel;
    }
    if (oTAB.props.primeList) {
      oTAB.props.primeList(oTAB.scope,oTAB.props);
    }
    log("use current Table %s oTP=%o oSel=%o scope=%s",oTAB.props.recTitle,oTAB.props,scope.oSel,scope.$id);
    return oTAB;
  }

/**
 * @ngdoc
 * @name tri.servSess#getTabProp
 * @methodOf tri.servSess
 *
 * @returns {Object} Properties object of current (`oTAB`) object.
 * `oTAB` is set to null.
 * @description
 * This returns the properties `props` object of current dynamic {@link /api/tri.object.Table Table} object.
 *
 * if `oTAB` is null, null is returned.
 *
 * See {@link /api/tri.servSess#setSect setSect} and {@link /api/tri.servSess#useTable useTable} for how `oTAB` receives a value.
 */
  function getTabProp() {
    if (!oTAB) return null;
    var oTP = oTAB.props;
    return oTP;
  }


/**
 * @ngdoc
 * @name tri.servSess#setSect
 * @methodOf tri.servSess
 *
 *
 * @param {string} sect The section name in the HTML file that should be made active.
 * @param {Object} tabdef The {@link /guide/table Static Table} object or null that should be made the 'current' `Table`.
 *
 * @description
 *
 * This is the primary means by which the HTML page sections are made visible or hidden.
 *
 * If `tabdef` is not null a new dynamic {@link /api/tri.object.Table Table} is created and assigned to the internal variable `oTAB`.
 *
 * If hooks to the {@link /api/tri.controller:ctrlCommList List Controller} and {@link /api/tri.controller:ctrlCommEdit Edit Controller} exist the `oTAB` property within them is nullified.
 *
 * See the related methods {@link /api/tri.servSess#getSect getSect} and {@link /api/tri.servSess#isSect isSect}.
 */
  function setSect(sect,tabdef) {
    if (oCRUD.inEdit()) return;
    sSect = sect;
    if (tabdef) {
      oTAB = new Table(tabdef,null,oCRUD);
    } else {
      oTAB = null;
    }
    if (oTAB != null) {
      log("setSection sect=%s tab=%s props=%o",sect,oTAB.props.recTitle,oTAB.props);
    }
    if (oListListener) oListListener.oTAB = null;
    var oCtrlEdit = oCRUD.getCtrlEdit(true);
    if (oCtrlEdit) {
      oCtrlEdit.oTAB = null;
      log("editScope oTAB nulled "+oCtrlEdit.$id);
    }

  }

/**
 * @ngdoc
 * @name tri.servSess#isAdmin
 * @methodOf tri.servSess
 *
 * @returns {Boolean} whether the 'role' property of the User profile contains the string 'admin'
 *
 * @description
 * Tests whether the current user is an administrator
 */
  function isAdmin() {
    return isRole("admin");
  }

/**
 * @ngdoc
 * @name tri.servSess#isRole
 * @methodOf tri.servSess
 *
 * @param {string} sRole value to test for
 *
 * @returns {Boolean} whether the 'role' property of the User profile contains the string `sRole`
 *
 * @description
 * Tests whether the current user has a specific role
 */
  function isRole(sRole) {
    if (oProf == null) return false;
    if (!oProf.role) return false;
    if (oProf.role.indexOf(sRole) >= 0) return true;
    return false;
  }

/**
 * @ngdoc
 * @name tri.servSess#isSandboxMode
 * @methodOf tri.servSess
 *
 * @returns {Boolean} `true` if the user profile has a property of `sandbox=true`
 *
 * @description
 * returns whether we are in {@link /guide/sandbox SandBox Mode} as determined by the user profile record.
 *
 */
  function isSandboxMode() {
    if (oProf == null) return false;
    if (!oProf.sandbox) return false;
    if (oProf.sandbox == 'true') return true;
    return false;
  }


  function getAutoLogSecs() {
    if (oProf == null) return 300;
    if (!oProf.autolog)  return 300;
    return +(oProf.autolog);
  }

/**
 * @ngdoc
 * @name tri.servSess#maskReduce
 * @methodOf tri.servSess
 *
 * @returns {Object[]} reduced object set
 *
 * @param {Object[]} oObjs input object set
 * @param {string} sMask String used as input to `new RegExp(sMask,'i')` to obtain the test pattern
 * @param {string} sFld Field in each `oObjs` object to test with the pattern
 * @description
 * returns a new object set where every object in the set matches the pattern produced with `sMask`
 *
 */
  function maskReduce(oObjs,sMask,sFld) {
    if (sMask.trim() === '') return oObjs;
    var oNew = [];
    var oMask = new RegExp(sMask,"i");
    for(var i=0,iMax=oObjs.length; i<iMax; i+=1) {
      var oObj = oObjs[i];
      if (oObj[sFld] && ((""+oObj[sFld]).match(oMask) != null)) {
        oNew.push(oObj);
      }
    }
    return oNew;
  }



}]);

/**
 * @ngdoc service
 * @name tri.servGAE
 *
 * @description
 * `servGAE` provides the interface to its counterpart on the server which presently is the Google App Engine.
 * The datastore and security services are described in {@link /guide/server-inter Server Interface}.
 *
 * Should it be necessary to replace interface there are 2 strategies that should work:
 *
 * 1. Replace the methods in this service by
 * those that exhibit the same signatures and functionality.  Behind the scenes a totally different interface could be used.
 *
 * 2. Replace the interface on the server that takes the same JSON interface requests and that returns the same JSON
 * object constructs.  Where more in depth datails are required than given in this document the logging function
 * could be used on the Apps system to get use cases for each type of request.
 *
 */
/**
 * @ngdoc
 * @name tri.servGAE#setURL
 * @methodOf tri.servGAE
 *
 *
 * @param {string} url The URL where the server is located.  This icludes the 'ajax.ajax' method flags required
 * by the present server inplementation.
 *
 * The prefix of the `url` passed to this routine is obtained from startup routines. Either the static reference used to load the system is used
 * or if a 'file//:' is detected
 * it defaults to localHost:8884.  The latter is used in a development environment.
 *
 *
 * @description
 *
 * Sets the internal URL used to access the AJAX services in the server.
 */
/**
 * @ngdoc
 * @name tri.servGAE#getURL
 * @methodOf tri.servGAE
 *
 *
 * @returns {string} the value set with {@link /api/tri.servGAE#setURL servGAE.setURL}
 *
 * @description
 *
 * returns the value set with {@link /api/tri.servGAE#setURL servGAE.setURL}
 */
/**
 * @ngdoc
 * @name tri.servGAE#getURL
 * @methodOf tri.servGAE
 *
 *
 * @returns {string} url The URL to access the server AJAX services.
 *
 * @description
 *
 * Returns the internal URL used to access the AJAX services in the server and established with `setURL`.
 */
/**
 * @ngdoc
 * @name tri.servGAE#setCust
 * @methodOf tri.servGAE
 *
 *
 * @param {string} cust The customer (application) name
 *
 * @description
 *
 * Sets the internal `sCust` value used as the 1st part of the multi-part key. See {@link /guide/server-inter Server Interface}
 * for more details on this value.
 */
/**
 * @ngdoc
 * @name tri.servGAE#getCust
 * @methodOf tri.servGAE
 *
 *
 * @returns {string} The customer (application) name
 *
 * @description
 *
 * Returns the value set with `setCust`. See {@link /guide/server-inter Server Interface}
 * for more details on this value.
 */
/**
 * @ngdoc
 * @name tri.servGAE#setToken
 * @methodOf tri.servGAE
 *
 *
 * @param {string} token The token value returned from the `login` function
 *
 * @description
 *
 * Sets the internal `sToken` value used to validate all server requests. See {@link /guide/server-inter Server Interface}
 * for more details on this value.
 */
/**
 * @ngdoc
 * @name tri.servGAE#getToken
 * @methodOf tri.servGAE
 *
 *
 * @returns {string} The token value returned from the `login` function
 *
 * @description
 *
 * Returns the value set with `setToken`. See {@link /guide/server-inter Server Interface}
 * for more details on this value.
 */
oApp.factory('servGAE',['$http','servREG',function($http,servREG) { // GAE Access service
  var sURL     = null;
  var sCust    = null;
  var sUser    = null;
  var sToken   = null;
  var nAjaxID  = 100;

  var oFuncs = {};
  oFuncs.setURL         = function(url)                          {sURL = url; log("AjaxURL:"+sURL);};
  oFuncs.getURL         = function()                             {return sURL;};
  oFuncs.setCust        = function(cust)                         {sCust = cust;};
  oFuncs.getCust        = function()                             {return sCust;};
  oFuncs.setToken       = function(token)                        {sToken = token; localStorage['.user-token'] = token;};
  oFuncs.getToken       = function()                             {return sToken;};
  oFuncs.login          = function(xUser,sPW,fOK,fFail)          {login(xUser,sPW,fOK,fFail);};
  oFuncs.validateToken  = function(user,token,fOK,fFail)         {validateToken(user,token,fOK,fFail);};
  oFuncs.getKeyData     = function(sType,sKey,fOK,fFail)         {getKeyData(sType,sKey,fOK,fFail);};
  oFuncs.putKeyData     = function(sType,sKey,sStr,fOK,fFail)    {putKeyData(sType,sKey,sStr,fOK,fFail);};
  oFuncs.issueFindFile  = function(sRecType,sRecKey,fOK,fFail)   {issueFindFile(sRecType,sRecKey,fOK,fFail);};
  oFuncs.changePassword = function(sOld,sNew,fOK,fFail)          {changePassword(sOld,sNew,fOK,fFail);};
  oFuncs.sendReminder   = function(sUser,fOK,fFail)              {sendReminder(sUser,fOK,fFail);};
  oFuncs.dropObj        = function(oObj,fOK,fFail)               {dropObj(oObj,fOK,fFail);};
  oFuncs.validateStore  = function(fOK,fFail)                    {validateStore(fOK,fFail);};
  oFuncs.primeStore     = function(sUser,sPW,fOK,fFail)          {primeStore(sUser,sPW,fOK,fFail);};
  oFuncs.superLogin     = function(sUser,sPW,fOK,fFail)          {superLogin(sUser,sPW,fOK,fFail);};
  oFuncs.addAdminUser   = function(oNew,sUser,sPW,fOK,fFail)     {addAdminUser(oNew,sUser,sPW,fOK,fFail);};
  oFuncs.listApps       = function(sUser,sPW,fOK,fFail)          {listApps(sUser,sPW,fOK,fFail);};
  return oFuncs;

/**
 * @ngdoc
 * @name tri.servGAE#validateToken
 * @methodOf tri.servGAE
 *
 * @param {string} user Userid (first in double login context)
 * @param {string} token from previous login
 * @param {Function} fOK callback routine for successful validation
 * @param {Function} fFail callback routine for failed validation
 *
 * @description
 * The `login` function stores the returned server token in localStorage. When a browser revisits the site hosting the Triangular application
 * the localStorage is checked for a copy of the token.  If found, `validateToken` function establishes whether the token is still valid.
 * The more common reasons for failure include:
 *
 * * There was a user inactivity timeout
 * * The User logged on to the site from a different machine
 * * The previous session ended with a logout
 *
 *
 * See {@link /guide/server-inter Server Interface} for more details on this process.
 *
 * If the validation process fails on the server an indication as to why is returned in the JSON response.
 *
 */
  function validateToken(user,token,fOK,fFail) {
    sUser  = user;
    sToken = token;
    var oJO = formatGemsReq("ValidateToken");
    log("ValidateToken %o",oJO);
    issueAjaxRequest(oJO,fOK,fFail);
  }

/**
 * @ngdoc
 * @name tri.servGAE#validateStore
 * @methodOf tri.servGAE
 *
 * @param {Function} fOK callback routine for successful validation
 * @param {Function} fFail callback routine for failed validation
 *
 * @description
 * Tests whether the Datastore is primed using the {@link /guide/server-inter#superusercommandset SuperUser Command Set.ajaxValidateStore}.
 */
  function validateStore(fOK,fFail) {
    var oJO = formatGemsReq("ValidateStore");
    log("ValidateStore %o",oJO);
    issueAjaxRequest(oJO,fOK,fFail);
  }

/**
 * @ngdoc
 * @name tri.servGAE#primeStore
 * @methodOf tri.servGAE
 *
 * @param {String} sUser SuperUser ID
 * @param {String} sPW SuperUser password
 * @param {Function} fOK callback routine for successful operation
 * @param {Function} fFail callback routine for failed operation
 *
 * @description
 * Primes the Datastore using the {@link /guide/server-inter#superusercommandset SuperUser Command Set.ajaxPrimeStore}.
 *
 * The {@link /guide/user#superuser SuperUser} record built uses the provided `sUser` and `sPW`
 */
  function primeStore(sUser,sPW,fOK,fFail) {
    var oJO = formatGemsReq("PrimeStore");
    log("PrimeStore %o",oJO);
    oJO.EXEC.auth.user = sUser;
    oJO.EXEC.auth.password = sPW;
    log("PrimeStore %o",oJO);
    issueAjaxRequest(oJO,fOK,fFail);
  }

/**
 * @ngdoc
 * @name tri.servGAE#superLogin
 * @methodOf tri.servGAE
 *
 * @param {String} sUser SuperUser ID
 * @param {String} sPW SuperUser password
 * @param {Function} fOK callback routine for successful match
 * @param {Function} fFail callback routine for failed match
 *
 * @description
 * Tests whether the `sUser` and `sPW` match that of the {@link /guide/user#superuser SuperUser} record.  It
 * uses the {@link /guide/server-inter#superusercommandset SuperUser Command Set.ajaxSuperLogin} to perform this test.
 */
  function superLogin(sUser,sPW,fOK,fFail) {
    var oJO = formatGemsReq("SuperLogin");
    oJO.EXEC.auth.user = sUser;
    oJO.EXEC.auth.password = sPW;
    log("SuperLogin %o",oJO);
    issueAjaxRequest(oJO,fOK,fFail);
  }

/**
 * @ngdoc
 * @name tri.servGAE#addAdminUser
 * @methodOf tri.servGAE
 *
 * @param {Object} oNew Object containing `AppID`, `User` and `NewPassword` properties.
 * @param {String} sUser SuperUser ID
 * @param {String} sPW SuperUser password
 * @param {Function} fOK callback routine for successful match
 * @param {Function} fFail callback routine for failed match
 *
 * @description
 * Tests whether the `sUser` and `sPW` match that of the {@link /guide/user#superuser SuperUser} record.
 *
 * It matched an {@link /guide/user#adminuser AdminUser} record is created. The `oNew` properties `User` and `NewPassword` are used
 * for the {@link /guide/user#adminuser AdminUser} properties.  It is created for app ID `oNew.AppID`
 *
 * It uses the {@link /guide/server-inter#superusercommandset SuperUser Command Set.ajaxAddAdminUser} to accomplish this.
 *
 */
  function addAdminUser(oNew,sUser,sPW,fOK,fFail) {
    var oJO = formatGemsReq("AddAdminUser");
    oJO.EXEC.auth.cust = sCust;
    oJO.EXEC.auth.user = sUser;
    oJO.EXEC.auth.password = sPW;
    oJO.EXEC.payload = oNew;
    log("AddAdminUser %o",oJO);
    issueAjaxRequest(oJO,fOK,fFail);
  }

/**
 * @ngdoc
 * @name tri.servGAE#listApps
 * @methodOf tri.servGAE
 *
 * @param {String} sUser SuperUser ID
 * @param {String} sPW SuperUser password
 * @param {Function} fOK callback routine for successful match and list
 * @param {Function} fFail callback routine for failed match and list
 *
 * @description
 * Tests whether the `sUser` and `sPW` match that of the {@link /guide/user#superuser SuperUser} record.
 *
 * It matched a list of the applications is returned in the response object.
 *
 * It uses the {@link /guide/server-inter#superusercommandset SuperUser Command Set.ajaxListApps} to accomplish this.
 *
 */
  function listApps(sUser,sPW,fOK,fFail) {
    var oJO = formatGemsReq("ListApps");
    oJO.EXEC.auth.user = sUser;
    oJO.EXEC.auth.password = sPW;
    log("ListApps %o",oJO);
    issueAjaxRequest(oJO,fOK,fFail);
  }

/**
 * @ngdoc
 * @name tri.servGAE#login
 * @methodOf tri.servGAE
 *
 * @param {Object} xUser Userid(s)
 * @param {string} sPW password
 * @param {Function} fOK callback routine for successful login
 * @param {Function} fFail callback routine for failed login
 *
 * @description
 * The `login` function establishes the User credentials and returns a token that is used for all requests
 * See {@link /guide/server-inter Server Interface} for more details on this process.
 *
 * The system supports a 2 person login, internally referred to as a double login.  This requirement is usually triggered
 * by using the template system to alter 'SINGLE' to 'DOUBLE'. See Deps.js in the Apps system.  Its use case is where donation money is counted
 * and two persons must be present.
 *
 * The double login requirement is conveyed to the server by xUser being an Object rather than a string.  The object contains
 * the string properties `user`, `password1`, `user2` and `password2`.
 *
 * If the validation process fails on the server an indication as to why is returned in the JSON response.
 *
 */
  function login(xUser,sPW,fOK,fFail) {
    sUser = xUser;
    var sUser2 = null;
    if (angular.isObject(xUser)) {// double person signon
      sUser = xUser.user1;
      sPW   = xUser.password1;
    }
    log("trying HTTP request user="+sUser+" cust="+sCust+" type="+(typeof xUser));
    localStorage['.user'] = sUser;
    localStorage['.user2'] = null;
    var oJO = formatGemsReq("Login",sPW);
    if (angular.isObject(xUser)) {
      sUser2 = xUser.user2;
      oJO.EXEC.auth.user2 = xUser.user2;
      oJO.EXEC.auth.password2 = xUser.password2;
      localStorage['.user2'] = xUser.user2;
    }
    log("login request %o",oJO);
    issueAjaxRequest(oJO,fOK,fFail);
  }

/**
 * @ngdoc
 * @name tri.servGAE#getKeyData
 * @methodOf tri.servGAE
 *
 * @param {string} sType The record type
 * @param {string} sKey The key name
 * @param {Function} fOK callback routine for successful retrieval
 * @param {Function} fFail callback routine for failed  retrieval
 *
 * @description
 * The `getKeyData` function retrieves a record ('TBL' mode) or group of records ('REC" mode) from server in JSON format.
 *
 * The key used to actually address the required data is constructed on the server from 3 parts each separated by a '/'.
 *
 * 1. The cust (application) ans established with {@link /api/tri.servGAE#setCust setCust}
 * 2. The sType value
 * 3. The sKey value
 *
 *
 * See {@link /guide/server-inter Server Interface} for more details on this process.
 *
 * If the retrieval process fails on the server an indication as to why is returned in the JSON response.
 *
 */
  function getKeyData(sType,sKey,fOK,fFail) {
    var oJO = formatGemsReq("ReadCitaData",sType,sKey);
    issueAjaxRead(oJO,fOK,fFail);
  }

  // This function valid only for singletons
/**
 * @ngdoc
 * @name tri.servGAE#dropObj
 * @methodOf tri.servGAE
 *
 * @param {Object} oObj The {@link /guide/data Data Object} previously retrieved.
 * @param {Function} fOK callback routine for successful retrieval
 * @param {Function} fFail callback routine for failed  retrieval
 *
 * @description
 * The `dropObj` function is ued to remove 'TBL' mode records from the system.  It is not valid for 'REC' mode records as it would
 * remove a whole collection of records. See {@link /guide/records Record Storage}.
 *
 * The physical key (GekID) used is extracted from the `oObj` to actually address the {@link /guide/data Data Object} to be deleted.
 *
 * Once deleted the record cannot be recovered from the server.
 *
 * See {@link /guide/server-inter Server Interface} for more details on this process.
 *
 * If the `dropObj` process fails on the server an indication as to why is returned in the JSON response.
 *
 */
  function dropObj(oObj,fOK,fFail) {
    var oJO = formatGemsReq("DeleteKey",null,oObj.KeyName);
    oJO.EXEC.payload.GekID = oObj.GekID;
    issueAjaxRequest(oJO,fOK,fFail);
    log("dropObj %o",oJO);
  }

/**
 * @ngdoc
 * @name tri.servGAE#putKeyData
 * @methodOf tri.servGAE
 *
 * @param {string} sType The record type
 * @param {string} sKey The key name
 * @param {string} sStr The data to store plus control information (Stringized JSON object)
 * @param {Function} fOK callback routine for successful retrieval
 * @param {Function} fFail callback routine for failed  retrieval
 *
 * @description
 * The `putKeyData` function stores a record ('TBL' mode) or group of records ('REC" mode) on the server in JSON stringized format.
 *
 * When a record is retrieved the timestamp associated with the record on the server is also retrieved.  The server uses this to
 * establish whether stale data is being returned. (ie - an update from another computer happened).  In this case the operation fails.
 * In the future for 'REC' mode operations the server will attempt to update the individual data object if there is no conflict.
 *
 * The key used to actually address the required data is constructed on the server from 3 parts each separated by a '/'.
 *
 * 1. The cust (application) ans established with {@link /api/tri.servGAE#setCust setCust}
 * 2. The sType value
 * 3. The sKey value
 *
 *
 * See {@link /guide/server-inter Server Interface} for more details on this process.
 *
 * If the retrieval process fails on the server an indication as to why is returned in the JSON response.
 *
 */
  function putKeyData(sType,sKey,sStr,fOK,fFail) {
    var oJO = formatGemsReq("SendCitaData",sType,sKey,sStr);
    issueAjaxRequest(oJO,fOK,fFail);
  }

/**
 * @ngdoc
 * @name tri.servGAE#changePassword
 * @methodOf tri.servGAE
 *
 * @param {string} sOld The record type
 * @param {string} sNew The key name
 * @param {Function} fOK callback routine for successful update
 * @param {Function} fFail callback routine for failed update
 *
 * @description
 * The `changePassword` function changes the logged in user password to the new value.
 *
 * <b>Note:</b> Passwords must contain at least one alphabetic character to distinguish them
 * from the encrypted value stored on the server.
 *
 * See {@link /guide/server-inter Server Interface} for more details on this process.
 *
 * If the update process fails on the server an indication as to why is returned in the JSON response.
 *
 */
  function changePassword(sOld,sNew,fOK,fFail) {
    var oJO = formatGemsReq("ChangePassword",sOld,sNew);
    issueAjaxRequest(oJO,fOK,fFail);
    log("changePassword %o",oJO);
  }

/**
 * @ngdoc
 * @name tri.servGAE#sendReminder
 * @methodOf tri.servGAE
 *
 * @param {string} sUser The userid
 * @param {Function} fOK callback routine for successful process
 * @param {Function} fFail callback routine for failed process
 *
 * @description
 * The `sendReminder` function will send notification to a user using an email address found in the user profile.
 *
 * <b>Note:</b> This is not implemented at present.
 *
 * If the process fails on the server an indication as to why is returned in the JSON response.
 *
 */
  function sendReminder(sUser,sNew,fOK,fFail) {
    var oJO = formatGemsReq("SendReminder",sUser);
    issueAjaxRequest(oJO,fOK,fFail);
    log("sendReminder %o",oJO);
  }


  function issueAjaxRequest(oJO,fSuccess,fError) {
    log("AJAX.AJAX.AJAX. issue ajax request %s %o url=%s",oJO.EXEC.ajaxMeth,oJO,sURL);
    $http({method: "POST", url: sURL, data: "json="+escape_utf8(JSON.stringify(oJO)),headers:{'Content-Type':"Application/x-www-form-urlencoded;charset=UTF-8"}}).
      success(function(data, status) {
        //log("success calling "+(""+fSuccess).substring(0,30)+"...",data);
        if (data.status != "GOOD") {
          fError(status,data);
        } else {
          fSuccess(status,data);
        }
      }).
      error(function(data, status) {
        fError(status,data);
    });
  }

  function issueAjaxRead(oJO,fSuccess,fError) {
    log("AJAX.AJAX.AJAX. issue ajax read request %o",oJO);
    $http({method: "POST", url: sURL, data: "json="+escape_utf8(JSON.stringify(oJO)),headers:{'Content-Type':"Application/x-www-form-urlencoded;charset=UTF-8"}}).
      success(function(data, status) {
        //dumpObjLog(data,"read-success");
        if (data.status != "GOOD") {
          fError(status,data);
        } else {
          log("Check read %o",data);
          if (!data.RESULT.RECORD.DataFld) {
            log("missing data %o",data);
            fSuccess([]);
          } else {
            var sText = data.RESULT.RECORD.DataFld;
            sText = sText.replace(/\r/,"");
            sText = sText.replace(/\n/,"");
            var oObjs = JSON.parse(sText);
            //log("Have "+oObjs.length+" objects for "+JSON.stringify(oJO));
            fSuccess(oObjs,data.RESULT);
          }
        }
      }).
      error(function(data, status) {
        fError(status,data);
    });
  }

/**
 * @ngdoc
 * @name tri.servGAE#issueFindFile
 * @methodOf tri.servGAE
 *
 * @param {string} sType The record type. Null indicates User profile data (Admin authority required by logged in user)
 * @param {string} sRecKey The record key (suffixed with '%' to get an array of matching records).
 * @param {Function} fOK callback routine for successful retrieval
 * @param {Function} fFail callback routine for failed  retrieval
 *
 * @description
 * The `issueKeyData` function retrieves a record header or array of record headers that describe the complete record key, its update datestamp an its internal physical key (GekID).
 *
 * The key used to actually address the required data is constructed on the server from 3 parts each separated by a '/'.
 *
 * 1. The cust (application) ans established with {@link /api/tri.servGAE#setCust setCust}
 * 2. The sType value
 * 3. The sRecKey value. When Suffixed with '%', an array of matching records is returned in the response.
 *
 * It can be used to retrieve a specific record (sRecType == null) or a collection of record headers.
 *
 * See {@link /guide/server-inter Server Interface} for more details on this process.
 *
 * If the retrieval process fails on the server an indication as to why is returned in the JSON response.
 *
 */
  function issueFindFile(sRecType,sRecKey,fOK,fFail) {
    var oJO = null;
    if (sRecType) {
      oJO = formatGemsReq("FindCitaData",sRecType,sRecKey);
    } else {
      oJO = formatGemsReq("FindUserData",sRecType,sRecKey);
    }
    log("Find....Data",oJO);
    issueAjaxRequest(oJO,fOK,fFail);
  }


  function formatGemsReq(sMeth,sRecType,sRecKey,sDataFld) {
    log("formatGemsReq user="+sUser+" meth="+sMeth+" recType="+sRecType+" recKey="+sRecKey+" cust="+sCust);
    var oRec = {};
    var oAuth = {cust:sCust,user:sUser};
    if ((sMeth == 'Login') || (sMeth == 'ChangePassword')){
      oAuth.password = sRecType;
      sRecType = null;
    }
    if (sToken) oAuth.token = sToken;
    if (sRecType && sRecKey) {
      oRec.KeyName  = sCust+"/"+sRecType+"/"+sRecKey;
    }
    if (!sRecType && sRecKey) {
      if (sMeth == 'ChangePassword'){
        oRec.NewPassword  = sRecKey;
      } else {
        oRec.KeyName  = sRecKey;
      }
    }
    if(sDataFld) oRec.DataFld = sDataFld;
    var oJO = {};
    var oExec = {};
    oExec.ajaxMeth  = sMeth;
    oExec.payload   = oRec;
    oExec.auth      = oAuth;
    oJO.EXEC = oExec;
    var sAjaxID = "AngJS."+(nAjaxID++);
    oJO.AjaxID = sAjaxID;
    return oJO;
  }

}]);

/**
 * @ngdoc service
 * @name tri.servTBL
 *
 * @description
 * Specific I/O services for TBL mode tables
 *
 * Refer to {@link /guide/records Record Storage} for a description of the record modes and to
 * {@link /api/tri.servCRUD servCRUD} for the API common functions.
 */
/**
 * @ngdoc
 * @name tri.servTBL#isCombined
 * @methodOf tri.servTBL
 *
 * @returns {Boolean} Always returns `false`.
 *
 * @description
 * Returns whether the service type combines the individual JSON objects into an array for storage and retrieval.
 */
/**
 * @ngdoc
 * @name tri.servTBL#setObjs
 * @methodOf tri.servTBL
 *
 * @param {Object} oTP The `Table.props` where the object array is stored.
 * @param {Object[]} objs The array of {@link /guide/data Data Object}s to store.
 *
 * @description
 * See {@link /api/tri.servREC#setObjs servREC.setObjs} since this function processes the call.
 */
oApp.factory('servTBL',['servGAE','servREC','servREG','servSess',function(servGAE,servREC,servREG,servSess) {  // ---------- Singleton Record CRUD service (each record stored as JSON object)
  var oFuncs    = {};
  var oCurTP    = null;

  oFuncs.setObjs      = function(oTP,objs)        {servREC.setObjs(oTP,objs);};
  oFuncs.isCombined   = function(oTP)             {return false;};
  oFuncs.insertRec    = function(oTP,obj,oaa,bInter)     {insertRec(oTP,obj,oaa,bInter);};
  return oFuncs;


/**
 * @ngdoc
 * @name tri.servTBL#insertRec
 * @methodOf tri.servTBL
 *
 * @param {Object} oTP The `Table.props` cache where the object array is stored.
 * @param {Object} obj The {@link /guide/data Data Object} to insert.
 * @param {Object} oaa The <b>O</b>bject <b>A</b>ccess <b>A</b>ddress. A string or number determining the insert point.  See {@link /guide/records Record Storage} for a description of `oaa`.
 * Note that the `servTBL` mode does not support chunked data.
 * @param {Boolean} bInter When `true` the update is intermediate with more to follow.
 *
 * @description
 *  Used internally to insert a record into the {@link /guide/data Data Object} cache.  If the `oaa` is null a new {@link /guide/data Data Object} is inserted.
 *
 * When `bInter` is `true` the display updates are not invoked.
 * Used to save partial updates to a record rather than lose the whole thing should the system crash.
 */
  function insertRec(oTP,oRec,oaa,bIntermed) {
    log("insertRec TBL mode "+oTP.recTitle,oRec);
    var oSave = angular.fromJson(angular.toJson(angular.copy(oRec))); // removes $$hashKey values
    delete oSave.oaa;
    var sDataFld = null;
    if (oSave.obj) {
      sDataFld = angular.toJson(oSave.obj);
      delete oSave.obj;
    } else {
      sDataFld = angular.toJson(oRec);
    }
    log("savedCopy TBL save=%o oTP=%o"+oTP.recTitle,oSave,oTP);
    var sKeyName = oSave.KeyName;
    if (sKeyName == null) {
      var sFileKey = oTP.recName;
      if (oTP.fileKey) sFileKey = oTP.fileKey();
      sKeyName = servGAE.getCust()+"/"+oTP.recType+"/"+sFileKey;
      log("KeyName is "+sKeyName);
    }
    if (servSess.isSandboxMode()) {
      var nIX = sKeyName.lastIndexOf("/");
      var sRecName = sKeyName.substring(nIX+1);
      var sParts = oTP.oCRUD.getAppStatKey();
      var sCache = "."+sParts[2]+oTP.lsName+"-cache";
      log("update bypassed for sandboxMode key="+sKeyName+" "+sRecName+" "+sCache);
      if (localStorage[sCache]) {
        var oNew = angular.fromJson(sDataFld);
        var oCache = JSON.parse(localStorage[sCache]);
        var oObj = oNew;
        if (oTP.cacheLoadExit) oObj = oTP.cacheLoadExit(sRecName,oNew);
        log("cache %o obj=%o",oCache,oObj);
        if (!oCache.map[sRecName]) {
          oCache.map[sRecName] = {GekID:"00000000",KeyName:sKeyName,UpdateTS:0};
          oTP.oObjs.push(oObj);
        } else {
          for(var i=0,iMax=oTP.oObjs.length; i<iMax; i+=1) {
            var oO = oTP.oObjs[i];
            if (oO.name == oObj.name) {
              oTP.oObjs[i] = oObj;
              log("found obj=%o oTP.objs=%o o=%o",oObj,{array:oTP.oObjs},oO);
              break;
            }
          }
        }
        delete oTP.oCache;
        oTP.oCRUD.getObjs(oTP);
        oCache.map[sRecName].oObjs = oObj;
        localStorage[sCache] = angular.toJson(oCache);
        log("cacheUpdated cache=%o oTP.cache=%o obj=%o",oCache,{objs:oTP.oCache},oObj);
        oTP.oPrevSel = null;
        oTP.cycle = ""+(new Date()).getMilliseconds();
      }
    } else {
      servGAE.putKeyData(null,sKeyName,sDataFld,goodWrt,failWrt);
    }

    function goodWrt() {
      log("Record "+oTP.recTitle+" persisted OK intermed="+bIntermed);
      var oT = oTP.statTbl;
      if ((oT.type == 'table') && (!bIntermed))  { //intermed used to save partway thru edit. eg Deps.js
        if (oT.lsName == null) {
          var oTbl = servREG.findTable(oT.name);
          oTP.oCRUD.refreshNonCachedTable(oT,oTbl,oTP);
        } else {
          servGAE.issueFindFile(oTP.recType,"%",
            function(status,data) {
              log("find good stat=%o data=%o",status,data);
              var oData = {DataStat:{RECORD:data.RESULT.RECORD}};
              oTP.oCRUD.syncLocalData(null,servGAE.getToken(),oData);
            }
            ,function(status,data){
              log("find failed stat=%o data=%o",status,data);
            }
          );
        }
      }
    }

    function failWrt(status,data) {
      log("Record "+oTP.recTitle+" persist FAILED reason="+status,data);
      servSess.setErrorMsg("Update failed:"+data['status-message']);
    }

  }

}]);


/**
 * @ngdoc service
 * @name tri.servREC
 *
 * @description
 * Specific I/O services for REC mode tables
 *
 * This service also contains many of the common functions with `servTBL` directly accessed by the
 * support routines via the `servREC.` prefix.
 *
 * Refer to {@link /guide/records Record Storage} for a description of the record modes and to
 * {@link /api/tri.servCRUD servCRUD} for the API common functions.
 */
oApp.factory('servREC',['$rootScope','servGAE',function($rootScope,servGAE) {  // ---------- Common Record CRUD service (records stored as JSON array)
/**
 * @ngdoc
 * @name tri.servREC#setCRUD
 * @methodOf tri.servREC
 *
 * @param {Object} crud Pointer to `servCRUD`.
 *
 * @description
 * Sets the `servREC` `oCRUD` pointer to crud so the `servREC` has access to the common routines.  Required to prevent circular definitions.
 */
/**
 * @ngdoc
 * @name tri.servREC#isCombined
 * @methodOf tri.servREC
 *
 * @returns {Boolean} Always returns `true`.
 *
 * @description
 * Returns whether the service type combines the individual JSON objects into an array for storage and retrieval.
 */
/**
 * @ngdoc
 * @name tri.servREC#hookCtrlEdit
 * @methodOf tri.servREC
 *
 * @param {Object} ctrl The standard or replacement {@link /api/tri.controller:ctrlCommEdit Edit Controller} used to edit the current {@link /guide/data Data Object}.
 *
 * @description
 * Sets the current editor for the current selected {@link /guide/data Data Object}.
 *
 */
/**
 * @ngdoc
 * @name tri.servREC#getCtrlEdit
 * @methodOf tri.servREC
 *
 * @returns {Object} The standard or replacement {@link /api/tri.controller:ctrlCommEdit Edit Controller} used to edit the current {@link /guide/data Data Object}.
 *
 * @description
 * Gets the current editor for the current selected {@link /guide/data Data Object}. In actuality this is the $scope pointer
 * for the {@link /api/tri.controller:ctrlCommEdit Edit Controller}.
 *
 */

  var oCRUD     = null;   //bi-directional link to servCRUD
  var oFuncs    = {};
  var oCtrlEdit = null;

  oFuncs.setCRUD         = function(crud)               {oCRUD = crud;};
  oFuncs.isCombined      = function(oTP)                {return true;};
  oFuncs.setObjs         = function(oTP,objs)           {setObjs(oTP,objs);};
  oFuncs.addChunk        = function(oTP,objs,chunk)     {addChunk(oTP,objs,chunk);};
  oFuncs.reload          = function(oTP)                {reload(oTP);};
  oFuncs.insertRec       = function(oTP,obj,oaa,bInter)   {insertRec(oTP,obj,oaa,bInter);};
  oFuncs.saveRecords     = function(oTP,oRecs,sRecName,sLSName,bRfsh) {saveRecords(oTP,oRecs,sRecName,sLSName,bRfsh);};

  oFuncs.refreshSignal   = function(sig,oTP)            {refreshSignal(sig,oTP);};
  oFuncs.hookCtrlEdit    = function(ctrl)               {oCtrlEdit = ctrl;};
  oFuncs.getCtrlEdit     = function()                   {return oCtrlEdit;};
  oFuncs.getOptions      = function(oCol,bShort)        {return getOptions(oCol,bShort);};
  oFuncs.getModFld       = function(oCol)               {return getModFld(oCol);};
  oFuncs.getMethods      = function(oCol)               {return getMethods(oCol);};
  oFuncs.getColRows      = function(oCol)               {return getColRows(oCol);}; //obsolete?
  oFuncs.showListCol     = function(oCol)               {return showListCol(oCol);};
  oFuncs.getProperties   = function(oTP,oCol)           {return getProperties(oTP,oCol);};
  oFuncs.mapValue        = function(oObj,oCol)          {return mapValue(oObj,oCol);};
  oFuncs.findCol         = function(oTP,sCol)           {return findCol(oTP,sCol);};
  oFuncs.getTableCols    = function(scope,oTP,sType)    {return getTableCols(scope,oTP,sType);};
  oFuncs.getSubRows      = function(scope,oObj,oSchema) {return getSubRows(scope,oObj,oSchema);};
  oFuncs.getSubCols      = function(scope,schema,sType) {return getSubCols(scope,schema,sType);};
  oFuncs.addProperty     = function(oTP,oCol)           {return addProperty(oTP,oCol);};
  oFuncs.removeProperty  = function(oTP,oCol,sName)     {return removeProperty(oTP,oCol,sName);};
  return oFuncs;

/**
 * @ngdoc
 * @name tri.servREC#addProperty
 * @methodOf tri.servREC
 *
 * @param {Object} oTP The `Table.props` values where the column array is stored
 * @param {Object} oCol The dynamic {@link /api/tri.object.Col Col} object
 *
 * @description
 * Used internally.  The `oCol` type is assumed to be 'property'.  The user is prompted to
 * name a unique property within the `oCol` properties array.  When validated a key of the returned user value is created
 * of null value.  Used to create key/value pairs within a column of type 'property'.
 *
 * The validation cycle is used later to validate the value of a key/value pair.
 *
 */
  function addProperty(oTP,oCol) {
    var oObjEdit;
    if (!oCRUD.inEdit()) return;
    var sName = prompt("Enter property name");
    if (sName == null) return;
    var bLoop = true;
    while(bLoop) {
      var sAltName = null;
      oObjEdit = oCRUD.getObjEdit() || {};
      angular.forEach(oObjEdit[oCol.col],function(value,key) {
        if (sName == key) {
          sAltName = prompt("Name '"+sName+"' is not unique, try another");
          if (sAltName == null) bLoop = false;
        }
      });
      if (!bLoop) return;          // gave up on alternate
      if (sAltName == null) break; // no dups
      sName = sAltName;            //try new name
    }
    oObjEdit[oCol.col][sName] = "";
  }

/**
 * @ngdoc
 * @name tri.servREC#removeProperty
 * @methodOf tri.servREC
 *
 * @param {Object} oTP The `Table.props` values where the column array is stored
 * @param {Object} oCol The dynamic {@link /api/tri.object.Col Col} object
 * @param {string} sKey The name of the property key value.
 *
 * @description
 * Used internally.  The `oCol` type is assumed to be 'property'.  After confirming with the user through a prompt
 * the property within the `oCol` properties array of key `sKey` is removed.
 *
 * The validation cycle is used later to validate the requirements of having a key/value pair for `sKey`.
 *
 */
  function removeProperty(oTP,oCol,sName) {
    if (!oCRUD.inEdit()) return;
    var oObjEdit = oCRUD.getObjEdit() || {};
    delete oObjEdit[oCol.col][sName];
  }


/**
 * @ngdoc
 * @name tri.servREC#mapValue
 * @methodOf tri.servREC
 *
 * @param {Object} oObj The {@link /guide/data Data Object}
 * @param {Object} oCol The dynamic {@link /api/tri.object.Col Col} object
 * oCol is assumed to have the `oneOf` property which points to another `Table`
 * @returns {string} The mapped value
 *
 * @description
 * Used internally. Returns the referenced value in {@link /api/tri.object.Col Col} `oneOf` related table based on the setting of
 * the {@link /guide/data Data Object} column.
 *
 */
  function mapValue(oObj,oCol) {
    var sVal = oObj[oCol.col];
    if (typeof sVal == 'undefined') return null;
    if (sVal == 'null') return null;
    var oProp = oCol.oneOf;
    var sParts = oProp.col.split(":");
    var sCol = sParts[0];
    var oTP   = oProp.table.getTabProp();
    if (!oTP.oMaps) oTP.oMaps = {};
    if (!oTP.oMaps[sCol]) {
      var oTagMap = {};
      var oObjs = oTP.oCRUD.getObjs(oTP);
      for(var sVar in oObjs) {
        var oRec = oObjs[sVar];
        oTagMap[oRec.tag] = oRec[sCol];
      }
      oTP.oMaps[sCol] = oTagMap;
    }
    var sName = (oTP.oMaps[sCol])[sVal];
    if (!sName) sName = "?"+sVal+"?";
    return sName;
  }

/**
 * @ngdoc
 * @name tri.servREC#getProperties
 * @methodOf tri.servREC
 *
 * @param {Object} oCol The dynamic {@link /api/tri.object.Col Col} object
 *
 * @returns {string[]} An array of keys
 *
 * @description
 * Used internally. Returns an array of keys whose {@link /api/tri.object.Col Col} `type` value is 'property'
 * and whose `hide` value is not `true`.  Used in the editing of `Table` data that contains columns of type 'property' such as the User `Table`.
 *
 */
  function getProperties(oTP,oCol) {
    if (!oTP) return [];
    //log("get properties "+bInEdit+" cols="+oTP.recTitle);
    if (!oCRUD.inEdit()) return [];
    if (oCol.type != 'property') return [];
    var oNew = [];
    var sHide = "";
    if (oCol.hide) sHide = ","+oCol.hide+",";
    var oObjEdit = oCRUD.getObjEdit() || {};
    angular.forEach(oObjEdit[oCol.col],function(value,key) {
      var bUse = true;
      if (sHide.indexOf(","+key+",") >= 0) bUse = false;
      if (bUse) this.push(key);
    },oNew);
    return oNew;
  }

/**
 * @ngdoc
 * @name tri.servREC#showListCol
 * @methodOf tri.servREC
 *
 * @param {Object} oCol The dynamic {@link /api/tri.object.Col Col} object
 *
 * @returns {Boolean} `true` is returned if the column should be shown in 'list' mode.
 *
 * @description
 * Used internally. If present the `oCol` showList value is returned. Otherwise `true` is returned.
 *
 */
  function showListCol(oCol) {
    if (!('showList' in oCol)) return true;
    return oCol.showList;
  }

/**
 * @ngdoc
 * @name tri.servREC#getTableCols
 * @methodOf tri.servREC
 *
 * @param {Object} scope The scope to use
 * @param {Object} oTP The `Table.props` values where the column array is stored
 * @param {string} sType The type to match against
 *
 * @returns {Object[]} The accumulated return values of the  {@link /api/tri.object.Col Col} object `select` method
 *
 * @description
 * Used internally. For each {@link /api/tri.object.Col Col} object whose type property matches the sType `col` property the
 * related `select` method is called.  The accumulated  results are returned.
 *
 */
  function getTableCols(scope,oTP,sType) {
    if (!oTP) return [];
    if (!oTP.cols) return [];
    //oTP.cols = asObjects(oTP.cols);
    return iterateCols(scope,oTP.cols,sType);
  }

/**
 * @ngdoc
 * @name tri.servREC#getSubRows
 * @methodOf tri.servREC
 *
 * @param {Object} scope The scope to use
 * @param {Object} oObj The {@link /guide/data Data Object} containing the rows.
 * @param {Object} oSchema The related sub-schema to use.
 *
 * @returns {Object[]} The rows within `oObj` of property `oSchema.base`
 *
 * @description
 * Used internally. Returns the array of {@link /guide/data Data Object} rows within `oObj` that belong to `oSchema.base`.
 * Refer to the Deps.js source code as an example.  Used to allow editing of an array of {@link /guide/data Data Object} objects
 * belonging to a single {@link /guide/data Data Object} object.
 *
 */
  function getSubRows(scope,oObj,oSchema) {
    if (!oObj) return [];
    if (!oObj[oSchema.base]) return [];
    return oObj[oSchema.base];
  }

/**
 * @ngdoc
 * @name tri.servREC#getSubCols
 * @methodOf tri.servREC
 *
 * @param {Object} scope The scope to use
 * @param {Object} schema The related sub-schema to use.
 * @param {string} sType The type to match against
 *
 * @returns {Object[]} The accumulated return values of the  {@link /api/tri.object.Col Col} object `select` method
 *
 * @description
 * Used internally. For each {@link /api/tri.object.Col Col} object whose type property matches the sType `col` property the
 * related `select` method is called.  The accumulated  results are returned.
 *
 */
  function getSubCols(scope,schema,sType) {
    if (!schema) return [];
    if (!schema.cols) return [];
    schema.cols = Col.asObjects(schema.cols);
    return iterateCols(scope,schema.cols,sType);
  }

  function iterateCols(scope,oColDefns,sType) {
    var oCols = [];
    for(var i in oColDefns) {
      var oCol = oColDefns[i];
      oCol.select(scope,oCols,sType);
    }
    return oCols;
  }


/**
 * @ngdoc
 * @name tri.servREC#getModFld
 * @methodOf tri.servREC
 *
 * @param {Object} oCol The dynamic {@link /api/tri.object.Col Col} object
 *
 * @returns {string} A 'ng-model=...' suitable for insertion into an HTML input element.
 *
 * @description
 * Used internally. Returns the model name for a given column.
 *
 */
  function getModFld(oCol) {
    return 'ng-model=oObj[' + oCol.col + ']';
  }


  function getMethods(oCol) {
    if (oCol.type != 'list') return [];
    if (!oCol.methods) return [];
    return oCol.methods;
  }

  // supected obsolete
/**
 * @ngdoc
 * @name tri.servREC#getMethods
 * @methodOf tri.servREC
 *
 * @param {Object} oCol The dynamic {@link /api/tri.object.Col Col} object
 *
 * @returns {Object[]} An array of method objects.
 *
 * @description
 * Used internally. An array of method objects used to insert into onclick attributes of dynamically built link elements. The
 * {@link /api/tri.object.Col Col} `type` attribute must be 'list' otherwise an empty list is returned.
 *
 */
  function getColRows(oCol) {
    if ('rows' in oCol) return oCol.rows;
    return '-1';
  }


/**
 * @ngdoc
 * @name tri.servREC#getOptions
 * @methodOf tri.servREC
 *
 * @param {Object} oCol The dynamic {@link /api/tri.object.Col Col} object
 * @param {Boolean} bShort If `true` the returned array will include the '--- not assigned ---' value
 *
 * @returns {Object[]} An array of objects suitable for injection into a 'select' element
 *
 * @description
 * Used internally. Given the `oCol` `oneOf` property which points to a related table will return an array of objects from that related table
 * that can be injected into a 'select' element.  Typically used to build a 'select' control with values from a related `Table` that is updated dynamically based
 * on the values stored in that `Table`.
 *
 */
  function getOptions(oCol,bShort) {
    var oProp = oCol.oneOf;
    if (!oProp) return [];
    var oTP   = oProp.table.getTabProp();
    var oRecs = oTP.oCRUD.getObjs(oTP);
    log("options count="+oRecs.length+" col="+oCol.col);
    var oOpts = [];
    var sParts = oProp.col.split(":");
    if (!bShort) {
      if (('reqd' in oCol) && (!oCol.reqd)) {
        oOpts.push({name:'--- not assigned ---',value:undefined});
      }
    }

    for(var i in oRecs) {
      var oRec = oRecs[i];
      var oOpt = {};
      oOpts.push(oOpt);
      if (sParts.length == 1){
        oOpt.name = oRec[sParts[0]];
      } else {
        if (bShort) {
          oOpt.name = oRec[sParts[0]];
          oOpt.title = oRec[sParts[1]];
        } else {
          oOpt.name = oRec[sParts[0]]+": "+oRec[sParts[1]];
        }
      }
      oOpt.value = +oRec.tag;
    }
    return oOpts;
  }


/**
 * @ngdoc
 * @name tri.servREC#addChunk
 * @methodOf tri.servREC
 *
 * @param {Object} oTP The `Table.props` where the object array is store.
 * @param {Object[]} objs The array of {@link /guide/data Data Object}s to store.
 * @param {number} chunk The chunk index relative to 0.
 *
 * @description
 *  Used internally for the retrieval and update methods to maintain the cache of {@link /guide/data Data Object}s when they are
 *  organized as chunks. See {@link /guide/records Records Storage} to understand 'chunks'.
 */
  function addChunk(oTP,objs,nChunk) {
    oTP.oChunks[nChunk].oObjs = objs;
    refreshSignal("rs3",oTP);
    log("Loaded chunk "+nChunk+" objs="+objs.length+" ls="+oTP.oChunks[nChunk].ls);
    //localStorage[oTP.oChunks[nChunk].ls] = JSON.stringify(objs);
  }

/**
 * @ngdoc
 * @name tri.servREC#setObjs
 * @methodOf tri.servREC
 *
 * @param {Object} oTP The `Table.props` where the object array is stored.
 * @param {Object[]} objs The array of {@link /guide/data Data Object}s to store.
 *
 * @description
 *  Used internally for the retrieval and update methods to maintain the cache of {@link /guide/data Data Object}s.
 */
  function setObjs(oTP,objs) {
    oTP.oObjs = objs;
    refreshSignal("rs4",oTP);
    log("loaded "+oTP.oObjs.length+" "+oTP.recTitle+" records(s) %o lsName=%s",{array:oTP.oObjs},oTP.lsName);
    //if (oTP.lsName) localStorage[oTP.lsName] = JSON.stringify(oTP.oObjs);
  }


  function getRawValue(oObj,oCol) {
    if (oObj == null) return null;
    if (typeof oCol.col == 'function') return oCol.col(oObj);
    return oObj[oCol.col];
  }

/**
 * @ngdoc
 * @name tri.servREC#findCol
 * @methodOf tri.servREC
 *
 * @param {Object} oTP The `Table.props` values where the column array is stored
 * @param {string} sCol The column name to find
 *
 * @returns {Object} oCol The dynamic {@link /api/tri.object.Col Col} object if found or null if not found.
 *
 * @description
 * Used internally. Returns the  {@link /api/tri.object.Col Col} object whose `col` property
 * matches the `sCol` parameter.  Null is returned if not found.
 *
 */
  function findCol(oTP,sCol) {
    for(var i in oTP.cols) {
      var oCol = oTP.cols[i];
      if (oCol.col === sCol) return oCol;
    }
    return null;
  }

  function maskReduce(oTP,oObjs,oSel,oFil) {
    var oCol = findCol(oTP,oFil.field);
    if (oCol == null) return oObjs;
    var sMask = oSel[oFil.field];
    if (!sMask || (""+sMask.trim() === '')) return oObjs;
    //log("maskReduce "+oCol.title+" "+sMask);
    var oMask = new RegExp(sMask,"i");
    var oNewObjs = [];
    for(var i in oObjs) {
      var oRec = oObjs[i];
      var sFld = oCol.getValue(null,oRec);
      if ((""+sFld).match(oMask) != null) {
        oNewObjs.push(oRec);
      }
    }
    return oNewObjs;
  }

  function stateReduce(oTP,oObjs,oSel,oFil) {
    var oCol = findCol(oTP,oFil.field);
    if (!oSel[oFil.field]) return oObjs;
    var oStat = oSel[oFil.field].status;
    if (!oStat) {
      log("no status field");
      return oObjs;
    }
    if (oStat.open) return [];
    //log("status "+oStat.mode+" "+oStat.list.length+" "+oFil.field+" col="+oCol.col);
    if (oStat.list.length === 0) return oObjs;
    var oNewObjs = [];
    var oMap = {};
    for(var j in oStat.list) {
      var sVal = oStat.list[j];
      var sOptVal = oStat.tri[0].options[sVal].value;
      //log("status optval="+sOptVal+" val="+sVal+" j="+j);
      oMap[sOptVal] = true;
    }
    for(var i in oObjs) {
      var oRec = oObjs[i];
      var sFld = oRec[oFil.field];
      //log("Test "+sFld+" "+oRec.tag+" "+oRec.oaa);
      if (oStat.mode == 'INCL') {
        if (oMap[sFld]) oNewObjs.push(oRec);
      } else {
        if (!oMap[sFld]) oNewObjs.push(oRec);
      }
    }
    return oNewObjs;
  }


/**
 * @ngdoc
 * @name tri.servREC#reload
 * @methodOf tri.servREC
 *
 * @param {Object} oTP The `Table.props` cache where the object array is stored.
 *
 * @description
 *  Used internally to refresh the {@link /guide/data Data Object}s cache from the server.
 */
  function reload(oTP) {
    if (oTP.oChunks) {
      for(var i in oTP.oChunks) {
        oTP.oChunks[i].oObjs = JSON.parse(localStorage[oTP.oChunks[i].ls]);
        log("reloaded "+oTP.recTitle+" chunk i="+i+" from  "+oTP.oChunks[i].ls+" objs="+oTP.oChunks[i].oObjs.length);
      }
    } else {
      if (oTP.lsName && localStorage[oTP.lsName]) {
        oTP.oObjs = JSON.parse(localStorage[oTP.lsName]);
        log("reloaded "+oTP.oObjs.length+" "+oTP.recTitle+" records(s) %o",{array:oTP.oObjs});
      } else {
        oTP.oObjs = [];
        log("reset oObjs "+oTP.recTitle);
      }
    }
    refreshSignal("rs5",oTP);
  }

  function removeObj(oObjs,oObj,nChunk) {
    var oNew = [];
    for(var sVar in oObjs) {
      var oRec = oObjs[sVar];
      if (oRec === oObj) {
        log("Found "+oRec.tag+" "+oObj.tag+" chunk="+nChunk);
      } else {
        if (nChunk != null) {
          oRec.oaa = ""+nChunk+"."+oNew.length;
        } else {
          oRec.oaa = oNew.length;
        }
        oNew.push(oRec);
      }
    }
    return oNew;
  }

/**
 * @ngdoc
 * @name tri.servREC#insertRec
 * @methodOf tri.servREC
 *
 * @param {Object} oTP The `Table.props` cache where the object array is stored.
 * @param {Object} obj The {@link /guide/data Data Object} to insert.
 * @param {Object} oaa The <b>O</b>bject <b>A</b>ccess <b>A</b>ddress. A string or number determining the insert point.  See {@link /guide/records Record Storage} for a description of `oaa`.
 * @param {Boolean} bInter When `true` the update is intermediate with more to follow.  Therefore do not update invoke the saveRecords function.
 * Used when several objects must be updated (such as a cheque renumbering pass) before persisting.
 *
 * @description
 *  Used internally to insert a record into the {@link /guide/data Data Object} cache.  If the `oaa` is null a new {@link /guide/data Data Object} is inserted.
 *
 * When `bInter` is `true` the saveRecords function is not invoked.
 * Used when several objects must be updated (such as a cheque renumbering pass) before persisting.  Not supported in chunked mode.
 * See {@link /guide/records Record Storage} to understand 'chunks'.
 */
  function insertRec(oTP,oRec,oaa,bIntermed) {
    var oRecs;
    log("insertRec REC mode rec=%o oaa=%s oTP=%o intermed=%s",oRec,oaa,oTP,bIntermed);
    var oSave = angular.fromJson(angular.toJson(angular.copy(oRec))); // removes $$hashKey values
    if (oTP.saveRecordExit) oSave = oTP.saveRecordExit(oSave);
    log("savedCopy %o",oSave);
    if (oTP.oChunks) {
      var nChunk = oTP.oChunks.length - 1; // Use last for new records.  Assume smaller for now. Otherwise build new chunk
      oRecs = null;
      var oChunk = oTP.oChunks[nChunk];
      if (oaa != null) {
        var sParts = oaa.split('.');
        nChunk = +sParts[0];
        oChunk = oTP.oChunks[nChunk];
        oRecs = oTP.oChunks[nChunk].oObjs;
        oSave.oaa = oaa;
        oRecs[sParts[1]] = oSave;
      } else {
        oRecs = oChunk.oObjs;
        oSave.oaa = ""+nChunk+"."+oRecs.length;
        oaa = oSave.oaa;
        oRecs.push(oSave);
      }
      if (!bIntermed) saveRecords(oTP,oRecs,oChunk.ls,oTP.lsName);
    } else {
      if (!oTP.oObjs) oTP.oObjs = []; // EC3A19 assume new table never written too
      oRecs = oTP.oObjs;
      if (oaa != null) {
        oSave.oaa = oaa;
        oRecs[oaa] = oSave;
      } else {
        oSave.oaa = oRecs.length;
        oRecs.push(oSave);
      }
      var sFileKey = oTP.recName;
      if (oTP.fileKey) sFileKey = oTP.fileKey();
      if (!bIntermed) saveRecords(oTP,oRecs,sFileKey,oTP.lsName);
    }
    log("saved oaa="+oaa+" tag="+oSave.tag+" into "+oTP.recName);
    if (!bIntermed) refreshSignal("rs6",oTP);
  }

/**
 * @ngdoc
 * @name tri.servREC#saveRecords
 * @methodOf tri.servREC
 *
 * @param {Object} oTP The `Table.props` cache where the object array is stored.
 * @param {Object} oRecs The {@link /guide/data Data Object} array to insert.
 * @param {string} sRecName The record name used as the third component of the object key.
 * @param {string} sLSName The localStorage name.  Null means there is no localStorage copy such as for User records.
 * @param {Boolean} bRfsh When `true` the update is intermediate with more to follow.  Therefore do not update invoke the saveRecords function.
 * Used when several objects must be updated (such as a cheque renumbering pass) before persisting.
 *
 * @description
 *  Used internally to persist reords to the localStorage cache and the data storage on the server.
 *
 */
  function saveRecords(oTP,oRecs,sRecName,sLSName,bRefresh) {
    log("Save records %s recName=%s lsName=%s count=%i refresh=%s",oTP.recTitle,sRecName,sLSName,oRecs.length,bRefresh);
    //localStorage[sLSName] = angular.toJson(oRecs);
    var sStr = "";
    var sChar = "[";
    var oSs = angular.fromJson(angular.toJson(oRecs));
    for(var sVar in oSs) { // Write with CRLF, clean up objects
      var oRec = oSs[sVar];
      delete oRec.oaa;
      delete oRec.ix; // for old ix system leftovers
      sStr += sChar + angular.toJson(oRec);
      sChar = "\r\n,";
    }
    sStr += "]";
    if ($rootScope.isSandboxMode()) {
      var sParts = oCRUD.getAppStatKey();
      var sCache = "."+sParts[2]+sLSName+"-cache";
      if (localStorage[sCache]) {
        var oCache = JSON.parse(localStorage[sCache]);
        oCache.map[sRecName].oObjs = oRecs;
        localStorage[sCache] = angular.toJson(oCache);
        log("saveRecords sandboxMode recname=%s objs=%o lsName=%s cache=%o sLS=%s",sRecName,{array:oRecs},sLSName,oCache,sCache);
        if (bRefresh) refreshSignal("rsX",oTP);
      }
    } else {
      servGAE.putKeyData(oTP.recType,sRecName,sStr,goodWrt,failWrt);
    }

    function goodWrt(){
      log(""+oRecs.length+" record(s) on file "+oTP.recName+" persisted OK");
      if (bRefresh) {
        refreshSignal("rsD",oTP);
        setTimeout(function(){$rootScope.$digest();},0);
      }
    }
    function failWrt(){
      log(""+oRecs.length+" Record(s) on file "+oTP.recName+" persist FAILED");
   }
  }

/**
 * @ngdoc
 * @name tri.servREC#refreshSignal
 * @methodOf tri.servREC
 *
 * @param {string} sig Caller id to aid diagnostics in the log file
 * @param {Object} oTP The current `Table.props` where the cache is stored.
 *
 * @description
 * Used internally to cause updates to show correctly on the display by resetting the cache and mapped objects as well as a hidden input
 * field that display screens can create dependencies against.
 *
 */
  function refreshSignal(sSigID,oTP) {
    log("refreshSignal id=%s tbl=%s",sSigID,oTP.recTitle,oTP);
    delete oTP.oMaps;
    delete oTP.oCache;
    oTP.oPrevSel = null;
    oTP.cycle = ""+(new Date()).getMilliseconds();
  }

}]);


// ---------------------------------------------------------------------------
// ----------------------------- Controllers ---------------------------------
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
 /**
 * @ngdoc function
 * @name tri.controller:ctrlSect
 *
 * @description
 * Provides a context managment scheme to know what context the infrastructure
 * is in.  For all cases the function is forwarded to the equivalent {@link /api/tri.servSess servSess} function
 * and where appropriate the return of that function is returned.
 *
 * @param {Object} $scope The scope of the controller
 * @param {Object} servSess The {@link /api/tri.servSess servSess} service pointer
 * @param {Object} servGAE The {@link /api/tri.servGAE servGAE} service pointer
 */
/**
 * @ngdoc
 * @name tri.controller:ctrlSect#isSect
 * @methodOf tri.controller:ctrlSect
 *
 * @returns {Boolean} the value returned by {@link /api/tri.servSess#isSect servSess.isSect}
 *
 * @param {string} sSect value to match against
 *
 * @description
 * Returns whether `sect` section matches the current section.
 *
 * This call is forwarded  to {@link /api/tri.servSess#isSect servSess.isSect} and returns the value obtained thereby.
 */
/**
 * @ngdoc
 * @name tri.controller:ctrlSect#hasSession
 * @methodOf tri.controller:ctrlSect
 *
 * @returns {Boolean} the value returned by {@link /api/tri.servSess#hasSession servSess.hasSession}
 *
 * @description
 * Returns whether a valid session exists. ie. The User is properly logged in and validated.
 *
 * This call is forwarded  to {@link /api/tri.servSess#hasSession servSess.hasSession} and returns the value obtained thereby.
 */
/**
 * @ngdoc
 * @name tri.controller:ctrlSect#hasErrorMsg
 * @methodOf tri.controller:ctrlSect
 *
 * @returns {Boolean} the value returned by {@link /api/tri.servSess#hasErrorMsg servSess.hasErrorMsg} != null
 *
 * @description
 * Returns whether a User error message exists.
 *
 * This call is forwarded  to {@link /api/tri.servSess#getErrorMsg servSess.getErrorMsg} and returns whether the result is null (false) or not (true).
 */
/**
 * @ngdoc
 * @name tri.controller:ctrlSect#getErrorMsg
 * @methodOf tri.controller:ctrlSect
 *
 * @returns {Boolean} the value returned by {@link /api/tri.servSess#getErrorMsg servSess.getErrorMsg}
 *
 * @description
 * Returns any User contextual error message.
 *
 * This call is forwarded  to {@link /api/tri.servSess#getErrorMsg servSess.getErrorMsg} and returns the value obtained thereby.
 */
/**
 * @ngdoc
 * @name tri.controller:ctrlSect#closeErrorMsg
 * @methodOf tri.controller:ctrlSect
 *
 * @returns {Object} `undefined`
 *
 * @description
 * Clears any error message.
 *
 * This call is forwarded  to {@link /api/tri.servSess#setErrorMsg servSess.setErrorMsg} with a value of `null`.
 */
/**
 * @ngdoc
 * @name tri.controller:ctrlSect#hasConfirmMsg
 * @methodOf tri.controller:ctrlSect
 *
 * @returns {Boolean} the value returned by {@link /api/tri.servSess#hasConfirmMsg servSess.hasConfirmMsg} != null
 *
 * @description
 * Returns whether a User confirmation message exists.
 *
 * This call is forwarded  to {@link /api/tri.servSess#getConfirmMsg servSess.getConfirmMsg} and returns whether the result is null (false) or not (true).
 */
/**
 * @ngdoc
 * @name tri.controller:ctrlSect#getConfirmMsg
 * @methodOf tri.controller:ctrlSect
 *
 * @returns {Boolean} the value returned by {@link /api/tri.servSess#getConfirmMsg servSess.getConfirmMsg}
 *
 * @description
 * Returns any User contextual confirmation message.
 *
 * This call is forwarded  to {@link /api/tri.servSess#getConfirmMsg servSess.getConfirmMsg} and returns the value obtained thereby.
 */
/**
 * @ngdoc
 * @name tri.controller:ctrlSect#closeConfirmMsg
 * @methodOf tri.controller:ctrlSect
 *
 * @returns {Object} `undefined`
 *
 * @description
 * Clears any confirmation message.
 *
 * This call is forwarded  to {@link /api/tri.servSess#setConfirmMsg servSess.setConfirmMsg} with a value of `null`.
 */
/**
 * @ngdoc
 * @name tri.controller:ctrlSect#cancelNewPassword
 * @methodOf tri.controller:ctrlSect
 *
 * @description
 * Clears the `sPasswordErr` field
 */
/**
 * @ngdoc
 * @name tri.controller:ctrlSect#hasError
 * @methodOf tri.controller:ctrlSect
 *
 * @returns {Boolean} whether `sPasswordErr` is null (false) or not null (true)
 *
 * @description
 * Returns whether `sPasswordErr` contains any data.
 */

/**
 * @ngdoc
 * @name tri.controller:ctrlSect#sPasswordErr
 * @propertyOf tri.controller:ctrlSect
 *
 * @description
 * Initial password change validation error field.
 *
 * Set during a `submitNewPassword` method call.
 */
function ctrlSect($scope,servSess,servGAE) {
  log("Created ctrlSect");
  $scope.sPasswordErr       = null;

  $scope.isSect             = function(sSect) {return servSess.isSect(sSect);};
  $scope.hasSession         = function()      {return servSess.hasSession();};
  $scope.hasErrorMsg        = function()      {return servSess.getErrorMsg() != null;};
  $scope.getErrorMsg        = function()      {return servSess.getErrorMsg();};
  $scope.closeErrorMsg      = function()      {return servSess.setErrorMsg(null);};
  $scope.hasConfirmMsg      = function()      {return servSess.getConfirmMsg() != null;};
  $scope.getConfirmMsg      = function()      {return servSess.getConfirmMsg();};
  $scope.closeConfirmMsg    = function()      {return servSess.setConfirmMsg(null);};
  $scope.cancelNewPassword  = function()      {servSess.setSect(null); };
  $scope.hasError           = function()      {return $scope.sPasswordErr != null; };
  $scope.submitNewPassword  = function()      {submitNewPassword(); };

/**
 * @ngdoc
 * @name tri.controller:ctrlSect#submitNewPassword
 * @methodOf tri.controller:ctrlSect
 *
 * @description
 * Used in concert with the HTML template 'apps-change-password.html' to submit a password change.
 *
 * If the password entered is valid (at least one alphabetic) and the confirm field matches the method
 * {@link /api/tri.servGAE#changePassword servGAE.changePassword} is called.
 *
 * If successful
 * {@link /api/tri.servSess#setConfirmMsg servSess.setConfirmMsg} is called.
 *
 * If not successful
 * {@link /api/tri.servSess#setErrorMsg servSess.Sess.#setErrorMsg} is called.
 */
  function submitNewPassword() {
    setErr(null);
    if (!$scope.Password || ($scope.Password.length === 0)) {
      return setErr("Existing password required");
    }
    if (!$scope.NewPassword || ($scope.NewPassword.length === 0)) {
      return setErr("New password required");
    }
    if ($scope.NewPassword.match(/[a-zA-Z]/) == null) {
      return setErr("New password must contain at least one alphabetic character");
    }
    if ($scope.NewPassword != $scope.ConfirmPassword) {
      return setErr("Repeated New password differs from New Password");
    }
    servGAE.changePassword($scope.Password,$scope.NewPassword,changeOK,changeFail);

    function changeOK(status,data) {
      //dumpObjLog(data,'ChangeOK');
      servSess.setConfirmMsg("Password change sucessful");
    }
    function changeFail(status,data) {
      log('ChangeFailed',data);
      servSess.setErrorMsg("Password change failed:"+data.RESULT.CODE);
    }
  }

  function setErr(msg) {
    $scope.sPasswordErr = msg;
  }

}

// ---------------------------------------------------------------------------
 /**
 * @ngdoc function
 * @name tri.controller:ctrlMenu
 *
 * @description
 * Provides the menu management infrastructure.
 *
 * It is also used to handle the User inactivity timeout functionality.
 *
 * @param {Object} $scope The scope of the controller
 * @param {Object} $rootScope The system rootScope
 * @param {Object} servSess The {@link /api/tri.servSess servSess} service pointer
 * @param {Object} servREG The {@link /api/tri.servGAE servREG} service pointer
 * @param {Object} servCRUD The {@link /api/tri.servGAE servCRUD} service pointer
 */
/**
 * @ngdoc
 * @name tri.controller:ctrlMenu#hasSession
 * @methodOf tri.controller:ctrlMenu
 *
 * @returns {Boolean} the value returned by {@link /api/tri.servSess#hasSession servSess.hasSession}
 *
 * @description
 * Returns whether a valid session exists (ie. there is a logged in user).
 *
 * This call is forwarded  to {@link /api/tri.servSess#hasSession servSess.hasSession} and returns the value obtained thereby.
 */
/**
 * @ngdoc
 * @name tri.controller:ctrlMenu#canChangePassword
 * @methodOf tri.controller:ctrlMenu
 *
 * @returns {Boolean} the value returned by {@link /api/tri.servSess#canChangePassword servSess.canChangePassword}
 *
 * @description
 * Returns whether a 2-person login is in effect.
 *
 * This call is forwarded  to {@link /api/tri.servSess#canChangePassword servSess.canChangePassword} and returns the value obtained thereby.
 */
/**
 * @ngdoc
 * @name tri.controller:ctrlMenu#isAdmin
 * @methodOf tri.controller:ctrlMenu
 *
 * @returns {Boolean} the value returned by {@link /api/tri.servSess#isAdmin servSess.isAdmin}
 *
 * @description
 * Returns whether a 2-person login is in effect.
 *
 * This call is forwarded  to {@link /api/tri.servSess#isAdmin servSess.isAdmin} and returns the value obtained thereby.
 */
/**
 * @ngdoc
 * @name tri.controller:ctrlMenu#getOptMenuItems
 * @methodOf tri.controller:ctrlMenu
 *
 * @returns {Boolean} the value returned by {@link /api/tri.servSess#getOptMenuItems servSess.getOptMenuItems}
 *
 * @description
 * Returns whether a 2-person login is in effect.
 *
 * This call is forwarded  to {@link /api/tri.servSess#getOptMenuItems servSess.getOptMenuItems} and returns the value obtained thereby.
 */
/**
 * @ngdoc
 * @name tri.controller:ctrlMenu#getIdleSecs
 * @methodOf tri.controller:ctrlMenu
 *
 * @returns {Boolean} the value returned by {@link /api/tri.servSess#getIdleSecs servSess.getIdleSecs}
 *
 * @description
 * Returns the number of seconds the user has been idle.
 *
 * This call is forwarded  to {@link /api/tri.servSess#getIdleSecs servSess.getIdleSecs} and returns the value obtained thereby.
 */
/**
 * @ngdoc
 * @name tri.controller:ctrlMenu#getIdleLeft
 * @methodOf tri.controller:ctrlMenu
 *
 * @returns {Boolean} the value returned by {@link /api/tri.servSess#getIdleLeft servSess.getIdleLeft}
 *
 * @description
 * Returns the number of seconds remaining before an idle timeout.
 *
 * This call is forwarded  to {@link /api/tri.servSess#getIdleLeft servSess.getIdleLeft} and returns the value obtained thereby.
 */
/**
 * @ngdoc
 * @name tri.controller:ctrlMenu#listService
 * @methodOf tri.controller:ctrlMenu
 *
 * @param {Object} tabdef The {@link /guide/table Static Table} object
 *
 * @description
 * Activates the {@link /api/tri.controller:ctrlCommList List Controller} called 'CommList' for a table defined by `tabdef`.
 *
 * This call is forwarded  to {@link /api/tri.servSess#setSect servSess.setSect}
 * with a section name of 'CommList' which performs the activation.
 */
/**
 * @ngdoc
 * @name tri.controller:ctrlMenu#changePassword
 * @methodOf tri.controller:ctrlMenu
 *
 * @description
 * Activates the `Change Password` HTML page (called 'NewPassword').
 *
 * This call is forwarded  to {@link /api/tri.servSess#setSect servSess.setSect}
 * with a section name of 'NewPassword' which performs the activation.
 */
/**
 * @ngdoc
 * @name tri.controller:ctrlMenu#getActionClass
 * @methodOf tri.controller:ctrlMenu
 *
 * @returns {string} 'c-action' or 'c-quiet'
 *
 * @description
 * This is used to disable the menu functionality when the {@link /api/tri.controller:ctrlCommEdit Edit Controller} is active.
 *
 * If editing 'c-quiet' is returned.
 * Otherwise 'c-action' is returned.
 *
 * This is used by the {@link /api/tri.directive:whenActive whenActive directive}.
 */
 function ctrlMenu($scope,$rootScope,servSess,servREG,servCRUD) {
  log("Created ctrlMenu");

  servSess.hookIdleListener($scope);
  $rootScope.isTrue        = function(b,sTrue,sFalse) {return b?(sTrue||'true'):(sFalse||'false');};
  $rootScope.getTitle      = function()        {return servSess.getTitle();};
  $rootScope.getSandboxMsg = function()        {return servSess.getSandboxMsg();};
  $rootScope.isSandboxMode = function()        {return servSess.isSandboxMode();};

  $scope.hasSession        = function()        {return servSess.hasSession();};
  $scope.canChangePassword = function()        {return servSess.canChangePassword();};
  $scope.getUser           = function()        {return getUser();};
  $scope.getUser2          = function()        {return getUser2();};
  $scope.isAdmin           = function()        {return servSess.isAdmin();};
  //??ec3922 $scope.isEnabled       = function(evt)     {return isEnabled(evt);}
  $scope.getTables         = function()        {return getTables();};
  $scope.listService       = function(tabdef)  {servSess.setSect('CommList',tabdef); };
  $scope.changePassword    = function()        {if (!servCRUD.inEdit()) servSess.setSect('NewPassword',null); };
  $scope.getOptMenuItems   = function()        {return servSess.getOptMenuItems();};
  $scope.getActionClass    = function()        {if (servCRUD.inEdit()) return "c-quiet"; return "c-action";};
  $scope.logoff            = function()        {logoff();};
  $scope.pulse             = function()        {pulse();};
  $scope.getIdleSecs       = function()        {return servSess.getIdleSecs();};
  $scope.getIdleLeft       = function()        {return servSess.getIdleLeft();};
  $scope.autoLogoff        = function()        {autoLogoff();};

/**
 * @ngdoc
 * @name tri.controller:ctrlMenu#autoLogoff
 * @methodOf tri.controller:ctrlMenu
 *
 * @description
 * This is called when the {@link /api/tri.servSess servSess} timeout routines deems that a User has exceeded their idle timeout time.
 *
 * A {@link /api/tri.controller:ctrlMenu#logoff logoff} request is issued and the complete window reloaded.
 *
 */
  function autoLogoff() {
    log("autoLogoff invoked");
    logoff();
    window.location.reload();
  }

/**
 * @ngdoc
 * @name tri.controller:ctrlMenu#logoff
 * @methodOf tri.controller:ctrlMenu
 *
 * @returns {string} 'c-action' or 'c-quiet'
 *
 * @description
 * This is called when the standard 'logoff' menu action is clicked or `autoLogoff` is called.
 *
 * The system is set to the context where no user is logged on.
 */
  function logoff() {
    log("logoff invoked inEdit="+servCRUD.inEdit());
    servSess.setSession(false);
    servSess.setSect(null);
    delete localStorage['.user-token'];
  }

/**
 * @ngdoc
 * @name tri.controller:ctrlMenu#getUser
 * @methodOf tri.controller:ctrlMenu
 *
 * @returns {string} the computed value.
 *
 * @description
 * If there is not an active session `null` is returned.
 *
 * Otherwise the evaluation of 'for ' || {@link /api/tri.servSess#getUser servSess.getUser()} is returned.
 */
  function getUser() {
    if (!servSess.hasSession()) return null;
    return " for "+servSess.getUser();
  }
/**
 * @ngdoc
 * @name tri.controller:ctrlMenu#getUser2
 * @methodOf tri.controller:ctrlMenu
 *
 * @returns {string} the computed value.
 *
 * @description
 * If there is not an active session `null` is returned.
 *
 * If there is not a double login '' is returned.
 *
 * Otherwise the evaluation of '/' || {@link /api/tri.servSess#getUser2 servSess.getUser2()} is returned.
 */
  function getUser2() {
    if (!servSess.hasSession()) return null;
    if (!servSess.isDouble()) return '';
    var sUser2 = servSess.getUser2() || '';
    if (sUser2.trim() !== '') return "/"+sUser2;
    return '';
  }

/**
 * @ngdoc
 * @name tri.controller:ctrlMenu#pulse
 * @methodOf tri.controller:ctrlMenu
 *
 * @description
 * This is called when the {@link /api/tri.servSess servSess} timer passes an elapsed second mark.
 *
 * A `$scope.#digest()` function call is made which triggers an update of the HTML page, possibly just updating the seconds till timeout counter.
 *
 */
  function pulse() {
    $scope.$digest();
  }

/**
 * @ngdoc
 * @name tri.controller:ctrlMenu#getTables
 * @methodOf tri.controller:ctrlMenu
 *
 * @returns {Object[]} A collection of static {@link /api/tri.object.Table Table} objects.
 *
 * @description
 * Returns a subset of the Table objects returned by {@link /api/tri.servREG#getTables servREG#getTables} that are accessible given the role
 * of the logged in User.
 */
  function getTables() {
    var oTs = servREG.getTables();
    var oTabs = [];
    for(var i=0,iMax=oTs.length; i<iMax; i+=1) {
      var oTab = oTs[i];
      var oTP = oTab.getTabProp();
      if (oTP.menuWhen) {
        if (oTP.menuWhen()) oTabs.push(oTab);
      } else {
        oTabs.push(oTab);
      }
    }
    return oTabs;
  }

}

// ---------------------------------------------------------------------------
 /**
 * @ngdoc function
 * @name tri.controller:ctrlSess
 *
 * @description
 * Standard controller referenced with ng-controller=ctrlSess on the
 * appropriated HTML div statement.
 *
 * It is used to manage the authentication of the User before allowing other
 * components to be used.
 *
 * @param {Object} $scope The scope of the controller
 * @param {Object} $http The angularJS $http service
 * @param {Object} servSess The {@link /api/tri.servSess servSess} service pointer
 * @param {Object} servGAE The {@link /api/tri.servGAE servGAE} service pointer
 * @param {Object} servCRUD The {@link /api/tri.servGAE servCRUD} service pointer
 */
/**
 * @ngdoc
 * @name tri.controller:ctrlSess#isSect
 * @methodOf tri.controller:ctrlSess
 *
 * @param {String} sSect the section to test for
 *
 * @returns {Boolean} the value returned by {@link /api/tri.servSess#isSect servSess.isSect}
 *
 * @description
 * Returns whether the current section is `sSect`
 *
 * The value returned is obtained by forwarding the call to {@link /api/tri.servSess#isSect servSess.isSect} and returning the value obtained thereby.
 */
/**
 * @ngdoc
 * @name tri.controller:ctrlSess#hasSession
 * @methodOf tri.controller:ctrlSess
 *
 * @returns {Boolean} the value returned by {@link /api/tri.servSess#hasSession servSess.hasSession}
 *
 * @description
 * Returns whether a valid session exists (ie. there is a logged in user).
 *
 * The value returned is obtained by forwarding the call to {@link /api/tri.servSess#hasSession servSess.hasSession} and returning the value obtained thereby.
 */
/**
 * @ngdoc
 * @name tri.controller:ctrlSess#sErrMsg
 * @propertyOf tri.controller:ctrlSess
 *
 * @description
 * Current error message or null.
 *
 * Set during a login attempt as input fields are edited.
 */
function ctrlSess($scope,$http,servSess,servGAE,servCRUD,servConfig) {

  var fResume = null;
  var oCurTP  = null;

  var sURL = ""+window.location;
  log("URL:"+sURL);
  if (sURL.substring(0,7) == "file://") {
    servGAE.setURL("http://10.1.1.3:8884/gems/cita/ajax.ajax");
    servSess.setDevpMode();
  } else if (sURL.substring(0,17) == "http://localhost:") {
    servGAE.setURL(sURL.substring(0,21)+"/gems/cita/ajax.ajax");
    servSess.setDevpMode();
  } else {
    var nIX = sURL.indexOf("/cita/");
    servGAE.setURL(sURL.substring(0,nIX) + "/gems/cita/ajax.ajax");
  }
  $scope.sErrMsg = "";
  $scope.sDouble = 'DOUBLE';
  $scope.UserName2 = '';
  $scope.Password2 = '';

  if (!$scope.UserName) {
    var oFill = null;
    if (servConfig.getAutoFill) oFill = servConfig.getAutoFill();
    if (oFill) {
      $scope.UserName = oFill.user;
      $scope.Password  = oFill.password;
      $scope.UserName2 = 'other'; // only looks like double login
      $scope.Password2 = 'other';
    }
  }

  log("Created ctrlSess");
  $scope.login          = function(sDbl)  {login(sDbl);};
  $scope.initUser       = function()      {initUser();};
  $scope.isSect         = function(sSect) {return servSess.isSect(sSect);};
  $scope.hasSession     = function()      {return servSess.hasSession();};
  $scope.sendReminder   = function()      {sendReminder();}; // does not yet function


/**
 * @ngdoc
 * @name tri.controller:ctrlSess#login
 * @methodOf tri.controller:ctrlSess
 *
 * @param {string} sDbl  'DOUBLE' if double login required
 *
 * @description
 * Performs the login functionality for a user in concert with the
 * HTML sections to obtain the User information (Userid & password).
 *
 * It ensures that the required fields are provided.
 *
 * When sufficient data is entered the functions {@link /api/tri.servSess#setUser servSess.setUser}
 * and {@link /api/tri.servGAE#login servGAE.login} are used to perform the login and prepare the context.
 *
 * If the login fails the controller informs the user via a message.
 */
  function login(sDbl) {
    log("login mode=%s scope=%o doing=%s",sDbl,$scope,$scope.bDoingLogin);
    if ($scope.bDoingLogin) return;
    $scope.sErrMsg = "";
    if (!$scope.UserName || ($scope.UserName.trim().length === 0)) {
      return loginError("Require username");
    }
    if (!$scope.Password || ($scope.Password.trim().length === 0)) {
      return loginError("Require password");
    }
    var xUser     = $scope.UserName;
    var xPassword = $scope.Password;

    if (sDbl == 'DOUBLE') {
      if (!$scope.UserName2 || ($scope.UserName2.trim().length === 0)) {
        return loginError("Require 2nd username");
      }
      if (!$scope.Password2 || ($scope.Password2.trim().length === 0)) {
        return loginError("Require 2nd password");
      }
      xUser = {user1:xUser,password1:xPassword,user2:$scope.UserName2,password2:$scope.Password2};
      xPassword = null;
    }
    if (angular.isDefined(window.ga)) ga('send','event','action',(sDbl=='DOUBLE'?'logindbl':'login'),$scope.UserName);
    servSess.setUser(sDbl,$scope.UserName,$scope.UserName2);
    servGAE.login(xUser,xPassword,goodLogin,failLogin);
    $scope.bDoingLogin = true;
  }

  function loginError(sMsg) {
    $scope.sErrMsg = sMsg;
    if (angular.isDefined(window.ga)) ga('send','event','action','loginerr',sMsg);
  }

  function sendReminder() {
    $scope.sErrMsg = "";
    if (!$scope.UserName || ($scope.UserName.trim().length === 0)) {
      $scope.sErrMsg = "Require username";
      return;
    }
    servGAE.sendReminder($scope.UserName,good,fail);

    function good() {
      log("good reminder");
    }
    function fail() {
      log("failed reminder");
    }
  }

  function goodLogin(status,data) {
    $scope.bDoingLogin = false;
    $scope.status = status;
    $scope.data = data;
    log("GoodLogin %o",data);
    var sToken = data.RESULT.token;
    servGAE.setToken(sToken);
    servSess.setSession(true,data.RESULT.PROFILE);
    //initReadList(completeValidate);
    servCRUD.syncLocalData($scope,sToken,data.RESULT);
  }


  function failLogin(status,data) {
    log("FailLogin ");
    $scope.bDoingLogin = false;
    if (angular.isDefined(window.ga)) ga('send','event','action','loginfail','server');
    $scope.data = data || "Request failed";
    $scope.status = status;
    if (data.RESULT && data.RESULT.STATUS) {
      $scope.sErrMsg = "Login error status="+data.RESULT.STATUS+" code="+data.RESULT.CODE+" HTTP status:"+$scope.status;
    } else {
      $scope.sErrMsg = "Login Request error, HTTP status:"+$scope.status;
    }
  }

/**
 * @ngdoc
 * @name tri.controller:ctrlSess#initUser
 * @methodOf tri.controller:ctrlSess
 *
 * @description
 * Performs initialization of input from any cached localStorage values for userids(s) and the token value.
 *
 * If a token value is found it uses the {@link /api/tri.servGAE#validateToken servGAE.validateToken} method to
 * see if  the token is valid.  If so the login is deemed successful and the context is prepared.
 * This includes calling {@link /api/tri.servSess#setSession servSess.setSession}
 *
 * If this is the very first time the user has used the system we do a dummy warm-up of the server (incase it is paged out).
 * This means that when he presses the login button the {@link /guide/gaesite GAE Server} will be warmed up.  If it is not the first
 * time the validate will do a warmup.
 *
 *
 * More information concerning the token is found at {@link /api/tri.servGAE#setToken servGAE.setToken} and {@link /guide/server-inter Server Interface}.
 */
  function initUser() {
    servSess.hasSession(false);
    if (servSess.getBootExit() != null) {
      (servSess.getBootExit())();
      return;
    }
    if (localStorage['.user']) {
      $scope.UserName  = localStorage['.user'];
      $scope.UserName2 = localStorage['.user2'];
      if (localStorage['.user-token']) {
        log("---------- Init user "+$scope.UserName+" token="+localStorage['.user-token']);
        servGAE.validateToken($scope.UserName,localStorage['.user-token'],goodValidate,failValidate);
      }
    } else {
      // very first time user.  We do a dummy validate to warm up the GAE server
      log("---------- DUMMY Init user cycle");
      servGAE.validateToken('dummy','0',goodDummy,failDummy);
    }
  }

  function goodValidate(status,data) {
    log("GoodValidate %o user1=%s user2=%s",data,$scope.UserName,$scope.UserName2);
    servSess.setSession(true,data.RESULT.PROFILE);
    var sDbl = "SINGLE";
    if ($scope.UserName2 == 'null') $scope.UserName2 = null;
    if ($scope.UserName2 && ($scope.UserName2 != $scope.UserName)) sDbl = "DOUBLE";
    servSess.setUser(sDbl,$scope.UserName,$scope.UserName2);
    //initReadList(completeValidate);
    servCRUD.syncLocalData($scope,servGAE.getToken(),data.RESULT);
  }

  function failValidate(status,data) {
    servGAE.setToken(null);
    log("Validate failed");
  }

  function goodDummy(status,data) {
    log("dummy validate OK");
  }
  function failDummy(status,data) {
    log("dummy validate failed");
  }


}

// ---------------------------------------------------------------------------
 /**
 * @ngdoc function
 * @name tri.controller:ctrlCommList
 *
 * @description
 * Provides the common lister functionality of the system which includes:
 *
 * * Listing of filtered sorted set of records from the current `Table`
 * * The record list has a static heading and a scrollable display area
 * * The columns to list are determined using the static {@link /api/tri.object.Table Table} definition.
 * * Columns with computed values are easily inserted and automatically updated using the {@link http://angularjs.org/ AngularJS} facilities
 * * Optional standard and custom 'Filter` inputs such as 'Limit', 'Mask'
 * * Optional standard and custom 'Table` clickable actions such as 'Create New xxx Record'
 * * Optional standard and custom 'Record` clickable actions such as 'edit'
 * * The ability to modify the appearance and coumn widths with CSS using the automatically provided column classes as CSS reference points.
 *
 * Many of the function calls are forwarded to an appropriate service and where applicable the return value is returned.
 *
 * @param {Object} $scope The scope of the controller
 * @param {Object} servSess The {@link /api/tri.servSess servSess} service pointer
 * @param {Object} servREC The {@link /api/tri.servGAE servREC} service pointer
 * @param {Object} servCRUD The {@link /api/tri.servGAE servCRUD} service pointer
 */
/**
 * @ngdoc
 * @name tri.controller:ctrlCommList#nUsedCols
 * @propertyOf tri.controller:ctrlCommList
 *
 * @description
 * Internal value used to compute the next {@link /api/tri.controller:ctrlCommList#getColClass getColClass} value.
 */
/**
 * @ngdoc
 * @name tri.controller:ctrlCommList#oSel
 * @propertyOf tri.controller:ctrlCommList
 *
 * @description
 * Contains the current filter (selection) values which are preserved in the `Table` object
 * during the  `Table` switch operation {@link /api/tri.servSess#useTable servSess.useTable}
 *
 */
/**
 * @ngdoc
 * @name tri.controller:ctrlCommList#isSect
 * @methodOf tri.controller:ctrlCommList
 *
 * @returns {Boolean} the value returned by {@link /api/tri.servSess#isSect servSess.isSect}
 *
 * @param {string} sect value to match against
 *
 * @description
 * Returns whether `sect` section matches the current section.
 *
 * This call is forwarded  to {@link /api/tri.servSess#isSect servSess.isSect} and returns the value obtained thereby.
 */
/**
 * @ngdoc
 * @name tri.controller:ctrlCommList#hasSession
 * @methodOf tri.controller:ctrlCommList
 *
 * @returns {Boolean} the value returned by {@link /api/tri.servSess#hasSession servSess.hasSession}
 *
 * @description
 * Returns whether a valid session exists. ie. The User is properly logged in and validated.
 *
 * This call is forwarded  to {@link /api/tri.servSess#hasSession servSess.hasSession} and returns the value obtained thereby.
 */
/**
 * @ngdoc
 * @name tri.controller:ctrlCommList#useTable
 * @methodOf tri.controller:ctrlCommList
 *
 * @param {Object} table table name (title) to find
 * @param {string} sel previous/default selection (filter) context
 *
 * @returns {Boolean} the value returned by {@link /api/tri.servSess#useTable servSess.useTable}
 *
 * @description
 * This sets a new `Table` context for the {@link /api/tri.controller:ctrlCommList List Controller}.
 *
 *
 * This call is forwarded  to {@link /api/tri.servSess#useTable servSess.useTable} with the insertion of the `$scope` variable and returns the value obtained thereby.
 */
/**
 * @ngdoc
 * @name tri.controller:ctrlCommList#getTableCols
 * @methodOf tri.controller:ctrlCommList
 *
 * @param {string} type The type of column array to extract. eg '=list', '=edit'
 *
 * @returns {Object[]} the value returned by {@link /api/tri.servREC#getTableCols servREC.getTableCols}
 *
 * @description
 * Returns a collection of {@link /api/tri.object.Col Col} objects that match `type`.
 *
 * This call is forwarded  to {@link /api/tri.servREC#getTableCols servREC.getTableCols} with the insertion of the `$scope` variable and returns the value obtained thereby.
 */
/**
 * @ngdoc
 * @name tri.controller:ctrlCommList#showCol
 * @methodOf tri.controller:ctrlCommList
 *
 * @param {Object} oCol {@link /api/tri.object.Col Col} object to test
 *
 * @returns {string} 'true' if column should be shown else 'false'
 *
 * @description
 *
 * This call is forwarded  to {@link /api/tri.servREC#showListCol servREC.showListCol} and the {Boolean} result returned as a {string}.
 */
/**
 * @ngdoc
 * @name tri.controller:ctrlCommList#inEdit
 * @methodOf tri.controller:ctrlCommList
 *
 * @returns {Boolean} `true` if {@link /api/tri.controller:ctrlCommEdit Edit Controller} is active
 *
 * @description
 * Returns whether the system {@link /api/tri.controller:ctrlCommEdit Edit Controller} is active.
 *
 * This call is forwarded  to {@link /api/tri.servCRUD#inEdit servCRUD.inEdit} and and returns the value obtained thereby.
 */
/**
 * @ngdoc
 * @name tri.controller:ctrlCommList#inDlgEdit
 * @methodOf tri.controller:ctrlCommList
 *
 * @returns {Boolean} `true` if {@link /api/tri.controller:ctrlCommEdit Edit Controller} is active and in Dialog mode
 *
 * @description
 * Returns whether the system {@link /api/tri.controller:ctrlCommEdit Edit Controller} is active and in Dialog mode.
 *
 * This call is forwarded  to {@link /api/tri.servCRUD#inDlgEdit servCRUD.inDlgEdit} and and returns the value obtained thereby.
 */

/**
 * @ngdoc
 * @name tri.controller:ctrlCommList#getObjs
 * @methodOf tri.controller:ctrlCommList
 *
 * @returns {Object[]} {@link /guide/data Data Object} collection for the specified `Table`
 *
 * @description
 * Returns the {@link /guide/data Data Object} collection for the specified `Table`.
 *
 * This call is forwarded  to {@link /api/tri.servCRUD#getObjs servCRUD.getObjs} and returns the value obtained thereby.
 */
/**
 * @ngdoc
 * @name tri.controller:ctrlCommList#getTabProp
 * @methodOf tri.controller:ctrlCommList
 *
 * @returns {Object} Properties object of current (oTAB) object. oTAB is set to null.
 *
 * @description
 * This returns the properties `props` object of current dynamic dynamic {@link /api/tri.object.Table Table} object.
 *
 * This call is forwarded  to {@link /api/tri.servCRUD#getTabProp servCRUD.getTabProp} and returns the value obtained thereby.
 */
/**
 * @ngdoc
 * @name tri.controller:ctrlCommList#editRecord
 * @methodOf tri.controller:ctrlCommList
 *
 * @param {Object} oaa The <b>O</b>bject <b>A</b>ccess <b>A</b>ddress. A string or number determining the required record.  See {@link /guide/records Record Storage} for a description of `oaa`.
 *
 * @description
 * This puts the system into 'Edit' mode and activates the system {@link /api/tri.controller:ctrlCommEdit Edit Controller} using the {@link /guide/data Data Object} obtained using `oaa'
 *
 * This call is forwarded  to {@link /api/tri.servCRUD#editRecord servCRUD.editRecord}.  Refer there for more details.
 */
/**
 * @ngdoc
 * @name tri.controller:ctrlCommList#makeRecord
 * @methodOf tri.controller:ctrlCommList
 *
 * @description
 * This puts the system into 'Create' mode and activates the system {@link /api/tri.controller:ctrlCommEdit Edit Controller}.
 *
 * This call is forwarded  to {@link /api/tri.servCRUD#makeRecord servCRUD.makeRecord}.  Refer there for more details.
 */
/**
 * @ngdoc
 * @name tri.controller:ctrlCommList#dropRecord
 * @methodOf tri.controller:ctrlCommList
 *
 * @param {Object} oaa The <b>O</b>bject <b>A</b>ccess <b>A</b>ddress. A string or number determining the required record.  See {@link /guide/records Record Storage} for a description of `oaa`.
 *
 * @description
 * This removes {@link /guide/data Data Object}  from the `Table`. The {@link /guide/data Data Object} to remove is obtained using `oaa'
 *
 * This call is forwarded  to {@link /api/tri.servCRUD#dropRecord servCRUD.dropRecord}.  Refer there for more details.
 */
 function ctrlCommList($scope,servSess,servREC,servCRUD) {
  log("Created ctrlCommList");
  var nUsedCols = 0;
  $scope.oSel         = {};
  servSess.hookListListener($scope);

  $scope.oServSess    = servSess;
  $scope.isSect       = function(sSect)      {return servSess.isSect(sSect);};
  $scope.hasSession   = function()           {return servSess.hasSession();};
  $scope.useTable     = function(table,sel)  {return servSess.useTable($scope,table,sel);};
  $scope.getTableCols = function(type)       {return servREC.getTableCols($scope,$scope.getTabProp(),type);};
  $scope.showCol      = function(oCol)       {return servREC.showListCol(oCol)?'true':'false';};
  $scope.initFilter   = function(oFil)       {initFilter(oFil);};
  $scope.getColTitle  = function(oFil)       {return getColTitle(oFil);};
  $scope.getRefColOpt = function(oFil)       {return getRefColOpt(oFil);};
  $scope.optionClick  = function(oThis)      {return optionClick(oThis);}; //obsolete
  $scope.initOptions  = function(oFil)       {return initOptions(oFil);};  //obsolete
  $scope.getBinding   = function(oFil)       {return getBinding(oFil);};   //obsolete
  $scope.getFilters   = function(sel,type)   {return getFilters(sel,type);};
  $scope.getFilter    = function(fld)        {return getFilter(fld);};

  $scope.getColClass  = function(ix,col)     {return getColClass(ix,col);};

  $scope.inEdit       = function()           {return servCRUD.inEdit();};
  $scope.inDlgEdit    = function()           {return servCRUD.inDlgEdit();};
  $scope.getObjs      = function()           {return servCRUD.getObjs();};
  //$scope.getSelObjs   = function()           {return servCRUD.getSelObjs();}
  $scope.getTabProp   = function()           {return servCRUD.getTabProp();};
  $scope.editRecord   = function(oaa)        {servCRUD.editRecord(oaa);};
  $scope.makeRecord   = function()           {servCRUD.makeRecord();};
  $scope.dropRecord   = function(oaa)        {servCRUD.dropRecord(oaa);};

/**
 * @ngdoc
 * @name tri.controller:ctrlCommList#getFilters
 * @methodOf tri.controller:ctrlCommList
 *
 * @param {Object} oSel object managed with {@link /api/tri.servSess#useTable servSess.useTable}
 * @param {string} sType Filter type
 *
 * @returns {Object[]} {@link /api/tri.object.Filter Filter} objects that match `sType`
 *
 * @description
 *
 * Returns an array of {@link /api/tri.object.Filter Filter} objects that match `sType` found in `oSel`. Refer
 * to {@link /api/tri.servSess#useTable servSess.useTable}.
 *
 * The returned value is cached as this function is called many times.
 *
 */
  function getFilters(oSel,sType) {
    var oFils = [];
    if (!oSel || !oSel._filters) return oFils;
    for(var i in oSel._filters) {
      var oFil = oSel._filters[i];
      if (oFil.type == sType) oFils.push(oFil);
    }
    return oFils;
  }

/**
 * @ngdoc
 * @name tri.controller:ctrlCommList#getFilter
 * @methodOf tri.controller:ctrlCommList
 *
 * @param {Object} oSel object managed with {@link /api/tri.servSess#useTable servSess.useTable}
 * @param {string} sFld Filter name to extract
 *
 * @returns {Object} {@link /api/tri.object.Filter Filter} object
 *
 * @description
 *
 * Returns a {@link /api/tri.object.Filter Filter} object whose `type` matches  'state' found in `oSel`
 * and whose `field` value matches `sFld`.
 * Refer also to {@link /api/tri.servSess#useTable servSess.useTable}.
 *
 */
  function getFilter(sFld) {
    var oFils = getFilters($scope.oSel,'state');
    for(var i in oFils) {
      var oFil = oFils[i];
      if (oFil.field == sFld) return oFil;
    }
    return null;
  }


  function optionClick(oThis) {
    log("option clicked ");
  }

  function getBinding(oFil) {
    if (oFil.type != 'state') return '';
    log("called get binding "+oFil.field+/*" "+oSel.name*/" "+oFil.type);
    var oSel =  document.getElementById(oFil.field);
    log("called get binding "+oFil.field+" name="+oSel.name);
    return '<option>bind</option>';
  }

/**
 * @ngdoc
 * @name tri.controller:ctrlCommList#getColTitle
 * @methodOf tri.controller:ctrlCommList
 *
 * @param {Object} oFil {@link /api/tri.object.Filter Filter} object
 *
 * @returns {string} computed value
 *
 * @description
 *
 * Returns a column title suitable for display
 *
 * Returns `null` if `oFil.field` is `null` of `undefined`
 *
 * Returns `oCol.getTitle()` if {@link /api/tri.object.Col Col} object `oCol` exists in the current context
 *
 * Else returns `oFil.field'
 */
  function getColTitle(oFil) {
    if (!oFil.field) return null;
    var oTP = getTabProp();
    if (oTP) {
      //log("getColFilter "+oFil.type+" "+oTP.recTitle);
      var oCol = servREC.findCol(oTP,oFil.field);
      if (oCol) return oCol.getTitle();
    }
    return oFil.field;
  }

  $scope.initSelect   = function(oThis)    {return initSelect(oThis);};


  function initOptions(oFil) {
    if (oFil.type != 'state') return null;
    var oSel =  document.getElementById(oFil.field);
    log("init select "+oFil.field+" "+oSel.name);
  }

/**
 * @ngdoc
 * @name tri.controller:ctrlCommList#getRefColOpt
 * @methodOf tri.controller:ctrlCommList
 *
 * @param {Object} oFil {@link /api/tri.object.Filter Filter} object
 *
 * @returns {Object[]} A collection of options returned by {@link /api/tri.servREC#getOptions servREC.getOptions}
 *
 * @description
 * Typically used to populate a 'select' control with values from a related `Table` that is updated dynamically based on the values stored in that `Table`.
 *
 * Returns an empty list if `oFil.type` != 'state' or {@link /api/tri.object.Col Col} object for `oFil.field` is not located
 *
 * Returns an empty list if `oCol.oneOf` is not defined
 *
 * Else returns the {@link /api/tri.servREC#getOptions servREC.getOptions} return value
 *
 */
  function getRefColOpt(oFil) {
    if (oFil.type != 'state') return [];
    var oCol = servREC.findCol(getTabProp(),oFil.field);
    if (!oCol) return [];
    if (!oCol.oneOf) return [];
    var oOpts = servREC.getOptions(oCol,true);
    log("return "+oOpts.length+" options "+oFil.field+" sel="+$scope.oSel);
    return oOpts;
  }


/**
 * @ngdoc
 * @name tri.controller:ctrlCommList#initFilter
 * @methodOf tri.controller:ctrlCommList
 *
 * @param {Object} oFil {@link /api/tri.object.Filter Filter} object
 *
 * @description
 *
 * Moves the {@link /api/tri.object.Filter Filter} object to the `$scope.oSel` object if `$scope.oSel` object does not contain `oFil.name`
 */
  function initFilter(oFil) {
    if (!oFil.init) return;
    if (!$scope.oSel) return;
    if (!(oFil.name in $scope.oSel)) $scope.oSel[oFil.name] = oFil.init;
  }

/**
 * @ngdoc
 * @name tri.controller:ctrlCommList#getColClass
 * @methodOf tri.controller:ctrlCommList
 *
 * @param {number} ix index of column
 * @param {Object} oCol dynamic {@link /api/tri.object.Col Col} object
 *
 * @description
 * Used to provide a series of class types 'C1', 'C2', ... 'Cn' based on whether a column is shown in the list.
 *
 * This value is typically used with ng-class and then referenced in the .CSS style sheets.
 *
 * This provides a convenient way to format HTML table columns (`<TD>`) and their header (`<TH>`).
 */
  function getColClass(ix,oCol) {
    if (ix === 0) nUsedCols = 0;
    if (!$scope.showCol(oCol)) return 'Chide';
    nUsedCols += 1;
    return 'C'+nUsedCols;
  }


}

// ---------------------------------------------------------------------------

 /**
 * @ngdoc function
 * @name tri.controller:ctrlCommEdit
 *
 * @description
 * Provides the edit infrastructure to edit a {@link /guide/data Data Object} using the {@link /api/tri.object.Table Table} object
 * to derive the fields (columns) to edit.  The standard edit controller functionality includes:
 *
 * * Listing and population of fields (columns) to edit using the static {@link /api/tri.object.Table Table} definition
 * * Various column types to allow custom edit behavoir
 * * Sub-edit mode to allow a record to have a sub-object (See Deps.js Apps)
 * * Standard create/remove/update actions for members of a 'property' type column
 * * Automatic change detection and Save/Cancel handling to avoid losing changes
 * * Standard and custom validation cycles are automatically run and invalid data disables the 'Save' mechanism.
 * * Intermediate changes may optionally be quietly persisted
 * * Referenced tables can be used to provide clickable values
 * * Referenced tables can be used to provide auto-completion of values
 *
 * Many of the function calls are forwarded to an appropriate service and where applicable the return value is returned.
 *
 * @param {Object} $scope The scope of the controller
 * @param {Object} servSess The {@link /api/tri.servSess servSess} service pointer
 * @param {Object} servREC The {@link /api/tri.servGAE servREC} service pointer
 * @param {Object} servCRUD The {@link /api/tri.servGAE servCRUD} service pointer
 */
/**
 * @ngdoc
 * @name tri.controller:ctrlCommEdit#oObj
 * @propertyOf tri.controller:ctrlCommEdit
 *
 * @description
 * Value holding pointer to {@link /guide/data Data Object} being edited.  Allows the {@link http://angularjs.org/ AngularJS} ng-model statement bi-directional access to the
 * column data values
 */
/**
 * @ngdoc
 * @name tri.controller:ctrlCommEdit#oPanel
 * @propertyOf tri.controller:ctrlCommEdit
 *
 * @description
 * Value holding pointer to the sub-object of {@link /guide/data Data Object} being edited.  Allows the {@link http://angularjs.org/ AngularJS} ng-model statement bi-directional access to the
 * column data values of the sub-object.  Refer to Deps.js as an example.
 */
/**
 * @ngdoc
 * @name tri.controller:ctrlCommEdit#sEditErr
 * @propertyOf tri.controller:ctrlCommEdit
 *
 * @description
 * Holds the text of any error condition that may have been detected during the validation cycle.
 */
/**
 * @ngdoc
 * @name tri.controller:ctrlCommEdit#isSect
 * @methodOf tri.controller:ctrlCommEdit
 *
 * @returns {Boolean} the value returned by {@link /api/tri.servSess#isSect servSess.isSect}
 *
 * @param {string} sect value to match against
 *
 * @description
 * Returns whether `sect` section matches the current section.
 *
 * This call is forwarded  to {@link /api/tri.servSess#isSect servSess.isSect} and returns the value obtained thereby.
 */
/**
 * @ngdoc
 * @name tri.controller:ctrlCommEdit#hasSession
 * @methodOf tri.controller:ctrlCommEdit
 *
 * @returns {Boolean} the value returned by {@link /api/tri.servSess#hasSession servSess.hasSession}
 *
 * @description
 * Returns whether a valid session exists. ie. The User is properly logged in and validated.
 *
 * This call is forwarded  to {@link /api/tri.servSess#hasSession servSess.hasSession} and returns the value obtained thereby.
 */
/**
 * @ngdoc
 * @name tri.controller:ctrlCommEdit#useTable
 * @methodOf tri.controller:ctrlCommEdit
 *
 * @param {Object} table table name (title) to find
 * @param {string} sel previous/default selection (filter) context
 *
 * @returns {Boolean} the value returned by {@link /api/tri.servSess#useTable servSess.useTable}
 *
 * @description
 * This sets a new `Table` context for the edit controller while in sub-edit mode.
 *
 *
 * This call is forwarded  to {@link /api/tri.servSess#useTable servSess.useTable} with the insertion of the `$scope` variable and returns the value obtained thereby.
 */
/**
 * @ngdoc
 * @name tri.controller:ctrlCommEdit#inEdit
 * @methodOf tri.controller:ctrlCommEdit
 *
 * @returns {Boolean} `true` if edit controller is active
 *
 * @description
 * Returns whether the system edit controller is active.
 *
 * This call is forwarded  to {@link /api/tri.servCRUD#inEdit servCRUD.inEdit} and and returns the value obtained thereby.
 */
/**
 * @ngdoc
 * @name tri.controller:ctrlCommEdit#inDlgEdit
 * @methodOf tri.controller:ctrlCommEdit
 *
 * @returns {Boolean} `true` if edit controller is active and in Dialog mode
 *
 * @description
 * Returns whether the system edit controller is active and in Dialog mode.
 *
 * This call is forwarded  to {@link /api/tri.servCRUD#inDlgEdit servCRUD.inDlgEdit} and and returns the value obtained thereby.
 */

/**
 * @ngdoc
 * @name tri.controller:ctrlCommEdit#getEditType
 * @methodOf tri.controller:ctrlCommEdit
 *
 * @returns {String} value returned by {@link /api/tri.servCRUD#getEditType servCRUD.getEditType}
 *
 * @description
 * Returns the mode of the editor ("Edit" or 'Create').
 *
 * This call is forwarded  to {@link /api/tri.servCRUD#getEditType servCRUD.getEditType} and and returns the value obtained thereby.
 */
/**
 * @ngdoc
 * @name tri.controller:ctrlCommEdit#getTabProp
 * @methodOf tri.controller:ctrlCommEdit
 *
 * @returns {Object} Properties object of current (oTAB) object. oTAB is set to null.
 *
 * @description
 * This returns the properties `props` object of current dynamic dynamic {@link /api/tri.object.Table Table} object.
 *
 * This call is forwarded  to {@link /api/tri.servCRUD#getTabProp servCRUD.getTabProp} and returns the value obtained thereby.
 */
/**
 * @ngdoc
 * @name tri.controller:ctrlCommEdit#getDirtyMsg
 * @methodOf tri.controller:ctrlCommEdit
 *
 * @returns {string} value returned by {@link /api/tri.servCRUD#getDirtyMsg servCRUD.getDirtyMsg}
 *
 * @description
 * This returns the type of 'Save' message that should be displayed.
 *
 * This call is forwarded  to {@link /api/tri.servCRUD#getDirtyMsg servCRUD.getDirtyMsg} and returns the value obtained thereby.
 */
/**
 * @ngdoc
 * @name tri.controller:ctrlCommEdit#getDirtyClass
 * @methodOf tri.controller:ctrlCommEdit
 *
 * @returns {string} value returned by {@link /api/tri.servCRUD#getDirtyClass servCRUD.getDirtyClass}
 *
 * @description
 * This returns either 'c-quiet' or 'c-action'.  It is used to enable/disable links used by the edit controller.
 *
 * This call is forwarded  to {@link /api/tri.servCRUD#getDirtyClass servCRUD.getDirtyClass} and returns the value obtained thereby.
 */
/**
 * @ngdoc
 * @name tri.controller:ctrlCommEdit#editCancel
 * @methodOf tri.controller:ctrlCommEdit
 *
 * @description
 * Forwards a User initiated 'cancel' request.
 *
 * This call is forwarded  to {@link /api/tri.servCRUD#editCancel servCRUD.editCancel}.
 */
/**
 * @ngdoc
 * @name tri.controller:ctrlCommEdit#editSave
 * @methodOf tri.controller:ctrlCommEdit
 *
 * @description
 * Forwards a User initiated 'save' request.
 *
 * This call is forwarded  to {@link /api/tri.servCRUD#editSave servCRUD.editSave}.
 */
/**
 * @ngdoc
 * @name tri.controller:ctrlCommEdit#hasEditError
 * @methodOf tri.controller:ctrlCommEdit
 *
 * @returns {Boolean} whether {@link /api/tri.controller:ctrlCommEdit#sEditErr sEditErr} is null (`false`) else `true`
 *
 * @description
 * Returns whether an edit error message exists.
 *
 */
/**
 * @ngdoc
 * @name tri.controller:ctrlCommEdit#getTrimOpt
 * @methodOf tri.controller:ctrlCommEdit
 *
 * @returns {string} 'true' or 'false' depending on whether `oCol` contains the property `trim`.
 *
 * @param {Object} oCol The dynamic {@link /api/tri.object.Col Col} object
 *
 * @description
 * Used to enable/disable the trimming of input fields.  This can be used to override the
 * automatic trimming that {@link http://angularjs.org/ AngularJS} performs on text input fields.
 *
 */
/**
 * @ngdoc
 * @name tri.controller:ctrlCommEdit#isSelect
 * @methodOf tri.controller:ctrlCommEdit
 *
 * @returns {string} 'true' or 'false' depending on whether `oCol` contains 'oneOf'
 *
 * @param {Object} oCol The dynamic {@link /api/tri.object.Col Col} object
 *
 * @description
 * Used to provide `<select>` controls with potential values computed from a related `Table'
 *
 * If `oCol.oneof` exists 'true' is returned
 *
 * Otherwise 'false' is returned
 *
 */
/**
 * @ngdoc
 * @name tri.controller:ctrlCommEdit#getOptions
 * @methodOf tri.controller:ctrlCommEdit
 *
 * @param {Object} oCol The dynamic {@link /api/tri.object.Col Col} object
 *
 * @returns {string} value returned by {@link /api/tri.servREC#getOptions servREC.getOptions}
 *
 * @description
 * This returns an array of objects suitable for injection into a 'select' element
 *
 * This call is forwarded  to {@link /api/tri.servREC#getOptions servREC.getOptions} and returns the value obtained thereby.
 */
/**
 * @ngdoc
 * @name tri.controller:ctrlCommEdit#getModFld
 * @methodOf tri.controller:ctrlCommEdit
 *
 * @param {Object} oCol The dynamic {@link /api/tri.object.Col Col} object
 *
 * @returns {string} value returned by {@link /api/tri.servREC#getModFld servREC.getModFld}
 *
 * @description
 * This returns the model name for a given column.
 *
 * This call is forwarded  to {@link /api/tri.servREC#getModFld servREC.getModFld} and returns the value obtained thereby.
 */
/**
 * @ngdoc
 * @name tri.controller:ctrlCommEdit#getProperties
 * @methodOf tri.controller:ctrlCommEdit
 *
 * @param {Object} oCol The dynamic {@link /api/tri.object.Col Col} object
 *
 * @returns {Object[]} value returned by {@link /api/tri.servREC#getProperties servREC.getProperties}
 *
 * @description
 * This returns an array of key/value pairs for a column of type 'property'
 *
 * This call is forwarded  to {@link /api/tri.servREC#getProperties servREC.getProperties} and returns the value obtained thereby.
 */
/**
 * @ngdoc
 * @name tri.controller:ctrlCommEdit#isVirt
 * @methodOf tri.controller:ctrlCommEdit
 *
 * @param {Object} oCol The dynamic {@link /api/tri.object.Col Col} object
 *
 * @returns {Boolean} `true` if `oCol.type` == 'virt' else `false`
 *
 * @description
 * Returns whether a column contains a computed value or is marked as type 'virt'.
 *
 */
/**
 * @ngdoc
 * @name tri.controller:ctrlCommEdit#getTableCols
 * @methodOf tri.controller:ctrlCommEdit
 *
 * @param {string} type The column type to retrieve
 *
 * @returns {Object[]} value returned by {@link /api/tri.servREC#getTableCols servREC.getTableCols}
 *
 * @description
 * This returns an array of {@link /api/tri.object.Col Col} objects whose `type` column match 'type'
 *
 * This call is forwarded  to {@link /api/tri.servREC#getTableCols servREC.getTableCols} and returns the value obtained thereby.
 */
/**
 * @ngdoc
 * @name tri.controller:ctrlCommEdit#getSubRows
 * @methodOf tri.controller:ctrlCommEdit
 *
 * @param {Object} oObj The {@link /guide/data Data Object} containing the rows.
 * @param {Object} oSchema The related sub-schema to use.
 *
 * @returns {Object[]} value returned by {@link /api/tri.servREC#getSubRows servREC.getSubRows}
 *
 * @description
 * Returns the array of {@link /guide/data Data Object} rows within `oObj` that belong to `oSchema.base`.
 *
 * This call is forwarded  to {@link /api/tri.servREC#getSubRows servREC.getSubRows} with the addition of parameter `$scope` and returns the value obtained thereby.
 */
/**
 * @ngdoc
 * @name tri.controller:ctrlCommEdit#getSubCols
 * @methodOf tri.controller:ctrlCommEdit
 *
 * @param {Object} schema The related sub-schema to use.
 * @param {string} sType the column type to extract
 *
 * @returns {Object[]} the collection of {@link /api/tri.object.Col Col} objects returned by {@link /api/tri.servREC#getSubCols servREC.getSubCols}
 *
 * @description
 * Returns the array of {@link /api/tri.object.Col Col}  that belong to `oSchema.base` and match `sType`.
 *
 * This call is forwarded  to {@link /api/tri.servREC#getSubCols servREC.getSubCols} with the addition of parameter `$scope` and returns the value obtained thereby.
 */
/**
 * @ngdoc
 * @name tri.controller:ctrlCommEdit#addProperty
 * @methodOf tri.controller:ctrlCommEdit
 *
 * @param {Object} oCol The dynamic {@link /api/tri.object.Col Col} object
 *
 * @returns {Object} `undefined`
 *
 * @description
 * Creates a new property key for a 'property' type column.
 *
 * This call is forwarded  to {@link /api/tri.servREC#addProperty servREC.addProperty} with the addition of parameter current table `props` object.
 */
/**
 * @ngdoc
 * @name tri.controller:ctrlCommEdit#removeProperty
 * @methodOf tri.controller:ctrlCommEdit
 *
 * @param {Object} oCol The dynamic {@link /api/tri.object.Col Col} object
 *
 * @returns {Object} `undefined`
 *
 * @description
 * Removes a property key from a 'property' type column.
 *
 * This call is forwarded  to {@link /api/tri.servREC#removeProperty servREC.removeProperty} with the addition of parameter current table `props` object.
 */
/**
 * @ngdoc
 * @name tri.controller:ctrlCommEdit#getMethods
 * @methodOf tri.controller:ctrlCommEdit
 *
 * @param {Object} oCol The dynamic {@link /api/tri.object.Col Col} object
 *
 * @returns {Object[]} the collection of method objects returned by {@link /api/tri.servREC#getMethods servREC.getMethods}
 *
 * @description
 * An array of method objects used to insert into onclick attributes of dynamically built link elements.
 *
 * This call is forwarded  to {@link /api/tri.servREC#getMethods servREC.getMethods} and returns the value obtained thereby.
 */
/**
 * @ngdoc
 * @name tri.controller:ctrlCommEdit#showListCol
 * @methodOf tri.controller:ctrlCommEdit
 *
 * @param {Object} oCol {@link /api/tri.object.Col Col} object to test
 *
 * @returns {string} 'true' if column should be shown else 'false'
 *
 * @description
 *
 * This is used in the sub-edit mode sub-list functionality.
 *
 * This call is forwarded  to {@link /api/tri.servREC#showListCol servREC.showListCol} and the {Boolean} result returned as a {string}.
 */


function ctrlCommEdit($scope,servSess,servREC,servCRUD) {
  log("Created ctrlCommEdit");

  var nUsedCols = 0;

  servCRUD.hookCtrlEdit($scope);
  $scope.oObj           = {};
  $scope.oPanel         = {};
  $scope.sEditErr       = null;
  $scope.trigger        = 0;

  $scope.isSect         = function(sSect)         {return servSess.isSect(sSect);};
  $scope.hasSession     = function()              {return servSess.hasSession();};
  $scope.useTable       = function(table,sel)     {return servSess.useTable($scope,table,sel);};

  $scope.inEdit         = function()              {return servCRUD.inEdit();};
  $scope.inDlgEdit      = function()              {return servCRUD.inDlgEdit();};
  $scope.getEditType    = function()              {return servCRUD.getEditType();};
  $scope.getTabProp     = function()              {return servCRUD.getTabProp();};
  $scope.dirtyMsg       = function()              {return servCRUD.dirtyMsg($scope);};
  $scope.dirtyClass     = function()              {return servCRUD.dirtyClass($scope);};
  $scope.editCancel     = function()              {servCRUD.editCancel();};
  $scope.editSave       = function()              {servCRUD.editSave($scope);};

  $scope.hasEditError   = function()              {return ($scope.sEditErr != null);};
  $scope.getTrimOpt     = function(oCol)          {if (!('trim' in oCol)) return 'true'; return oCol.trim?'true':'false';};
  $scope.isReadOnly     = function(oCol)          {return isReadOnly(oCol);};
  $scope.getColClass    = function(ix,col)        {return getColClass(ix,col);};
  //$scope.isColType      = function(oCol,sType)    {return isColType(oCol,sType);}
  $scope.isSelect       = function(oCol)          {if ('oneOf' in oCol) return 'true'; return 'false';};
  $scope.getOptions     = function(oCol)          {return servREC.getOptions(oCol);};
  $scope.getModFld      = function(oCol)          {return servREC.getModFld(oCol);};
  $scope.getProperties  = function(oCol)          {return servREC.getProperties($scope.getTabProp(),oCol);};
  $scope.isVirt         = function(oCol)          {return (oCol.type == 'virt');};
  $scope.getTableCols   = function(type)          {return servREC.getTableCols($scope,$scope.getTabProp(),type);};
  $scope.getSubRows     = function(oObj,oSchema)  {return servREC.getSubRows($scope,oObj,oSchema);};
  $scope.getSubCols     = function(schema,sType)  {return servREC.getSubCols($scope,schema,sType);};
  $scope.addProperty    = function(oCol)          {return servREC.addProperty($scope.getTabProp(),oCol);};
  $scope.removeProperty = function(oCol,name)     {return servREC.removeProperty($scope.getTabProp(),oCol,name);};
  $scope.getMethods     = function(oCol)          {return servREC.getMethods(oCol);};
  $scope.getColRows     = function(oCol)          {return servREC.getColRows(oCol);}; //obsolete?
  $scope.methodClick    = function(oCol,oA,oObj,p){methodClick(oCol,oA,oObj,p);}; //obsolete?
  $scope.showListCol    = function(oCol)          {return servREC.showListCol(oCol)?'true':'false';};
  $scope.call           = function(fn,oObj,x)     {return call(fn,oObj,x);};

/**
 * @ngdoc
 * @name tri.controller:ctrlCommEdit#isReadOnly
 * @methodOf tri.controller:ctrlCommEdit
 *
 * @returns {string} 'true' or 'false' depending on whether `oCol` is deemed 'readonly'
 *
 * @param {Object} oCol The dynamic {@link /api/tri.object.Col Col} object
 *
 * @description
 * Used to mark an `<input>` control as 'readonly' and prevent updates to that field.
 *
 * If `oCol.type` is 'virt' 'true' is returned
 *
 * If `oCol.readonly` evaluates to `true` 'true' is returned
 *
 * Otherwise 'false' is returned
 *
 */
  function isReadOnly(oCol) {
    if ($scope.isVirt(oCol)) return 'true';
    if (typeof oCol.readonly  == 'function') return oCol.readonly($scope,oCol);
    if ('readonly' in oCol) return oCol.readonly?'true':'false';
    return 'false';
  }

  function methodClick(oCol,x,oObj,parm) {
    log("method click "+$scope.$id,x,parm);
    if (typeof x == 'object') {
      x.method($scope.oObj,oCol,parm);
    } else {
      oCol.methods[x].method($scope,oObj,parm);
    }
  }

/**
 * @ngdoc
 * @name tri.controller:ctrlCommEdit#getColClass
 * @methodOf tri.controller:ctrlCommEdit
 *
 * @param {number} ix index of column
 * @param {Object} oCol dynamic {@link /api/tri.object.Col Col} object
 *
 * @description
 * Used to provide a series of class types 'C1', 'C2', ... 'Cn' based on whether a column is shown in the list.
 *
 * This value is typically used with ng-class and then referenced in the .CSS style sheets.
 *
 * This provides a convenient way to format HTML table columns (`<TD>`) and their header (`<TH>`).
 */
  function getColClass(ix,oCol) {
    if (ix === 0) nUsedCols = 0;
    if (!$scope.showListCol(oCol)) return 'Chide';
    nUsedCols += 1;
    return 'C'+nUsedCols;
  }

/**
 * @ngdoc
 * @name tri.controller:ctrlCommEdit#call
 * @methodOf tri.controller:ctrlCommEdit
 *
 * @param {Function} fn function to call
 * @param {Object} oObj The {@link /guide/data Data Object} passed to `fn`
 * @param {Object} x a custom object passed to `fn'
 *
 * @deprecated not required
 *
 * @description
 * <b>deprecated</b>
 *
 * This is an early version of accessing custom functions from the .HTML files.  This has been replaced for the most part
 * by adding more flexibility to the column definitions and automatically linking functions contained in those definitions into the current $scope.
 */
  function call(fn,oObj,x) {
    try {
      return fn($scope,oObj,x);
    } catch (e) {
      log("call exception "+e);
      //log("  "+fn);
    }
  }
}


/**
 * @ngdoc object
 * @name tri.object.Tri
 *
 * @description
 * Provides a set of static utility functions that can be accessed with the prefix `tri.`
 *
 * The public methods attached to the `tri` object and described herein are
 * freely accessible from Javascript code.
 *
 * These functions can be called from HTML code using the 'windows' verbs such as `onclick` vs the {@link http://angularjs.org/ AngularJS} verbs such as `ng-click`.
 *
 */
/**
 * @ngdoc constructor
 *
 * @name tri.object.Tri#tri
 * @methodOf tri.object.Tri
 * @description
 * Constructor used to build a single instance of the `tri` object.
 */


// Create a tri object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

// Technique copied from JSON code. Thanks.

if (!this.tri) {
  this.tri = {};
}

// These can be called externally by using the BBB. prefix.
// We compile them just once when we parse bbb.js
if (typeof tri.compiled === 'undefined') { // see matching end.external.compiled
  tri.compiled = true;
  tri.$templateCache = null;

  /**
   * @ngdoc
   *
   * @name tri.object.Tri#postToOpener
   * @methodOf tri.object.Tri
   * @description
   * Posts the `oMsg` serializable object to the window that opened the secondary window.  The handler of this message is described in
   * {@link /api/tri.method:hookMsgListener hookMsgListener} where the `verb` and `payload` parameters are described.
   *
   * This is used by the secondary windows described in {@link /guide/form-page-design Form Page Design}.
   *
   * The messages are processed by {@link /api/tri.method:hookMsgListener hookMsgListener}
   *
   * @param {Object} oMsg object that contains properties `verb` and `payload`
   *
   */
  tri.postToOpener = function(oMsg) {
    if (!window.opener) {
      log("no window opener");
    } else {
      window.opener.postMessage(oMsg,"*");
    }
  };

  /**
   * @ngdoc
   *
   * @name tri.object.Tri#loadTemplates
   * @methodOf tri.object.Tri
   * @description
   * This is used by the secondary windows described in {@link /guide/form-page-design Form Page Design} to load {@link /guide/templates Templates}
   * from the primary window.
   *
   * The statements in the `FormXXX.htm` file of the form
   *
   * `<div class=for-template html='xxx.html' ng-include='zzz' alter='strs'></div>`
   *
   *  are scanned for.  Any found cause a request of 'sys-get-template` to be made to the
   * {@link /api/tri.method:hookMsgListener hookMsgListener} of the primary window.
   *
   * It responds with the data which is handled by {@link /api/tri.object.Tri#postTemplate tri.postTemplate}
   *
   * The field `xxx.html` names the template to fetch.
   *
   * The field `zzz` names a unique variable added to the `$scope` used to manage the template loading process.
   *
   * The field `strs` is an optional field that represents strings passed to the {@link /api/tri.object.Tri#alter tri.alter} method.
   *
   * @param {event} {@link http://angularjs.org/ AngularJS} $event object used to provide context for this method.
   *
   */
  tri.loadTemplates = function($rootScope,$templateCache) {
    tri.$templateCache = $templateCache;
    $rootScope.isTrue = tri.isTrue;
    var oNL = document.getElementsByClassName('for-template');//angular.element("div")
    for(var i=0,iMax=oNL.length; i<iMax; i+=1) {
      var oDiv = angular.element(oNL[i]);
      var sHtml = oDiv.attr('html');
      var sVbl  = oDiv.attr('ng-include');
      oDiv.attr('id',"_"+sVbl);
      var scope = oDiv.scope();
      scope[sVbl] = null;
      log("Found %s %s",oDiv.attr('html'),oDiv.attr('ng-include'));
      tri.postToOpener({verb:"sys-get-template",payload:{name:sHtml,id:"_"+sVbl}});
    }
  };

  /**
   * @ngdoc
   *
   * @name tri.object.Tri#postTemplate
   * @methodOf tri.object.Tri
   * @description
   * This is used by the secondary windows described in {@link /guide/form-page-design Form Page Design} to load {@link /guide/templates Templates}
   *
   * This method is the responder to the {@link /api/tri.object.Tri#loadTemplates tri.loadTemplates} invoked reponses.
   *
   * The template provided in the `payload` is added to the `$templateCache` cache after any `alter` strings are applied.
   *
   * Then the `ng-include` referenced name is changed wich causes the template to be rendered by {@link http://angularjs.org/ AngularJS}.
   *
   * @param {Object} event {@link http://angularjs.org/ AngularJS} $event object used to provide context for this method.  The {@link /api/tri.object.Tri#loadTemplates tri.loadTemplates}
   * inserts enough information so the response provides sufficient context.
   *
   */
  tri.postTemplate = function(event) {
    var oPL = event.data.payload;
    var oDiv = angular.element(document.getElementById(oPL.id));
    var scope = oDiv.scope();
    //log('tri.postTemplate have template len=%s',oPL.html.length+" name="+scope['panel_name']+" event=%o div=%o",{obj:event},{obj:oDiv});
    var sName = oDiv.attr('ng-include');
    var oApp = angular.module("app");
    var sHtml = oPL.html;
    var sAlter = oDiv.attr('alter');
    if (sAlter) sHtml = tri.applyAlters(sHtml,sAlter);
    sHtml = tri.applyAlters(sHtml,'img-defer/img');
    log("GOT scope=%o name=%s app=%o",scope,sName,oApp);
    tri.$templateCache.put(oPL.name,sHtml);
    scope[sName] = oPL.name;
    scope.$digest();
  };

  /**
   * @ngdoc
   *
   * @name tri.object.Tri#closePage
   * @methodOf tri.object.Tri
   * @description
   * Used to close the
   * {@link /guide/form-page-design Form Page} and signal the primary window this has been done.
   *
   * The signal of `sys-close-page` is sent via {@link /api/tri.object.Tri#postToOpener tri.postToOpener} to
   * {@link /api/tri.method:hookMsgListener hookMsgListener}
   */
  tri.closePage = function() {
    log("closing page");
    tri.postToOpener({verb:"sys-close-page"});
  };

  /**
   * @ngdoc
   *
   * @name tri.object.Tri#isTrue
   * @methodOf tri.object.Tri
   * @description
   * {@link http://angularjs.org/ AngularJS} prefers strings in the HTML `ng-` functions.  This utility function
   * returns `sTrue` or `sFalse` depending on the boolean state of `b`.
   *
   * @param {Object} b the boolean value or function to evaluate
   * @param {string} sTrue string returned if true
   * @param {string} sFalse returned if false
   */
  tri.isTrue  = function(b,sTrue,sFalse) {return b?(sTrue||'true'):(sFalse||'false');};

  /**
   * @ngdoc
   *
   * @name tri.object.Tri#applyAlters
   * @methodOf tri.object.Tri
   * @description
   * This is used by the template handlers to alter the HTML strings just prior to handing over to {@link http://angularjs.org/ AngularJS} for insertion into
   * the HTML page.
   *
   * The `sAlter` param consists of a repeated group of pairs.  Each pair group is separated by a ';'. Do not use a trailing ';'.
   *
   * Each pair is separated by a '/'.  The first of the pair
   * is the regular expression to match in the template text. The second of the pair is the replacement text. <b>Note:</b> this text has been processed by the parser browser and might be transformed
   * by the browser (such as making tags lowercase).
   *
   * For example the string `alter='##TITLE##/title;option/no-option'`
   *
   * causes `##TITLE##` to be replaced by `title` and `option` to be replaced by `no-option`.
   *
   * In the case where the pair content needs to contain a '/' the first of the pair may start with a '!' and
   * the '!' is then used to separate the two parts of the pair. eg. `alter='!/apps/tri!/../apps/tri'`
   *
   * @param {string} sHtml HTML string to manipulate
   * @param {string} sAlter Alter strings
   * @returns {string} altered `sHtml`
   */
  tri.applyAlters = function(sHtml,sAlter) {
    log("Apply alters "+sAlter);
    var sAlters = sAlter.split(";");
    for(var i=0,iMax=sAlters.length; i<iMax; i+=1) {
      var sParts = [];
      if (sAlters[i].charAt(0) == '!') {
        sParts = sAlters[i].substring(1).split("!");
      } else {
        sParts = sAlters[i].split("/");
      }
      //log("  replace "+sParts[0]+" with "+sParts[1]);
      sHtml = sHtml.replace(new RegExp(sParts[0],"g"),sParts[1]);
      //if (sAlters[i].charAt(0) == '!') log("new HTML "+sHtml);
    }
    return sHtml;
  };

  /**
   * @ngdoc
   *
   * @name tri.object.Tri#calcAgo
   * @methodOf tri.object.Tri
   * @description
   * Given the `sDate` and `sTime` parameters, this utility function returns an approximate age such a `2 days`.
   *
   * @param {string} sDate Date of format `yyyymmdd`
   * @param {string} sTime 24 hour time sting of format `hhmmss`
   */
  tri.calcAgo = function(sDate,sTime) {
    var oNow = new Date();
    var mThen = Date.UTC(sDate.substring(0,4),+sDate.substring(4,6)-1,sDate.substring(6,8)
                        ,sTime.substring(0,2),sTime.substring(2,4),sTime.substring(4,6),0);
    var nSecs = ((oNow.getTime() - mThen)/1000).toFixed(0);
    if (nSecs < 60) return plural(nSecs,'sec');
    var nMins = (nSecs / 60).toFixed(0);
    if (nMins < 60) return plural(nMins,'min');
    var nHrs = (nMins / 60).toFixed(0);
    if (nHrs < 24) return plural(nHrs,'hr');
    var nDays = (nHrs / 24).toFixed(0);
    if (nDays < 7) return plural(nDays,'day');
    var nWks = (nDays / 7).toFixed(0);
    if (nWks < 4) return plural(nWks,'wk');
    var nMons = (nWks / 4).toFixed(0);
    return plural(nMons,'mth');

    function plural(n,sStr) {
      if (n > 1) return ''+n+' '+sStr + 's';
      return ''+n+' '+sStr;
    }
  };


}
