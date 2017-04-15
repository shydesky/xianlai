var ByteBuffer=require("../ByteBuffer");
var YuYinNotify=function(){
//
	this.uid="";
//
	this.fileName="";

this.write=function(bodybuff)
{
	bodybuff.putUTF(this.uid);
	bodybuff.putUTF(this.fileName);
};
this.read=function(buffer)
{
	this.uid=buffer.readUTF();
	this.fileName=buffer.readUTF();
};
this.clone=function()
{
var cloneObj={};
cloneObj.uid=this.uid;
cloneObj.fileName=this.fileName;
cloneObj.read=this.read;
cloneObj.write=this.write;
cloneObj.clone=this.clone;
return cloneObj;
};
};
module.exports = YuYinNotify;
