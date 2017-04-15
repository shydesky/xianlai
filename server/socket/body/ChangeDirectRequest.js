var ByteBuffer=require("../ByteBuffer");
var ChangeDirectRequest=function(){
//
	this.x=0;
//
	this.y=0;
//
	this.mapScl=0;
//
	this.name="";

this.write=function(bodybuff)
{
	bodybuff.putFloat(this.x);
	bodybuff.putFloat(this.y);
	bodybuff.putFloat(this.mapScl);
	bodybuff.putUTF(this.name);
};
this.read=function(buffer)
{
	this.x=buffer.readFloat();
	this.y=buffer.readFloat();
	this.mapScl=buffer.readFloat();
	this.name=buffer.readUTF();
};
this.clone=function()
{
var cloneObj={};
cloneObj.x=this.x;
cloneObj.y=this.y;
cloneObj.mapScl=this.mapScl;
cloneObj.name=this.name;
cloneObj.read=this.read;
cloneObj.write=this.write;
return cloneObj;
};
};
module.exports = ChangeDirectRequest;
