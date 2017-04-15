var ByteBuffer=require("../ByteBuffer");
var FlushRoomNotify=function(){
//
	this.roomUsers=[];

this.write=function(bodybuff)
{
	var roomUsers_size=this.roomUsers.length;
	bodybuff.putInt(roomUsers_size);
	for(var i=0;i<roomUsers_size;i++)
	{
		var obj=this.roomUsers[i];
		var buf=new ByteBuffer();
		buf.initBlank();
		buf.putByte(1);
		obj.write(buf);
		bodybuff.appendByteBuffer(buf);
		buf=null;
	}
};
this.read=function(buffer)
{
	var roomUsers_size=buffer.readInt();
	for(var i=0;i<roomUsers_size;i++)
	{
		buffer.readByte();
var RoomUserInfo=require("./RoomUserInfo");
		var info=new RoomUserInfo();
		info.read(buffer);
		this.roomUsers.push(info);
	}
};
this.clone=function()
{
var cloneObj={};
cloneObj.roomUsers=[];
	var roomUsers_size=this.roomUsers.length;
	for(var i=0;i<roomUsers_size;i++)
	{
		var obj=this.roomUsers[i];
cloneObj.roomUsers.push(obj.clone());
	}
cloneObj.read=this.read;
cloneObj.write=this.write;
cloneObj.clone=this.clone;
return cloneObj;
};
};
module.exports = FlushRoomNotify;
