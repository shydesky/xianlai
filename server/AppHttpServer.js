/**
 * Created by yungu on 16/8/10.
 */
/**
 * Created by yungu on 16/7/28.
 */




var S_Http = require('./S_Http');
var GameInfo=require('./GameInfo');
var Service=require("./service/Service");
var HttpMsgNumber=require("./http/HttpMsgIds");
var Mongo=require("./mongo");
var uuid = require('node-uuid');
var log=require("./Log");
var http = require('http');
var https = require('https');



var APP_ID="wxfcb1bebb182dd555";
var APP_SECRET="d90f6d3aec7b54a87b9ae7fdc25f82b8";

var createUUID = (function (uuidRegEx, uuidReplacer) {
    return function () {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(uuidRegEx, uuidReplacer).toUpperCase();
    };
})(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0,
        v = c == "x" ? r : (r & 3 | 8);
    return v.toString(16);
});

Date.prototype.Format = function(fmt)
{ //author: meizz
    var o = {
        "M+" : this.getMonth()+1,                 //月份
        "d+" : this.getDate(),                    //日
        "h+" : this.getHours(),                   //小时
        "m+" : this.getMinutes(),                 //分
        "s+" : this.getSeconds(),                 //秒
        "q+" : Math.floor((this.getMonth()+3)/3), //季度
        "S"  : this.getMilliseconds()             //毫秒
    };
    if(/(y+)/.test(fmt))
        fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    for(var k in o)
        if(new RegExp("("+ k +")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
    return fmt;
}


 function getClientIP(req){
     var ipAddress; var headers = req.headers;
     var forwardedIpsStr = headers['x-real-ip'] || headers['x-forwarded-for'];
     forwardedIpsStr ? ipAddress = forwardedIpsStr : ipAddress = null;
     if (!ipAddress) { ipAddress = req.connection.remoteAddress; }
     var arr=ipAddress.split(":");
     if(arr.length>0)
     {
         ipAddress=arr[arr.length-1];
     }
     return ipAddress;

 }

function getHttps(url,callBack) {

    https.get(url, function (res) {
          //console.log('statusCode:', res.statusCode);
         // console.log('headers:', res.headers);

        res.on('data', function (d) {

            console.log(d.toString());

            var body=JSON.parse(d);
            callBack(0,body);

        });
        res.on('error', function (e) {
            log(e);
            callBack(-1,null);

        });

    });

}


function ReplaceAll(str, sptr, sptr1){
    while (str.indexOf(sptr) >= 0){
        str = str.replace(sptr, sptr1);
    }
    return str;
}


function  AppHttpServer() {

    this.serverList=[];
    this.http=new S_Http(GameInfo.getInstance().httpServerPort);

    Mongo.DaoManager.getInstance().init();

    setTimeout(this.initTimer.bind(this), 2.0);
}
module.exports = AppHttpServer;

AppHttpServer.prototype.initTimer=function()
{

    setTimeout(this.initTimer.bind(this), 60000.0);

    Mongo.DaoManager.getInstance().findServerList(function (list) {

        if(this.serverList==undefined)
        {
            this.serverList=list;

        }
        else{
            var size=list.length;
            for(var i=0;i<size;i++)
            {
                var server=list[i];
                var ip=server.ip;
                var port=server.port;

                var flg=false;

                var len=this.serverList.length;
                for(var j=0;j<len;j++)
                {
                    var server2=this.serverList[j];
                    var ip2=server2.ip;
                    var port2=server2.port;

                    if(ip==ip2&&port==port2)
                    {
                        flg=true;
                        break;
                    }

                }

                if(!flg)
                {
                    this.serverList.push(server);
                    server.count=0;
                    //log("添加服务器:"+server.ip+":"+server.port);
                }
            }


        }



        var len=this.serverList.length;
        for(var i=0;i<len;i++)
        {
            var server=this.serverList[i];
            server.count=0;
            //log("可用服务器:"+server.ip+":"+server.port);
        }


    }.bind(this));

}
AppHttpServer.prototype.start=function()
{


    Service.getInstance().httpRegist(HttpMsgNumber.LOGIN_REQUEST,this,this.onHttpReceive.bind(this));
    Service.getInstance().httpRegist(HttpMsgNumber.GET_WX_INFO_REQUEST,this,this.onHttpReceive.bind(this));
    Service.getInstance().httpRegist(HttpMsgNumber.SET_NAME_REQUEST,this,this.onHttpReceive.bind(this));
    Service.getInstance().httpRegist(HttpMsgNumber.PAY_REQUEST,this,this.onHttpReceive.bind(this));
    Service.getInstance().httpRegist(HttpMsgNumber.PAY_QUERY_REQUEST,this,this.onHttpReceive.bind(this));
    Service.getInstance().httpRegist(HttpMsgNumber.PAY_RESULT_NOTIFY,this,this.onHttpReceive.bind(this));
    Service.getInstance().httpRegist(HttpMsgNumber.SERVER_STATE_NOTIFY,this,this.onHttpReceive.bind(this));
    Service.getInstance().httpRegist(9100,this,this.onHttpReceive.bind(this));




}
AppHttpServer.prototype.getRd=function () {
    var r = Math.random();
    var a1=r*10-1;
    a1=Math.round(a1);
    if(a1<=0)a1=1;
    return a1;
}
AppHttpServer.prototype.registUser=function (account,pwd,responseCallBack,obj,canUseServer) {

    var uid="";
    for(var i=0;i<8;i++)
    {
        uid+=this.getRd();
    }

    var that=this;
    var req=obj.req;

    Mongo.DaoManager.getInstance().findUserByUid(uid,function (user) {

        if(user==null||user==undefined)
        {
            //注册
            var user={};
            user.uid=uid;//uuid.v1();
            if(account==""||account==null||account==undefined)
            {
                user.account=user.uid;
            }
            else{
                user.account=account;
            }

            user.pwd="123456";
            user.gold=20;
            user.diamond=0;
            user.name=obj.name;
            user.headUrl=obj.headUrl;
            user.score=0;
            user.regDate=new Date().Format("yyyy-MM-dd hh:mm:ss");
            user.loginDate=user.regDate;
            user.sex=obj.sex;
            user.accountState=0;

            log("[#用户登录注册 account"+user.account+",pwd:"+user.pwd+"]");


            Mongo.DaoManager.getInstance().addUser(user,function (error) {

                var resData={};
                resData.ip=canUseServer.ip;
                resData.port=canUseServer.port;
                resData.state=0;
                resData.uid=user.uid;
                resData.account=user.account;
                resData.pwd=user.pwd;
                resData.gold=user.gold;
                resData.name=user.name;
                resData.diamond=user.diamond;
                resData.score=user.score;
                resData.headUrl=user.headUrl;
                resData.accountState=user.accountState;
                resData.clientIp=getClientIP(req);
                console.log("[用户登录,name:"+user.name+",Ip:"+resData.clientIp+"]");
                responseCallBack(resData);
            });

        }
        else{
            that.registUser(account,pwd,responseCallBack,obj,canUseServer);
        }

    });

}

AppHttpServer.prototype.onHttpReceive=function (msgNumber,obj,target,responseCallBack) {

    var num=parseInt(msgNumber);
    log("http msgnumber:"+msgNumber);

    var req=obj.req;

    var that=this;

    switch(num) {
        case HttpMsgNumber.LOGIN_REQUEST:
        {
            //req.connection.remoteAddress
            //检查空闲服务器
            var canUseServer=null;
            var len=this.serverList.length;
            for(var i=0;i<len;i++)
            {
                var server=this.serverList[i];
                if(server.count<200)
                {
                    canUseServer=server;
                    break;
                }

            }
            if(canUseServer==null)
            {
                var Rand = Math.random();
                var index=Math.round(Rand * len);
                if(index>=len)index=len-1;
                if(index<0)index=0;
                canUseServer=this.serverList[index];
            }
            log("用户登录:"+obj.account+" "+obj.type);

                //账号密码登录
                var account=obj.account;
                var pwd=obj.pwd;

            Mongo.DaoManager.getInstance().findUserByAccountAndPwd(account,pwd,function (user) {

                if(user==null||user==undefined)
                {


                    //注册
                    that.registUser(account,pwd,responseCallBack,obj,canUseServer);


                }
                else{
                    log("[用户登录成功 account:"+account+",pwd:"+pwd+"]");
                    var resData={};
                    resData.ip=canUseServer.ip;
                    resData.port=canUseServer.port;
                    resData.state=0;
                    resData.uid=user.uid;
                    resData.account=user.account;
                    resData.pwd=user.pwd;
                    resData.gold=user.gold;
                    resData.name=user.name;
                    resData.diamond=user.diamond;
                    resData.score=user.score;
                    var headUrl=obj.headUrl;
                    if(headUrl=="")
                    {
                        headUrl=user.headUrl;
                    }
                    resData.headUrl=obj.headUrl;
                    resData.clientIp=getClientIP(req);
                    resData.accountState=user.accountState;

                    console.log("[用户登录,name:"+user.name+",Ip:"+resData.clientIp+"]");

                    responseCallBack(resData);

                    var dateTxt=new Date().Format("yyyy-MM-dd hh:mm:ss");
                    var updateTxt={"loginDate":dateTxt.toString(),"headUrl":headUrl.toString()};
                    Mongo.DaoManager.getInstance().updateUserByUid(user.uid,updateTxt,function (error) {
                        if(error==-1)
                        {
                            log("[更新登录日期失败 uid:"+user.uid+" date:"+dateTxt+"]");
                        }
                        else{
                            log("[更新登录日期成功 uid:"+user.uid+" date:"+dateTxt+"]");
                        }

                    })
                }

            });




        }
            break;

        case HttpMsgNumber.GET_WX_INFO_REQUEST:
        {

           var type = obj.type;
            var code = obj.code;
            log("type:"+type+" code:"+code);
            if (type == 1) {
                //微信


                getHttps('https://api.weixin.qq.com/sns/oauth2/access_token?appid='+APP_ID+'&secret='+APP_SECRET+'&code='+code+'&grant_type=authorization_code',function (state,body) {

                    if(state==0)
                    {




                        var refresh_token=body.refresh_token;
                        //
                        // https.get('https://api.weixin.qq.com/sns/oauth2/refresh_token?appid='+APP_ID+'&grant_type=refresh_token&refresh_token='+refresh_token, function (res2) {
                        //
                        //     res2.on('data', function (d) {
                        //
                        //         var body=JSON.parse(d);
                        //         // var resData={};
                        //         // resData.state=0;
                        //         // resData.token=body.access_token;
                        //         // resData.openid=body.openid;
                        //         //
                        //         // var refresh_token=body.refresh_token;
                        //
                        //
                        //
                        //
                        //
                        //     });
                        //     res2.on('error', function (e) {
                        //
                        //         responseCallBack(resData);
                        //
                        //     });
                        //
                        // })

                        getHttps('https://api.weixin.qq.com/sns/oauth2/refresh_token?appid='+APP_ID+'&grant_type=refresh_token&refresh_token='+refresh_token,function (state2,body2) {

                            if(state2==0)
                            {
                                console.log("微信用户信息 state2:"+state2);
                                getHttps('https://api.weixin.qq.com/sns/userinfo?access_token='+body2.access_token+'&openid='+body2.openid+'&lang=zh_CN',function (state3,body3) {


                                    console.log("微信用户信息state3:"+state3);
                                    if(state3==0)
                                    {

                                        var resData={};
                                        resData.state=0;
                                        resData.token=body3.access_token;
                                        resData.openid=body3.openid;

                                        var nickname=body3.nickname;
                                        var sex=body3.sex;
                                        var city=body3.city;
                                        var province=body3.province;
                                        var headimgurl=body3.headimgurl;
                                        var unionid=body3.unionid;

                                        resData.headimgurl=headimgurl;
                                        resData.name=nickname;
                                        resData.sex=sex;
                                        responseCallBack(resData);

                                    }
                                    else{
                                        var resData={};
                                        resData.state=-1;
                                        responseCallBack(resData);
                                    }

                                });

                            }
                            else{
                                responseCallBack(null);
                            }

                        });
                        //log("body.openid:"+body.openid);




                    }
                    else{
                        var resData={};
                        resData.state=-1;
                        responseCallBack(resData);
                    }

                });

                //







            }

        }
            break;
        case HttpMsgNumber.SET_NAME_REQUEST:
        {
            var uid = obj.uid;
            var name = obj.name;

            Mongo.DaoManager.getInstance().findUserByName(name, function (user) {

                if (user == null || user == undefined) {

                    Mongo.DaoManager.getInstance().updateUserByUid(uid, {"name": name.toString()}, function (state) {


                        if (state == 0) {

                            var resData = {};
                            resData.state = 0;
                            responseCallBack(resData);
                        }
                        else {

                            var resData = {};
                            resData.state = -2;
                            resData.txt = "存储失败!";
                            responseCallBack(resData);
                        }

                    });

                }
                else {

                    if(uid!=user.uid)
                    {
                        log("[用户uid:" + uid + "不存在]");
                        var resData = {};
                        resData.state = -1;
                        resData.txt = "呢称已被人抢走!";
                        responseCallBack(resData);
                    }
                     else{

                        var resData = {};
                        resData.state = 0;
                        responseCallBack(resData);
                    }



                }

            });
        }
            break;

        case HttpMsgNumber.PAY_REQUEST:
        {
            var goodId=obj.goodId;
            var uid=obj.uid;
            var name=obj.name;
            var good=GameInfo.getInstance().goods[goodId];
            var transNo=createUUID();
            var des="糖果吃吃吃"+good.name+"金币";
            var money=good.money*10*10;
          //  var ip=getClientIP(obj.req);
            var ip="121.42.15.211";
            var attach=uid+","+goodId+","+ip;
            var qs = require('querystring');


            transNo=ReplaceAll(transNo,"-","");
            log("out_trade_no:"+transNo);
            var data = {
                service:"unified.trade.pay",
                version:2.0,
                charset:"UTF-8",
                sign_type:"MD5",
                out_trade_no:transNo,
                body:des,
                total_fee:money,
                mch_create_ip:"121.42.15.211",
                attach:attach
            };//这是需要提交的数据


            var content = qs.stringify(data);

            var options = {
                hostname: '121.42.15.211',
                port: 80,
                path: '/GameServer/getToken?' + content,
                method: 'GET'
            };

            log(content);

            var req = http.request(options, function (res) {
                //console.log('STATUS: ' + res.statusCode);
               // console.log('HEADERS: ' + JSON.stringify(res.headers));
                res.setEncoding('utf8');
                res.on('data', function (chunk) {

                    var body=JSON.parse(chunk);
                    //console.log('BODY: ' + chunk);
                    var token=body.token_id;
                    log(token);

                    var resData={};
                    resData.state=0;
                    resData.token=token;
                    responseCallBack(resData);

                });
            });

            req.on('error', function (e) {
                console.log('problem with request: ' + e.message);

                var resData={};
                resData.state=-1;
                responseCallBack(resData);
            });

            req.end();
        }
            break;
        case HttpMsgNumber.PAY_QUERY_REQUEST:
        {
            var uid=obj.uid;

            Mongo.DaoManager.getInstance().findUserByUid(uid,function (user) {

                if(user==null||user==undefined)
                {
                    log("[REWARD_REQUEST 用户uid:"+uid+"不存在]");
                    var resData={};
                    resData.state=-1;
                    responseCallBack(resData);
                }
                else {
                    var resData={};
                    resData.state=0;
                    resData.money=user.money;
                    responseCallBack(resData);
                }

            });
        }
            break;
        case HttpMsgNumber.PAY_RESULT_NOTIFY:
        {
            var attach=obj.attach;
            log("支付回调attach:"+attach);
            var a=attach.split(",");
            var uid=a[0];
            var goodId=a[1];
            log("uid:"+uid+"   goodId:"+goodId);
            var money=0;



            Mongo.DaoManager.getInstance().findUserByUid(uid,function (user) {

                if(user==null||user==undefined)
                {
                    log("[支付回调用户id错误:"+uid+",money:"+money+"]");
                    var resData={};
                    resData.state=-1;
                    responseCallBack(resData);
                }
                else {
                    var resData={};
                    resData.state=0;

                    if(user.shouC==undefined)
                    {
                        user.shouC=[];
                        for(var i=0;i<4;i++)
                        {
                            user.shouC.push(1);
                        }

                    }
                    if(goodId=="1645")
                    {
                        money=6000;
                        if(user.shouC[0]==1)
                        {
                            money*=2;
                            user.shouC[0]=0;
                        }

                    }
                    else if(goodId=="1646")
                    {
                        money=30000;

                        if(user.shouC[1]==1)
                        {
                            money*=2;
                            user.shouC[1]=0;
                        }
                    }
                    else if(goodId=="1647")
                    {
                        money=98000;
                        if(user.shouC[2]==1)
                        {
                            money*=2;
                            user.shouC[2]=0;
                        }
                    }
                    else if(goodId=="1648")
                    {
                        money=128000;

                        if(user.shouC[3]==1)
                        {
                            money*=2;
                            user.shouC[3]=0;
                        }
                    }


                    user.money+=money;

                        Mongo.DaoManager.getInstance().updateUserByUid(uid,{"money":user.money,"shouC":user.shouC},function (state) {


                            if(state==0)
                            {

                                responseCallBack(resData);
                            }
                            else{

                                resData.state=-1;
                                responseCallBack(resData);
                            }

                        })

                    Mongo.DaoManager.getInstance().addPay(obj,function (state) {


                        if(state==0)
                        {
                            log("支付纪录存储成功!");

                        }
                        else{
                            log("支付纪录存储失败!");

                        }

                    })


                }

            });


        }
            break;
        case HttpMsgNumber.SERVER_STATE_NOTIFY:
        {
            var ip=obj.ip;
            var count=obj.count;
            var port=obj.port;

            var resData={};
            resData.state=0;
            responseCallBack(resData);

            console.log("ip:"+ip+",port:"+port+",count:"+count);

        }
            break;
        case 9100:
        {

            console.log("切换请求:"+new Date().Format("yyyy-MM-dd hh:mm:ss"));

            var resData={};
            resData.value=1;
            resData.urlPath="http://daili.szmpsj.com/login.asp?sid=";
            responseCallBack(resData);



        }
            break;
    }

}

process.on('uncaughtException', function (err) {
    //打印出错误
    console.log(err);
    //打印出错误的调用栈方便调试
    console.log(err.stack);
});
var appHttp=new AppHttpServer();
appHttp.start();