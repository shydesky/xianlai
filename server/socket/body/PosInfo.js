var ByteBuffer=require("../ByteBuffer");
var PosInfo=function(){
//
	this.worldX=[];
//
	this.worldY=[];
//
	this.rotate=[];
//
	this.name="";
//
	this.roleNumber=0;

this.write=function(bodybuff)
{
	var worldX_size=this.worldX.length;
	bodybuff.putInt(worldX_size);
	for(var i=0;i<worldX_size;i++)
	{
		bodybuff.putInt(this.worldX[i]);
	}
	var worldY_size=this.worldY.length;
	bodybuff.putInt(worldY_size);
	for(var i=0;i<worldY_size;i++)
	{
		bodybuff.putInt(this.worldY[i]);
	}
	var rotate_size=this.rotate.length;
	bodybuff.putInt(rotate_size);
	for(var i=0;i<rotate_size;i++)
	{
		bodybuff.putInt(this.rotate[i]);
	}
	bodybuff.putUTF(this.name);
	bodybuff.putInt(this.roleNumber);
};
this.read=function(buffer)
{
	var worldX_size=buffer.readInt();
	for(var i=0;i<worldX_size;i++)
	{
		var x=buffer.readInt();
		this.worldX.push(x);
	}
	var worldY_size=buffer.readInt();
	for(var i=0;i<worldY_size;i++)
	{
		var x=buffer.readInt();
		this.worldY.push(x);
	}
	var rotate_size=buffer.readInt();
	for(var i=0;i<rotate_size;i++)
	{
		var x=buffer.readInt();
		this.rotate.push(x);
	}
	this.name=buffer.readUTF();
	this.roleNumber=buffer.readInt();
};
this.clone=function()
{
var cloneObj={};
cloneObj.worldX=[];
	var worldX_size=this.worldX.length;
	for(var i=0;i<worldX_size;i++)
	{
cloneObj.worldX.push(this.worldX[i]);
	}
cloneObj.worldY=[];
	var worldY_size=this.worldY.length;
	for(var i=0;i<worldY_size;i++)
	{
cloneObj.worldY.push(this.worldY[i]);
	}
cloneObj.rotate=[];
	var rotate_size=this.rotate.length;
	for(var i=0;i<rotate_size;i++)
	{
cloneObj.rotate.push(this.rotate[i]);
	}
cloneObj.name=this.name;
cloneObj.roleNumber=this.roleNumber;
cloneObj.read=this.read;
cloneObj.write=this.write;
return cloneObj;
};
};
module.exports = PosInfo;
