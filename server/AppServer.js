/**
 * Created by yungu on 16/7/28.
 */



var s_socket_Server = require('./S_WSocket');
var S_Http = require('./S_Http');
//var s_iosocket_Server = require('./S_IOSocket');


var GameInfo=require('./GameInfo');
var Service=require("./service/Service");
var Socket=require("./socket");
var log=require("./Log");
var UserManager=require("./UserManager");
var HttpMsgNumber=require("./http/HttpMsgIds");
var Mongo=require("./mongo");
var uuid = require('node-uuid');
var http = require('http');
var childProcess=require('child_process');
var CommandType=require('./CommandType');
var MsgManager=require('./MsgManager');
var MatchManager=require('./MatchManager');
var GameLogic=require('./GameLogic');
var GameLogic_HongHu147=require('./GameLogic_HongHu147');
var GameLogic_BinZhou=require('./GameLogic_BinZhou');
var GameLogic_LuZhouDaEr=require('./GameLogic_LuZhouDaEr');
var RoomManager=require('./RoomManager');
var RoomDefine=require('./RoomDefine');
var FlowDefine=require('./FlowDefine');
var CmdId=require('./CmdId');
var fs = require('fs');
var ByteBuffer=require("./socket/ByteBuffer");

Date.prototype.Format = function (fmt) { //author: meizz
   var o = {
      "M+": this.getMonth() + 1, //月份
      "d+": this.getDate(), //日
      "h+": this.getHours(), //小时
      "m+": this.getMinutes(), //分
      "s+": this.getSeconds(), //秒
      "q+": Math.floor((this.getMonth() + 3) / 3), //季度
      "S": this.getMilliseconds() //毫秒
   };
   if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
   for (var k in o)
      if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
   return fmt;
}
//var Lib = require('./lib');

var thatScene=null;
var thatApp=null;
var gameCount=0;

String.prototype.startWith=function(str){
   if(str==null||str==""||this.length==0||str.length>this.length)
      return false;
   if(this.substr(0,str.length)==str)
      return true;
   else
      return false;
   return true;
}

function ReplaceAll(str, sptr, sptr1){
   while (str.indexOf(sptr) >= 0){
      str = str.replace(sptr, sptr1);
   }
   return str;
}
function  AppServer() {

   this.seedCount=1;
   this.serverList=[];
   this.gameRuning=true;
   this.isSpeech=0;
   this.ranks=[];

   this.frameTime=GameInfo.getInstance().gameFrameTime;
   this.heartTime=5000;
   Mongo.DaoManager.getInstance().init();

   MsgManager.getInstance().setApp(this);
   UserManager.getInstance().setApp(this);

   setTimeout(this.heart.bind(this), this.heartTime);
}

module.exports = AppServer;

AppServer.prototype.generate=function () {

   return this.seedCount++;
}

AppServer.prototype.start=function()
{

      this.gameLogic=new GameLogic();
      this.gameLogic.run();
      this.gameLogic.app=this;

      this.gameLogic_HongHu147=new GameLogic_HongHu147();
      this.gameLogic_HongHu147.run();
      this.gameLogic_HongHu147.app=this;

      this.gameLogic_BinZhou=new GameLogic_BinZhou();
      this.gameLogic_BinZhou.run();
      this.gameLogic_BinZhou.app=this;


      this.GameLogic_LuZhouDaEr=new GameLogic_LuZhouDaEr();
      this.GameLogic_LuZhouDaEr.run();
      this.GameLogic_LuZhouDaEr.app=this;




      Service.getInstance().regist(Socket.MsgNumber.ENTER_SCENE_REQUEST,this,this.onReceive.bind(this));
      Service.getInstance().regist(Socket.MsgNumber.RANDOM_MATCH_REQUEST,this,this.onReceive.bind(this));
      Service.getInstance().regist(Socket.MsgNumber.CREATE_ROOM_REQUEST,this,this.onReceive.bind(this));
      Service.getInstance().regist(Socket.MsgNumber.JOIN_ROOM_REQUEST,this,this.onReceive.bind(this));
      Service.getInstance().regist(Socket.MsgNumber.PUT_CARD_REQUEST,this,this.onReceive.bind(this));
      Service.getInstance().regist(Socket.MsgNumber.OPERATE_CARD_REQUEST,this,this.onReceive.bind(this));
      Service.getInstance().regist(Socket.MsgNumber.PASS_OPERATE_REQUEST,this,this.onReceive.bind(this));
      Service.getInstance().regist(Socket.MsgNumber.READY_REQUEST,this,this.onReceive.bind(this));
      Service.getInstance().regist(Socket.MsgNumber.CHECK_OLD_ROOM_REQUEST,this,this.onReceive.bind(this));
      Service.getInstance().regist(Socket.MsgNumber.ACK_REQUEST,this,this.onReceive.bind(this));
      Service.getInstance().regist(Socket.MsgNumber.GET_INFO_REQUEST,this,this.onReceive.bind(this));
      Service.getInstance().regist(Socket.MsgNumber.GET_ZHANJI_REQUEST,this,this.onReceive.bind(this));
      Service.getInstance().regist(Socket.MsgNumber.GET_RANK_REQUEST,this,this.onReceive.bind(this));
      Service.getInstance().regist(Socket.MsgNumber.HEART_CLIENT_TO_SERVER_REQUEST,this,this.onReceive.bind(this));
      Service.getInstance().regist(Socket.MsgNumber.HEART_CLIENT_TO_SERVER_RESPONSE,this,this.onReceive.bind(this));
      Service.getInstance().regist(Socket.MsgNumber.MSG_REQUEST,this,this.onReceive.bind(this));
      Service.getInstance().regist(Socket.MsgNumber.DISMISS_REQUEST,this,this.onReceive.bind(this));
      Service.getInstance().regist(Socket.MsgNumber.DISMISS_SEL_REQUEST,this,this.onReceive.bind(this));
      Service.getInstance().regist(Socket.MsgNumber.PLAY_REQUEST,this,this.onReceive.bind(this));
      Service.getInstance().regist(Socket.MsgNumber.GET_ROLE_INFO_REQUEST,this,this.onReceive.bind(this));
      Service.getInstance().regist(Socket.MsgNumber.PLAY_EFFECT_REQUEST,this,this.onReceive.bind(this));
      Service.getInstance().regist(Socket.MsgNumber.FLOWS_ACK_REQUEST,this,this.onReceive.bind(this));
      Service.getInstance().regist(Socket.MsgNumber.BIND_USER_REQUEST,this,this.onReceive.bind(this));
      Service.getInstance().regist(Socket.MsgNumber.BIND_MY_REQUEST,this,this.onReceive.bind(this));




   var that=this;

      this.child=childProcess.fork("./child.js");
      this.sendToChild=function (type,obj,isConvert) {

         var msg={};
         msg.type=type;
         msg.isConvert=isConvert;
         if(isConvert)
         {
            msg.obj=that.convertToString(obj);
         }
         else{
            msg.obj=obj;
         }
         this.child.send(msg);


      }
      this.child.on('message',function (msg) {

         var type=msg.type;
         var obj=msg.obj;
         var isConvert=msg.isConvert;
         if(isConvert)
         {

            that.convertToObj(obj);


         //   console.log("转换====="+type);
         }

         if(type==1)
         {
            //接受到消息
            that.onReceive(obj.msgNumber,obj);

         }
         else if(type==2)//关闭连接
         {
            //接受到消息
            var obj=msg.obj;
            var user=UserManager.getInstance().getUserBySessionId(obj.sessionId);
            if(user!=null)
            {
              // roleInfo.close();
               log("[用户"+user.name+"连接关闭]");
               if(!UserManager.getInstance().removeUser(user.uid))
               {
                  UserManager.getInstance().removeUser2(user);
               }

            }
            else{

               log("[用户null sessionId:"+obj.sessionId+"]");
            }
         }


      });


   this.child2=childProcess.fork("./child2.js");
   this.sendToChild2=function (type,obj,isConvert) {

      var msg={};
      msg.type=type;
      msg.isConvert=isConvert;
      if(isConvert)
      {
         msg.obj=that.convertToString(obj);
      }
      else{
         msg.obj=obj;
      }
      this.child2.send(msg);


   }
   this.child2.on('message',function (msg) {

      var type=msg.type;
      var obj=msg.obj;
      var isConvert=msg.isConvert;
      if(isConvert)
      {

         that.convertToObj(obj);

      }
      if(type==1)
      {
         //排行
         that.ranks=obj;
         console.log("[排行榜更新:"+that.ranks.length+"]");

      }


   });


   this.uploadChild=childProcess.fork("./uploadChild.js");
   this.sendToUloadChild=function (type,obj,reqId,isConvert) {

      var msg={};
      msg.type=type;
      msg.isConvert=isConvert;
      msg.reqId=reqId;
      if(isConvert)
      {
         msg.obj=that.convertToString(obj);
      }
      else{
         msg.obj=obj;
      }
      this.uploadChild.send(msg);

   }
   this.uploadChild.on('message',function (msg) {

      var type=msg.type;
      var obj=msg.obj;
      var reqId=msg.reqId;

      if(type==1)
      {
         var roomId=obj.name;
         var uid=obj.uid;
         var fileName=obj.fileName;
         var room=RoomManager.getInstance().getRoomById(roomId);
         if(room!=undefined)
         {
            console.log("推送语音");
            var yuYinNotify=new Socket.YuYinNotify();
            yuYinNotify.uid=uid;
            yuYinNotify.fileName=fileName;
            MsgManager.getInstance().sendToRoomUser(room,Socket.MsgNumber.YUYIN_NOTIFY,yuYinNotify);
         }



      }
      else if(type==CmdId.GAME_GONGGAO)
      {

         Mongo.DaoManager.getInstance().updateGameInfoByType(2,1,obj.txt,function (state) {

            if(state==-1)
            {
               console.log("[更新存储公告失败!]");
            }

         });
         
         var body=new Socket.GongGaoNotify();
         body.txt=obj.txt;
         MsgManager.getInstance().sendToAllPlayers(Socket.MsgNumber.GONGGAO_NOTIFY,body);

         console.log("[公告推送:"+obj.txt+"]");
      }
      else if(type==CmdId.GAME_MSG)
      {
         Mongo.DaoManager.getInstance().updateGameInfoByType(0,0,obj.txt,function (state) {

            if(state==-1)
            {
               console.log("[更新存储邮件消息失败!]");
            }
            else{
               console.log("[更新存储邮件消息成功!]");
            }

         });


      }
      else if(type==CmdId.GAME_KEFU)
      {
         Mongo.DaoManager.getInstance().updateGameInfoByType(1,0,obj.txt,function (state) {

            if(state==-1)
            {
               console.log("[更新存储客服信息失败!]");
            }
            else{
               console.log("[更新存储客服信息成功!]");
            }

         });
      }
      else if(type==CmdId.GAME_ADD_YUANBAO)
      {
         var uid=obj.uid;
         if(obj.count==undefined)
         {
            obj.count=0;
         }
         var count=parseInt(obj.count+"");//添加数目

         Mongo.DaoManager.getInstance().findUserByUid(uid,function (user) {

            var result={};
            result.state=0;

            if(user==null||user==undefined)
            {
               result.state=-1;
               result.txt="用户Id错误,未发现此玩家!";
               that.sendToUloadChild(type,result,reqId,false);
            }
            else{

               user.gold+=count;
               console.log("[添加用户元宝命令,uid:"+uid+",count:"+count+"]");

               Mongo.DaoManager.getInstance().updateUserByUid(uid,{"gold":user.gold},function (state) {


                  if(state==0)
                  {
                     that.sendToUloadChild(type,user,reqId,false);

                     var obj={};
                     obj.uid=user.uid;
                     obj.name=user.name;
                     obj.value=count;
                     that.sendToChild2(3,obj,false);

                     var onlineUser=UserManager.getInstance().getUserByUid(user.uid);
                     if(onlineUser!=null)
                     {
                        console.log("玩家在线");
                        onlineUser.gold=user.gold;
                        var roleInfoNotify=new Socket.RoleInfoNotify();
                        roleInfoNotify.user=onlineUser;
                        MsgManager.getInstance().sendTo(onlineUser,Socket.MsgNumber.ROLEINFO_NOTIFY,roleInfoNotify);
                     }
                     else
                     {
                        console.log("玩家不在线");
                     }


                  }
                  else{
                     result.state=-2;
                     result.txt="添加失败!";
                     that.sendToUloadChild(type,result,reqId,false);
                  }

               })



            }

         });

      }
      else if(type==CmdId.GAME_FENGHAO)
      {
         var uid=obj.uid;
         if(obj.accountState==undefined)
         {
            obj.accountState=0;
         }
         var state=parseInt(obj.accountState+"");//
         if(state!=1&&state!=0)
         {
            state=0;
         }

         Mongo.DaoManager.getInstance().findUserByUid(uid,function (user) {

            var result={};
            result.state=0;

            if(user==null||user==undefined)
            {
               result.state=-1;
               result.txt="用户Id错误,未发现此玩家!";
               that.sendToUloadChild(type,result,reqId,false);
            }
            else{

               user.accountState=state;
               console.log("[封号命令,uid:"+uid+",state:"+state+"]");

               Mongo.DaoManager.getInstance().updateUserByUid(uid,{"accountState":user.accountState},function (state) {


                  if(state==0)
                  {
                     that.sendToUloadChild(type,user,reqId,false);
                  }
                  else{
                     result.state=-2;
                     result.txt="封号失败!";
                     that.sendToUloadChild(type,result,reqId,false);
                  }

               })



            }

         });

      }
      else if(type==CmdId.GAME_ONLINE_COUNT)
      {
         if(that.onLineUserCount==undefined)
         {
            that.onLineUserCount=0;
         }
         var result={};
         result.count=that.onLineUserCount;
         that.sendToUloadChild(type,result,reqId,false);

      }
      else if(type==CmdId.GAME_USER_INFO)
      {
         var uid=obj.uid;
         if(obj.count==undefined)
         {
            obj.count=0;
         }


         Mongo.DaoManager.getInstance().findUserByUid(uid,function (user) {

            var result={};
            result.state=0;

            if(user==null||user==undefined)
            {
               result.state=-1;
               result.txt="用户Id错误,未发现此玩家!";
               that.sendToUloadChild(type,result,reqId,false);
            }
            else {

               that.sendToUloadChild(type, user, reqId, false);
            }
         });
      }
      else if(type==CmdId.GAME_ROOM_INFO)
      {

      }

   });

   this.convertToString=function (body) {

      if(body==undefined)
      {
         return undefined;
      }
      if(body==null)
      {
         return null;
      }
      if(body instanceof  Array)
      {
         var myBody=[];
         var len=body.length;
         for(var i=0;i<len;i++)
         {
            var obj=body[i];
            myBody[i]=this.convertToString(obj);
         }

         return myBody;
      }
      else if(typeof body === 'object'){
         var myBody={};
         // myBody.read="";
         // myBody.write="";
         for(var key in body)
         {
            var val=body[key];
            if(typeof val ==='function')
            {
               if(key=="write")
               {
                  myBody.write=val.toString();
               }
               else if(key=="read")
               {
                  myBody.read=val.toString();
               }
               else if(key=="clone")
               {
                  myBody.clone=val.toString();
               }
            }
            else{
               if(typeof val ==='object')
               {
                  //log(key+":"+val);
                  var childObj=this.convertToString(val);
                  myBody[key]=childObj;
               }
               else{
                  myBody[key]=val;
               }



            }
         }

         return myBody;
      }
      else{
         return body;
      }


   }


   this.convertToObj=function (body) {


      if(body instanceof Array)
      {
         var len=body.length;
         for(var i=0;i<len;i++)
         {
            var obj=body[i];
            this.convertToObj(obj);
         }
      }
      else if(typeof body === 'object'){

         for(var key in body)
         {
            var val=body[key];

            // log(key+"###"+val);

            if(key=="write")
            {
               body.write=eval("("+val+")");
            }
            else if(key=="read")
            {
               body.read=eval("("+val+")");
            }
            else if(key=="clone")
            {
               body.clone=eval("("+val+")");
            }
            else{

               if(typeof val ==='object')
               {
                  this.convertToObj(val);

               }



            }
         }

      }



   }
   
}

