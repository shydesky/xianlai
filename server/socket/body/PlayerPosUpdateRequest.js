var ByteBuffer=require("../ByteBuffer");
var PlayerPosUpdateRequest=function(){
//
	this.pos=[];

this.write=function(bodybuff)
{
	var pos_size=this.pos.length;
	bodybuff.putInt(pos_size);
	for(var i=0;i<pos_size;i++)
	{
		var obj=this.pos[i];
		var buf=new ByteBuffer();
		buf.initBlank();
		buf.putByte(1);
		obj.write(buf);
		bodybuff.appendByteBuffer(buf);
		buf=null;
	}
};
this.read=function(buffer)
{
	var pos_size=buffer.readInt();
	for(var i=0;i<pos_size;i++)
	{
		buffer.readByte();
var PosInfo=require("./PosInfo");
		var info=new PosInfo();
		info.read(buffer);
		this.pos.push(info);
	}
};
this.clone=function()
{
var cloneObj={};
cloneObj.pos=[];
	var pos_size=this.pos.length;
	for(var i=0;i<pos_size;i++)
	{
		var obj=this.pos[i];
cloneObj.pos.push(obj.clone());
	}
cloneObj.read=this.read;
cloneObj.write=this.write;
return cloneObj;
};
};
module.exports = PlayerPosUpdateRequest;
