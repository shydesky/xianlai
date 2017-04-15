var ByteBuffer=require("../ByteBuffer");
var PutCardRequest=function(){
//
	this.c_id=0;
//
	this.uid="";
//
	this.roomId="";

this.write=function(bodybuff)
{
	bodybuff.putInt(this.c_id);
	bodybuff.putUTF(this.uid);
	bodybuff.putUTF(this.roomId);
};
this.read=function(buffer)
{
	this.c_id=buffer.readInt();
	this.uid=buffer.readUTF();
	this.roomId=buffer.readUTF();
};
this.clone=function()
{
var cloneObj={};
cloneObj.c_id=this.c_id;
cloneObj.uid=this.uid;
cloneObj.roomId=this.roomId;
cloneObj.read=this.read;
cloneObj.write=this.write;
cloneObj.clone=this.clone;
return cloneObj;
};
};
module.exports = PutCardRequest;
