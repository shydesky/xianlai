/**
 * Created by yungu on 16/9/6.
 */


var dgram = require('dgram');

var Service=require("./service/Service");
var ByteBuffer=require("./socket/ByteBuffer");
var MessageFactory=require("./socket/MessageFactory");
var log=require("./Log");
var Socket=require("./socket");
var Mongo=require("./mongo");
var fs = require('fs');

var socketMap={};



function Utf8ArrayToStr(array) {
    var out, i, len, c;
    var char2, char3;

    out = "";
    len = array.length;
    i = 0;
    while(i < len) {
        c = array[i++];
        switch(c >> 4)
        {
            case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
            // 0xxxxxxx
            out += String.fromCharCode(c);
            break;
            case 12: case 13:
            // 110x xxxx   10xx xxxx
            char2 = array[i++];
            out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
            break;
            case 14:
                // 1110 xxxx  10xx xxxx  10xx xxxx
                char2 = array[i++];
                char3 = array[i++];
                out += String.fromCharCode(((c & 0x0F) << 12) |
                    ((char2 & 0x3F) << 6) |
                    ((char3 & 0x3F) << 0));
                break;
        }
    }

    return out;
}

var Socket=function (server,ip,port) {
    this.ip=ip;
    this.port=port;
    this.udpServer=server;

    this.send=function (buf) {

        console.log("发送");
        var buffer=new Buffer(buf);
        this.udpServer.send(buffer,0,buffer.length,this.port,this.ip);
    }
}

function S_UDPSocket(serverPort) {


    var that=this;

    var server = dgram.createSocket('udp4');
    server.bind(serverPort);
    // server.setTTL(250);

    server.on('listening', function(){

        console.log('Server started at ', serverPort);
    });


    server.on('message', function(msg, info){


        var ad=info.address;
        var port=info.port
        var key=ad+":"+port;


      var len=msg.length;
        var buffer= new ArrayBuffer(len);
        var view = new Uint8Array(buffer);
        for(var i=0;i<len;i++)
        {
            view[i]=msg[i];


        }
        var str=Utf8ArrayToStr(view);
        str+="\n";
        console.log(str);

        fs.appendFile('./clientLog.txt',str,'utf8',function(err){
            if(err)
            {
                console.log(err);
            }
        });

        // console.log("on message=====:"+key);
        // var socket=socketMap[key];
        //
        // if(socket==undefined)
        // {
        //     var so=new Socket(server,ad,port);
        //     socketMap[key]=so;
        //     handleMessage(msg,so);
        // }
        // else{
        //     handleMessage(msg,socket);
        // }

    });

    server.on('error', function(){
        // handle error
    });

    server.on('close', function(){
        // handle error


    });


   // this.socketServer.on('connection', connectionEstablished.bind(this));

};

module.exports = S_UDPSocket;

function connectionEstablished(ws,that) {

    console.log("connect finished");



};

