var ByteBuffer=require("../ByteBuffer");
var TopTipNotify=function(){
//
	this.player={};

this.write=function(bodybuff)
{
	var player_buf=new ByteBuffer();
	player_buf.initBlank();
	player_buf.putByte(1);
	this.player.write(player_buf);
	bodybuff.appendByteBuffer(player_buf);
	player_buf=null;
};
this.read=function(buffer)
{
	var player_b=buffer.readByte();
	if(player_b){
var Rank=require("./Rank");
		var player_info=new Rank();
		player_info.read(buffer);
		this.player=player_info;
	}
};
this.clone=function()
{
var cloneObj={};
cloneObj.player=this.player.clone();
cloneObj.read=this.read;
cloneObj.write=this.write;
return cloneObj;
};
};
module.exports = TopTipNotify;
