/**
 * Created by yungu on 16/7/29.
 */
var http = require('http');
var questring=require('querystring');
var url = require("url");
var Service=require("./service/Service");
var HttpMsgNumber=require("./http/HttpMsgIds");
var crypto = require('crypto')

function  S_Http(port) {

   this.server=http.createServer(function(req,res){

       var data="";

       req.on("data",function(chunk){



           data+=chunk;

       });

       req.on("end",function(){


           var pathname = url.parse(req.url).pathname;  //pathname => select
                 //arg => name=a&id=5
           console.log("路径:" + pathname );
           if(pathname=="/payResult")
           {
               // var arg = url.parse(req.url).query;
               // var str = questring.parse(arg);
               if(data!=null&&data!="")
               {
                   console.log("支付回调数据:"+data);
                   data = questring.parse(data);

                  if(data.extra_data!=undefined)
                  {

                        var body={};
                         body.attach=data.extra_data;
                      body.order_id=data.order_id;
                      body.user_id=data.user_id;
                      body.cost=data.cost;
                      body.signature=data.signature;
                      
                      Service.getInstance().httpExcute(HttpMsgNumber.PAY_RESULT_NOTIFY,body,function (obj) {

                          var resObj={};
                          resObj.status="success";
                          resObj.message="";
                          var responseData=JSON.stringify(resObj);
                          res.end(responseData);
                          res.destroy();

                      });

                  }
                   else{
                      var resObj={};
                      resObj.status="error";
                      resObj.message="扩展数据错误!";
                      var responseData=JSON.stringify(resObj);
                      res.end(responseData);
                      res.destroy();

                  }
               }
               else{

                   res.end();
                   res.destroy();
               }

               return;
           }
           else if(pathname=="/payResult_1"||pathname=="/payresult_1")
           {

               if(data!=null&&data!="")
               {
                   console.log("支付回调数据:"+data);

                   data = questring.parse(data);

                   if(data.extend!=undefined)
                   {

                       var body={};
                       body.attach=data.extend;
                       body.order_id=data.out_trade_no;
                       body.user_id="";//data.user_id;
                       body.cost=data.price;
                       body.signature=data.sign;

                       Service.getInstance().httpExcute(HttpMsgNumber.PAY_RESULT_NOTIFY,body,function (obj) {

                           // var resObj={};
                           // resObj.status="success";
                           // resObj.message="";
                           // var responseData=JSON.stringify(resObj);
                           res.end("1");
                           res.destroy();

                       });

                   }
                   else{
                       // var resObj={};
                       // resObj.status="error";
                       // resObj.message="扩展数据错误!";
                       // var responseData=JSON.stringify(resObj);
                       res.end("0");
                       res.destroy();

                   }
               }
               else{

                   res.end("0");
                   res.destroy();
               }

               return;

           }
           else if(pathname=="/manager")
           {

               try
               {

                   var pathData=url.parse(req.url);

                   var query=pathData.query;
                   query=decodeURIComponent(query);
                   var queryArr=query.split("&");
                   if(queryArr.length<=0)
                   {
                       console.log("请求数据错误:"+query);
                       res.destroy();
                       return;
                   }
                   var msgNumber=queryArr[0];
                   var json=queryArr[1];

                   msgNumber=msgNumber.split("=")[1];
                   json=json.split("=")[1];

                   console.log("msgNumber:"+msgNumber+",json:"+json);
                   var body=JSON.parse(json);

                   body.req=req;

                   Service.getInstance().httpExcute(msgNumber,body,function (obj) {


                       if(obj!=null)
                       {
                           var responseData=JSON.stringify(obj);
                           res.writeHead(200, {'Content-type' : 'text/html',"Access-Control-Allow-Origin":"*"});
                            console.log("#2");
                           if(responseData!=null)
                           {

                               // res.write(responseData);
                               res.end(responseData);
                           }

                       }
                       else{
                           console.log("#3");
                           obj={};
                           obj.txt="错误!";
                           var responseData=JSON.stringify(obj);
                           res.end(responseData);
                       }


                       res.destroy();


                   });
               }
               catch(err)
               {
                   console.log(err);
                   console.log(err.stack);
             
                   res.destroy();
               }



               return;
           }


           data = questring.parse(data);
   
           var msgNumber=data.msgNumber;
            if(data.json==undefined)
            {
                console.log("[http json 数据错误]");
                res.writeHead(200, {'Content-type' : 'text/html',"Access-Control-Allow-Origin":"*"});
                res.end();
                res.destroy();
                return;
            }
           var body=JSON.parse(data.json);

          // console.log("msgNumber::"+msgNumber+"  body:"+body);

           body.req=req;
           
           Service.getInstance().httpExcute(msgNumber,body,function (obj) {


               if(obj!=null)
               {
                   var responseData=JSON.stringify(obj);
                   res.writeHead(200, {'Content-type' : 'text/html',"Access-Control-Allow-Origin":"*"});
                   // console.log(responseData);
                   if(responseData!=null)
                   {
                      // res.write(responseData);
                       res.end(responseData);
                   }

               }
               else{
                   obj={};
                   obj.txt="错误!";
                   var responseData=JSON.stringify(obj);
                   res.end(responseData);
               }

              
               res.destroy();


           });


       });

    }).listen(port);

}

module.exports = S_Http;