AppServer.prototype.heart=function () {


   setTimeout(this.heart.bind(this), this.heartTime);

   var heartReq=new Socket.HeartServerToClientRequest();
   heartReq.m_id=0;
   var playerCount=0;
   var botCount=0;
  // log("数量:"+Object.keys(this.scene.players).length);
   var users=UserManager.getInstance().getAllUsers();
   for(var key in users)
   {
      var user=users[key];

      if(user.uid.startWith("@"))
      {
         //机器人

         botCount++;

         continue;
      }
      else{

         playerCount++;
      }



      if(user.hasSend!=undefined&&user.hasSend)
      {
         //user.timeCount+=1;
        // log("[心跳:"+role.timeCount+"]");
        // if(user.timeCount>((1000)/this.heartTime*15))
         var t=new Date().getTime()-user.hearTime;
         t=t/1000;
         console.log("心跳等待:"+t+"s");
         if(t>180)
         {

            var obj={};
            obj.sessionId=user.sessionId;
            this.sendToChild(5,obj,false);



            var user=UserManager.getInstance().getUserBySessionId(obj.sessionId);
            if(user!=null)
            {
               // roleInfo.close();
               log("[用户"+user.name+"连接提前关闭]");
               if(!UserManager.getInstance().removeUser(user.uid))
               {
                  UserManager.getInstance().removeUser2(user);
               }

            }

            log("[心跳超时用户:"+user.name+"]");
         }


         MsgManager.getInstance().sendTo(user,Socket.MsgNumber.HEART_SERVER_TO_CLIENT_REQUEST,heartReq);

         continue;
      }

      //console.log("send:"+user.hasSend);
      MsgManager.getInstance().sendTo(user,Socket.MsgNumber.HEART_SERVER_TO_CLIENT_REQUEST,heartReq);
      user.hearTime=new Date().getTime();
      user.hasSend=true;
      user.timeCount=0;
   }


   this.onLineUserCount=playerCount;

   //console.log("[当前在线玩家:"+playerCount+"]");


}

function sleep(milliSeconds) {
   var startTime = new Date().getTime();
   while (new Date().getTime() < startTime + milliSeconds);
};


function getDateOnTime() {

   var now = new Date();
   var years = now.getYear()+1900;
   var months = now.getMonth()+1;
   var days = now.getDate();
   var hours = now.getHours();
   var min=now.getMinutes();

   var newYear=years;
   var newMonth=months;
   var newDay=days-2;
   var newHour="00";
   var newMin="00";
   newDay=newDay+"";
   
   if(newDay.length<2)
   {
      newDay="0"+newDay;
   }
   newMonth=""+newMonth;
   if(newMonth.length<2)
   {
      newMonth="0"+newMonth;
   }

   return newYear+"/"+newMonth+"/"+newDay+" "+"00:00";

}

