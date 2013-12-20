package com.rsi.cita;

import com.rsi.gems.bbb.run.Methods;
import com.rsi.gems.bbb.run.Ajax;
import com.rsi.gems.bbb.run.B3Req;
import com.rsi.gems.run.Page;
import com.rsi.gems.run.Req;
import com.rsi.gems.run.App;
import com.rsi.gems.utl.CU;
import org.json.JSONArray;
import org.json.JSONObject;
import com.rsi.act.ACT;
import com.rsi.act.Item;
import javax.servlet.http.HttpServletResponse;
import com.google.appengine.api.datastore.Text;

import java.util.HashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import com.rsi.cita.gdo.GdoCitaData;

public class CitaMethods extends Methods {

  HashMap<String,JSONObject> oAuthTab = new HashMap<String,JSONObject>();

  public static void log(String sMsg) {System.out.println(sMsg);}

  // TODO: token check.
  private boolean checkAuth(B3Req oR,Ajax oAjax,JSONObject oExec) throws Exception {
    JSONObject oJO = oExec.getJSONObject("auth");
    String sKeyName = "*/"+oJO.getString("cust")+"/"+oJO.getString("user");
    log(""+sKeyName+" check");
    if (oAuthTab.containsKey(sKeyName)) return true;
    ACT.Status oS = oR.getACT().viewItemByKey(GdoCitaData.class,sKeyName);
    if (!oS.isGOOD()) {
      log(""+sKeyName+" not found");
      JSONObject oRet = new JSONObject();
      oRet.put("STATUS","AUTH-ERR");
      oRet.put("CODE","not-in-auth-table");
      oAjax.addBlock("RESULT",oRet);
      return false;
    }
    GdoCitaData oGWD = (GdoCitaData)oS.oItem;
    String sDF =  ""+oGWD.getDataFld().getValue();
    JSONObject oProps = new JSONObject();
    if (sDF.startsWith("{")) oProps = new JSONObject(sDF);
    //log(""+sKeyName+" props "+oProps);
    oAuthTab.put(sKeyName,oProps);
    return true;
  }

  private JSONObject getProfile(B3Req oR,JSONObject oExec) throws Exception {
    JSONObject oJO = oExec.getJSONObject("auth");
    String sKeyName = "*/"+oJO.getString("cust")+"/"+oJO.getString("user");
    JSONObject oProps = oAuthTab.get(sKeyName);
    return oProps;
  }

  private boolean isRole(B3Req oR,JSONObject oExec,String sRole) throws Exception {
    JSONObject oProps = getProfile(oR,oExec);
    if (oProps == null) return false;
    String sAuth = oProps.optString("role");
    if (sAuth == null) return false;
    //log("isAdmin "+sAuth+" "+sKeyName);
    if (sAuth.indexOf(sRole) >= 0) return true;
    return false;
  }

  B3Req insertOriginHeader(Req oR) throws Exception {
    HttpServletResponse oSrvRes = (HttpServletResponse)oR.getRes();
    oSrvRes.setHeader("Access-Control-Allow-Origin","*");
    return (B3Req)oR;
  }

  private boolean validatePassword(B3Req oR,JSONObject oUser,String sPassword) throws Exception {
    String sStoredPassword = oUser.getString("password");
    Matcher oM = Pattern.compile("[a-zA-Z]").matcher("");
    if (oM.reset(sStoredPassword).find()) { // new password
      //log("New password mode:"+sStoredPassword);
      if (sPassword.equals(sStoredPassword)) {
        oUser.put("password",encryptCitaPassword(oR,sPassword,null));
        return true;
      }
      return false;
    }
    // encrypted password
    String sES = encryptCitaPassword(oR,sPassword,null);
    //log("Compare:"+sStoredPassword+" "+sES);
    return sES.equals(sStoredPassword);
  }


  private boolean performLogin(B3Req oR,Ajax oAjax,JSONObject oExec) throws Exception {
    JSONObject oJO = oExec.getJSONObject("auth");
    JSONObject[] oObjs = validateUserPassword(oR,oAjax,oJO,oJO.getString("user"),oJO.getString("password"),true);
    if (oObjs == null) return false;
    JSONObject oUser = oObjs[0];
    JSONObject oRet = oObjs[1];
    oRet.put("user",oJO.getString("user"));
    // check for double login requirement
    String sDbl = oUser.optString("double");
    if ("true".equals(sDbl)) {
      JSONObject[] oObjs2 = validateUserPassword(oR,oAjax,oJO,oJO.getString("user2"),oJO.getString("password2"),false);
      if (oObjs2 == null) return false;
      oRet.put("user2",oJO.getString("user2"));
    } else {
      if (oJO.optString("user2",null) != null) oRet.put("user2",oJO.getString("user2"));
    }
    //log("isAdmin "+sAuth+" "+sKeyName);
    String sToken = oUser.getString("token");
    oRet.put("STATUS","OK");
    oRet.put("token",sToken);
    addProfile(oRet,oUser);
    oAjax.addBlock("RESULT",oRet);
    returnAppDataStat(oR,oJO,oRet);
    return true;
  }

