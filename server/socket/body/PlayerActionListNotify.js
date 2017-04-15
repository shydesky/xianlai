var ByteBuffer=require("../ByteBuffer");
var PlayerActionListNotify=function(){
//
	this.players=[];

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
};
this.read=function(buffer)
{
	var players_size=buffer.readInt();
	for(var i=0;i<players_size;i++)
	{
		buffer.readByte();
var PlayerActions=require("./PlayerActions");
		var info=new PlayerActions();
		info.read(buffer);
		this.players.push(info);
	}
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
cloneObj.read=this.read;
cloneObj.write=this.write;
return cloneObj;
};
};
module.exports = PlayerActionListNotify;
