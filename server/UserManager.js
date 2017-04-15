/**
 * Created by yungu on 16/11/4.
 */

var Socket=require("./socket");
var MsgManager=require("./MsgManager");
var Mongo=require("./mongo");

var UserManager=(function()
{
    var unique;
    function getInstance(){
        return unique || ( unique = new UserManagerClass() );
    }
    return {
        getInstance : getInstance
    }
})();

var UserManagerClass=function () {

    this.users={};
    this.sessionIdMap={};
    this.app=null;
    
    this.setApp=function (app) {
        this.app=app;
    }
    this.getAllUsers=function () {

        return this.users;
    }
    this.appendUser=function (roleInfo) {
        this.users[roleInfo.uid]=roleInfo;
        this.sessionIdMap[roleInfo.sessionId]=roleInfo;
    }
    this.removeUser=function (uid) {
        var user=this.users[uid];
        if(user==undefined)
        {
            console.log("[注意:user==undefined]");
            return false;
        }

        return this.removeUser2(user);
    }
    this.removeUser2=function (user) {

        if(user.roomUser!=undefined&&user.roomUser!=null)
        {
            user.roomUser.isOnline=false;
            user.roomUser.setTuoGuan(true);
           
            console.log("[用户:"+user.name+"下线,牌局被托管]");

            var res=new Socket.OffLineNotify();
            res.uid=user.uid;
            MsgManager.getInstance().sendToRoomUser(user.room,Socket.MsgNumber.OFF_LINE_NOTIFY,res);

        }
        delete this.users[user.uid];
        if(user!=undefined)
        {
            delete this.sessionIdMap[user.sessionId];
        }


        return true;
    }
    this.removeUserBySessionId=function (sessionId) {
        var user=this.sessionIdMap[sessionId];

        if(user!=undefined)
        {
            delete this.sessionIdMap[sessionId];
            delete  this.users[user.uid];
        }

    }

    this.getUserByUid=function (uid) {
        return this.users[uid];
    }
    this.getUserBySessionId=function (sessionId) {
        return this.sessionIdMap[sessionId]
    }
    
    this.addGold=function (uid,gold) {
        if(gold<=0)
        {
            return gold;
        }
        var user=this.users[uid];
        user.gold+=gold;

        var obj={};
        obj.uid=user.uid;
        obj.name=user.name;
        obj.value=gold;
        this.app.sendToChild2(1,obj,false);

        this.updateUserGold(user);
        
    }
    this.subGold=function (uid,gold) {


        if(gold<=0)
        {
            return;
        }
        var user=this.users[uid];
        if(user==undefined)
        {
            console.log("[扣除元宝失败]");
            return;
        }
        user.gold-=gold;
        if(user.gold<0)user.gold=0;

        var obj={};
        obj.uid=user.uid;
        obj.name=user.name;
        obj.value=gold;
        obj.head=user.headIcon;
        this.app.sendToChild2(2,obj,false);

        this.updateUserGold(user);


    }

    this.updateUserGold=function (u) {

        Mongo.DaoManager.getInstance().findUserByUid(u.uid,function (user) {


            if(user==null||user==undefined)
            {
               console.log("[更新玩家元宝失败!]");
            }
            else{

                Mongo.DaoManager.getInstance().updateUserByUid(u.uid,{"gold":u.gold},function (state) {


                    if(state==0)
                    {


                    }
                    else{
                        console.log("[更新玩家元宝失败!]");
                    }

                })



            }

        });

    }

    
}
module.exports = UserManager;