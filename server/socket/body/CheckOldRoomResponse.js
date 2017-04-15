var ByteBuffer=require("../ByteBuffer");
var CheckOldRoomResponse=function(){
//0:没有未完成的牌局,1:有
	this.state=0;
//
	this.roomId="";

this.write=function(bodybuff)
{
	bodybuff.putInt(this.state);
	bodybuff.putUTF(this.roomId);
};
this.read=function(buffer)
{
	this.state=buffer.readInt();
	this.roomId=buffer.readUTF();
};
this.clone=function()
{
var cloneObj={};
cloneObj.state=this.state;
cloneObj.roomId=this.roomId;
cloneObj.read=this.read;
cloneObj.write=this.write;
cloneObj.clone=this.clone;
return cloneObj;
};
};
module.exports = CheckOldRoomResponse;
