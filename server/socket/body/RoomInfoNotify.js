var ByteBuffer=require("../ByteBuffer");
var RoomInfoNotify=function(){
//
	this.roomInfo={};

this.write=function(bodybuff)
{
	var roomInfo_buf=new ByteBuffer();
	roomInfo_buf.initBlank();
	roomInfo_buf.putByte(1);
	this.roomInfo.write(roomInfo_buf);
	bodybuff.appendByteBuffer(roomInfo_buf);
	roomInfo_buf=null;
};
this.read=function(buffer)
{
	var roomInfo_b=buffer.readByte();
	if(roomInfo_b){
var RoomInfo=require("./RoomInfo");
		var roomInfo_info=new RoomInfo();
		roomInfo_info.read(buffer);
		this.roomInfo=roomInfo_info;
	}
};
this.clone=function()
{
var cloneObj={};
cloneObj.roomInfo=this.roomInfo.clone();
cloneObj.read=this.read;
cloneObj.write=this.write;
cloneObj.clone=this.clone;
return cloneObj;
};
};
module.exports = RoomInfoNotify;
