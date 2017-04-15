var ByteBuffer=require("../ByteBuffer");
var JoinRoomRequest=function(){
//
	this.roomId="";
//
	this.uid="";

this.write=function(bodybuff)
{
	bodybuff.putUTF(this.roomId);
	bodybuff.putUTF(this.uid);
};
this.read=function(buffer)
{
	this.roomId=buffer.readUTF();
	this.uid=buffer.readUTF();
};
this.clone=function()
{
var cloneObj={};
cloneObj.roomId=this.roomId;
cloneObj.uid=this.uid;
cloneObj.read=this.read;
cloneObj.write=this.write;
cloneObj.clone=this.clone;
return cloneObj;
};
};
module.exports = JoinRoomRequest;
