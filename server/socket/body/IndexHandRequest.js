var ByteBuffer=require("../ByteBuffer");
var IndexHandRequest=function(){
//服务器id
	this.sid="";

this.write=function(bodybuff)
{
	bodybuff.putUTF(this.sid);
};
this.read=function(buffer)
{
	this.sid=buffer.readUTF();
};
this.clone=function()
{
var cloneObj={};
cloneObj.sid=this.sid;
cloneObj.read=this.read;
cloneObj.write=this.write;
cloneObj.clone=this.clone;
return cloneObj;
};
};
module.exports = IndexHandRequest;
