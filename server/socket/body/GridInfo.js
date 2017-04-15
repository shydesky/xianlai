var ByteBuffer=require("../ByteBuffer");
var GridInfo=function(){
//
	this.gridX=0;
//
	this.gridY=0;
//0:未使用,1:未关联,2:已关联,3:主角
	this.type=0;
//0:红,1:黄,2:蓝,3:绿
	this.skin="";
//
	this.g_id="";
//
	this.name="";

this.write=function(bodybuff)
{
	bodybuff.putShort(this.gridX);
	bodybuff.putShort(this.gridY);
	bodybuff.putShort(this.type);
	bodybuff.putUTF(this.skin);
	bodybuff.putUTF(this.g_id);
	bodybuff.putUTF(this.name);
};
this.read=function(buffer)
{
	this.gridX=buffer.readShort();
	this.gridY=buffer.readShort();
	this.type=buffer.readShort();
	this.skin=buffer.readUTF();
	this.g_id=buffer.readUTF();
	this.name=buffer.readUTF();
};
this.clone=function()
{
var cloneObj={};
cloneObj.gridX=this.gridX;
cloneObj.gridY=this.gridY;
cloneObj.type=this.type;
cloneObj.skin=this.skin;
cloneObj.g_id=this.g_id;
cloneObj.name=this.name;
cloneObj.read=this.read;
cloneObj.write=this.write;
return cloneObj;
};
};
module.exports = GridInfo;