  private JSONObject[] validateUserPassword(B3Req oR,Ajax oAjax,JSONObject oJO,String sUser,String sPassword,boolean bPrimary) throws Exception {
    String sKeyName = "*/"+oJO.getString("cust")+"/"+sUser;
    //log("KeyName:"+sKeyName);
    ACT.Status oS = oR.getACT().viewItemByKey(GdoCitaData.class,sKeyName);
    JSONObject oRet = new JSONObject();
    if (!oS.isGOOD()) {
      oRet.put("STATUS","AUTH-ERR");
      oRet.put("CODE","not-in-auth-table primary="+bPrimary);
      oAjax.addBlock("RESULT",oRet);
      return null;
    }
    oS = oR.getACT().readItemForUpdate(GdoCitaData.class,oS.oItem.getGekID());
    GdoCitaData oGWD = (GdoCitaData)oS.oItem;
    String sDF =  ""+oGWD.getDataFld().getValue();
    if (!sDF.startsWith("{")) {
      oRet.put("STATUS","AUTH-ERR");
      oRet.put("CODE","non-JSON user data  primary="+bPrimary);
      oAjax.addBlock("RESULT",oRet);
      return null;
    }
    JSONObject oUser = new JSONObject(sDF);
    String sOldPassword = oUser.getString("password");
    if (!validatePassword(oR,oUser,sPassword)) {
      oRet.put("STATUS","AUTH-ERR");
      oRet.put("CODE","mismatches-password-value primary="+bPrimary);
      oAjax.addBlock("RESULT",oRet);
      return null;
    }
    if (bPrimary) {
      String sToken = encryptCitaPassword(oR,sKeyName+System.nanoTime(),null);
      oUser.put("token",sToken);
    }
    if (bPrimary || (!sOldPassword.equals(oUser.getString(("password"))))) {
      oGWD.setDataFld(new Text(""+oUser));
      oS = oR.getACT().updateItem(oGWD,oGWD.getGekRawUTS());
    }
    return new JSONObject[]{oUser,oRet};
  }

  private boolean performChangePassword(B3Req oR,Ajax oAjax,JSONObject oExec) throws Exception {
    JSONObject oJO = oExec.getJSONObject("auth");
    String sKeyName = "*/"+oJO.getString("cust")+"/"+oJO.getString("user");
    log("ChangePassword KeyName:"+sKeyName);
    ACT.Status oS = oR.getACT().viewItemByKey(GdoCitaData.class,sKeyName);
    JSONObject oRet = new JSONObject();
    if (!oS.isGOOD()) {
      oRet.put("STATUS","AUTH-ERR");
      oRet.put("CODE","not-in-auth-table");
      oAjax.addBlock("RESULT",oRet);
      return false;
    }
    oS = oR.getACT().readItemForUpdate(GdoCitaData.class,oS.oItem.getGekID());
    GdoCitaData oGWD = (GdoCitaData)oS.oItem;
    String sDF =  ""+oGWD.getDataFld().getValue();
    if (!sDF.startsWith("{")) {
      oRet.put("STATUS","AUTH-ERR");
      oRet.put("CODE","non-JSON user data");
      oAjax.addBlock("RESULT",oRet);
      return false;
    }
    JSONObject oUser = new JSONObject(sDF);
    String sPassword = ""+oJO.getString("password");
    if (!validatePassword(oR,oUser,sPassword)) {
      oRet.put("STATUS","AUTH-ERR");
      oRet.put("CODE","mismatches-stored-password-value");
      oAjax.addBlock("RESULT",oRet);
      return false;
    }
    JSONObject oPL = oExec.getJSONObject("payload");
    String sNewPassword = oPL.getString("NewPassword");
    String sES = encryptCitaPassword(oR,sNewPassword,null);
    oUser.put("password",sES);
    oGWD.setDataFld(new Text(""+oUser));
    oS = oR.getACT().updateItem(oGWD,oGWD.getGekRawUTS());
    oRet.put("STATUS","OK");
    addProfile(oRet,oUser);
    oAjax.addBlock("RESULT",oRet);
    return true;
  }

  private void addProfile(JSONObject oRet,JSONObject oUser) throws Exception {
    JSONObject oProf = new JSONObject(""+oUser);
    oProf.remove("token");
    oProf.remove("password");
    oRet.put("PROFILE",oProf);
  }

