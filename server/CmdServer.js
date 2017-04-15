/**
 * Created by yungu on 16/12/9.
 */

var GameInfo=require('./GameInfo');
var CmdId=require('./CmdId');



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

var CmdServer=(function()
{
    var unique;
    function getInstance(){

        return unique || ( unique = new CmdServerClass() );
    }


    return {

        getInstance : getInstance

    }


})();


var CmdServerClass=function() {

    this.reqID=0;
    this.messageCallBack={};
    var that=this;

    this.excuteCmd=function (cmdObj,callBack) {


        var resObj={};
        var cmdNumber=parseInt(cmdObj.cmdNumber);
        resObj.cmdNumber=cmdNumber;
        resObj.state=0;

        var ip=getClientIP(cmdObj.req);
        console.log("[系统命令请求IP:"+ip+"]");
        var ipds=GameInfo.getInstance().canExcuteCmdIp;
        var canExcuteIp=false;


        var len=ipds.length;
        for(var i=0;i<len;i++)
        {
            var canIp=ipds[i];
            if(canIp=="*")
            {
                canExcuteIp=true;
                break;
            }
            if(canIp==ip)
            {
                canExcuteIp=true;
                break;
            }
        }

        if(!canExcuteIp)
        {
            resObj.state=-1;
            resObj.txt="非授权IP!";
            callBack(resObj);
            return;
        }
        var jsonStr=cmdObj.json;
        if(jsonStr==undefined)
        {
            resObj.state=-1;
            resObj.txt="json数据错误!";
            callBack(resObj);
            return;
        }
        var body=JSON.parse(jsonStr);

        switch(cmdNumber)
        {
            case CmdId.GAME_GONGGAO:
            {
                var msg={};
                msg.type=CmdId.GAME_GONGGAO;
                msg.obj=body;

                this.sendMsg(msg,null);

                callBack(resObj);
            }
                break;
            case CmdId.GAME_MSG:
            {
                var msg={};
                msg.type=CmdId.GAME_MSG;
                msg.obj=body;

                this.sendMsg(msg,null);

                callBack(resObj);
            }
                break;
            case CmdId.GAME_KEFU:
            {
                var msg={};
                msg.type=CmdId.GAME_KEFU;
                msg.obj=body;
                this.sendMsg(msg,null);

                callBack(resObj);
            }
                break;
            case CmdId.GAME_ADD_YUANBAO:
            {
                var msg={};
                msg.type=CmdId.GAME_ADD_YUANBAO;
                msg.obj=body;
                this.sendMsg(msg,function (httpResObj) {

                    callBack(httpResObj);
                });

            }
                break;
            case CmdId.GAME_FENGHAO:
            {
                var msg={};
                msg.type=CmdId.GAME_FENGHAO;
                msg.obj=body;
                this.sendMsg(msg,function (httpResObj) {

                    callBack(httpResObj);
                });

            }
                break;
            case CmdId.GAME_ONLINE_COUNT:
            {
                var msg={};
                msg.type=CmdId.GAME_ONLINE_COUNT;
                msg.obj=body;
                this.sendMsg(msg,function (httpResObj) {

                    callBack(httpResObj);
                });

            }
                break;
            case CmdId.GAME_USER_INFO:
            {
                var msg={};
                msg.type=CmdId.GAME_USER_INFO;
                msg.obj=body;
                this.sendMsg(msg,function (httpResObj) {

                    callBack(httpResObj);
                });

            }
                break;
            case CmdId.GAME_ROOM_INFO:
            {
                var msg={};
                msg.type=CmdId.GAME_USER_INFO;
                msg.obj=body;
                this.sendMsg(msg,function (httpResObj) {

                    callBack(httpResObj);
                });
            }
                break;

            default:
            {
                resObj.state=-1;
                resObj.txt="命令错误!";
                callBack(resObj);
                return;
            }
                break

        }





    }
    



    this.sendMsg=function (msg,myCalBack) {

        this.reqID++;
        if(this.reqID>99999999)
        {
            this.reqID=0;
        }
        msg.reqId=this.reqID;
        if(myCalBack!=null)
        {
            var obj={};
            //obj.httpCallBack=httpCallBack;
            obj.myCalBack=myCalBack;
            this.messageCallBack[this.reqID]=obj;
        }
        process.send(msg);

    }

    this.onMsg=function (msg) {

        var type=msg.type;
        var obj=msg.obj;
        var reqId=msg.reqId;
        var isConvert=msg.isConvert;
        if(isConvert)
        {
            that.convertToObj(obj);
        }
        var callBackObj=this.messageCallBack[reqId];
        if(callBackObj==undefined)
        {
            return;
        }
        delete this.messageCallBack[reqId];
        console.log("[命令回调,发送http应答,type:"+type+",reqId:"+reqId+"]");

        if(type==CmdId.GAME_ADD_YUANBAO||type==CmdId.GAME_USER_INFO||type==CmdId.GAME_FENGHAO)
        {
            var resObj={};
            resObj.cmdNumber=type;
            if(obj.state==undefined)
            {
                var user=obj;
                resObj.state=0;
                resObj.name=user.name;
                resObj.uid=user.uid;
                resObj.gold=user.gold;
                resObj.headUrl=user.headUrl;
                resObj.sex=user.sex;
                resObj.accountState=user.accountState;
            }
            else{
                resObj.state=-1;
                resObj.txt=obj.txt;
            }



            callBackObj.myCalBack(resObj);
        }
        else if(type==CmdId.GAME_ONLINE_COUNT)
        {
            var resObj={};
            resObj.cmdNumber=type;
            resObj.state=0;
            resObj.count=obj.count;

            callBackObj.myCalBack(resObj);
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

}
module.exports = CmdServer;