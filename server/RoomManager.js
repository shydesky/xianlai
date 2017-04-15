/**
 * Created by yungu on 16/11/4.
 */
var Room=require("./Room");
var log=require("./Log");

var RoomManager=(function()
{
    var unique;
    function getInstance(){
        return unique || ( unique = new RoomManagerClass() );
    }
    return {
        getInstance : getInstance
    }
})();

var RoomManagerClass=function () {

    this.roomUnusedId=[];
    this.rooms={};

    for(var i=100000;i<1000000;i++)
    {
        this.roomUnusedId.push(i);
    }
    this.roomUnusedId.sort(function(){ return 0.5 - Math.random() });

    this.getRoomId=function () {

        var keys=this.roomUnusedId.length;
        var len=keys.length;
        if(len<=0)
        {
            log("[ERROR:无可用房间ID]");
        }

        var roomId=this.roomUnusedId[0];
        this.roomUnusedId.splice(0,1);
        return roomId+"";
      //return "123456";
    }
    this.getRoomById=function (roomId) {

        return this.rooms[roomId];
    }
    this.createRoom=function (userId) {

        var roomId=this.getRoomId();
        var room=new Room();
        room.roomId=roomId;
        room.uid=userId;
        this.rooms[roomId]=room;
        return room;
    }

    this.removeRoom=function (roomId) {
        var room=this.rooms[roomId];
        if(room!=undefined)
        {
            room.close();
            this.roomUnusedId[roomId]=roomId;
            delete this.rooms[roomId];
        }
        console.log("[移除房间:"+roomId+"]");
    }
    this.checkUserInRoom=function (uid) {

        for(var rId in this.rooms)
        {
            var room=this.rooms[rId];
            var user=room.getUserByUid(uid);
            if(user!=null)
            {
                return room;
            }
            else{
                // for(var uid2 in room.roomUsers)
                // {
                //     var uu=room.roomUsers[uid2];
                //     console.log("roomId:"+rId+",uid:"+uu.uid+",checkUid:"+uid);
                //
                // }

            }

        }

        return null;
    }
    

}

module.exports = RoomManager;