  private boolean performValidateToken(B3Req oR,Ajax oAjax,JSONObject oExec) throws Exception {
    JSONObject oJO = oExec.getJSONObject("auth");
    String sKeyName = "*/"+oJO.getString("cust")+"/"+oJO.getString("user");
    log("KeyName:"+sKeyName);
    ACT.Status oS = oR.getACT().viewItemByKey(GdoCitaData.class,sKeyName);
    JSONObject oRet = new JSONObject();
    if (!oS.isGOOD()) {
      oRet.put("STATUS","AUTH-ERR");
      oRet.put("CODE","not-in-auth-table");
      oAjax.addBlock("RESULT",oRet);
      return false;
    }
    GdoCitaData oGWD = (GdoCitaData)oS.oItem;
    JSONObject oRec = oGWD.populateJSON();
    log("TV.Record:"+oRec);
    log("TV.DataFld:"+oGWD.getDataFld().getValue());
    String sDF =  ""+oGWD.getDataFld().getValue();
    JSONObject oUser = new JSONObject();
    if (sDF.startsWith("{")) {
      oUser = new JSONObject(sDF);
      String sToken = oUser.optString("token","*****");
      if (!sToken.equals(oJO.optString("token"))) {
        oRet.put("STATUS","AUTH-ERR");
        oRet.put("CODE","token-has-expired");
        oAjax.addBlock("RESULT",oRet);
        return false;
      }
    } else {
      oRet.put("STATUS","AUTH-ERR");
      oRet.put("CODE","token-does-not-exist");
      oAjax.addBlock("RESULT",oRet);
      return false;
    }
    addProfile(oRet,oUser);
    oRet.put("STATUS","OK");
    oAjax.addBlock("RESULT",oRet);
    returnAppDataStat(oR,oJO,oRet);
    return true;
  }

  private void returnAppDataStat(B3Req oR,JSONObject oJO,JSONObject oRet) throws Exception {
    String sKeyName = ""+oJO.getString("cust")+"/%";
    JSONObject oDS = findCitaData(oR,oJO,false,sKeyName);
    oRet.put("DataStat",oDS);
  }

  private String encryptCitaPassword(Req oR,String sStr,String sApp) {
    App oApp = oR.getApp();
    if (sApp != null) {
      oApp = oR.getCust().findApp(sApp);
      log("Lost "+sApp);
      oApp = oR.getApp();
    }
    String sSrc = sStr+oApp.getParm("PasswordObfuscator")+sStr;
    String sResult = CU.getAdlerString(sSrc);
    //System.out.println("Encrypter:"+sSrc+" result="+sResult);
    return sResult;
  }


  public String ajaxLogin(Req oRP,Page oP,Ajax oAjax,JSONObject oExec) throws Exception {
    try {
      B3Req oR = insertOriginHeader(oRP);
      log("ExecLogin:"+oExec);
      if (!performLogin(oR,oAjax,oExec)) return oAjax.setFail("no-auth");
      return oAjax.setGood("login OK");
    } catch (Exception e) {
      return trap(e,oAjax);
    }
  }

  public String ajaxValidateToken(Req oRP,Page oP,Ajax oAjax,JSONObject oExec) throws Exception {
    try {
      B3Req oR = insertOriginHeader(oRP);
      log("ExecValidateToken:"+oExec);
      if (!performValidateToken(oR,oAjax,oExec)) return oAjax.setFail("no-auth");
      return oAjax.setGood("validate OK");
    } catch (Exception e) {
      return trap(e,oAjax);
    }
  }

  public String ajaxChangePassword(Req oRP,Page oP,Ajax oAjax,JSONObject oExec) throws Exception {
    try {
      B3Req oR = insertOriginHeader(oRP);
      log("ExecLogin:"+oExec);
      if (!performChangePassword(oR,oAjax,oExec)) return oAjax.setFail("no-auth");
      return oAjax.setGood("login OK");
    } catch (Exception e) {
      return trap(e,oAjax);
    }
  }


