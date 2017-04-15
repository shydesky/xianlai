var ByteBuffer=require("../ByteBuffer");
var ReviveRequest=function(){
//
	this.data="";

this.write=function(bodybuff)
{
	bodybuff.putUTF(this.data);
};
this.read=function(buffer)
{
	this.data=buffer.readUTF();
};
this.clone=function()
{
var cloneObj={};
cloneObj.data=this.data;
cloneObj.read=this.read;
cloneObj.write=this.write;
return cloneObj;
};
};
module.exports = ReviveRequest;
