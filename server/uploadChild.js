/**
 * Created by yungu on 16/10/15.
 */

var http = require('http');
var questring=require('querystring');
var url = require("url");
var GameInfo=require('./GameInfo');
var formidable = require("formidable");
var fs = require('fs');
var CmdServer=require('./CmdServer');


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

function uploadChild()
{


    this.server=http.createServer(function(req,res){


        if (req.url == '/upload') {

            console.log("http upload=================");


            var form = new formidable.IncomingForm();

            form.parse(req, function(err, fields, files) {



                var type=fields.type;

                // for(var key in files)
                // {
                //     console.log("key:"+key+"####"+fields.key);
                // }

                if(type==undefined||type=="0")//语音
                {
                    var roomId=fields.name;
                    var str=fields.uid;

                    var strs=str.split("_");
                    var uid=strs[0];
                    var time=strs[1];

                    form.uploadDir=GameInfo.getInstance().uploadDir;


                    var t=new Date().getTime();
                    var fileName=uid+"_"+time+"_"+t+".spx";
                    fs.renameSync(files.upload.path,form.uploadDir+"/"+fileName);

                    console.log("语音:"+fileName+",roomId:"+roomId);

                    var msg={};
                    msg.type=1;
                    msg.obj={name:roomId,uid:uid,fileName:fileName};
                    process.send(msg);
                }
                else if(type!=undefined&&type=="1")//照片
                {
                    var name=fields.name;
                    var uid=fields.uid;

                    form.uploadDir=GameInfo.getInstance().imageDir;
                    console.log("照片设置:"+fields.name);
                    var t=new Date().getTime();
                    var fileName=name+"_.png";
                    fs.renameSync(files.upload.path,form.uploadDir+"/"+fileName);

                    // var msg={};
                    // msg.type=1;
                    // msg.obj={name:name,uid:uid,fileName:fileName};
                    // process.send(msg);
                }

                res.end();
                res.destroy();
            });


        }
        else if (req.url == '/cmd')
        {


            var data="";

            req.on("data",function(chunk){


                data+=chunk;

            });

            req.on("end",function() {




                data = questring.parse(data);
                var cmdNumber=data.cmdNumber;

                var cmdObj={};
                cmdObj.cmdNumber=cmdNumber;
                cmdObj.json=data.json;
                cmdObj.req=req;

                console.log("【cmd-cmdNumber:"+cmdNumber+",json:"+data.json+",time:"+new Date().Format("yyyy/MM/dd hh:mm:ss")+"】");


                CmdServer.getInstance().excuteCmd(cmdObj,function (obj) {

                    if(obj!=null)
                    {
                        var responseData=JSON.stringify(obj);
                        res.writeHead(200, {'Content-type' : 'text/html',"Access-Control-Allow-Origin":"*"});
                        if(responseData!=null)
                        {
                            res.end(responseData);
                        }

                    }
                    else{
                        res.end();
                    }

                    res.destroy();

                });



            });


            
        }
        else{

            res.end();
            res.destroy();
        }


    }).listen(GameInfo.getInstance().uploadPort);



    process.on('message',function (msg) {
        

        CmdServer.getInstance().onMsg(msg);


    });

    process.on('uncaughtException', function (err) {
        //打印出错误
        console.log(err);
        //打印出错误的调用栈方便调试
        console.log(err.stack);
    });



}


uploadChild();