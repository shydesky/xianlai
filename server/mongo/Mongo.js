/**
 * Created by yungu on 16/8/7.
 */
var MongoClient = require('mongodb').MongoClient;
//var DB_CONN_STR = 'mongodb://xixi:xixi_binzhou@localhost:27017/chess';
var DB_CONN_STR = 'mongodb://localhost:27017/chess';


var Mongo=function(callBack) {

    //var that=this;
    
    this.excute=function (method) {



        MongoClient.connect(DB_CONN_STR, function(err, db) {
            console.log("mongodb 连接成功！");
           // that.db=db;
            method(db);
            db.close();
        });
    }



    


}

module.exports = Mongo;