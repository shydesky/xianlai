/**
 * Created by yungu on 16/8/14.
 */
var WebSocket = require('ws');
var ByteBuffer=require("./socket/ByteBuffer");
var MessageFactory=require("./socket/MessageFactory");
var log=require("./Log");
var Socket=require("./socket");
var NickBotName = require('./NickNameBot');
var Service=require("./service/Service");
var GameInfo=require('./GameInfo');
var http = require('http');
var questring=require('querystring');
var botId=1;
var hasGameFinished=false;



function BotSocket() {


    this.wsocket = new WebSocket("ws://127.0.0.1:"+GameInfo.getInstance().webSocketPort);
    this.wsocket._binaryType = "arraybuffer";
    this.hasLogin=false;
    this.hasColsed=false;
    this.name="";
    this.uid="";
    this.w=960;
    this.h=640;
    this.state=0;
    this.walkTime=0;
    this.runAwayTime=0;
    this.attackTime=0;
    var that=this;
    this.wsocket.onopen = function(){
        // console.log("connect finished");

        var req=new Socket.EnterSceneRequest();

        var len=NickBotName.length;
        var Rand = Math.random();
        var index=Math.round(Rand * len);

        if(index>=len)index=len-1;
        var name = NickBotName[index];
        req.name=name;
        req.uid="@"+botId++;
        req.ip="127.0.0.1";
        req.gps="000";

        that.sendData(Socket.MsgNumber.ENTER_SCENE_REQUEST,req);

        that.name=req.name;
        that.uid=req.uid;

    }
    this.wsocket.onmessage = function(e){


        var data = e.data;
        var buf = new Uint8Array(data);
        var byteBuf=new ByteBuffer();
        byteBuf.initBlank();
        byteBuf.setMsg(buf);
        var msgNumber=byteBuf.readInt16();

        var factory=MessageFactory.getInstance();
        var body=factory.build(msgNumber,byteBuf);

        // if(msgNumber!=2013)
        //console.log("server msgNumber:"+msgNumber);


        switch(msgNumber)
        {
            case Socket.MsgNumber.ENTER_SCENE_RESPONSE:
            {
                if(body.state!=0)
                {
                    log("[登录错误!]");
                    that.close();
                    return;
                }

                that.hasLogin=true;

                that.joinRoom("123456");

            }
                break;
            case Socket.JOIN_ROOM_RESPONSE:
            {
                if(body.state!=0)
                {
                    log("[加入房间失败!!!]");

                    return;
                }
                else{
                    log("[加入房间成功]");
                }

            }
                break;
            case Socket.MsgNumber.GAME_FINISHED_NOTIFY:
            {
                log("["+that.name+"]游戏结束!");
                that.close();
                hasGameFinished=true;
            }
                break;
            case Socket.MsgNumber.THING_NOTIFY:
            {
                this.things=body.thingInfos;
            }
                break;
            case Socket.MsgNumber.PLAYER_ACTION_LIST_NOTIFY:
            {


                var players=body.players;
                var count=players.length;

                for(var i=0;i<count;i++)
                {
                    var player=players[i];
                    var name=player.name;
                    if(name!=that.name)
                    {
                        continue;
                    }
                    var actions=player.actions;

                    var count2=actions.length;
                    for(var j=0;j<count2;j++)
                    {
                        var action=actions[j];
                        var grids=action.grids;

                        if(action.type==TYPE_CREATE)
                        {

                        }
                        else if(action.type==TYPE_STATIC)
                        {

                        }
                        else if(action.type==TYPE_MOVE)
                        {

                        }
                        else if(action.type==TYPE_PENG)
                        {


                        }
                        else if(action.type==TYPE_GUAN)
                        {

                        }
                        else if(action.type==TYPE_DEAD)
                        {
                            console.log("机器人type_dead:"+that.name);
                            that.close();
                        }

                    }

                }
            }
                break;
            case Socket.MsgNumber.PLAYER_UPDATE:
            {
                // if(body.oper==3)
                // {
                //     var r=body.player;
                //     if(r.name==that.name)
                //     {
                //         log("机器人["+that.name+"]被吃掉");
                //         that.close();
                //     }
                //
                // }


            }
                break;
            case Socket.MsgNumber.HEART_SERVER_TO_CLIENT_REQUEST:
            {

               // console.log("心跳====");
                var heart=new Socket.HeartClientToServerResponse();
                heart.m_id=body.m_id;
                that.sendData(Socket.MsgNumber.HEART_CLIENT_TO_SERVER_RESPONSE,heart);

            }
                break;
        }
    }
    this.wsocket.onclose = function(e){

        console.log("关闭 onclose" );
        that.hasColsed=true;

    }
    this.wsocket.onerror = function(e){

        console.log("关闭 onerror:"+e );
        that.hasColsed=true;

    }

    this.sendData=function (msgNumber,body) {

        if(that.hasColsed)
        {
            return;
        }
        var buf=new Socket.ByteBuffer();
        buf.initBlank();
        buf.putInt16(msgNumber);
        body.write(buf);

        var array = new Uint8Array(buf.buffer);
        var l = buf.count;
        var buffer= new ArrayBuffer(l);
        var view = new Uint8Array(buffer)
        for (var i = 0; i < l; i++) {
            view[i] = array[i];
        }

        this.wsocket.send(view.buffer);


    }
    this.pSub=function(p1,p2)
    {
        var p={x:0,y:0};
        p.x=p1.x-p2.x;
        p.y=p1.y-p2.y;
        return p;
    }
    this.pNormalize=function( p)
    {
        var pp={x:p.x,y:p.y};

        var n = pp.x * pp.x + pp.y * pp.y;

        if (n == 1.0)
        {
            return p;
        }


        n = Math.sqrt(n);
        // Too close to zero.
        if (n < 2e-37)
            return p;

        n = 1.0 / n;
        pp.x *= n;
        pp.y *= n;
        return pp;
    }


    this.joinRoom=function (roomId) {

        var req=new Socket.JoinRoomRequest();
        req.uid=that.uid;
        req.roomId=roomId;
        that.sendData(Socket.MsgNumber.JOIN_ROOM_REQUEST,req);

    }

    this.close=function () {
        that.hasColsed=true;
        that.wsocket.close();

    }





};

process.on('uncaughtException', function (err) {
    //打印出错误
    console.log(err);
    //打印出错误的调用栈方便调试
    console.log(err.stack);
});


function BotServer()
{
    this.bots=[];
    this.maxCount=GameInfo.getInstance().botCount;
    this.index=0;
    this.gameCount=0;
    this.addT=100;//5000;
    this.checkT=1000;
    var that=this;

    this.botLoop=function () {

        setTimeout(this.botLoop.bind(this), this.checkT);



    }

    this.addPlayer=function () {

        if(hasGameFinished)
        {
            setTimeout(this.addPlayer.bind(this), this.addT);
            return;
        }
        if(this.needCount!=undefined)
        {
            this.maxCount=this.needCount;
        }
        var size=this.bots.length;

        for(var index=0;index<size;index++) {
            var socket = this.bots[index];
            if (socket.hasColsed) {
                this.bots.splice(index, 1);
                index--;
                size--;
            }
        }

        if(size<this.maxCount)
        {
            var c=new BotSocket();
            this.bots.push(c);

        }
        setTimeout(this.addPlayer.bind(this), this.addT);
        // log("[#机器人数量:"+this.bots.length+",maxCount:"+this.maxCount+"]");
    }

    setTimeout(this.botLoop.bind(this), this.checkT);
    setTimeout(this.addPlayer.bind(this), this.addT);

}

BotServer();
