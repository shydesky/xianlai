/**
 * Created by yungu on 16/9/30.
 */

var WebSocket = require('ws');
var Service=require("./service/Service");
var ByteBuffer=require("./socket/ByteBuffer");
var MessageFactory=require("./socket/MessageFactory");
var log=require("./Log");
var Socket=require("./socket");
var Mongo=require("./mongo");

var sessionId=0;


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

    sessionId++;
    ws.sessionId=sessionId;
    this.child.socketMap[sessionId]=ws;
    
    console.log("[建立连接sessionId:"+sessionId+"]");

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
    delete s_wsocket.child.socketMap[socket.sessionId]
    console.log("关闭!!!!!socket.sessionId:"+socket.sessionId);

    var obj={};
    obj.sessionId=socket.sessionId;
    this.s_wsocket.child.sendToProcess(2,obj,false);


}
function handleMessage(message) {

    var byteBuf=new ByteBuffer();
    byteBuf.initBlank();
    byteBuf.setMsg(message);
    var msgNumber=byteBuf.readInt16();
    //console.log("server msgNumber:"+msgNumber);
    var factory=MessageFactory.getInstance();
    var body=factory.build(msgNumber,byteBuf);

   // body=this.s_wsocket.cloneObj(body);

    var obj={
        body:body,
        msgNumber:msgNumber,
        sessionId:this.socket.sessionId
    }

    this.s_wsocket.child.sendToProcess(1,obj,true);


};