  public String ajaxSendCitaData(Req oRP,Page oP,Ajax oAjax,JSONObject oExec) throws Exception {
    try {
      B3Req oR = insertOriginHeader(oRP);
      if (!checkAuth(oR,oAjax,oExec)) return oAjax.setFail("no-auth");
      JSONObject oProf = getProfile(oR,oExec);
      String sSandbox = oProf.optString("sandbox"); //thwart potential hackers
      if ("true".equals(sSandbox)) {
        log("sandbox write rejected");
        return oAjax.setFail("Attempt to write in sandbox mode thwarted");
      }
      JSONObject oJO = oExec.getJSONObject("payload");
      String sKeyName = oJO.getString("KeyName");
      String sValErr = validateKey(oR,oAjax,oExec,sKeyName);
      if (sValErr != null) return sValErr;
      if (sKeyName.startsWith("*/")) oAuthTab = new HashMap<String,JSONObject>();
      JSONObject oRet = makeCitaData(oR,oJO);
      oAjax.addBlock("RESULT",oRet);
      String sStr = oAjax.setGood("Cita record");
      if ("WAKS-call".equals(oAjax.getInput().getString("AjaxID"))) {
        sStr += "\r\n"+"**GIO.EOF.MARKER**\r\n"; // add EOF marker
      }
      //log("ajaxSendCitaData "+sStr);
      log("ajaxSendCitaData successful "+sKeyName);
      return sStr;
    } catch (Exception e) {
      return trap(e,oAjax);
    }
  }

  String trap(Exception e,Ajax oAjax) throws Exception {
    JSONObject oRet = new JSONObject();
    oRet.put("STATUS","TRAP");
    oRet.put("CODE",""+e);
    e.printStackTrace();
    oAjax.addBlock("RESULT",oRet);
    return oAjax.setFail("exception");
  }


  private String validateKey(B3Req oR,Ajax oAjax,JSONObject oExec,String sKeyName) throws Exception {
    if (sKeyName.startsWith("*/")) {
      if (!isRole(oR,oExec,"admin")) return oAjax.setFail("KeyType requires admin role for find");
    }
    if (sKeyName.startsWith("./")) { //thwart access to SuperUser
      if (!isRole(oR,oExec,"admin")) return oAjax.setFail("KeyType invalid format");
    }
    return null;
  }

  public String ajaxFindCitaData(Req oRP,Page oP,Ajax oAjax,JSONObject oExec) throws Exception {
    try {
      B3Req oR = insertOriginHeader(oRP);
      log("ExecFind:"+oExec);
      if (!checkAuth(oR,oAjax,oExec)) return oAjax.setFail("no-auth");
      JSONObject oJO = oExec.getJSONObject("payload");
      String sKeyName = oJO.getString("KeyName");
      String sValErr = validateKey(oR,oAjax,oExec,sKeyName);
      if (sValErr != null) return sValErr;
      JSONObject oRet = findCitaData(oR,oJO,false,sKeyName);
      oAjax.addBlock("RESULT",oRet);
      return oAjax.setGood("Cita record");
    } catch (Exception e) {
      return trap(e,oAjax);
    }
  }

   public String ajaxFindUserData(Req oRP,Page oP,Ajax oAjax,JSONObject oExec) throws Exception {
    try {
      B3Req oR = insertOriginHeader(oRP);
      if (!checkAuth(oR,oAjax,oExec)) return oAjax.setFail("no-auth");
      if (!isRole(oR,oExec,"admin")) return oAjax.setFail("User access requires admin role");
      log("ExecFind:"+oExec);
      //JSONObject oJO0 = oExec.getJSONObject("payload");
      JSONObject oAuth = oExec.getJSONObject("auth");
      String sCust = oAuth.getString("cust");
      JSONObject oJO = new JSONObject();
      oJO.put("KeyName","\\*/"+sCust+"/%");
      String sKeyName = oJO.getString("KeyName");
      JSONObject oRet = findCitaData(oR,oJO,true,sKeyName);
      oAjax.addBlock("RESULT",oRet);
      return oAjax.setGood("Cita record");
    } catch (Exception e) {
      return trap(e,oAjax);
    }
  }

   public String ajaxSendReminder(Req oRP,Page oP,Ajax oAjax,JSONObject oExec) throws Exception {
    try {
      B3Req oR = insertOriginHeader(oRP);
      /*if (!checkAuth(oR,oAjax,oExec)) return oAjax.setFail("no-auth");
      if (!isAdmin(oR,oExec)) return oAjax.setFail("User access requires admin role");
      log("ExecFind:"+oExec);
      //JSONObject oJO0 = oExec.getJSONObject("payload");
      JSONObject oJO = new JSONObject();
      oJO.put("KeyName","\\ * /mems/%");
      */
      sendReminder(oR);
      JSONObject oRet = new JSONObject();
      oRet.put("STATUS","OK");
      oRet.put("CODE","email sent to xxx");
      oAjax.addBlock("RESULT",oRet);
      return oAjax.setGood("Reminder Sent");
    } catch (Exception e) {
      return trap(e,oAjax);
    }
  }

