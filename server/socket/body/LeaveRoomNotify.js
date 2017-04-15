var ByteBuffer=require("../ByteBuffer");
var LeaveRoomNotify=function(){
//
	this.roomUser={};

this.write=function(bodybuff)
{
	var roomUser_buf=new ByteBuffer();
	roomUser_buf.initBlank();
	roomUser_buf.putByte(1);
	this.roomUser.write(roomUser_buf);
	bodybuff.appendByteBuffer(roomUser_buf);
	roomUser_buf=null;
};
this.read=function(buffer)
{
	var roomUser_b=buffer.readByte();
	if(roomUser_b){
var RoomUserInfo=require("./RoomUserInfo");
		var roomUser_info=new RoomUserInfo();
		roomUser_info.read(buffer);
		this.roomUser=roomUser_info;
	}
};
this.clone=function()
{
var cloneObj={};
cloneObj.roomUser=this.roomUser.clone();
cloneObj.read=this.read;
cloneObj.write=this.write;
cloneObj.clone=this.clone;
return cloneObj;
};
};
module.exports = LeaveRoomNotify;
