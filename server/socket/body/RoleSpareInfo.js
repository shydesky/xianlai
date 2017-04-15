var ByteBuffer=require("../ByteBuffer");
var RoleSpareInfo=function(){
//
	this.worldX=0;
//
	this.worldY=0;
//分身id
	this.number=0;
//
	this.boold=0;
//
	this.rotate=0;
//0:已有分身,1:新分身
	this.state=0;
//分裂时间
	this.time=0;
//关联父分身
	this.relationNumber=0;

this.write=function(bodybuff)
{
	bodybuff.putFloat(this.worldX);
	bodybuff.putFloat(this.worldY);
	bodybuff.putInt(this.number);
	bodybuff.putLongType(this.boold);
	bodybuff.putInt(this.rotate);
	bodybuff.putInt(this.state);
	bodybuff.putInt(this.time);
	bodybuff.putInt(this.relationNumber);
};
this.read=function(buffer)
{
	this.worldX=buffer.readFloat();
	this.worldY=buffer.readFloat();
	this.number=buffer.readInt();
	this.boold=buffer.readLongType();
	this.rotate=buffer.readInt();
	this.state=buffer.readInt();
	this.time=buffer.readInt();
	this.relationNumber=buffer.readInt();
};
this.clone=function()
{
var cloneObj={};
cloneObj.worldX=this.worldX;
cloneObj.worldY=this.worldY;
cloneObj.number=this.number;
cloneObj.boold=this.boold;
cloneObj.rotate=this.rotate;
cloneObj.state=this.state;
cloneObj.time=this.time;
cloneObj.relationNumber=this.relationNumber;
cloneObj.read=this.read;
cloneObj.write=this.write;
return cloneObj;
};
};
module.exports = RoleSpareInfo;
