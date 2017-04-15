
var ServiceClass=function() {

    this.register = [];
    this.httpRegister = [];
   // this.urlPath = "http://121.42.15.211:8080/GameServer/get_api";
     //this.urlPath="http://192.168.1.100:8080/GameServer/get_api";

    this.excute = function (msgNumber, body) {
        var hasExcute = false;
        var key = msgNumber + "";
        var targets = this.register[key];
        if (targets == undefined) {
            return false;
        }
        var size = targets.length;
        // cc.log("excute----"+size);
        for (var i = 0; i < size; i++) {
            var t = targets[i];
            t.func(msgNumber, body, t.target);
            hasExcute = true;
            // cc.log("msgNumber:"+msgNumber);
        }


        body = null;

        return hasExcute;
    }

    this.regist = function (msgNumber, target, func) {
        var key = msgNumber + "";
        var targets = this.register[key];

        if (targets != undefined) {
            var size = targets.length;
            for (var i = 0; i < size; i++) {
                var t = targets[i];
                if (t.func == func && t.target == target) {

                    return;
                }
                // cc.log("----size---"+size);
            }
            //  cc.log("----***1---"+msgNumber);
            var tt = {};
            tt.target = target;
            tt.func = func;
            targets.push(tt);
        }
        else {
            // cc.log("----2---"+msgNumber);
            targets = [];
            var tt = {};
            tt.target = target;
            tt.func = func;
            targets.push(tt);
            this.register[key] = targets;
        }


    }
    this.unregist = function (target) {
        for (var key in this.register) {
            var targets = this.register[key];
            if (targets == undefined) {
                return;
            }
            var size = targets.length;
            for (var i = 0; i < size; i++) {

                var t = targets[i];

                if (t.target == target) {
                    targets.splice(i, 1);
                    cc.log("unregist " + key);
                    break;
                }

            }

        }


        // cc.log("======len==="+this.register.length);

    },
        this.httpExcute=function(msgNumber,body,responseCallBack)
        {
            // cc.log("httpExcute===="+msgNumber);
            var key=msgNumber+"";
            var targets=this.httpRegister[key];
            if(targets==undefined)
            {
                console.log("http未注册:"+msgNumber);

                responseCallBack(null);

                return;
            }
            var size=targets.length;
            // cc.log("httpExcute===="+size);
            for(var i=0;i<size;i++) {
                var t = targets[i];
                // cc.log("######"+t.func);
                return t.func(msgNumber, body,t.target,responseCallBack);
            }
           // body=null;
            return null;
        }

    this.httpRegist=function(msgNumber,target,func)
    {
        var key=msgNumber+"";
        var targets=this.httpRegister[key];
        // cc.log("httpRegist=="+msgNumber+"==");
        if(targets!=undefined)
        {
            // cc.log("httpRegist2=="+msgNumber+"=="+targets.length);
            var size=targets.length;
            for(var i=0;i<size;i++)
            {
                var t=targets[i];
                if(t.target==target&&t.func==func)
                {
                    //cc.log("httpRegist==t.target==target&&t.func==func=="+msgNumber);
                    return;
                }
                // cc.log("----size---"+size);
            }

            var tt={};
            tt.target=target;
            tt.func=func;
            targets.push(tt);

        }
        else{

            targets=[];
            var tt={};
            tt.target=target;
            tt.func=func;
            targets.push(tt);
            this.httpRegister[key]=targets;
        }



    },

        this.clear=function () {
            this.httpRegister={};
            this.register={};
        },

        this.httpUnregist=function(target) {
            for (var key in this.httpRegister) {
                var targets = this.httpRegister[key];
                if (targets == undefined) {
                    return;
                }
                var size = targets.length;
                // cc.log("this.httpUnregist size:"+size);
                for (var i = 0; i < size; i++) {

                    var t = targets[i];

                    if (t.target == target) {
                        // cc.log("this.httpUnregist:"+key);
                        t.func = null;
                        t.target = null;
                        targets.splice(i, 1);
                        //cc.log("this.targetstargets:"+targets.length);
                        //
                        break;
                    }

                }


            }
        }






}
    var Service=(function()
     {
                 
      
                 var unique;
                 
                 
                 function getInstance(){
                 
                 return unique || ( unique = new ServiceClass() );
                 
                 
                 
                 }
                 
                 
                 return {
                 
                 getInstance : getInstance
                 
                 }
    
                 
                 
                 
                                            
            })();






module.exports = Service;