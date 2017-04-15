var ByteBuffer=require("../ByteBuffer");
var RoleSpareMassInfo=function(){
//分身id
	this.number=0;
//
	this.boold=0;

this.write=function(bodybuff)
{
	bodybuff.putInt(this.number);
	bodybuff.putLongType(this.boold);
};
this.read=function(buffer)
{
	this.number=buffer.readInt();
	this.boold=buffer.readLongType();
};
this.clone=function()
{
var cloneObj={};
cloneObj.number=this.number;
cloneObj.boold=this.boold;
cloneObj.read=this.read;
cloneObj.write=this.write;
return cloneObj;
};
};
module.exports = RoleSpareMassInfo;
