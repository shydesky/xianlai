var ByteBuffer=require("../ByteBuffer");
var ThingUpdate=function(){
//
	this.grids=[];
//1:添加,2:更新,3:删除
	this.oper=0;

this.write=function(bodybuff)
{
	var grids_size=this.grids.length;
	bodybuff.putInt(grids_size);
	for(var i=0;i<grids_size;i++)
	{
		var obj=this.grids[i];
		var buf=new ByteBuffer();
		buf.initBlank();
		buf.putByte(1);
		obj.write(buf);
		bodybuff.appendByteBuffer(buf);
		buf=null;
	}
	bodybuff.putInt(this.oper);
};
this.read=function(buffer)
{
	var grids_size=buffer.readInt();
	for(var i=0;i<grids_size;i++)
	{
		buffer.readByte();
var GridInfo=require("./GridInfo");
		var info=new GridInfo();
		info.read(buffer);
		this.grids.push(info);
	}
	this.oper=buffer.readInt();
};
this.clone=function()
{
var cloneObj={};
cloneObj.grids=[];
	var grids_size=this.grids.length;
	for(var i=0;i<grids_size;i++)
	{
		var obj=this.grids[i];
cloneObj.grids.push(obj.clone());
	}
cloneObj.oper=this.oper;
cloneObj.read=this.read;
cloneObj.write=this.write;
return cloneObj;
};
};
module.exports = ThingUpdate;
