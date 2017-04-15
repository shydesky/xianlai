/**
 * Created by yungu on 16/8/8.
 */
var Mongo=require("./Mongo");

var DaoManagerClass=function () {

    var that=this;

    this.init=function () {
        that.mongo=new Mongo(this.connected);

    }

    this.connected=function () {


    }

    this.addUser=function (user,callback) {

        this.mongo.excute(function (db) {


            var collection = db.collection('userinfoentity');
            collection.insert(user, function(err, result) {
                if(err)
                {
                    console.log('Error:'+ err);
                    callback(-1);
                    return;
                }
                callback(0);
            });
        });




    }

    this.addPay=function (pay,callback) {

        this.mongo.excute(function (db) {


            var collection = db.collection('payentity');
            collection.insert(pay, function(err, result) {
                if(err)
                {
                    console.log('Error:'+ err);
                    callback(-1);
                    return;
                }
                callback(0);
            });
        });
    }

    this.findUserByAccountAndPwd=function (account,pwd,callback) {

        this.mongo.excute(function (db) {

            var collection = db.collection('userinfoentity');

             var whereStr = {$and:[{"account":account.toString()},{"pwd":pwd.toString()}]};

            collection.find(whereStr).toArray(function(err, result) {
                if(err)
                {
                    console.log('Error:'+ err);
                    callback(null);
                    return;
                }

                //console.log("find user account:"+len);
                callback(result[0]);
            });

        });

    }
    

    this.findUserByUid=function (uid,callback) {

        this.mongo.excute(function (db) {

            var collection = db.collection('userinfoentity');

            var whereStr = {"uid":uid.toString()};

            collection.find(whereStr).toArray(function(err, result) {
                if(err)
                {
                    console.log('Error:'+ err);
                    callback(null);
                    return;
                }

                //console.log("find user account:"+len);
                callback(result[0]);
            });

        });

    }

    this.findUserByName=function (name,callback) {

        this.mongo.excute(function (db) {

            var collection = db.collection('userinfoentity');

            var whereStr = {"name":name.toString()};

            collection.find(whereStr).toArray(function(err, result) {
                if(err)
                {
                    console.log('Error:'+ err);
                    callback(null);
                    return;
                }

                //console.log("find user account:"+len);
                callback(result[0]);
            });

        });

    }

    this.updateUserByUid=function (uid,txt,callBack) {

        this.mongo.excute(function (db) {

            var collection = db.collection('userinfoentity');
            //更新数据
            var whereStr = {"uid":uid.toString()};
            var updateStr = {$set: txt};
            collection.update(whereStr,updateStr, function(err, result) {
                if(err)
                {
                    console.log('Error:'+ err);
                    callBack(-1);
                    return;
                }
                callBack(0);
            });

        });



    }



    this.deleteUser=function (uid) {
        var collection = this.mongo.db.collection('userinfoentity');
        //删除数据
        var whereStr = {"uid":"'"+uid+"'"};
        collection.remove(whereStr, function(err, result) {
            if(err)
            {
                console.log('Error:'+ err);
                return;
            }
            console.log(result);
        });
    }



    this.findServerList=function (callback) {

        this.mongo.excute(function (db) {

            var collection = db.collection('serverentity');
            var whereStr = {"state":0};
            collection.find(whereStr).toArray(function(err, result) {
                if(err)
                {
                    console.log('Error:'+ err);
                    return;
                }

                callback(result);
            });
        });


    }

    this.findGameInfoByGroup=function (groupType,callback) {

        this.mongo.excute(function (db) {

            var collection = db.collection('gameInfoEntity');

            var whereStr = {"group":groupType};

            collection.find(whereStr).toArray(function(err, result) {
                if(err)
                {
                    console.log('Error:'+ err);
                    callback(null);
                    return;
                }

                //console.log("find user account:"+len);
                callback(result);
            });

        });

    }
    this.findGameInfoByType=function (type,callback) {

        this.mongo.excute(function (db) {

            var collection = db.collection('gameInfoEntity');

            var whereStr = {"type":type};

            collection.find(whereStr).toArray(function(err, result) {
                if(err)
                {
                    console.log('Error:'+ err);
                    callback(null);
                    return;
                }
                callback(result[0]);
            });

        });

    }
    this.updateGameInfoByType=function (type,group,value,callBack) {


        var that=this;

        this.findGameInfoByType(type,function (obj) {

            if(obj!=null)
            {

                that.mongo.excute(function (db) {

                    var collection = db.collection('gameInfoEntity');
                    //更新数据
                    var whereStr = {"type":type};
                    var updateStr = {$set: {"group":group,"value":value.toString()}};
                    collection.update(whereStr,updateStr, function(err, result) {
                        if(err)
                        {
                            console.log('Error:'+ err);
                            callBack(-1);
                            return;
                        }
                        callBack(0);
                    });

                });


            }
            else{



                that.mongo.excute(function (db) {

                    var infoObj={};
                    infoObj.type=type;
                    infoObj.value=value;
                    infoObj.group=group;

                    var collection = db.collection('gameInfoEntity');
                    collection.insert(infoObj, function(err, result) {
                        if(err)
                        {
                            console.log('Error:'+ err);
                            callBack(-1);
                            return;
                        }
                        callBack(0);
                    });


                });


            }

        })

          





    }
    this.appendZhanji=function (zhanji,callback) {

        this.mongo.excute(function (db) {


            var collection = db.collection('zhanjientity');
            collection.insert(zhanji, function (err, result) {
                if (err) {
                    console.log('Error:' + err);
                    callback(-1);
                    return;
                }
                callback(0);
            });
        });
    }

    this.findZhanjiByTime=function (uid,timeStr,callback) {

        this.mongo.excute(function (db) {

            var collection = db.collection('zhanjientity');

            var whereStr ={$and:[{"uid":uid},{"time":{"$gt":timeStr}}]};

            collection.find(whereStr).toArray(function(err, result) {
                if(err)
                {
                    console.log('Error:'+ err);
                    callback(null);
                    return;
                }

               // console.log("find findZhanjiByTime account:"+result.length);
                callback(result);
            });

        });

    }


    this.addGoldData=function (data,callback) {

        this.mongo.excute(function (db) {


            var collection = db.collection('goldentity');
            collection.insert(data, function(err, result) {
                if(err)
                {
                    console.log('Error:'+ err);
                    callback(-1);
                    return;
                }
                callback(0);
            });
        });
    }

    this.findGoldDataByDate=function (date,callback) {

        this.mongo.excute(function (db) {

            var collection = db.collection('goldentity');

            var whereStr = {"date":{"$gt":date}};

            collection.find(whereStr).toArray(function(err, result) {
                if(err)
                {
                    console.log('Error:'+ err);
                    callback(null);
                    return;
                }

                //console.log("find user account:"+len);
                callback(result);
            });

        });

    }

    //添加绑定用户
    this.addBindUser=function (bindUser,callback) {

        this.mongo.excute(function (db) {

            var collection = db.collection('bindUser');
            collection.insert(bindUser, function(err, result) {
                if(err)
                {
                    console.log('Error:'+ err);
                    callback(-1);
                    return;
                }
                callback(0);
            });
        });

    }
    //查找我绑定的用户
    this.findMyBind=function (uid,callback) {

        this.mongo.excute(function (db) {

            var collection = db.collection('bindUser');

            var whereStr = {"uid":uid};

            collection.find(whereStr).toArray(function(err, result) {
                if(err)
                {
                    console.log('Error:'+ err);
                    callback(null);
                    return;
                }
                callback(result[0]);
            });

        });

    }
    //查找绑定我的用户
    this.findBindMy=function (uid,callback) {

        this.mongo.excute(function (db) {

            var collection = db.collection('bindUser');

            var whereStr = {"bindUid":uid};

            collection.find(whereStr).toArray(function(err, result) {
                if(err)
                {
                    console.log('Error:'+ err);
                    callback(null);
                    return;
                }
                callback(result);
            });

        });

    }


    //gm管理
    this.findManager=function (account,pwd,callback) {

        this.mongo.excute(function (db) {

            var collection = db.collection('manager');

            var whereStr = {$and:[{"account":account.toString()},{"pwd":pwd.toString()}]};

            collection.find(whereStr).toArray(function(err, result) {
                if(err)
                {
                    console.log('Error:'+ err);
                    callback(null);
                    return;
                }
                callback(result[0]);
            });

        });

    }

    this.findAllManager=function (callback) {

        this.mongo.excute(function (db) {

            var collection = db.collection('manager');
            collection.find().toArray(function(err, result) {
                if(err)
                {
                    console.log('Error:'+ err);
                    callback(null);
                    return;
                }

                callback(result);
            });
        });


    }
    //查询所有子代理
    this.findAllChildManager=function (uid,callback) {

        this.mongo.excute(function (db) {

            var collection = db.collection('manager');

            var whereStr = {"parentUid":uid.toString()};

            collection.find(whereStr).toArray(function(err, result) {
                if(err)
                {
                    console.log('Error:'+ err);
                    callback(null);
                    return;
                }
                callback(result);
            });

        });

    }

    //添加子代理
    this.addChildManager=function (manager,callback) {

        this.mongo.excute(function (db) {

            var collection = db.collection('manager');
            collection.insert(manager, function(err, result) {
                if(err)
                {
                    console.log('Error:'+ err);
                    callback(-1);
                    return;
                }
                callback(0);
            });
        });

    }
    //删除代理
    this.deleteChildManager=function (uid,callback) {

        var collection = this.mongo.db.collection('manager');
        //删除数据
        var whereStr = {"uid":"'"+uid+"'"};
        collection.remove(whereStr, function(err, result) {
            if(err)
            {
                console.log('Error:'+ err);
                callback(-1);
                return;
            }
            callback(0);
            //console.log(result);
        });
    }
    //更新代理
    this.updateManagerByUid=function (uid,txt,callBack) {

        this.mongo.excute(function (db) {

            var collection = db.collection('manager');
            //更新数据
            var whereStr = {"uid":uid.toString()};
            var updateStr = {$set: txt};
            collection.update(whereStr,updateStr, function(err, result) {
                if(err)
                {
                    console.log('Error:'+ err);
                    callBack(-1);
                    return;
                }
                callBack(0);
            });

        });



    }







}

var DaoManager=(function()
{
    var unique;
    function getInstance(){
        return unique || ( unique = new DaoManagerClass() );
    }
    return {
        getInstance : getInstance
    }
})();

module.exports = DaoManager;