  public String ajaxDeleteKey(Req oRP,Page oP,Ajax oAjax,JSONObject oExec) throws Exception {
    try {
      B3Req oR = insertOriginHeader(oRP);
      if (!checkAuth(oR,oAjax,oExec)) return oAjax.setFail("no-auth");
      if (!isRole(oR,oExec,"admin") && !isRole(oR,oExec,"mgr")) return oAjax.setFail("DeleteKey requires admin/mgr role");
      JSONObject oPL = oExec.getJSONObject("payload");
      int nGekID = Integer.parseInt(oPL.getString("GekID"));
      log("DeleteKey:"+oExec+" GekID="+nGekID);
      JSONObject oRet = performDeleteKey(oR,nGekID);
      oAjax.addBlock("RESULT",oRet);
      return oAjax.setGood("Removal executed");
    } catch (Exception e) {
      return trap(e,oAjax);
    }
  }

  JSONObject performDeleteKey(B3Req oR,int nGekID) throws Exception {
    JSONObject oRet = new JSONObject();
    ACT.Status oS = oR.getACT().removeItem(GdoCitaData.class,nGekID);
    if (oS.isGOOD()) {
      oRet.put("STATUS","OK");
      oRet.put("CODE","Item removed");
    } else {
      oRet.put("STATUS","NAK");
      oRet.put("CODE","removal failed");
    }
    return oRet;
  }



  public String ajaxReadCitaData(Req oRP,Page oP,Ajax oAjax,JSONObject oExec) throws Exception {
    try {
      B3Req oR = insertOriginHeader(oRP);
      if (!checkAuth(oR,oAjax,oExec)) return oAjax.setFail("no-auth");
      log("ExecRead:"+oExec);
      JSONObject oJO = oExec.getJSONObject("payload");
      String sKeyName = oJO.getString("KeyName");
      String sValErr = validateKey(oR,oAjax,oExec,sKeyName);
      if (sValErr != null) return sValErr;
      JSONObject oRet = readCitaData(oR,oJO);
      oAjax.addBlock("RESULT",oRet);
      String sStr = oAjax.setGood("Cita record");
      if ("GIO".equals(oJO.optString("flag-eof"))) {
        sStr += "\r\n**GIO.EOF.MARKER**\r\n";
        log("Added GIO flag");
      }
      return sStr;
    } catch (Exception e) {
      return trap(e,oAjax);
    }
  }

  JSONObject readCitaData(B3Req oR,JSONObject oJO) throws Exception {
    String sKeyName = oJO.getString("KeyName");
    log("getCitaData key="+sKeyName);
    JSONObject oRet = new JSONObject();
    ACT.Status oS = oR.getACT().viewItemByKey(GdoCitaData.class,sKeyName);
    log("ReadStatus for "+sKeyName+" "+oS);
    if (oS.isGOOD()) {
      oS = oR.getACT().viewItem(GdoCitaData.class,oS.oItem.getGekID());
      GdoCitaData oGWD = (GdoCitaData)oS.oItem;
      JSONObject oRec = oGWD.populateJSON();
      oRet.put("STATUS","OK");
      oRet.put("CODE","found");
      oRet.put("RECORD",oRec);
      oRet.put("UpdateTS",""+oS.oItem.getGekUpdateTS().getTime());
    } else {
      oRet.put("STATUS","NAK");
      oRet.put("CODE","not-found");
    }
    return oRet;
  }

  JSONObject findCitaData(B3Req oR,JSONObject oJO,boolean bData,String sKeyName) throws Exception {
    log("getCitaData "+sKeyName);
    JSONObject oRet = new JSONObject();
    String[][] sLikes = new String[][]{new String[]{"KeyName",sKeyName}};
    ACT.Status oS = oR.getACT().viewSelectedItems(GdoCitaData.class,sLikes);
    log("ReadStatus for find key="+sKeyName+" good="+oS.isGOOD());
    if (oS.isGOOD()) {
      JSONArray oJA = new JSONArray();
      log("Find returned "+oS.oItems.length+" item(s)");
      for(Item oItem:oS.oItems) {
        GdoCitaData oGWD = (GdoCitaData)oItem;
        JSONObject oOut = new JSONObject();
        addStr(oOut,"GekID",""+oGWD.getGekID());
        addStr(oOut,"KeyName",oGWD.getKeyName());
        addStr(oOut,"CreateTS",""+oItem.getGekCreateTS().getTime());
        addStr(oOut,"UpdateTS",""+oItem.getGekUpdateTS().getTime());
        if (bData) addStr(oOut,"DataFld",""+""+oGWD.getDataFld().getValue());
        oJA.put(oOut);
      }
      oRet.put("STATUS","OK");
      oRet.put("CODE","found");
      oRet.put("RECORD",oJA);
    } else {
      oRet.put("STATUS","NAK");
      oRet.put("CODE","find faild");
    }
    return oRet;
  }

