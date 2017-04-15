/**
 * Created by yungu on 16/11/4.
 */
var log=require("./Log");
var RoomManager=require("./RoomManager");


var MatchManager=(function()
{
    var unique;
    function getInstance(){
        return unique || ( unique = new MatchManagerClass() );
    }
    return {
        getInstance : getInstance
    }
})();

var MatchManagerClass=function () {

    this.matchQueue=[];

    setTimeout(this.matchLogic.bind(this), 1000);
    
    this.appendMatchUser=function (user) {
        this.matchQueue.push(user);
    }

    
    this.matchLogic=function () {

        setTimeout(this.matchLogic.bind(this), 1000);

        var len=this.matchQueue.length;
        while(len>=3)
        {
            //满足3人,创建房间
            log("[随机匹配创建房间]");

            var room=RoomManager.getInstance().createRoom("-1");
            for(var i=0;i<3;i++)
            {
                var user=this.matchQueue[0];
                room.joinRoom(user);
                this.matchQueue.splice(0,1);
            }
            len=this.matchQueue.length
        }

        log("[当前等待匹配玩家数目:"+len+"]");


    }
}

module.exports = MatchManager;