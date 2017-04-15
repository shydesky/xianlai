/**
 * Created by yungu on 16/9/29.
 */


var WebSocket=require("./childWebSocket");
var GameInfo=require('./GameInfo');
var ByteBuffer=require("./socket/ByteBuffer");
var MessageFactory=require("./socket/MessageFactory");
var log=require("./Log");
var Socket=require("./socket");
var CommandType=require('./CommandType');
var that=null;

function caculatePixSize(blood) {
    var size=Math.pow(blood*1000,1/3);
    return size;
}

Array.prototype.insert = function (index, item) {
    this.splice(index, 0, item);
};

function getSpeedByBlood( blood) {

    var size= caculatePixSize(blood);
    var speed=(7000/size)+40;
    // var speed=this.maxSpeed-(blood-this.init_blood)/11;
    // if(speed<10)speed=10;
    return speed;

}

function pingT() {

    setTimeout(pingT, 10);

    for(var key in that.socketMap)
    {
        var socket=that.socketMap[key];
        if(socket!=null&&socket!=undefined)
        {

            try {

                socket.ping();

            }
            catch(err)
            {
                console.log("错误#");
                console.log("err:"+err)
            }


        }
    }


}

function Child()
{

    this.socketServer=new WebSocket(GameInfo.getInstance().webSocketPort);
    this.socketServer.child=this;
    this.socketMap={};
    //setTimeout(pingT,10);

    that=this;

    process.on('uncaughtException', function (err) {
        //打印出错误
        console.log(err);
        //打印出错误的调用栈方便调试
        console.log(err.stack);
    });

    process.on('message',function (m) {

        var type=m.type;
        var obj=m.obj;
        var isConvert=m.isConvert;
        if(isConvert)
        {
            that.convertToObj(obj);
        }

        if(type==CommandType.SEND_MSG_TO_USER)//发送消息　
        {

            var msgNumber=obj.msgNumber;
            var body=obj.body;
            var sessionId=obj.sessionId;
            that.send(sessionId,msgNumber,body);

        }
        else if(type==CommandType.SEND_MSG_TO_SOME_USER)//发送消息　
        {

            var msgNumber=obj.msgNumber;
            var body=obj.body;
            var sessionIds=obj.sessionIds;
            var len=sessionIds.length;
            for(var i=0;i<len;i++)
            {
                var sessionId=sessionIds[i];
                that.send(sessionId,msgNumber,body);
            }

        }
        else if(type==CommandType.SEND_MSG_TO_ALL_USER)//发送消息　
        {
            //console.log("发送给所有玩家");
            var msgNumber=obj.msgNumber;
            var body=obj.body;
            that.sendAll(msgNumber,body);

        }
        else if(type==5)//用户退出　
        {

            var sessionId=obj.sessionId;
            var socket=that.socketMap[sessionId];
            delete that.socketMap[sessionId];
            if(socket!=null&&socket!=undefined)
            {
                socket.close();
            }
            else{
                console.log("查找关闭sessionId失败:"+sessionId);
            }
            console.log("[主动关闭:"+sessionId+"]");

        }
        else if(type==7)//全部关闭
        {

            for(var sessionId in that.socketMap)
            {
                var socket=that.socketMap[sessionId];
                if(socket!=null&&socket!=undefined)
                {
                    socket.close();
                }
                delete that.socketMap[sessionId];
            }

            console.log("[全部关闭]");

        }



    });



    this.sendAll=function(msgNumber,body) {


        //  body.write=eval("("+body.write+")");

        var buf=new Socket.ByteBuffer();
        buf.initBlank();
        buf.putInt16(msgNumber);
        body.write(buf);



        var array = new Uint8Array(buf.buffer);
        var l = buf.count;
        var buffer= new ArrayBuffer(l);
        var view = new Uint8Array(buffer);
        for (var i = 0; i < l; i++) {
            view[i] = array[i];
        }

        //console.log("发送给所有玩家2222:"+Object.keys(this.socketMap).length);
        for(var key in this.socketMap)
        {
            var socket=this.socketMap[key];
            if(socket!=null&&socket!=undefined)
            {

                try {
                   // console.log("发送:"+msgNumber);
                    socket.send(view.buffer);

                }
                catch(err)
                {
                    console.log("错误");
                    console.log("err:"+err)
                }


            }
        }


    }

   this.send=function(sessionId,msgNumber,body) {

       
     //  body.write=eval("("+body.write+")");
       
        var buf=new Socket.ByteBuffer();
        buf.initBlank();
        buf.putInt16(msgNumber);
        body.write(buf);



        var array = new Uint8Array(buf.buffer);
        var l = buf.count;
        var buffer= new ArrayBuffer(l);
        var view = new Uint8Array(buffer);
        for (var i = 0; i < l; i++) {
            view[i] = array[i];
        }


        var socket=this.socketMap[sessionId];
       //log("sessionId:"+sessionId+"  "+socket+"  "+Object.keys(this.socketMap).length);
        if(socket!=null&&socket!=undefined)
        {
            //log("发送消息:"+msgNumber);

            try {

                socket.send(view.buffer);

            }
            catch(err)
            {
                console.log("错误");
                console.log("err:"+err)
            }

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
    
    this.sendToProcess=function (type,obj,isConvert) {

        var msg={};
        msg.type=type;
        msg.isConvert=isConvert;
        if(isConvert)
        {
            msg.obj=this.convertToString(obj);
        }
        else{
            msg.obj=obj;
        }
        process.send(msg);
    }






}



// test();
Child();


module.exports = Child;