  JSONObject makeCitaData(B3Req oR,JSONObject oJO) throws Exception {
    String sKeyName = oJO.getString("KeyName");
    log("makeCitaData "+sKeyName);
    JSONObject oRet = new JSONObject();
    GdoCitaData oGWD = new GdoCitaData().populateItem(oJO);
    log("madeCitaData "+oGWD);
    ACT.Status oS = oR.getACT().viewItemByKey(GdoCitaData.class,sKeyName);
    log("ReadStatus for "+sKeyName+" "+oS);
    String sStat = "?";
    if (!oS.isGOOD()) {
      oS = oR.getACT().createRecord(oGWD);
      sStat = "new";
    } else {
      oS = oR.getACT().readItemForUpdate(GdoCitaData.class,oS.oItem.getGekID());
      GdoCitaData oOldGWD = (GdoCitaData)oS.oItem;
      oOldGWD.setDataFld(oGWD.getDataFld());
      oS = oR.getACT().updateItem(oOldGWD,oOldGWD.getGekRawUTS());
      oGWD.setGekID(oOldGWD.getGekID());
      sStat = "updated";
    }
    JSONObject oRec = oGWD.populateJSON();
    oRet.put("STATUS","OK");
    oRet.put("CODE",""+sStat);
    oRet.put("RECORD",oRec);
    return oRet;
  }

  void addStr(JSONObject oOut,String sFldName,String sValue) throws Exception {
    if (sValue == null) return;
    oOut.put(sFldName,sValue);
  }


  void sendReminder(B3Req oR) throws Exception {
    String sHTML = "<html>"
                 + "<body>"
                 + "<pre>"
                 + "  Your temporary password is: <b>{{TEMP}}</b>"
                 + "  Use this value to login to the system."
                 + "  The system will ask you to set up a new password."
                 + "</pre>"
                 + "Thanks,<br>"
                 + "SysAdmin"
                 + "</body>"
                 + "<html>";
    String sCRLF = "\r\n";
    String sTEXT = "  Your temporary password is: {{TEMP}}"+sCRLF
                 + "  Use this value to login to the system."+sCRLF
                 + "  The system will ask you to set up a new password."+sCRLF
                 + ""+sCRLF
                 + "Thanks,"+sCRLF
                 + "SysAdmin"+sCRLF;
    basicSendMail(oR,"public@rexcel.com","Your password",sHTML,sTEXT);

  }

  // ---------------------------------------------------------------
  // Note:  These are WAKS interfaces.  WAKS calls must provide the SuperUser ID & password.
  //
  // We also allow a leading $ to indicate we are reading writing User records.
  //
  // Since the SuperUser ID is created under the Boot application we have to supply
  // this to cause the encryptCitaPassword to use the write parm string.
  //
   public String ajaxWaksFindCitaData(Req oRP,Page oP,Ajax oAjax,JSONObject oExec) throws Exception {
    try {
      B3Req oR = insertOriginHeader(oRP);
      log("ExecFind:"+oExec);
      String sAuth = validateSuperAdmin(oR,oAjax,oExec,"Boot");
      if (sAuth != null) log("Failed:"+sAuth);
      if (sAuth != null) return sAuth;
      JSONObject oJO = oExec.getJSONObject("payload");
      String sKeyName = oJO.getString("KeyName");
      if (sKeyName.startsWith("$/")) sKeyName = "\\*"+sKeyName.substring(1);
      JSONObject oRet = findCitaData(oR,oJO,false,sKeyName);
      oAjax.addBlock("RESULT",oRet);
      return oAjax.setGood("Cita record");
    } catch (Exception e) {
      return trap(e,oAjax);
    }
  }

  public String ajaxWaksReadCitaData(Req oRP,Page oP,Ajax oAjax,JSONObject oExec) throws Exception {
    try {
      B3Req oR = insertOriginHeader(oRP);
      String sAuth = validateSuperAdmin(oR,oAjax,oExec,"Boot");
      if (sAuth != null) return sAuth;
      log("ExecRead:"+oExec);
      JSONObject oJO = oExec.getJSONObject("payload");
      String sKeyName = oJO.getString("KeyName");
      if (sKeyName.startsWith("$/")) sKeyName = "*"+sKeyName.substring(1);
      JSONObject oRet = readCitaData(oR,oJO);
      oAjax.addBlock("RESULT",oRet);
      String sStr = oAjax.setGood("Cita record");
      if ("GIO".equals(oJO.optString("flag-eof"))) {
        sStr += "\r\n**GIO.EOF.MARKER**\r\n";
        log("Added GIO flag");
      }
      return sStr;
    } catch (Exception e) {
      return trap(e,oAjax);
    }
  }

