var ByteBuffer=require("../ByteBuffer");
var MsgRequest=function(){
//
	this.uid="";
//
	this.roomId="";
//
	this.biaoqing="";
//
	this.msg="";

this.write=function(bodybuff)
{
	bodybuff.putUTF(this.uid);
	bodybuff.putUTF(this.roomId);
	bodybuff.putUTF(this.biaoqing);
	bodybuff.putUTF(this.msg);
};
this.read=function(buffer)
{
	this.uid=buffer.readUTF();
	this.roomId=buffer.readUTF();
	this.biaoqing=buffer.readUTF();
	this.msg=buffer.readUTF();
};
this.clone=function()
{
var cloneObj={};
cloneObj.uid=this.uid;
cloneObj.roomId=this.roomId;
cloneObj.biaoqing=this.biaoqing;
cloneObj.msg=this.msg;
cloneObj.read=this.read;
cloneObj.write=this.write;
cloneObj.clone=this.clone;
return cloneObj;
};
};
module.exports = MsgRequest;
