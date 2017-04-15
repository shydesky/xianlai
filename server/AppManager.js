/**
 * Created by yungu on 17/1/3.
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
var RoomManager=require('./RoomManager');


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


function  AppManagerServer() {

    this.serverList=[];
    this.http=new S_Http(GameInfo.getInstance().managerPort);

    Mongo.DaoManager.getInstance().init();

}
module.exports = AppManagerServer;


AppManagerServer.prototype.start=function()
{

    this.managers={};

    Service.getInstance().httpRegist(1001,this,this.onHttpReceive.bind(this));


    setTimeout(this.logic.bind(this), 1.0);

    this.childQueryQueue=[];

}
AppManagerServer.prototype.getRd=function () {
    var r = Math.random();
    var a1=r*10-1;
    a1=Math.round(a1);
    if(a1<=0)a1=1;
    return a1;
}

process.on('uncaughtException', function (err) {
    //打印出错误
    console.log(err);
    //打印出错误的调用栈方便调试
    console.log(err.stack);
});

AppManagerServer.prototype.onHttpReceive=function (msgNumber,obj,target,responseCallBack) {

    var num = parseInt(msgNumber);
    log("manager msgnumber:" + msgNumber);

    var req = obj.req;

    var that = this;

    switch (num) {
        case 1001://登录
        {
            var account=obj.account;
            var pwd=obj.pwd;

            console.log("#1!");

            Mongo.DaoManager.getInstance().findManager(account,pwd,function (manager) {

                if(manager==null||manager==undefined)
                {
                    var resData={};
                    resData.state=-1;
                    resData.txt="账号或密码错误!";
                    responseCallBack(resData);

                    console.log("账号密码错误!");
                }
                else{

                    that.managers[manager.uid]=manager;

                    var resData={};
                    resData.uid=manager.uid;
                    resData.gold=manager.gold;
                    resData.name=manager.name;
                    resData.roleType=manager.roleType;
                    resData.parentUid=manager.parentUid;
                    resData.clientIp=getClientIP(req);
                    resData.accountState=manager.accountState;

                    console.log("[管理员登录成功,name:"+manager.name+",Ip:"+resData.clientIp+"]");

                    responseCallBack(resData);

                    var dateTxt=new Date().Format("yyyy-MM-dd hh:mm:ss");
                    var updateTxt={"loginDate":dateTxt.toString()};
                    Mongo.DaoManager.getInstance().updateManagerByUid(manager.uid,updateTxt,function (error) {
                        if(error==-1)
                        {
                            log("[更新登录日期失败 name:"+manager.name+" date:"+dateTxt+"]");
                        }
                        else{
                            log("[更新登录日期成功 name:"+manager.name+" date:"+dateTxt+"]");
                        }

                    })
                }

            });


        }
            break;
        case 1002://代理查询
        {
            var uid=obj.uid;


            var resData={};
            if(this.managers[uid]==undefined)
            {
                resData.state=-1;
                resData.txt="未登录,不可操作!";
                responseCallBack(resData);
                return;
            }
            var manager=this.managers[uid];
            // if(manager.roleType>=2)
            // {
            //     //2级别以上无代理权限
            //     resData.state=-1;
            //     resData.txt="无代理权限!";
            //     responseCallBack(resData);
            //     return;
            //
            // }

            // var queryObj={};
            // queryObj.manager=manager;
            // queryObj.uid=uid;
            // queryObj.responseCallBack=responseCallBack;
            // this.childQueryQueue.push(queryObj);


            Mongo.DaoManager.getInstance().findAllManager(function (list) {

                if(list==null)
                {
                    resData.state=-2;
                    resData.txt="错误:1002-2!";
                    responseCallBack(resData);
                }
                else{

                    resData.daili=[];

                    //一级代理
                    var count=list.length;
                    for(var i=0;i<count;i++)
                    {
                        var childManager=list[i];
                        if(childManager.parentUid==uid)
                        {
                            var dail2={};
                            dail2.manager=childManager;
                            dail2.daili=[];
                            resData.daili.push(dail2);


                            //二级代理
                            for(var j=0;j<count;j++)
                            {
                                var childManager2=list[j];
                                if(childManager2.parentUid==childManager.uid)
                                {
                                    var dail3={};
                                    dail3.manager=childManager2;
                                    dail3.daili=[];
                                    dail2.daili.push(dail3);



                                    //三级代理
                                    for(var k=0;k<count;k++)
                                    {
                                        var childManager3=list[k];
                                        if(childManager3.parentUid==childManager2.uid)
                                        {
                                            var dail4={};
                                            dail4.manager=childManager3;
                                            dail4.daili=[];
                                            dail3.daili.push(dail4);

                                        }

                                    }

                                }

                            }


                        }

                    }
                    //
                    // //二级代理
                    // var count2=resData.daili.length;
                    // for(var j=0;j<count2;j++)
                    // {
                    //     var daili=resData.daili[j];
                    //     var dailiManger=daili.manager;
                    //
                    //     for(var i=0;i<count;i++)
                    //     {
                    //         var childManager=list[i];
                    //         if(childManager.parentUid==dailiManger.uid)
                    //         {
                    //             var dail3={};
                    //             dail3.manager=childManager;
                    //             dail3.daili=[];
                    //             daili.daili.push(dail3);
                    //         }
                    //
                    //     }
                    //
                    //
                    // }
                    //
                    // //三级代理
                    // var count3=resData.daili.length;
                    // for(var j=0;j<count2;j++)
                    // {
                    //     var daili=resData.daili[j];
                    //     var dailiManger=daili.manager;
                    //
                    //     for(var i=0;i<count;i++)
                    //     {
                    //         var childManager=list[i];
                    //         if(childManager.parentUid==dailiManger.uid)
                    //         {
                    //             var dail3={};
                    //             dail3.manager=childManager;
                    //             dail3.daili=[];
                    //             daili.daili.push(dail3);
                    //         }
                    //
                    //     }
                    //
                    //
                    // }


                    resData.list=list;
                    responseCallBack(resData);

                }


            });



        }
            break;
        case 1003://代理删除
        {
            //


        }
            break;
        case 1004://代理添加
        {
            var uid=obj.uid;
            var resData={};
            if(this.managers[uid]==undefined)
            {
                resData.state=-1;
                resData.txt="未登录,不可操作!";
                responseCallBack(resData);
                return;
            }
            var manager=this.managers[uid];
            // if(manager.roleType>=2)
            // {
            //     //2级别以上无代理权限
            //     resData.state=-1;
            //     resData.txt="无代理权限!";
            //     responseCallBack(resData);
            //     return;
            //
            // }
            if(manager.gold<=0)
            {
                resData.state=-1;
                resData.txt="已经没有房卡了,请先去总代理购买房卡!";
                responseCallBack(resData);
                return;
            }
            

            var name=obj.name;
            var account=obj.account;
            var pwd=obj.pwd;

            var newManager={};
            newManager.uid=RoomManager



        }
            break;


    }
}
//
// AppManagerServer.prototype.findChildManager=function (uid,resData,responseCallBack) {
//
//     Mongo.DaoManager.getInstance().findAllChildManager(uid,function (list) {
//
//         if(list==null)
//         {
//             //resData.state=-2;
//            // resData.txt="错误:1002-2!";
//            // responseCallBack(resData);
//         }
//         else{
//
//             //检查是否有子代理
//             var count=list.length;
//             for(var i=0;i<count;i++)
//             {
//                 var childManager=list[i];
//                 if(manager.roleType<=1)
//                 {
//
//                 }
//
//             }
//
//             resData.list=list;
//             responseCallBack(resData);
//
//         }
//
//
//     });
//
// }

AppManagerServer.prototype.logic=function () {

    setTimeout(this.logic.bind(this), 1.0);


    var queryCount=this.childQueryQueue.length;



}
process.on('uncaughtException', function (err) {
    //打印出错误
    console.log(err);
    //打印出错误的调用栈方便调试
    console.log(err.stack);
});

var appHttp=new AppManagerServer();
appHttp.start();