  public String ajaxWaksSendCitaData(Req oRP,Page oP,Ajax oAjax,JSONObject oExec) throws Exception {
    try {
      B3Req oR = insertOriginHeader(oRP);
      String sAuth = validateSuperAdmin(oR,oAjax,oExec,"Boot");
      if (sAuth != null) return sAuth;
      JSONObject oJO = oExec.getJSONObject("payload");
      String sKeyName = oJO.getString("KeyName");
      if (sKeyName.startsWith("$/")) sKeyName = "*"+sKeyName.substring(1);
      JSONObject oRet = makeCitaData(oR,oJO);
      oAjax.addBlock("RESULT",oRet);
      String sStr = oAjax.setGood("Cita record");
      if ("WAKS-call".equals(oAjax.getInput().getString("AjaxID"))) {
        sStr += "\r\n"+"**GIO.EOF.MARKER**\r\n"; // add EOF marker
      }
      //log("ajaxSendCitaData "+sStr);
      log("ajaxSendCitaData successful "+sKeyName);
      return sStr;
    } catch (Exception e) {
      return trap(e,oAjax);
    }
  }



  // ---------------------------------------------------------------
  // Note:  These are accesses with the 'boot' application so that B3Req is not instantiated
  //        because at this point it would fail.
  //
  //        These are special methods to test for and construct a Datastore.
  //
  public String ajaxValidateStore(Req oR,Page oP,Ajax oAjax,JSONObject oExec) throws Exception {
    try {
      //B3Req oR = insertOriginHeader(oRP);
      log("Exec validateStore:"+oExec);
      //if (!performLogin(oR,oAjax,oExec)) return oAjax.setFail("no-auth");
      ACT oACT = ACT.getACT();
      ACT.Status oS =  oACT.viewControlRecord();
      if (oS.isGOOD()) {
        return oAjax.setGood("validateStore primed");
      } else {
        return oAjax.setFail("not-primed");
      }
    } catch (Exception e) {
      e.printStackTrace();
      return trap(e,oAjax);
    }
  }


  public String ajaxPrimeStore(Req oR,Page oP,Ajax oAjax,JSONObject oExec) throws Exception {
    try {
      log("Exec PrimeStore:"+oExec);
      ACT oACT = ACT.getACT();
      oACT.formatControlRecord();
      App oApp = oR.getCust().findApp("Bbb");
      String sStrGEK = oApp.getParm("ActItems") + ";com.rsi.cita.gdo.GdoCitaData";
      String[] sGEKs = sStrGEK.split(";");
      oACT.assignControlRecordGEKs(sGEKs);
      JSONObject oAuth = oExec.getJSONObject("auth");
      String sKeyName = "././"+oAuth.getString("user");
      JSONObject oUser = new JSONObject();
      JSONObject oProp = new JSONObject();
      String sES = encryptCitaPassword(oR,oAuth.getString("user")+"/"+oAuth.get("password"),null);
      oProp.put("password",sES);
      oUser.put("DataFld",""+oProp);
      oUser.put("KeyName",sKeyName);
      GdoCitaData oGWD = new GdoCitaData().populateItem(oUser);
      ACT.Status oS = oACT.createRecord(oGWD);
      if (oS.isGOOD()) {
        return oAjax.setGood("primeStore OK");
      } else {
        return oAjax.setFail("primeStore failed "+oS);
      }
    } catch (Exception e) {
      return trap(e,oAjax);
    }
  }

  public String ajaxSuperLogin(Req oR,Page oP,Ajax oAjax,JSONObject oExec) throws Exception {
    try {
      log("Exec superLogin:"+oExec);
      String sOK = validateSuperAdmin(oR,oAjax,oExec,null);
      if (sOK != null) return sOK;
    } catch (Exception e) {
      return trap(e,oAjax);
    }
    return oAjax.setGood("superLogin primed");
  }

