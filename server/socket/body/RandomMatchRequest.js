var ByteBuffer=require("../ByteBuffer");
var RandomMatchRequest=function(){
//
	this.uid="";

this.write=function(bodybuff)
{
	bodybuff.putUTF(this.uid);
};
this.read=function(buffer)
{
	this.uid=buffer.readUTF();
};
this.clone=function()
{
var cloneObj={};
cloneObj.uid=this.uid;
cloneObj.read=this.read;
cloneObj.write=this.write;
cloneObj.clone=this.clone;
return cloneObj;
};
};
module.exports = RandomMatchRequest;