function close(error) {

    // var s_wsocket=this.s_wsocket;
    // var socket=this.socket;
    // var roleInfo=s_wsocket.appServer.scene.getRoleBySocket(socket);
    // var roleName="";
    // if(roleInfo==null&&s_wsocket.appServer.lastScene!=undefined)
    // {
    //     roleInfo=s_wsocket.appServer.lastScene.getRoleBySocket(socket);
    //     roleName=s_wsocket.appServer.lastScene.removePlayerBySocket(socket);
    //
    //     if(roleName.startWith("#"))
    //     {
    //         log("[机器人"+roleName+"退出]");
    //         return;
    //     }
    //     if(roleInfo!=null)
    //     {
    //         roleInfo.socket=null;
    //         var uid=roleInfo.uid;
    //         console.log("uid::::"+uid);
    //         Mongo.DaoManager.getInstance().findUserByUid(uid,function (user) {
    //
    //             if(user==null||user==undefined)
    //             {
    //
    //
    //                 log("[用户数据错误,uid:"+uid+"]");
    //
    //
    //             }
    //             else{
    //                 user.eatMass+=roleInfo.tmpMass;
    //                 user.eatPlayerCount+=roleInfo.tmpEatPlayer;
    //                 user.beEatCount+=roleInfo.tmpBeEatPlayer;
    //                 user.gameCount++;
    //
    //
    //                 var txt={"exp":roleInfo.exp,"level":roleInfo.level,"money":roleInfo.money,"eatMass":user.eatMass,"eatPlayerCount":user.eatPlayerCount,"beEatCount":user.beEatCount,"gameCount":user.gameCount};
    //                 Mongo.DaoManager.getInstance().updateUserByUid(uid,txt,function (state) {
    //
    //
    //                     if(state==0)
    //                     {
    //
    //
    //
    //
    //                     }
    //                     else{
    //
    //                         log("[用户"+user.name+"退出更新失败!]");
    //                     }
    //
    //                 })
    //             }
    //
    //         });
    //     }
    //     else{
    //         log("[#close 用户为null]");
    //     }
    // }
    // else{
    //     roleName=s_wsocket.appServer.scene.removePlayerBySocket(socket);
    //
    //     if(roleName.startWith("#"))
    //     {
    //         log("[机器人"+roleName+"退出]");
    //
    //         var playerUpdate=new Socket.PlayerUpdate();
    //         playerUpdate.oper=3;
    //         playerUpdate.player=roleInfo;
    //         if(roleInfo!=null)
    //         {
    //             s_wsocket.appServer.scene.sendToAllPlayers(Socket.MsgNumber.PLAYER_UPDATE, playerUpdate);
    //         }
    //
    //         return;
    //     }
    //
    //     if(roleInfo!=null)
    //     {
    //         roleInfo.socket=null;
    //         var uid=roleInfo.uid;
    //         console.log("uid::::"+uid);
    //         Mongo.DaoManager.getInstance().findUserByUid(uid,function (user) {
    //
    //             if(user==null||user==undefined)
    //             {
    //                 log("[用户数据错误,uid:"+uid+"]");
    //             }
    //             else{
    //                 user.eatMass+=roleInfo.tmpMass;
    //                 user.eatPlayerCount+=roleInfo.tmpEatPlayer;
    //                 user.beEatCount+=roleInfo.tmpBeEatPlayer;
    //                 user.gameCount++;
    //
    //
    //                 var txt={"exp":roleInfo.exp,"level":roleInfo.level,"money":roleInfo.money,"eatMass":user.eatMass,"eatPlayerCount":user.eatPlayerCount,"beEatCount":user.beEatCount,"gameCount":user.gameCount};
    //                 Mongo.DaoManager.getInstance().updateUserByUid(uid,txt,function (state) {
    //
    //
    //                     if(state==0)
    //                     {
    //
    //
    //
    //
    //                     }
    //                     else{
    //
    //                         log("[用户"+user.name+"退出更新失败!]");
    //                     }
    //
    //                 })
    //             }
    //
    //         });
    //     }
    //     else{
    //         log("[#close 用户为null]");
    //     }
    //
    //     var playerUpdate=new Socket.PlayerUpdate();
    //     playerUpdate.oper=3;
    //     playerUpdate.player=roleInfo;
    //     if(roleInfo!=null)
    //     {
    //         s_wsocket.appServer.scene.sendToAllPlayers(Socket.MsgNumber.PLAYER_UPDATE, playerUpdate);
    //     }
    // }



    log("[用户 "+roleName+" 下线]");
}
function toArrayBuffer(buf) {
    var ab = new ArrayBuffer(buf.length);
    var view = new Uint8Array(ab);
    var aa="";
    for (var i = 0; i < buf.length; ++i) {
        view[i] = buf[i];
        aa+=buf[i];
    }
   // console.log("字节:"+aa);
    return view;
}

function handleMessage(msg,socket) {

     //console.log("message:"+msg.length);

    var message= toArrayBuffer(msg);

    var byteBuf=new ByteBuffer();
    byteBuf.initBlank();
    byteBuf.setMsg(message);

    //var len=byteBuf.readInt();
    //console.log("len:"+len);
   // var seq=byteBuf.readInt();
    var msgNumber=byteBuf.readInt();
    // var isZip=byteBuf.readByte();

    console.log("server msgNumber:"+msgNumber);
    var factory=MessageFactory.getInstance();
    var body=factory.build(msgNumber,byteBuf);

    var obj={
        body:body,
        socket:socket,
        s_wsocket:null
    }
    Service.getInstance().excute(msgNumber,obj);
};