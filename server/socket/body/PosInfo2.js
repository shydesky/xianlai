var ByteBuffer=require("../ByteBuffer");
var PosInfo2=function(){
//
	this.worldX=0;
//
	this.worldY=0;
//
	this.rotate=0;
//
	this.roleNumber=0;
//
	this.releationNumber=0;
//
	this.boold=0;

this.write=function(bodybuff)
{
	bodybuff.putFloat(this.worldX);
	bodybuff.putFloat(this.worldY);
	bodybuff.putFloat(this.rotate);
	bodybuff.putInt(this.roleNumber);
	bodybuff.putInt(this.releationNumber);
	bodybuff.putLongType(this.boold);
};
this.read=function(buffer)
{
	this.worldX=buffer.readFloat();
	this.worldY=buffer.readFloat();
	this.rotate=buffer.readFloat();
	this.roleNumber=buffer.readInt();
	this.releationNumber=buffer.readInt();
	this.boold=buffer.readLongType();
};
this.clone=function()
{
var cloneObj={};
cloneObj.worldX=this.worldX;
cloneObj.worldY=this.worldY;
cloneObj.rotate=this.rotate;
cloneObj.roleNumber=this.roleNumber;
cloneObj.releationNumber=this.releationNumber;
cloneObj.boold=this.boold;
cloneObj.read=this.read;
cloneObj.write=this.write;
return cloneObj;
};
};
module.exports = PosInfo2;
