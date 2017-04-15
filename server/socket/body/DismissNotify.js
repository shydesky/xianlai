var ByteBuffer=require("../ByteBuffer");
var DismissNotify=function(){
//
	this.players=[];
//
	this.leftTime=0;

this.write=function(bodybuff)
{
	var players_size=this.players.length;
	bodybuff.putInt(players_size);
	for(var i=0;i<players_size;i++)
	{
		var obj=this.players[i];
		var buf=new ByteBuffer();
		buf.initBlank();
		buf.putByte(1);
		obj.write(buf);
		bodybuff.appendByteBuffer(buf);
		buf=null;
	}
	bodybuff.putInt(this.leftTime);
};
this.read=function(buffer)
{
	var players_size=buffer.readInt();
	for(var i=0;i<players_size;i++)
	{
		buffer.readByte();
var DismissObj=require("./DismissObj");
		var info=new DismissObj();
		info.read(buffer);
		this.players.push(info);
	}
	this.leftTime=buffer.readInt();
};
this.clone=function()
{
var cloneObj={};
cloneObj.players=[];
	var players_size=this.players.length;
	for(var i=0;i<players_size;i++)
	{
		var obj=this.players[i];
cloneObj.players.push(obj.clone());
	}
cloneObj.leftTime=this.leftTime;
cloneObj.read=this.read;
cloneObj.write=this.write;
cloneObj.clone=this.clone;
return cloneObj;
};
};
module.exports = DismissNotify;
