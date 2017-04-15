var ByteBuffer=require("../ByteBuffer");
var TuBall=function(){
//
	this.worldX=0;
//
	this.worldY=0;
//质量
	this.mass=0;
//id
	this.id=0;
//id
	this.name="";
//id
	this.number=0;
//0,1
	this.static=0;
//
	this.skin="";

this.write=function(bodybuff)
{
	bodybuff.putInt(this.worldX);
	bodybuff.putInt(this.worldY);
	bodybuff.putInt(this.mass);
	bodybuff.putInt(this.id);
	bodybuff.putUTF(this.name);
	bodybuff.putInt(this.number);
	bodybuff.putInt(this.static);
	bodybuff.putUTF(this.skin);
};
this.read=function(buffer)
{
	this.worldX=buffer.readInt();
	this.worldY=buffer.readInt();
	this.mass=buffer.readInt();
	this.id=buffer.readInt();
	this.name=buffer.readUTF();
	this.number=buffer.readInt();
	this.static=buffer.readInt();
	this.skin=buffer.readUTF();
};
this.clone=function()
{
var cloneObj={};
cloneObj.worldX=this.worldX;
cloneObj.worldY=this.worldY;
cloneObj.mass=this.mass;
cloneObj.id=this.id;
cloneObj.name=this.name;
cloneObj.number=this.number;
cloneObj.static=this.static;
cloneObj.skin=this.skin;
cloneObj.read=this.read;
cloneObj.write=this.write;
return cloneObj;
};
};
module.exports = TuBall;
