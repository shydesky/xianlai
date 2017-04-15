/**
 * Created by yungu on 16/7/28.
 */
var WebSocket = require('ws');


var Service=require("./service/Service");
var ByteBuffer=require("./socket/ByteBuffer");
var MessageFactory=require("./socket/MessageFactory");
var log=require("./Log");
var Socket=require("./socket");
var Mongo=require("./mongo");


function S_WSocket(serverPort) {

    this.socketServer = new WebSocket.Server({port:serverPort});

    this.socketServer.on('connection', connectionEstablished.bind(this));

    // Properly handle errors because some people are too lazy to read the readme
    this.socketServer.on('error', function err(e) {
        switch (e.code) {
            case "EADDRINUSE":
                console.log("[Error] Server could not bind to port! Please close out of Skype or change 'serverPort' in gameserver.ini to a different number.");
                break;
            case "EACCES":
                console.log("[Error] Please make sure you are running Ogar with root privileges.");
                break;
            default:
                console.log("[Error] Unhandled error code: " + e.code);
                break;
        }
        process.exit(1); // Exits the program
    });
};

module.exports = S_WSocket;

function connectionEstablished(ws) {

    console.log("connect finished");

    var bindObject = {
        s_wsocket: this,
        socket: ws
    };
    ws.on('message', handleMessage.bind(bindObject));
    ws.on('error', close.bind(bindObject));
    ws.on('close', close.bind(bindObject));

};

function close(error) {

    var s_wsocket=this.s_wsocket;
    var socket=this.socket;
    var roleInfo=s_wsocket.appServer.scene.getRoleBySocket(socket);
    var roleName="";
    if(roleInfo==null&&s_wsocket.appServer.lastScene!=undefined)
    {
        roleInfo=s_wsocket.appServer.lastScene.getRoleBySocket(socket);
        roleName=s_wsocket.appServer.lastScene.removePlayerBySocket(socket);

        if(roleName.startWith("@"))
        {
            log("[机器人"+roleName+"退出]");
            return;
        }
        if(roleInfo!=null)
        {
            roleInfo.socket=null;
            var uid=roleInfo.uid;
            console.log("uid::::"+uid);
            Mongo.DaoManager.getInstance().findUserByUid(uid,function (user) {

                if(user==null||user==undefined)
                {


                       // log("[用户数据错误,uid:"+uid+"]");


                }
                else{

                    user.eatMass+=roleInfo.tmpMass;
                    user.eatPlayerCount+=roleInfo.tmpEatPlayer;
                    user.beEatCount+=roleInfo.tmpBeEatPlayer;
                    user.gameCount++;


                    var txt={"exp":roleInfo.exp,"level":roleInfo.level,"money":roleInfo.money,"eatMass":user.eatMass,"eatPlayerCount":user.eatPlayerCount,"beEatCount":user.beEatCount,"gameCount":user.gameCount};
                    Mongo.DaoManager.getInstance().updateUserByUid(uid,txt,function (state) {


                        if(state==0)
                        {




                        }
                        else{

                            log("[用户"+user.name+"退出更新失败!]");
                        }

                    })
                }

            });
        }
        else{
            log("[#close 用户为null]");
        }
    }
    else{
        roleName=s_wsocket.appServer.scene.removePlayerBySocket(socket);

        if(roleName.startWith("@"))
        {
            log("[机器人"+roleName+"退出]");

            var playerUpdate=new Socket.PlayerUpdate();
            playerUpdate.oper=3;
            playerUpdate.player=roleInfo;
            if(roleInfo!=null)
            {
                s_wsocket.appServer.scene.sendToAllPlayers(Socket.MsgNumber.PLAYER_UPDATE, playerUpdate);
            }

            return;
        }

        if(roleInfo!=null)
        {
            roleInfo.socket=null;
            var uid=roleInfo.uid;
            console.log("uid::::"+uid);
            Mongo.DaoManager.getInstance().findUserByUid(uid,function (user) {

                if(user==null||user==undefined)
                {
                    log("[用户数据错误,uid:"+uid+"]");
                }
                else{
                    user.eatMass+=roleInfo.tmpMass;
                    user.eatPlayerCount+=roleInfo.tmpEatPlayer;
                    user.beEatCount+=roleInfo.tmpBeEatPlayer;
                    user.gameCount++;


                    var txt={"exp":roleInfo.exp,"level":roleInfo.level,"money":roleInfo.money,"eatMass":user.eatMass,"eatPlayerCount":user.eatPlayerCount,"beEatCount":user.beEatCount,"gameCount":user.gameCount};
                    Mongo.DaoManager.getInstance().updateUserByUid(uid,txt,function (state) {


                        if(state==0)
                        {




                        }
                        else{

                            log("[用户"+user.name+"退出更新失败!]");
                        }

                    })
                }

            });
        }
        else{
            log("[#close 用户为null]");
        }

        var playerUpdate=new Socket.PlayerUpdate();
        playerUpdate.oper=3;
        playerUpdate.player=roleInfo;
        if(roleInfo!=null)
        {
            s_wsocket.appServer.scene.sendToAllPlayers(Socket.MsgNumber.PLAYER_UPDATE, playerUpdate);
        }
    }



    log("[用户 "+roleName+" 下线]");
}
function handleMessage(message) {

   // console.time("hear");
    //var that=this.s_wsocket;
    var byteBuf=new ByteBuffer();
    byteBuf.initBlank();
    byteBuf.setMsg(message);
    var msgNumber=byteBuf.readInt16();
    //console.log("server msgNumber:"+msgNumber);
    var factory=MessageFactory.getInstance();
    var body=factory.build(msgNumber,byteBuf);
    // switch(msgNumber)
    // {
    //     case ENTER_SCENE_REQUEST:
    //     {
    //         //console.log(body.name);
    //         var res=new EnterSceneResponse();
    //         res.state=0;
    //
    //
    //     }
    //         break;
    //
    // }
    var obj={
        body:body,
        socket:this.socket,
        s_wsocket:this.s_wsocket
    }
    Service.getInstance().excute(msgNumber,obj);
};