var ByteBuffer=require("../ByteBuffer");
var MsgResponse=function(){
//
	this.uid="";
//
	this.biaoqing="";
//
	this.msg="";

this.write=function(bodybuff)
{
	bodybuff.putUTF(this.uid);
	bodybuff.putUTF(this.biaoqing);
	bodybuff.putUTF(this.msg);
};
this.read=function(buffer)
{
	this.uid=buffer.readUTF();
	this.biaoqing=buffer.readUTF();
	this.msg=buffer.readUTF();
};
this.clone=function()
{
var cloneObj={};
cloneObj.uid=this.uid;
cloneObj.biaoqing=this.biaoqing;
cloneObj.msg=this.msg;
cloneObj.read=this.read;
cloneObj.write=this.write;
cloneObj.clone=this.clone;
return cloneObj;
};
};
module.exports = MsgResponse;