AppServer.prototype.onReceive=function (msgNumber,obj) {

   if(obj==null)
   {
      return;
   }
  // log("MsgNumber:"+msgNumber);

   var body=obj.body;
   var sessionId=obj.sessionId;


   switch(msgNumber)
   {
      case Socket.MsgNumber.ENTER_SCENE_REQUEST:
      {
         log("[进入场景请求:"+body.name+"]");


         var roleInfo=new Socket.RoleInfo();
         roleInfo.sessionId=sessionId;

         var uid=body.uid;
         var name=body.name;
         var ip=body.ip;
         var gps=body.gps;

         var that=this;

         if(uid.startWith("@")){

            roleInfo.uid=uid;
            roleInfo.name=name;
            roleInfo.gold=0;
            roleInfo.diamond=0;
            roleInfo.score=0;
            roleInfo.headIcon="http://139.196.15.139/head.png";//"http://192.168.1.100:7788/head.png";

            UserManager.getInstance().appendUser(roleInfo);

            var res=new Socket.EnterSceneResponse();
            res.state=0;
            MsgManager.getInstance().sendTo(roleInfo,Socket.MsgNumber.ENTER_SCENE_RESPONSE,res);
         }
         else{

            var user=UserManager.getInstance().getUserByUid(uid);
            if(user!=undefined)
            {



               var obj={};
               obj.sessionId=user.sessionId;
               this.sendToChild(5,obj,false);



               var user2=UserManager.getInstance().getUserBySessionId(obj.sessionId);
               if(user2!=null)
               {
                  // roleInfo.close();
                  log("[踢掉"+user2.name+"##]");
                  if(!UserManager.getInstance().removeUser(user2.uid))
                  {
                     UserManager.getInstance().removeUser2(user2);
                  }

               }


               // console.log("[不能重复登录此账号,uid:"+uid+",name:"+user.name+"]");
               // var res=new Socket.EnterSceneResponse();
               // res.state=-3;
               // MsgManager.getInstance().sendTo(roleInfo,Socket.MsgNumber.ENTER_SCENE_RESPONSE,res);
               // return;
            }

            Mongo.DaoManager.getInstance().findUserByUid(uid,function (user) {

               if(user==null||user==undefined)
               {
                  log("用户为null");
                  var res=new Socket.EnterSceneResponse();
                  res.state=-1;
                  MsgManager.getInstance().sendTo(roleInfo,Socket.MsgNumber.ENTER_SCENE_RESPONSE,res);
                  return;
               }
               else{

                  if(user.accountState==1)
                  {
                     var res=new Socket.EnterSceneResponse();
                     res.state=-2;
                     MsgManager.getInstance().sendTo(roleInfo,Socket.MsgNumber.ENTER_SCENE_RESPONSE,res);

                     return;
                  }

                  roleInfo.uid=uid;
                  roleInfo.name=name;
                  roleInfo.gold=user.gold;
                  roleInfo.diamond=user.diamond;
                  roleInfo.score=user.score;
                  roleInfo.headIcon=user.headUrl;
                  roleInfo.ip=ip;
                  roleInfo.gps=gps;
                  roleInfo.sex=user.sex;
                  roleInfo.accountState=user.accountState;

                  // var a=Math.random();
                  // if(a<0.5)
                  // {
                  //
                  // }
                  // else{
                  //    roleInfo.sex=0;
                  // }

                  console.log("[进入游戏玩家,name:"+name+",Ip:"+ip+",gps:"+gps+"]");
                  UserManager.getInstance().appendUser(roleInfo);

                  var res=new Socket.EnterSceneResponse();
                  res.state=0;
                  MsgManager.getInstance().sendTo(roleInfo,Socket.MsgNumber.ENTER_SCENE_RESPONSE,res);


                  Mongo.DaoManager.getInstance().findGameInfoByType(2,function (obj) {

                     if(obj!=null)
                     {
                        //console.log("推送消息!");
                        var body=new Socket.GongGaoNotify();
                        body.txt=obj.value;
                        MsgManager.getInstance().sendToAllPlayers(Socket.MsgNumber.GONGGAO_NOTIFY,body);
                     }
                     else{
                        

                     }

                  })
                  

               }

            });





         }


         }

           break;
      case Socket.MsgNumber.RANDOM_MATCH_REQUEST://随机匹配
      {
         var uid=body.uid;
         var user=UserManager.getInstance().getUserByUid(uid);
         if(user!=undefined)
         {
            MatchManager.getInstance().appendMatchUser(user);

            var res=new Socket.RandomMatchResponse();
            res.state=0;
            MsgManager.getInstance().sendTo(user,Socket.MsgNumber.RANDOM_MATCH_RESPONSE,res);
         }
         else{

            var res=new Socket.RandomMatchResponse();
            res.state=-1;
            MsgManager.getInstance().sendTo(user,Socket.MsgNumber.RANDOM_MATCH_RESPONSE,res);
         }

      }
           break;
      case Socket.MsgNumber.CREATE_ROOM_REQUEST://创建房间
      {
         var uid=body.uid;
         var user=UserManager.getInstance().getUserByUid(uid);
         var res=new Socket.CreateRoomResponse();
         if(user!=undefined)
         {

            var needGold=0;

            if(RoomDefine.isTest2==1)
            {
               body.roomType=RoomDefine.ROOM_TYPE_LUZHOUDAER;//test

            }

            if(body.roomType==RoomDefine.ROOM_TYPE_BOPI)
            {
                  needGold=2;

            }
            else if(body.roomType==RoomDefine.ROOM_TYPE_HONGHU_147)
            {
               if(body.ju==4)
               {
                  needGold=1;
               }
               else
               {
                  needGold=2;
               }
            }
            else if(body.roomType==RoomDefine.ROOM_TYPE_BINZHOU)
            {
               if(body.ju==4)
               {
                  needGold=1;
               }
               else if(body.ju==8)
               {
                  needGold=2;
               }
               else if(body.ju==12)
               {
                  needGold=3;
               }
               else
               {
                  needGold=4;
               }
            }
            else if(body.roomType==RoomDefine.ROOM_TYPE_LUZHOUDAER)
            {

            }


            // //检查元宝是否足够
            if(RoomDefine.CHECK_GOLD==1)
            {
               if(user.gold<needGold)
               {
                  console.log("[元宝不足无法创建房间,uid:"+uid+",gold:"+user.gold+"]");
                  res.state=-2;
                  res.txt="创建房间需要房卡"+needGold+"张,是否购买?";
                  MsgManager.getInstance().sendTo(user,Socket.MsgNumber.CREATE_ROOM_RESPONSE,res);
                  return;
               }
            }

            var room=RoomManager.getInstance().createRoom(uid);
            room.showInfoFlg=body.gongneng;
            room.choushui=body.choushui;
            room.rule=body.gunze;
            room.gameCount=body.ju;
            room.maxCount=body.ju;
            room.playerCount=body.renshu;
            room.qita=body.qita;
            //console.log("qita::::::::"+body.qita);
            room.roomType=body.roomType;
            room.needGold=needGold;
            
           res.state=0;
            if(RoomDefine.isTest==1)
            {
               room.playerCount=2;
            }
            MsgManager.getInstance().sendTo(user,Socket.MsgNumber.CREATE_ROOM_RESPONSE,res);
            room.joinRoom(user);

            var res2=new Socket.RoomInfoNotify();
            var roomInfo=new Socket.RoomInfo();
            res2.roomInfo=roomInfo;
          //  log("roomId:"+room.roomId);
            roomInfo.roomId=room.roomId+"";
            roomInfo.leftCount=room.gameCount;
            roomInfo.uid=uid;
            roomInfo.choushui=body.choushui;
            roomInfo.renshu=body.renshu;
            roomInfo.gongneng=body.gongneng;
            roomInfo.gunze=body.gunze;
            roomInfo.time=new Date().Format("yyyy/MM/dd hh:mm:ss");
            roomInfo.roomType=room.roomType;
            roomInfo.qita=room.qita;
            roomInfo.state=room.state;
            roomInfo.maxCount=room.maxCount;

            console.log("[roomId:"+room.roomId+",人数:"+room.playerCount+",息囤转换:"+room.rule+",局数:"+room.gameCount+",其他:"+room.qita);

            
            var allUsersInRoom=room.getRoomUsers();
            for(var uid in allUsersInRoom)
            {
               var u=allUsersInRoom[uid];
               var roomUserInfo=new Socket.RoomUserInfo();
               roomUserInfo.index=u.roomUser.index;
               roomUserInfo.user=u;
               roomUserInfo.type=u.roomUser.type;
               roomUserInfo.isReady=u.roomUser.isReady;

               if(u.roomUser.isOnline)
               {
                  roomUserInfo.isOnline=1;
               }
               else{
                  roomUserInfo.isOnline=0;
               }

               roomInfo.roomUsers.push(roomUserInfo);
            }


            MsgManager.getInstance().sendTo(user,Socket.MsgNumber.ROOM_INFO_NOTIFY,res2);


            console.log("[创建房间:"+room.roomId+"]");

         }
         else{
            res.state=-1;
            MsgManager.getInstance().sendTo(user,Socket.MsgNumber.CREATE_ROOM_RESPONSE,res);
         }
      }
         break;
      case Socket.MsgNumber.JOIN_ROOM_REQUEST://加入房间
      {
         console.log("加入房间!");
         var roomId=body.roomId;
         var uid=body.uid;
         var user=UserManager.getInstance().getUserByUid(uid);
         var res=new Socket.JoinRoomResponse();




         if(user!=undefined)
         {



            var room=RoomManager.getInstance().getRoomById(roomId);
            if(room==undefined)
            {
               //console.log("#1");
               res.state=-3;
               MsgManager.getInstance().sendTo(user,Socket.MsgNumber.JOIN_ROOM_RESPONSE,res);
               return;

            }



            var isInRoom=false;
            var tmpUsers=room.getRoomUsers();
            for(var key in tmpUsers)
            {
               var u=tmpUsers[key];
               console.log("u:"+u.uid+"=="+uid);
               if(u.uid==uid)
               {
                  isInRoom=true;
                  break;
               }

            }
            if(!isInRoom)
            {

               // if(user.gold<3)
               // {
               //    console.log("[元宝不足无法进入房间,uid:"+uid+",gold:"+user.gold+"]");
               //    res.state=-2;
               //    res.txt="元宝不足,进入房间需要3元宝,是否购买元宝?";
               //    MsgManager.getInstance().sendTo(user,Socket.MsgNumber.JOIN_ROOM_RESPONSE,res);
               //    return;
               // }


               if(room.checkHasJoinAll())
               {
                 // console.log("#2");
                  res.state=-1;
                  MsgManager.getInstance().sendTo(user,Socket.MsgNumber.JOIN_ROOM_RESPONSE,res);
                  return;
               }
            }

            //console.log("join user id:"+user.uid);
            room.joinRoom(user);

            var res2=new Socket.RoomInfoNotify();
            var roomInfo=new Socket.RoomInfo();
            res2.roomInfo=roomInfo;
            roomInfo.roomId=room.roomId+"";
            roomInfo.leftCount=room.gameCount;
            roomInfo.uid=uid;
            roomInfo.choushui=room.choushui;
            roomInfo.renshu=room.playerCount;
            roomInfo.gongneng=room.showInfoFlg;
            roomInfo.gunze=room.rule;
            roomInfo.roomType=room.roomType;
            roomInfo.time=new Date().Format("yyyy/MM/dd hh:mm:ss");
            roomInfo.qita=room.qita;
            roomInfo.state=room.state;
            roomInfo.maxCount=room.maxCount;

            var allUsersInRoom=room.getRoomUsers();
            var  myInfo=null;
            for(var key in allUsersInRoom)
            {
               var u=allUsersInRoom[key];
               var roomUserInfo=new Socket.RoomUserInfo();
               roomUserInfo.index=u.roomUser.index;
               roomUserInfo.user=u;
               roomUserInfo.type=u.roomUser.type;
               roomUserInfo.isReady=u.roomUser.isReady;

               if(u.roomUser.isOnline)
               {
                  roomUserInfo.isOnline=1;
               }
               else{
                  roomUserInfo.isOnline=0;
               }
               roomInfo.roomUsers.push(roomUserInfo);

               if(u.uid==uid)
               {
                  myInfo=roomUserInfo;
               }
               console.log("headIcon:"+u.headIcon);
            }

            res.state=0;
            MsgManager.getInstance().sendTo(user,Socket.MsgNumber.JOIN_ROOM_RESPONSE,res);


            MsgManager.getInstance().sendTo(user,Socket.MsgNumber.ROOM_INFO_NOTIFY,res2);


            var res3=new Socket.FlushRoomNotify();
            res3.roomUsers.push(myInfo);
           // console.log("#:"+myInfo.user.uid);
            MsgManager.getInstance().sendToRoomUser(room,Socket.MsgNumber.FLUSH_ROOM_NOTIFY,res3);

            if(RoomDefine.isTest==1)
            {
               isInRoom=true;
            }
            if(isInRoom)
            {
               //推送当前玩家的牌
               var playerCardsRes=new Socket.RoomPlayerCardsNotify();

               for(var key in allUsersInRoom) {
                  var u = allUsersInRoom[key];
                  var rUser=u.roomUser;
                  if(u.uid==uid)
                  {
                     rUser.clientAck=1;
                  }


                  var plCards=new Socket.PlayerCards();
                  playerCardsRes.playerCards.push(plCards);
                  plCards.uid=u.uid;
                  plCards.roleType=rUser.type;

                  for(var c_id in rUser.cards1)
                  {
                     plCards.cards1.push(rUser.cards1[c_id]);

                  }

                  var cLen=rUser.cards2.length;
                  for(var i=0;i<cLen;i++)
                  {
                     var arr=rUser.cards2[i];
                     var groupCard=new Socket.GroupCard();
                     groupCard.cards=arr;
                     plCards.cards2.push(groupCard);
                  }


                  cLen=rUser.cards3.length;
                  for(var i=0;i<cLen;i++)
                  {
                     var cd=rUser.cards3[i];
                     plCards.cards3.push(cd);
                  }

                 // console.log("name:"+u.name+",cards1:"+plCards.cards1.length+",cards2:"+plCards.cards2.length+",cards3:"+plCards.cards3.length);

               }
               var isSetTableCard=false;


               // {
               //    if(room.ackNextState==RoomDefine.ROOM_WAIT_SELECTED_STATE)
               //    {
               //       isSetTableCard=true;
               //    }
               //
               //
               // }
               // else if(room.state==RoomDefine.ROOM_WAIT_SELECTED_STATE)
               // {
               //    isSetTableCard=true;
               // }
               if(room.state==RoomDefine.ROOM_WAIT_GOON_STATE)
               {
                  //playerCardsRes.playerCards=[];
                  console.log("####room.state==RoomDefine.ROOM_WAIT_GOON_STATE");

                  var len=room.roomHistoryFinishedNotify.length;
                  if(len>0)
                  {
                     var gameFinish=room.roomHistoryFinishedNotify[len-1];
                     gameFinish.state=3;
                     MsgManager.getInstance().sendTo(user,Socket.MsgNumber.GAME_FINISHED_NOTIFY,gameFinish);

                  }
                  else{
                     user.roomUser.isReady=0;
                  }



               }
               else{
                  console.log("####room.state!=RoomDefine.ROOM_WAIT_GOON_STATE:"+room.state);

                  playerCardsRes.tableCard=room.tableTopObj.card;
                  if(playerCardsRes.tableCard==null)
                  {
                     playerCardsRes.tableCard=new Socket.Card();
                  }
                  playerCardsRes.tableCardUid=room.tableTopObj.uid;
                  playerCardsRes.leftCardCount=room.leftCard();

                  var flow=null;
                  if(room.roomType==RoomDefine.ROOM_TYPE_BOPI)
                  {
                        flow=this.gameLogic.createFlow(room,1);
                  }
                  else if(room.roomType==RoomDefine.ROOM_TYPE_HONGHU_147)
                  {
                     flow=this.gameLogic_HongHu147.createFlow(room,1);
                  }
                  else if(room.roomType==RoomDefine.ROOM_TYPE_BINZHOU)
                  {
                     flow=this.gameLogic_BinZhou.createFlow(room,1);
                  }
                  else if(room.roomType==RoomDefine.ROOM_TYPE_LUZHOUDAER)
                  {
                     flow=this.GameLogic_LuZhouDaEr.createFlow(room,1);
                  }


                  if(room.state==RoomDefine.ROOM_WAIT_SELECTED_STATE)
                  {
                     console.log("[玩家重新进入房间-房间"+room.roomId+"状态-等待选择]");

                     var userCanSelectedActions=room.canSelectedUserAction;
                     for(var sel_uid in userCanSelectedActions)
                     {
                        var sel_arr=userCanSelectedActions[sel_uid];
                        var sel_len=sel_arr.length;
                        var sel_user=room.getUserByUid(sel_uid);

                        for(var i=0;i<sel_len;i++)
                        {
                           var action=sel_arr[i];
                           if(action.isDrop)
                           {
                              continue;
                           }
                           if(action.type==RoomDefine.ACTION_KECHI||action.type==RoomDefine.ACTION_KEHU||action.type==RoomDefine.ACTION_KEPENG||action.type==RoomDefine.ACTION_KEHU2)
                           {
                              flow.pushAction(sel_user,action);
                           }

                        }

                     }


                  }
                  else if(room.state==RoomDefine.ROOM_WAIT_PUT_CARD_STATE)
                  {

                     console.log("[玩家重新进入房间-房间"+room.roomId+"状态-等待出牌]");

                     playerCardsRes.tableCard=new Socket.Card();
                     
                     var action=new Socket.Action();
                     action.type=RoomDefine.ACTION_WAIT_PUT;//0:发牌,1:提,2:跑,3:可吃,4:吃,5:可胡，6:胡，7:可碰,8:碰,9:等待出牌,10:出牌,11:隐藏选择按钮,12:取消超时等待
                     //0:非反馈动作,1:需要反馈动作
                     action.ack=1;
                     var putCardUser=room.getUserByUid(room.currentPutCardUID);
                     flow.pushAction(putCardUser,action);


                  }
                  playerCardsRes.flow=flow;
                  MsgManager.getInstance().sendTo(user,Socket.MsgNumber.ROOM_PLAYER_CARDS_NOTIFY,playerCardsRes);



               }


            }


         }
         else{
            console.log("加入房间用户为null!");
         }


         if(room.state==RoomDefine.ROOM_DISMISS_STATE)
         {

            var res=room.disMissObj.res;
            var players=res.players;

            res.leftTime=GameInfo.getInstance().disMissWaitTime-(new Date().getTime()-room.disMissWaitTime)/1000;
            if(res.leftTime<0)
            {
               res.leftTime=0;
            }
            MsgManager.getInstance().sendToRoomUser(room, Socket.MsgNumber.DISMISS_NOTIFY, res);


         }
         if(RoomDefine.isTest==1)
         {
            // room.setTouchUserIndex(1);
            var uu=room.getUserByIndex(0);
            room.setPutCardUid(uu.uid);//设置出牌者
            room.setRoomState(RoomDefine.ROOM_ACTION_STATE);
            room.setFlowNomber(FlowDefine.WAIT_PUT_CARD_NO);
            // room.setFlowNomber(FlowDefine.TOUCH_CARD);


         }
      }
           break;
      case Socket.MsgNumber.PUT_CARD_REQUEST://出牌
      {
         var roomId=body.roomId;
         var uid=body.uid;
         var c_id=body.c_id;

        // console.log("roomId:"+roomId+",uid:"+uid+",c_id:"+c_id);
         var res=new Socket.PutCardResponse();
         var user=UserManager.getInstance().getUserByUid(uid);
         if(user!=null)
         {

            var room=RoomManager.getInstance().getRoomById(roomId);
            if(room==undefined)
            {
               res.state=-1;
               MsgManager.getInstance().sendTo(user,Socket.MsgNumber.PUT_CARD_RESPONSE,res);
               return;

            }
            if(RoomDefine.isTest==1)
            {

            }
            else{
               // if(room.checkIsRoomInAckState())
               // {
               //    //
               //    console.log("[ACK状态中,压后出牌]");
               //    var ackObj={};
               //    ackObj.obj=obj;
               //    ackObj.msgNumber=msgNumber;
               //    room.pushAckObj(ackObj);
               //    return;
               // }
            }

            var roomUser=user.roomUser;
            var card=roomUser.getCardByIdInCards1(c_id);
            if(card==null)
            {
               log("[出错错误,没有这张牌c_id:"+c_id+"]");
               res.state=-1;
               MsgManager.getInstance().sendTo(user,Socket.MsgNumber.PUT_CARD_RESPONSE,res);
               return;
            }
            //检查是否有玩家偎起牌
            var allUser=room.getRoomUsers();
            for(var key in allUser)
            {
               var u=allUser[key];
               if(u.uid==uid)
               {
                  continue;
               }
               var roomU=u.roomUser;
               var cards2=roomU.cards2;
               var cCount=cards2.length;
               var hasChecked=false;
               for(var i=0;i<cCount;i++)
               {
                  var arr=cards2[i];
                  if(arr.length==3)
                  {
                     var c1=arr[0];
                     var c2=arr[1];
                     var c3=arr[2];
                     if(c1.isBack==1||c2.isBack==1||c3.isBack==1)
                     {
                        if(c1.type==card.type&&c1.value==card.value)
                        {
                           //检查玩家出完牌是否听牌
                           if(roomUser.cards1[card.c_id]==undefined)
                           {
                              console.log("cards1中没有这个牌:type:"+card.type+",value:"+card.value+",c_id:"+card.c_id);
                           }
                           delete roomUser.cards1[card.c_id];
                           //if(roomUser.checkIsTingPai())
                           {
                              roomUser.cards1[card.c_id]=card;
                              roomUser.canPengAndChi=false;

                              log("[打出别人(偎)的牌,以后不可以再吃和碰]");
                           }
                           // else{
                           //    roomUser.cards1[card.c_id]=card;
                           //    log("[非听牌,不可以打出别人偎的牌]");
                           //    res.state=-2;
                           //    MsgManager.getInstance().sendTo(user,Socket.MsgNumber.PUT_CARD_RESPONSE,res);
                           //    return;
                           // }

                           hasChecked=true;
                           break;
                        }



                     }



                  }

               }
               if(hasChecked)
               {
                  break;
               }


            }


            roomUser.moveTo(card,roomUser.cards1,null);//移动牌
            room.setCurrentCardOnTableTop(uid,card,RoomDefine.ROOM_PUT_CARD_TYPE);
            room.setRoomState(RoomDefine.ROOM_ACTION_STATE);
            room.setFlowNomber(FlowDefine.PUT_CARD_NO);

            console.log("[出牌操作应答]");
            res.state=0;
            MsgManager.getInstance().sendToAckRoomUser(room,Socket.MsgNumber.PUT_CARD_RESPONSE,res,room.currentFlowsId);


         }




      }
           break;
      case Socket.MsgNumber.OPERATE_CARD_REQUEST://
      {

         var roomId=body.roomId;
         var uid=body.uid;
         var type=body.type;
         var cardIds=body.cardIds;
         var serverUser=body.user;//服务器托管传递
         var flowsId=body.flowsId;



         log("[选择操作请求:"+type+",uid:"+uid+"]");

         var res=new Socket.OperateCardResponse();
         var user=UserManager.getInstance().getUserByUid(uid);
         if(serverUser!=undefined&&serverUser!=null)
         {
            user=serverUser;
         }
         if(user!=null)
         {
            var room=RoomManager.getInstance().getRoomById(roomId);
            if(room==undefined)
            {
               console.log("房间为null!");
               res.state=-1;
               MsgManager.getInstance().sendTo(user,Socket.MsgNumber.OPERATE_CARD_RESPONSE,res);
               return;

            }


            if(room.isExpireFlows(flowsId))
            {
               console.log("[过期流程操作:roomId:"+roomId+",flowsId:"+flowsId+",name:"+user.name+"]");
               return;
            }

            // if(room.checkIsRoomInAckState())
            // {
            //    //
            //    console.log("[ACK状态中,压后出牌]");
            //    var ackObj={};
            //    ackObj.obj=obj;
            //    ackObj.msgNumber=msgNumber;
            //    room.pushAckObj(ackObj);
            //    return;
            // }
            //
            // if(room.hasNoResponseNotifyFlow())
            // {
            //    // console.log("[等待其他玩家流程ACK应答!!!!]");
            //    // var ackObj={};
            //    // ackObj.obj=obj;
            //    // ackObj.msgNumber=msgNumber;
            //    // room.waitRequest.push(ackObj);
            //    return;
            // }



            //检查是否操作有效
            if(!room.isRoomState(RoomDefine.ROOM_WAIT_SELECTED_STATE))
            {
               console.log("房间状态错误!");
               res.state=-1;
               MsgManager.getInstance().sendTo(user,Socket.MsgNumber.OPERATE_CARD_RESPONSE,res);
               return;
            }

            user.roomUser.waitSelected=false;

            if(type==0)//0:碰,1:吃,2:胡
            {

               room.dropCanSelectedUserActionByType(uid,RoomDefine.ACTION_KEHU);
               room.dropCanSelectedUserActionByType(uid,RoomDefine.ACTION_KEHU2);

               if(room.checkHasActionInCanSelected(uid,RoomDefine.ACTION_KEHU)||room.checkHasActionInCanSelected(uid,RoomDefine.ACTION_KEHU2))
               {

                  console.log("有胡等待");
                  room.pushOperateQueue2(uid,type,cardIds,0,room.currentFlowsId);
               }
               else{
                  room.clearOperateQueue();
                  room.pushOperateQueue(uid,type,cardIds,room.currentFlowsId);
                  room.setRoomState(RoomDefine.ROOM_ACTION_STATE);
                  room.setFlowNomber(FlowDefine.PENG_NO);


                  user.roomUser.removeChouChi(room.tableTopObj.card);
                  user.roomUser.removeChouPeng(room.tableTopObj.card);

                  res.state=0;
                  MsgManager.getInstance().sendToAckRoomUser(room,Socket.MsgNumber.OPERATE_CARD_RESPONSE,res,room.currentFlowsId);
               }


            }
            else if(type==1)
            {

               room.dropCanSelectedUserActionByType(uid,RoomDefine.ACTION_KEHU);
               room.dropCanSelectedUserActionByType(uid,RoomDefine.ACTION_KEHU2);
               room.dropCanSelectedUserActionByType(uid,RoomDefine.ACTION_KEPENG);

               //检查是否有碰,如果有碰,需要碰优先
               if(room.checkHasActionInCanSelected(uid,RoomDefine.ACTION_KEPENG)||room.checkHasActionInCanSelected(uid,RoomDefine.ACTION_KEHU)||room.checkHasActionInCanSelected(uid,RoomDefine.ACTION_KEHU2))
               {
                  console.log("有碰或胡等待");
                  room.pushOperateQueue2(uid,type,cardIds,0,room.currentFlowsId);

               }
               else{

                  var flg=true;
                  if(room.tableTopObj.uid==uid)
                  {


                  }
                  else{

                     //检查摸出牌的人是否有吃
                     var actionChi=room.getActionInCanSelected(room.tableTopObj.uid,RoomDefine.ACTION_KECHI);
                     if(actionChi!=null)
                     {
                        console.log("等待上家先吃!");

                        flg=false;

                        room.pushOperateQueue2(uid,type,cardIds,0,room.currentFlowsId);

                     }

                  }

                  if(flg)
                  {
                     room.clearOperateQueue();
                     room.pushOperateQueue(uid,type,cardIds,room.currentFlowsId);
                     room.setRoomState(RoomDefine.ROOM_ACTION_STATE);
                     room.setFlowNomber(FlowDefine.CHI_NO);

                     user.roomUser.removeChouChi(room.tableTopObj.card);
                     user.roomUser.removeChouPeng(room.tableTopObj.card);


                     res.state=0;
                     MsgManager.getInstance().sendToAckRoomUser(room,Socket.MsgNumber.OPERATE_CARD_RESPONSE,res,room.currentFlowsId);


                  }

               }

            }
            else if(type==2){
               var flg=true;
               //按照座次先后胡牌
               if(room.tableTopObj.uid==uid)
               {


               }
               else{
                  var actionHu=room.getActionInCanSelected(room.tableTopObj.uid,RoomDefine.ACTION_KEHU);
                  if(actionHu==null)
                  {
                     actionHu=room.getActionInCanSelected(room.tableTopObj.uid,RoomDefine.ACTION_KEHU2);
                  }
                  if(actionHu!=null)
                  {
                     console.log("等待上家先胡!");
                     flg=false;
                     room.pushOperateQueue2(uid,type,cardIds,0,room.currentFlowsId);
                  }
                  else
                  {
                     var nextUser=room.getNextUserByUidNoXian(room.tableTopObj.uid);
                     if(nextUser!=null&&nextUser.uid==uid)
                     {
                        flg=true;

                     }
                     else if(nextUser!=null){

                        var actionHu2=room.getActionInCanSelected(nextUser.uid,RoomDefine.ACTION_KEHU);
                        if(actionHu2==null)
                        {
                           actionHu2=room.getActionInCanSelected(nextUser.uid,RoomDefine.ACTION_KEHU2);
                        }
                        if(actionHu2!=null)
                        {
                           console.log("等待上家先胡2!");
                           flg=false;
                           room.pushOperateQueue2(uid,type,cardIds,0,room.currentFlowsId);
                        }


                     }
                  }
               }


               if(flg)
               {
                  room.clearOperateQueue();
                  room.pushOperateQueue(uid,type,cardIds,room.currentFlowsId);
                  room.setRoomState(RoomDefine.ROOM_ACTION_STATE);
                  room.setFlowNomber(FlowDefine.HU_NO);

                  res.state=0;
                  MsgManager.getInstance().sendToAckRoomUser(room,Socket.MsgNumber.OPERATE_CARD_RESPONSE,res,room.currentFlowsId);
               }

            }
            else if(type==3){//爆牌

               user.roomUser.canPengAndChi=false;

               room.clearOperateQueue();
               room.pushOperateQueue(uid,type,cardIds,room.currentFlowsId);
               room.setRoomState(RoomDefine.ROOM_ACTION_STATE);
               room.setTouchUserIndex(user.roomUser.index);
               room.setFlowNomber(FlowDefine.TOUCH_CARD);

               res.state=0;
               MsgManager.getInstance().sendToAckRoomUser(room,Socket.MsgNumber.OPERATE_CARD_RESPONSE,res,room.currentFlowsId);

            }
         

         }
         else {
            console.log("[选择-用户ID错误:"+uid+"]");
         }

      }
           break;
      case Socket.MsgNumber.PASS_OPERATE_REQUEST:
      {
         log("[放弃操作]");
         var uid=body.uid;
         var roomId=body.roomId;
         var flowsId=body.flowsId;



         var isBaoPaiPass=false;

         var res=new Socket.PassOperateResponse();
         var user=UserManager.getInstance().getUserByUid(uid);
         if(user!=null) {
            var room = RoomManager.getInstance().getRoomById(roomId);
            if (room == undefined) {
               res.state = -1;
               MsgManager.getInstance().sendToRoomUser(room, Socket.MsgNumber.PASS_OPERATE_RESPONSE, res);
               return;
            }

            if(room.isExpireFlows(flowsId))
            {
               console.log("[过期流程操作:roomId:"+roomId+",flowsId:"+flowsId+",name:"+user.name+"]");
               return;
            }

            // if(room.hasNoResponseNotifyFlowUser(uid))
            // {
            //    return;
            // }
            // if(flowsId!=room.currentFlowsId)
            // {
            //    return;
            // }

            var arr=room.canSelectedUserAction[uid];
            if(arr!=undefined)
            {

               var actionCount=arr.length;
               for(var i=0;i<actionCount;i++)
               {
                  var ac=arr[i];
                  if(ac.isDrop)
                  {
                     continue;
                  }
                  if(ac.type==RoomDefine.ACTION_KECHI)
                  {
                     user.roomUser.appendChouChi(room.tableTopObj.card);
                    // break;
                  }
                  else if(ac.type==RoomDefine.ACTION_KE_BAOPAI)
                  {
                     isBaoPaiPass=true;
                  }

               }

            }
            room.dropCanSelectedUserAction(uid);


            if(isBaoPaiPass)
            {

               room.setRoomState(RoomDefine.ROOM_ACTION_STATE);
               room.setFlowNomber(FlowDefine.TOUCH_21_CARD_NO);

               var res=new Socket.OperateCardResponse();
               res.state=0;
               MsgManager.getInstance().sendToAckRoomUser(room,Socket.MsgNumber.OPERATE_CARD_RESPONSE,res,room.currentFlowsId);


            }

            res.state=0;
            res.uid=uid;
            MsgManager.getInstance().sendToAckRoomUser(room, Socket.MsgNumber.PASS_OPERATE_RESPONSE, res,room.currentFlowsId);

         }
      }
           break;
      case Socket.MsgNumber.READY_REQUEST:
      {

         var uid=body.uid;
         var roomId=body.roomId;
         log("[玩家准备好:"+body.uid+",roomId:"+roomId+"]");
         var res=new Socket.ReadyResponse();
         var user=UserManager.getInstance().getUserByUid(uid);
         if(user!=null) {
            var room = RoomManager.getInstance().getRoomById(roomId);
            if (room == undefined) {
               res.state = -1;
               MsgManager.getInstance().sendToRoomUser(room, Socket.MsgNumber.READY_RESPONSE, res);
               return;
            }
            user.roomUser.isReady=0;

            res.state=0;
            res.uid=uid;
            MsgManager.getInstance().sendToRoomUser(room, Socket.MsgNumber.READY_RESPONSE, res);

         }
      }
           break;
      case Socket.MsgNumber.CHECK_OLD_ROOM_REQUEST:
      {
         var uid=body.uid;

         var res=new Socket.CheckOldRoomResponse();
         var user=UserManager.getInstance().getUserByUid(uid);
         if(user!=null)
         {

            var room=RoomManager.getInstance().checkUserInRoom(uid);
            if(room!=null)
            {
               console.log("直接进入未结束的房间");
               res.state=1;//0:没有未完成的牌局,1:有
               res.roomId=room.roomId;
               MsgManager.getInstance().sendTo(user, Socket.MsgNumber.CHECK_OLD_ROOM_RESPONSE, res);

            }
            else{
               console.log("没有未结束的房间");
               res.state=0;//0:没有未完成的牌局,1:有
               MsgManager.getInstance().sendTo(user, Socket.MsgNumber.CHECK_OLD_ROOM_RESPONSE, res);
            }

         }


      }
           break;
      case Socket.MsgNumber.ACK_REQUEST:
      {

         var type=body.type;//0:发牌,1:提,2:跑,3:可吃,4:吃,5:可胡，6:胡，7:可碰,8:碰,9:等待出牌,10:出牌,11:隐藏选择按钮,12:取消超时等待
         var uid=body.uid;
         var roomId=body.roomId;
         var flows_id=body.flows_id;

         var user=UserManager.getInstance().getUserByUid(uid);
         if(user!=null)
         {
            console.log("[客户端ACK,roomId:"+roomId+",type:"+type+",uid:"+uid+",flows_id:"+flows_id+"]");
            var room = RoomManager.getInstance().getRoomById(roomId);
            if(flows_id==room.currentFlowsId)
            {
               user.roomUser.clientAck=1;
            }

            var res=new Socket.AckResponse();
            res.state=0;
            res.type=type;
            res.flows_id=flows_id;
            MsgManager.getInstance().sendTo(user,Socket.MsgNumber.ACK_RESPONSE,res);

            var arr=user.roomUser.getAckWaitResponse(flows_id);
            if(arr!=undefined)
            {
               var size=arr.length;
               var arr2=[];
               for(var i=0;i<size;i++)
               {
                  var obj=arr[i];

                  var canSend=false;
                  if(type==9)
                  {
                     if(obj.msgNumber==Socket.MsgNumber.PUT_CARD_RESPONSE)
                     {
                        canSend=true;
                     }
                  }
                  else{
                     if(obj.msgNumber!=Socket.MsgNumber.PUT_CARD_RESPONSE)
                     {
                        canSend=true;
                     }
                  }

                  if(canSend)
                  {
                     MsgManager.getInstance().sendTo(user,obj.msgNumber,obj.body);
                     console.log("[收到ACK,发送等待应答,msgNumber:"+obj.msgNumber+",name:"+user.name+"]");
                  }
                  else{
                     arr2.push(obj);
                  }

               }
               if(arr2.length>0)
               {
                  arr.splice(0,arr.length);
                  for(var k=0;k<arr2.length;k++)
                  {
                     var objRes=arr2[k];
                     arr.push(objRes);

                     console.log("[剩余未处理应答:"+objRes.msgNumber+"]");
                  }

               }
               else{
                  user.roomUser.removeAckWaitResponse(flows_id);
               }


            }

         }




      }
           break;
      case Socket.MsgNumber.GET_INFO_REQUEST:
      {
         var type=body.type;
         if(type==0)
         {

            var user=UserManager.getInstance().getUserBySessionId(sessionId);

            if(user!=null)
            {
               Mongo.DaoManager.getInstance().findGameInfoByGroup(type,function (arr) {

                  if(arr==null||arr==undefined)
                  {

                     var res=new Socket.GetInfoResponse();
                     res.type=type;
                     res.value=[];
                     res.value.push("");
                     res.value.push("");

                     MsgManager.getInstance().sendTo(user,Socket.MsgNumber.GET_INFO_RESPONSE,res);
                     return;
                  }
                  else{
                     var val=[];
                     var len=arr.length;
                     for(var i=0;i<len;i++)
                     {
                        var info=arr[i];
                        val.push(info.value);
                     }
                     var res=new Socket.GetInfoResponse();
                     res.type=type;
                     res.value=val;
                     MsgManager.getInstance().sendTo(user,Socket.MsgNumber.GET_INFO_RESPONSE,res);

                  }

               });
            }



         }

      }
           break;
      case Socket.MsgNumber.GET_ZHANJI_REQUEST:
      {
         var uid=body.uid;

         var user=UserManager.getInstance().getUserByUid(uid);

         if(user!=null)
         {
            var strTime=getDateOnTime();
            console.log("strTime:"+strTime);//

            Mongo.DaoManager.getInstance().findZhanjiByTime(uid,strTime,function (arr) {

               if(arr==null||arr==undefined)
               {

                  var res=new Socket.GetZhanJiResponse();
                  res.zhanjis=[];
                  MsgManager.getInstance().sendTo(user,Socket.MsgNumber.GET_ZHANJI_RESPONSE,res);

               }
               else{
                  var val=[];
                  var len=arr.length;
                  for(var i=0;i<len;i++)
                  {
                     var info=arr[i];
                     var zhanji=new Socket.ZhanJi();
                     zhanji.time=info.time;
                     zhanji.time2=info.time2;
                     zhanji.ju=info.jushu;
                     zhanji.renshu=info.renshu;
                     zhanji.score=info.hushu;
                     zhanji.code=info.code;
                     if(info.ju!=undefined)
                     {
                        var juCount=info.ju.length;
                        for(var k=0;k<juCount;k++)
                        {
                           var juInfo=info.ju[k];

                           var juPlayers=new Socket.ZhanjiMeiJu();


                           var playersCount=juInfo.players.length;
                           for(var pIndex=0;pIndex<playersCount;pIndex++)
                           {
                              var playerJu=juInfo.players[pIndex];

                              var juObj=new Socket.ZhanJiObj();
                              juObj.uid=playerJu.uid;
                              juObj.name=playerJu.name;
                              juObj.zonghuxi=playerJu.zonghuxi;
                              juObj.dunshu=playerJu.dunshu;
                              juObj.dunshu2=playerJu.dunshu2;
                              juObj.huxi=playerJu.huxi;

                              juPlayers.players.push(juObj);
                           }

                           zhanji.juList.push(juPlayers);

                        }



                     }

                     val.push(zhanji);
                  }
                  var res=new Socket.GetZhanJiResponse();
                  res.zhanjis=val;
                  MsgManager.getInstance().sendTo(user,Socket.MsgNumber.GET_ZHANJI_RESPONSE,res);

               }

            });

         }


      }
           break;
      case Socket.MsgNumber.GET_RANK_REQUEST:
      {
         console.log("[排行榜请求]");
         var uid=body.uid;
         var user=UserManager.getInstance().getUserByUid(uid);
         if(user!=null)
         {
            var res=new Socket.GetRankResponse();
            res.ranks=[];
            var len=this.ranks.length;
            for(var i=0;i<len;i++)
            {
               var r=this.ranks[i];
               var u=UserManager.getInstance().getUserByUid(r.uid);
               if(u!=undefined)
               {
                  r.isOnline=0;
               }
               else{
                  r.isOnline=1;
               }
               res.ranks.push(r);
            }

            MsgManager.getInstance().sendTo(user,Socket.MsgNumber.GET_RANK_RESPONSE,res);

         }

      }
      break;
      case Socket.MsgNumber.HEART_CLIENT_TO_SERVER_REQUEST:
      {

        // console.log("收到客户端心跳请求");
         var user=UserManager.getInstance().getUserBySessionId(sessionId);
         var res=new Socket.HeartServerToClientResponse();
         MsgManager.getInstance().sendTo(user,Socket.MsgNumber.HEART_SERVER_TO_CLIENT_RESPONSE,res);

      }
         break;
      case Socket.MsgNumber.HEART_CLIENT_TO_SERVER_RESPONSE:
      {
         // log("心跳应答");
         var user=UserManager.getInstance().getUserBySessionId(sessionId);
         if(user==null)
         {
            return;
         }
         user.hasSend=false;


      }
         break;
      case Socket.MsgNumber.MSG_REQUEST:
      {
         var uid=body.uid;
         var roomId=body.roomId;
         var biaoqing=body.biaoqing;
         var msg=body.msg;
         console.log("[聊天信息,roomId:"+roomId+",uid:"+uid+",biaoqing:"+biaoqing+",msg:"+msg+"]");


         var user=UserManager.getInstance().getUserByUid(uid);
         if(user!=null) {
            var room = RoomManager.getInstance().getRoomById(roomId);
            if (room == undefined) {
               console.log("[聊天信息错误,房间Id不存在:"+roomId+"]");
               return;
            }

            var res=new Socket.MsgResponse();
            res.biaoqing=biaoqing;
            res.uid=uid;
            res.msg=msg;
            MsgManager.getInstance().sendToRoomUser(room, Socket.MsgNumber.MSG_RESPONSE, res);

         }
      }
           break;
      case Socket.MsgNumber.DISMISS_REQUEST:
      {
         console.log("[解散房间请求]");
         var uid=body.uid;
         var roomId=body.roomId;


         var user=UserManager.getInstance().getUserByUid(uid);
         if(user!=null) {
            var room = RoomManager.getInstance().getRoomById(roomId);
            if (room == undefined) {
               console.log("[解散房间请求错误,房间Id不存在:"+roomId+"]");
               return;
            }

            if(room.isRoomState(RoomDefine.ROOM_WAIT_START_STATE))//还没开局
            {
               var res=new Socket.DismissResponse();
               //0:等待玩家同意,1:直接退出,2:房间解散
               if(uid==room.uid)
               {
                  res.state=2;
                  //房主解散房间
                  res.txt="房主解散房间!";
                  console.log("[房主解散房间,roomId:"+roomId+"]");
                  RoomManager.getInstance().removeRoom(roomId);

                  MsgManager.getInstance().sendToRoomUser(room, Socket.MsgNumber.DISMISS_RESPONSE, res);

               }
               else{
                  res.state=1;
                  room.removeUser(uid);
                  console.log("[玩家退出房间:"+roomId+"]");
                  MsgManager.getInstance().sendTo(user, Socket.MsgNumber.DISMISS_RESPONSE, res);

                  //刷新房间
                  var res2=new Socket.RoomInfoNotify();
                  var roomInfo=new Socket.RoomInfo();
                  res2.roomInfo=roomInfo;
                  //  log("roomId:"+room.roomId);
                  roomInfo.roomId=room.roomId+"";
                  roomInfo.leftCount=room.gameCount;
                  roomInfo.uid=room.uid;
                  roomInfo.choushui=room.choushui;
                  roomInfo.renshu=room.playerCount;
                  roomInfo.gongneng=room.showInfoFlg;
                  roomInfo.gunze=room.rule;
                  roomInfo.time=new Date().Format("yyyy/MM/dd hh:mm:ss");
                  roomInfo.state=room.state;
                  roomInfo.roomType=room.roomType;
                  roomInfo.qita=room.qita;
                  roomInfo.state=room.state;
                  roomInfo.maxCount=room.maxCount;

                  var allUsersInRoom=room.getRoomUsers();
                  for(var u_id in allUsersInRoom)
                  {
                     var u=allUsersInRoom[u_id];
                     var roomUserInfo=new Socket.RoomUserInfo();
                     roomUserInfo.index=u.roomUser.index;
                     roomUserInfo.user=u;
                     roomUserInfo.type=u.roomUser.type;
                     roomUserInfo.isReady=u.roomUser.isReady;

                     if(u.roomUser.isOnline)
                     {
                        roomUserInfo.isOnline=1;
                     }
                     else{
                        roomUserInfo.isOnline=0;
                     }

                     roomInfo.roomUsers.push(roomUserInfo);
                  }


                  MsgManager.getInstance().sendToRoomUser(room,Socket.MsgNumber.ROOM_INFO_NOTIFY,res2);


               }


            }
            else{

               if(room.state==RoomDefine.ROOM_DISMISS_STATE)
               {


               }
               else{
                  var res=new Socket.DismissNotify();
                  for(var uid2 in room.roomUsers)
                  {
                     var user=room.roomUsers[uid2];
                     var obj=new Socket.DismissObj();
                     obj.uid=uid2;
                     if(user.uid==uid)
                     {
                        obj.state=0;//0:等待选择,1:同意,2:拒绝
                        obj.type=1;//0:选择者，1:发起者
                     }
                     else{
                        obj.state=0;//0:等待选择,1:同意,2:拒绝
                        obj.type=0;//0:选择者，1:发起者
                     }
                     res.players.push(obj);
                  }


                  res.leftTime=GameInfo.getInstance().disMissWaitTime;

                  MsgManager.getInstance().sendToRoomUser(room, Socket.MsgNumber.DISMISS_NOTIFY, res);

                  room.setDisMissState(res);
                  room.disMissWaitTime=new Date().getTime();
               }

            }


         }

      }
           break;
      case Socket.MsgNumber.DISMISS_SEL_REQUEST:
      {
         var uid=body.uid;
         var state=body.state;
         var roomId=body.roomId;
         console.log("[解散房间选择,uid:"+uid+",state:"+state+"]");


         var user=UserManager.getInstance().getUserByUid(uid);
         if(user!=null) {
            var room = RoomManager.getInstance().getRoomById(roomId);
            if (room == undefined) {
               console.log("[解散房间选择错误,房间Id不存在:"+roomId+"]");
               return;
            }
            if(!room.isRoomState(RoomDefine.ROOM_DISMISS_STATE))
            {
               console.log("[房间没有人发起解散请求:"+roomId+"]");
               return;
            }
            var res=room.disMissObj.res;
            var players=res.players;
            var len=players.length;
            var isAllAgree=true;
            for(var i=0;i<len;i++)
            {
               var obj=players[i];
               if(obj.uid==uid)
               {
                  obj.state=state;

               }
               //0:等待选择,1:同意,2:拒绝
               if(obj.state!=1&&obj.type!=1)//0:选择者，1:发起者
               {
                  isAllAgree=false;
               }

            }
            res.leftTime=GameInfo.getInstance().disMissWaitTime-(new Date().getTime()-room.disMissWaitTime)/1000;
            if(res.leftTime<0)
            {
               res.leftTime=0;
            }
            MsgManager.getInstance().sendToRoomUser(room, Socket.MsgNumber.DISMISS_NOTIFY, res);

            if(state==2)//1:同意,2:拒绝
            {
               console.log("[玩家拒绝解散房间,roomId:"+roomId+"]");
               room.setRoomState(room.disMissObj.dismissLastState);

            }

            if(isAllAgree)
            {
               console.log("[玩家全部同意解散房间,roomId:"+roomId+"]");


               
               var res=null;

               if(room.roomType==RoomDefine.ROOM_TYPE_BOPI)
               {
                  res=this.gameLogic.createGameFinishNotify(room,1,true);
               }
               else if(room.roomType==RoomDefine.ROOM_TYPE_HONGHU_147)
               {
                  res=this.gameLogic_HongHu147.createGameFinishNotify(room,1,true);
               }
               else if(room.roomType==RoomDefine.ROOM_TYPE_BINZHOU)
               {
                  res=this.gameLogic_BinZhou.createGameFinishNotify(room,1,true);
               }
               else if(room.roomType==RoomDefine.ROOM_TYPE_LUZHOUDAER)
               {
                  flow=this.GameLogic_LuZhouDaEr.createGameFinishNotify(room,1,true);
               }
               res.state=2;//0:小局结束,1:全局结束
               MsgManager.getInstance().sendToRoomUser(room,Socket.MsgNumber.GAME_FINISHED_NOTIFY,res);
               
               RoomManager.getInstance().removeRoom(roomId);

            }

         }

      }
           break;
      case Socket.MsgNumber.PLAY_REQUEST:
      {
         var uid=body.uid;
         var code=body.code;
         console.log("[回放请求,uid:"+uid+",code:"+code+"]");

         var user=UserManager.getInstance().getUserByUid(uid);
         if(user!=null) {


            var res=new Socket.PlayResponse();
            res.state=0;

            var fileName=GameInfo.getInstance().playHistoryDir+"/"+code+".bin";
            fs.readFile(fileName,function(err,data){
               if(err)
               {
                  console.log("[回放码错误,code:"+code+"]");
                  res.state=-1;
                  MsgManager.getInstance().sendTo(user, Socket.MsgNumber.PLAY_RESPONSE, res);
                  return;
               }
               var len=data.length;
               res.code=code;
               res.size=len;

               MsgManager.getInstance().sendTo(user, Socket.MsgNumber.PLAY_RESPONSE, res);




               console.log("data len:"+len);

               // var byteBuffer=new ByteBuffer()
               // byteBuffer.initBlank();
               // for(var j=0;j<len;j++)
               // {
               //    byteBuffer.putUint8(data[j]);
               // }
               // byteBuffer.offset=0;
               //
               //
               //
               // var roomInfoNotify=new Socket.RoomInfoNotify();
               // roomInfoNotify.read(byteBuffer);
               // MsgManager.getInstance().sendTo(user,Socket.MsgNumber.ROOM_INFO_NOTIFY,roomInfoNotify);
               //
               //
               // var flowNotify=new Socket.FlowsNotify();
               // var flows=[];
               // flowNotify.flows=flows;
               // var flowCount=byteBuffer.readShort();
               // console.log("[流程数目:"+flowCount+"]");
               // for(var k=0;k<flowCount;k++)
               // {
               //    var flow=new Socket.Flow();
               //    flow.read(byteBuffer);
               //    flows.push(flow);
               // }
               // MsgManager.getInstance().sendTo(user, Socket.MsgNumber.FLOWS_NOTIFY, flowNotify);
               //
               //
               // var finishGameNotify=new Socket.PlayBackFinishInfoNotify();
               // var infos=[];
               // finishGameNotify.infos=infos;
               // var finishCount=byteBuffer.readShort();
               // console.log("[结算数目:"+finishCount+"]");
               // for(var k=0;k<finishCount;k++)
               // {
               //    var f=new Socket.PlayBackFinisheGameInfo();
               //    f.read(byteBuffer);
               //    infos.push(f);
               // }
               // MsgManager.getInstance().sendTo(user, Socket.MsgNumber.PLAY_BACK_FINISH_INFO_NOTIFY, finishGameNotify);



            });

         }

      }
           break;
      case Socket.MsgNumber.GET_ROLE_INFO_REQUEST:
      {
         var uid=body.uid;
         var user=UserManager.getInstance().getUserByUid(uid);
         if(user!=undefined)
         {
            var roleInfoNotify=new Socket.RoleInfoNotify();
            roleInfoNotify.user=user;
            MsgManager.getInstance().sendTo(user,Socket.MsgNumber.ROLEINFO_NOTIFY,roleInfoNotify);
         }



      }
           break;
      case Socket.MsgNumber.PLAY_EFFECT_REQUEST:
      {
         var fromUid=body.fromUid;
         var toUid=body.toUid;
         var roomId=body.roomId;
         var type=body.type;

         console.log("播放特效请求");

         var user=UserManager.getInstance().getUserByUid(fromUid);
         if(user!=null) {
            var room = RoomManager.getInstance().getRoomById(roomId);
            if (room == undefined) {
               console.log("[PLAY_EFFECT_REQUEST 房间Id不存在:" + roomId + "]");
               return;
            }

            var res=new Socket.PlayEffectResponse();
            res.fromUid=fromUid;
            res.toUid=toUid;
            res.type=type;

            MsgManager.getInstance().sendToRoomUser(room,Socket.MsgNumber.PLAY_EFFECT_RESPONSE,res);

         }

      }
           break;
      case Socket.MsgNumber.FLOWS_ACK_REQUEST:
      {
         var flows_id=body.flows_id;
         var roomId=body.roomId;
         var uid=body.uid;
         console.log("[流程ACK,roomId:"+roomId+",uid:"+uid+",flows_id:"+flows_id+"]");

         var user=UserManager.getInstance().getUserByUid(uid);
         if(user!=null) {
            var room = RoomManager.getInstance().getRoomById(roomId);
            if (room == undefined) {
               console.log("[FLOWS_ACK_REQUEST 房间Id不存在:" + roomId + "]");
               return;
            }
            user.roomUser.removeNotifyFlowsById(flows_id);


            var notifyFlows=user.roomUser.notifyFlows;
            var notifyCount=notifyFlows.length;
            if(notifyCount>0)
            {

               var notifyObj=notifyFlows[0];
               console.log("[发送压后的下一个流程flowsId:"+notifyObj.notify.flows_id+"]");
               MsgManager.getInstance().sendTo(user,Socket.MsgNumber.FLOWS_NOTIFY,notifyObj.notify);

            }


            //#1
            // if(!room.hasNoResponseNotifyFlow())
            // {
            //    //检查是否有压后处理
            //    var count=room.waitRequest.length;
            //    if(count>0)
            //    {
            //       console.log("[流程应答全部收到,处理压后请求 count:"+count+"]");
            //       for(var i=0;i<count;i++)
            //       {
            //          var reqObj=room.waitRequest[i];
            //          if(reqObj!=null)
            //          {
            //             console.log("[msgNumber:"+reqObj.msgNumber+"]");
            //             this.onReceive(reqObj.msgNumber,reqObj.obj);
            //
            //          }
            //
            //       }
            //
            //       room.waitRequest=[];
            //
            //    }
            // }
         }


      }
           break;
      case Socket.MsgNumber.BIND_USER_REQUEST:
      {
         var uid=body.uid;
         var bindUid=body.bindUid;

         var res=new Socket.BindUserResponse();
         res.user=new Socket.BindObj();

         var user=UserManager.getInstance().getUserByUid(uid);
         if(user!=null) {

            if(bindUid=="")
            {
               console.log("[查询是否绑定玩家,name:"+user.name+"]");

               Mongo.DaoManager.getInstance().findMyBind(uid,function (obj) {

                     if(obj==null)
                     {
                        res.state=0;
                        MsgManager.getInstance().sendTo(user,Socket.MsgNumber.BIND_USER_RESPONSE,res);
                     }
                     else{

                        var bindObj=new Socket.BindObj();
                        bindObj.uid=obj.uid;


                        bindObj.uid=uid;
                        bindObj.name=obj.name;
                        bindObj.headUrl=obj.headUrl;

                        bindObj.bindUid=obj.bindUid;
                        bindObj.bindName=obj.bindName;
                        bindObj.bindHeadUrl=obj.bindHeadUrl;

                        bindObj.date=obj.date;

                        res.state=1;
                        res.user=bindObj;
                        MsgManager.getInstance().sendTo(user,Socket.MsgNumber.BIND_USER_RESPONSE,res);

                     }

               })

            }
            else{

               if(uid==bindUid)
               {
                  res.state=-1;
                  res.txt="不能绑定自己,绑定失败!";
                  MsgManager.getInstance().sendTo(user,Socket.MsgNumber.BIND_USER_RESPONSE,res);

                  return;
               }
               Mongo.DaoManager.getInstance().findUserByUid(bindUid,function (user2) {

                  res.state=0;

                  if(user2==null||user2==undefined)
                  {
                     res.state=-1;
                     res.txt="玩家Id错误,绑定失败!";
                     MsgManager.getInstance().sendTo(user,Socket.MsgNumber.BIND_USER_RESPONSE,res);

                     console.log("[绑定玩家失败,uid:"+uid+",bindUid:"+bindUid+"]");
                  }
                  else{

                     console.log("[查询是否绑定玩家#2,name:"+user.name+"]");

                     Mongo.DaoManager.getInstance().findMyBind(uid,function (obj) {

                        if(obj==null)
                        {

                           var bindObj=new Socket.BindObj();
                           bindObj.uid=uid;
                           bindObj.name=user.name;
                           bindObj.headUrl=user.headIcon;
                           bindObj.bindUid=bindUid;
                           bindObj.bindName=user2.name;
                           bindObj.bindHeadUrl=user2.headUrl;

                           bindObj.date=new Date().Format("yyyy/MM/dd hh:mm:ss");


                           Mongo.DaoManager.getInstance().addBindUser(bindObj,function (state) {

                              if(state==-1)
                              {
                                 console.log("[绑定存储失败!!!]");
                              }

                           });

                           res.state=1;
                           res.user=bindObj;
                           MsgManager.getInstance().sendTo(user,Socket.MsgNumber.BIND_USER_RESPONSE,res);

                           user.gold+=10;
                           user2.gold+=10;

                           UserManager.getInstance().updateUserGold(user);
                           UserManager.getInstance().updateUserGold(user2);

                           console.log("[绑定玩家,uid:"+uid+",bindUid:"+bindUid+",name:"+user.name+",bindName:"+user2.name+"]");

                           var onlineUser=UserManager.getInstance().getUserByUid(user2.uid);
                           if(onlineUser!=null)
                           {
                              onlineUser.gold=user2.gold;
                              var roleInfoNotify=new Socket.RoleInfoNotify();
                              roleInfoNotify.user=onlineUser;
                              MsgManager.getInstance().sendTo(onlineUser,Socket.MsgNumber.ROLEINFO_NOTIFY,roleInfoNotify);
                           }


                           var roleInfoNotify2=new Socket.RoleInfoNotify();
                           roleInfoNotify2.user=user;
                           MsgManager.getInstance().sendTo(user,Socket.MsgNumber.ROLEINFO_NOTIFY,roleInfoNotify2);

                        }
                        else{
                              console.log("[已经绑定玩家!]");
                           res.state=-1;
                           res.txt="已经绑定玩家!!!";
                           MsgManager.getInstance().sendTo(user,Socket.MsgNumber.BIND_USER_RESPONSE,res);
                        }

                     })





                  }

               });
            }


         }


      }
           break;
      case Socket.MsgNumber.BIND_MY_REQUEST:
      {
         var uid=body.uid;

         var res=new Socket.BindMyResponse();

         var user=UserManager.getInstance().getUserByUid(uid);
         if(user!=null) {

            console.log("[查询绑定 "+user.name+" 的玩家]");

            Mongo.DaoManager.getInstance().findBindMy(uid,function (list) {

               if(list==null)
               {
                  console.log("[查询失败]");
                  MsgManager.getInstance().sendTo(user,Socket.MsgNumber.BIND_MY_RESPONSE,res);
               }
               else{

                  var count=list.length;

                  console.log("[绑定我的玩家:"+count+"]");

                  for(var i=0;i<count;i++)
                  {
                     var obj=list[i];

                     var bindObj=new Socket.BindObj();
                     bindObj.uid=obj.uid;
                     bindObj.bindUid=obj.bindUid;
                     bindObj.name=obj.name;
                     bindObj.bindName=obj.bindName;
                     bindObj.bindHeadUrl=obj.bindHeadUrl;
                     bindObj.headUrl=obj.headUrl;
                     bindObj.date=obj.date;

                     res.users.push(bindObj);
                  }

                  MsgManager.getInstance().sendTo(user,Socket.MsgNumber.BIND_MY_RESPONSE,res);


               }

            })
         }


      }
         break;

   }
}

AppServer.prototype.createFlow=function (room,type) {



}



process.on('uncaughtException', function (err) {
   //打印出错误
   console.log(err);
   //打印出错误的调用栈方便调试
   console.log(err.stack);
});

app=new AppServer();
app.start();

