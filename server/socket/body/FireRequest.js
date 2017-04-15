var ByteBuffer=require("../ByteBuffer");
var FireRequest=function(){
//
	this.shellSkin="";
//x,y
	this.direct="";

this.write=function(bodybuff)
{
	bodybuff.putUTF(this.shellSkin);
	bodybuff.putUTF(this.direct);
};
this.read=function(buffer)
{
	this.shellSkin=buffer.readUTF();
	this.direct=buffer.readUTF();
};
this.clone=function()
{
var cloneObj={};
cloneObj.shellSkin=this.shellSkin;
cloneObj.direct=this.direct;
cloneObj.read=this.read;
cloneObj.write=this.write;
return cloneObj;
};
};
module.exports = FireRequest;
