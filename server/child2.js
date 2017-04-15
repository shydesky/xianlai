/**
 * Created by yungu on 16/10/3.
 */


var WebSocket=require("./childWebSocket");
var GameInfo=require('./GameInfo');
var ByteBuffer=require("./socket/ByteBuffer");
var MessageFactory=require("./socket/MessageFactory");
var log=require("./Log");
var Socket=require("./socket");
var Mongo=require("./mongo");
var that=null;
var s_udpsocket_Server = require('./S_UDPSocket');

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

function Child2()
{
    // this.socketServer=new WebSocket(9000);
    // this.socketServer.child=this;
    // this.socketMap={};
    //setTimeout(this.foodupdate.bind(this), 3000);

    this.rankTime=1000;

    that=this;
    that.players={};

    Mongo.DaoManager.getInstance().init();

    this.getDate=function (day) {

        var strDate=new Date().Format("yyyy-MM-dd");
        var d = new Date(strDate.replace(/-/g, '/'));
        d.setDate(d.getDate() - day); // 前7天

        return d.Format("yyyy-MM-dd hh:mm:ss");

    }

    //this.socketServer2=new s_udpsocket_Server(9001);


    //var lastDate=this.getDate(3);
    // console.log("lastDate:"+lastDate);
    // Mongo.DaoManager.getInstance().findGoldDataByDate(lastDate,function (result) {
    //
    //     if(result!=null)
    //     {
    //         var len=result.length;
    //         console.log("[元宝消耗记录:"+len+"]");
    //         for(var i=0;i<len;i++)
    //         {
    //             var data=result[i];
    //             var uid=data.uid;
    //             var arr=that.players[uid];
    //             if(arr==undefined)
    //             {
    //                 arr=[];
    //                 arr.push(data);
    //                 that.players[uid]=arr;
    //             }
    //             else{
    //                 arr.push(data);
    //             }
    //
    //
    //         }
    //
    //
    //     }
    //
    // });

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

        if(type == 1) {//添加元宝

            var data={};
            data.uid=obj.uid;
            data.name=obj.name;
            data.value=obj.value;
            data.type=type;//添加
            data.date=new Date().Format("yyyy/MM/dd hh:mm:ss");

            Mongo.DaoManager.getInstance().addGoldData(data,function (state) {

                if(state!=0)
                {
                    console.log("[增加元宝记录失败!]");
                }

            });


        }
        else if(type==2)//消耗元宝
        {

            var data={};
            data.uid=obj.uid;
            data.name=obj.name;
            data.value=obj.value;
            data.head=obj.head;
            data.type=2;//消耗
            data.date=new Date().Format("yyyy/MM/dd hh:mm:ss");

            Mongo.DaoManager.getInstance().addGoldData(data,function (state) {

                if(state!=0)
                {
                    console.log("[消耗元宝记录失败!]");
                }

            });

            var arr=that.players[data.uid];
            if(arr==undefined)
            {
                arr=[];
                arr.push(data);
                that.players[data.uid]=arr;
            }
            else{
                arr.push(data);
            }


        }
        else if(type == 3) {//添加元宝

            var data={};
            data.uid=obj.uid;
            data.name=obj.name;
            data.value=obj.value;
            data.type=3;//添加
            data.date=new Date().Format("yyyy/MM/dd hh:mm:ss");

            Mongo.DaoManager.getInstance().addGoldData(data,function (state) {

                if(state!=0)
                {
                    console.log("[增加元宝记录失败2!]");
                }

            });


        }

    });


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

    this.update=function () {
        setTimeout(this.update.bind(this), this.rankTime);

        var checkDate=this.getDate(3);//前3天
        var rank=[];
        for(var uid in that.players)
        {
            var arr=that.players[uid];
            var value=0;
            var len=arr.length;
            for(var i=0;i<len;i++)
            {
                var data=arr[i];
                var date=data.date;
                if(date>checkDate)
                {
                    value+=data.value;
                }
               // console.log("日期1:"+date+",日期2:"+checkDate);

            }

            var count=rank.length;
            for(var j=0;j<count;j++)
            {
                var a=rank[j];
                if(a.value<=value)
                {
                    var a2={};
                    a2.value=value;
                    a2.data=data;
                    rank.splice(j,0,a2);
                    break;
                }

            }

            if(count==0)
            {
                var a2={};
                a2.value=value;
                a2.data=data;
                rank.push(a2);
            }



        }
        var result=[];
        //发送给客户端
        var rCount=rank.length;
        for(var i=0;i<50&&i<rCount;i++)
        {
            var r=new Socket.Rank();
            var rk=rank[i];
            r.uid=rk.data.uid;
            r.name=rk.data.name;
            r.head=rk.data.head;
            r.value=rk.value;
            result.push(r);
        }

        if(result.length>0)
        {
            this.sendToProcess(1,result,true);
        }

    }



   // setTimeout(this.update.bind(this), this.rankTime);




}

Child2();