var ByteBuffer=require("../ByteBuffer");
var ReadyRequest=function(){
//
	this.uid="";
//
	this.roomId="";

this.write=function(bodybuff)
{
	bodybuff.putUTF(this.uid);
	bodybuff.putUTF(this.roomId);
};
this.read=function(buffer)
{
	this.uid=buffer.readUTF();
	this.roomId=buffer.readUTF();
};
this.clone=function()
{
var cloneObj={};
cloneObj.uid=this.uid;
cloneObj.roomId=this.roomId;
cloneObj.read=this.read;
cloneObj.write=this.write;
cloneObj.clone=this.clone;
return cloneObj;
};
};
module.exports = ReadyRequest;
