/**
 * Created by yungu on 16/11/4.
 */

var CommandType=require('./CommandType');
var Room=require("./Room");
var Socket=require("./socket");


var MsgManager=(function()
{
    var unique;
    function getInstance(){
        return unique || ( unique = new MsgManagerClass() );
    }
    return {
        getInstance : getInstance
    }
})();

var MsgManagerClass=function () {

   this.setApp=function (myApp) {
       this.app=myApp;
   }

    this.sendTo=function (user,msgNumber,body) {

        if(user==undefined)
        {
            console.log("[sendTo]user==undefined,msgNumber:"+msgNumber);
            return;
        }
        var response={};
        response.sessionId=user.sessionId;
        response.body=body.clone();
        response.msgNumber=msgNumber;
        this.app.sendToChild(CommandType.SEND_MSG_TO_USER,response,true);
    }
    
    this.sendToRoomUser=function (room,msgNumber,body) {
        var users=room.getRoomUsers();
        for(var uid in users)
        {
            var user=users[uid];
            //console.log("msgNumber:"+msgNumber+",uid:"+user.uid);
            this.sendTo(user,msgNumber,body);
        }



    }
    this.sendToAckRoomUser=function (room,msgNumber,body,flowsId) {
        var users=room.getRoomUsers();
        for(var uid in users)
        {
            var user=users[uid];
            if(user.roomUser.clientAck==1)
            {
                this.sendTo(user,msgNumber,body);
            }
            else{
                user.roomUser.appendAckWaitResponse(flowsId,msgNumber,body);
            }
        }

        if(msgNumber==Socket.MsgNumber.OPERATE_CARD_RESPONSE)
        {
            room.appendExpireFlows(flowsId);
        }

    }

    this.sendToAllPlayers=function (msgNumber,body) {

        var response={};
        response.body=body;
        response.msgNumber=msgNumber;
        this.app.sendToChild(CommandType.SEND_MSG_TO_ALL_USER,response,true);


    }


}

module.exports = MsgManager;