var ByteBuffer=require("../ByteBuffer");
var PlayerPositionNotify=function(){
//
	this.playes_n=[];

this.write=function(bodybuff)
{
	var playes_n_size=this.playes_n.length;
	bodybuff.putInt(playes_n_size);
	for(var i=0;i<playes_n_size;i++)
	{
		var obj=this.playes_n[i];
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
	var playes_n_size=buffer.readInt();
	for(var i=0;i<playes_n_size;i++)
	{
		buffer.readByte();
var PlayerPos=require("./PlayerPos");
		var info=new PlayerPos();
		info.read(buffer);
		this.playes_n.push(info);
	}
};
this.clone=function()
{
var cloneObj={};
cloneObj.playes_n=[];
	var playes_n_size=this.playes_n.length;
	for(var i=0;i<playes_n_size;i++)
	{
		var obj=this.playes_n[i];
cloneObj.playes_n.push(obj.clone());
	}
cloneObj.read=this.read;
cloneObj.write=this.write;
return cloneObj;
};
};
module.exports = PlayerPositionNotify;
