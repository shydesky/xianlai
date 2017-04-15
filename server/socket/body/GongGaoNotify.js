var ByteBuffer=require("../ByteBuffer");
var GongGaoNotify=function(){
//
	this.txt="";

this.write=function(bodybuff)
{
	bodybuff.putUTF(this.txt);
};
this.read=function(buffer)
{
	this.txt=buffer.readUTF();
};
this.clone=function()
{
var cloneObj={};
cloneObj.txt=this.txt;
cloneObj.read=this.read;
cloneObj.write=this.write;
cloneObj.clone=this.clone;
return cloneObj;
};
};
module.exports = GongGaoNotify;
