var ByteBuffer=require("../ByteBuffer");
var YuYinRequest=function(){
//
	this.name="";

this.write=function(bodybuff)
{
	bodybuff.putUTF(this.name);
};
this.read=function(buffer)
{
	this.name=buffer.readUTF();
};
this.clone=function()
{
var cloneObj={};
cloneObj.name=this.name;
cloneObj.read=this.read;
cloneObj.write=this.write;
return cloneObj;
};
};
module.exports = YuYinRequest;
