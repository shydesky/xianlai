var ByteBuffer=require("../ByteBuffer");
var PlayRequest=function(){
//
	this.uid="";
//回放码
	this.code="";

this.write=function(bodybuff)
{
	bodybuff.putUTF(this.uid);
	bodybuff.putUTF(this.code);
};
this.read=function(buffer)
{
	this.uid=buffer.readUTF();
	this.code=buffer.readUTF();
};
this.clone=function()
{
var cloneObj={};
cloneObj.uid=this.uid;
cloneObj.code=this.code;
cloneObj.read=this.read;
cloneObj.write=this.write;
cloneObj.clone=this.clone;
return cloneObj;
};
};
module.exports = PlayRequest;
