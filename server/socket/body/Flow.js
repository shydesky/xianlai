var ByteBuffer=require("../ByteBuffer");
var Flow=function(){
//0:创建玩家,1:玩家动作
	this.type=0;
//
	this.players=[];

this.write=function(bodybuff)
{
	bodybuff.putInt(this.type);
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
	this.type=buffer.readInt();
	var players_size=buffer.readInt();
	for(var i=0;i<players_size;i++)
	{
		buffer.readByte();
var Player=require("./Player");
		var info=new Player();
		info.read(buffer);
		this.players.push(info);
	}
};
this.clone=function()
{
var cloneObj={};
cloneObj.type=this.type;
cloneObj.players=[];
	var players_size=this.players.length;
	for(var i=0;i<players_size;i++)
	{
		var obj=this.players[i];
cloneObj.players.push(obj.clone());
	}
cloneObj.read=this.read;
cloneObj.write=this.write;
cloneObj.clone=this.clone;
return cloneObj;
};
};
module.exports = Flow;