  public String ajaxAddAdminUser(Req oR,Page oP,Ajax oAjax,JSONObject oExec) throws Exception {
    try {
      log("Exec addAdminUser:"+oExec);
      String sOK = validateSuperAdmin(oR,oAjax,oExec,null);
      if (sOK != null) return sOK;
      ACT oACT = ACT.getACT();
      JSONObject oPL = oExec.getJSONObject("payload");
      String sPassword = oPL.getString("NewPassword");
      String sCust     = oPL.getString("AppID");
      String sUser     = oPL.getString("User");
      String sKeyName  = "*/"+sCust+"/"+sUser;
      String[][] sLikes = new String[][]{new String[]{"KeyName","\\"+sKeyName}};
      ACT.Status oS = oACT.viewSelectedItems(GdoCitaData.class,sLikes);
      log("ReadStatus for find key="+sKeyName+" good="+oS.isGOOD());
      if (oS.isGOOD() && (oS.oItems != null) && (oS.oItems.length > 0)) {
        return oAjax.setFail("App="+sCust+" user="+sUser+" already configured");
      } else {
        JSONObject oUser = new JSONObject();
        JSONObject oProp = new JSONObject();
        oProp.put("password",sPassword);
        oProp.put("role","admin");
        oUser.put("DataFld",""+oProp);
        oUser.put("KeyName",sKeyName);
        GdoCitaData oGWD = new GdoCitaData().populateItem(oUser);
        oS = oACT.createRecord(oGWD);
        if (oS.isGOOD()) {
          return oAjax.setGood("AddAdminUser OK");
        } else {
          return oAjax.setFail("AddAdminUser failed "+oS);
        }
      }
    } catch (Exception e) {
      return trap(e,oAjax);
    }
  }

  public String ajaxListApps(Req oR,Page oP,Ajax oAjax,JSONObject oExec) throws Exception {
    try {
      log("Exec addAdminUser:"+oExec);
      String sOK = validateSuperAdmin(oR,oAjax,oExec,null);
      if (sOK != null) return sOK;
      ACT oACT = ACT.getACT();
      String sKeyName = "*/%";
      String[][] sLikes = new String[][]{new String[]{"KeyName","\\"+sKeyName}};
      ACT.Status oS = oACT.viewSelectedItems(GdoCitaData.class,sLikes);
      log("ReadStatus for find key="+sKeyName+" good="+oS.isGOOD());
      if (oS.isGOOD() && (oS.oItems != null) && (oS.oItems.length > 0)) {
        JSONObject oRet = new JSONObject();
        JSONArray oJA = new JSONArray();
        log("Find returned "+oS.oItems.length+" item(s)");
        for(Item oItem:oS.oItems) {
          GdoCitaData oGWD = (GdoCitaData)oItem;
          JSONObject oOut = new JSONObject();
          String sKey = oGWD.getKeyName();
          String sDF  = ""+oGWD.getDataFld().getValue();
          JSONObject oProp = new JSONObject(sDF);
          String sRole = oProp.optString("role",null);
          if ((sRole != null) && (sRole.indexOf("admin") >= 0)) {
            String[] sParts = sKey.split("/");
            addStr(oOut,"app",sParts[1]);
            addStr(oOut,"user",sParts[2]);
            oJA.put(oOut);
          }
        }
        oRet.put("STATUS","OK");
        oRet.put("CODE","found");
        oRet.put("RECORD",oJA);
        oAjax.addBlock("RESULT",oRet);
        return oAjax.setGood("apps returned");
      } else {
        return oAjax.setFail("no apps configured");
      }
    } catch (Exception e) {
      return trap(e,oAjax);
    }
  }

  private String validateSuperAdmin(Req oR,Ajax oAjax,JSONObject oExec,String sApp) throws Exception {
    ACT oACT = ACT.getACT();
    JSONObject oAuth = oExec.getJSONObject("auth");
    String sKeyName = "././"+oAuth.getString("user");
    ACT.Status oS = oACT.viewItemByKey(GdoCitaData.class,sKeyName);
    if (oS.isGOOD()) {
      GdoCitaData oGWD = (GdoCitaData)oS.oItem;
      String sDF =  ""+oGWD.getDataFld().getValue();
      JSONObject oProps = new JSONObject(sDF);
      log("UserRecord:"+oProps);
      String sES0 = oProps.getString("password");
      String sES1 = encryptCitaPassword(oR,oAuth.getString("user")+"/"+oAuth.get("password"),sApp);
      if (sES1.equals(sES0)) {
        log("UserRecord:"+oProps+" is good as superuser");
        return null; // Its good
      } else {
        String sPassword = ""+oAuth.get("password"); //allow change if SuperUser token known and special overide format
        if (sPassword.startsWith("=") || sPassword.startsWith(".") ) {
          String[] sParts = sPassword.substring(1).split("/");
          if (sParts[0].equals(sES0) && sParts.length == 2) {
            sES1 = encryptCitaPassword(oR,oAuth.getString("user")+"/"+sParts[1],sApp);
            oProps.put("password",sES1);
            oGWD.setDataFld(new Text(""+oProps));
            oS = oACT.updateItem(oGWD,oGWD.getGekRawUTS());
            log("SuperUser password changed to "+sParts[1]+" "+sES1);
            return null; // Its good
          }
        }
        log("SuperUser credentials bad expect="+sES0+" have="+sES1);
        return oAjax.setFail("SuperUser credentials bad");
      }
    } else {
      return oAjax.setFail("Lost SuperUser record");
    }
  }


}
