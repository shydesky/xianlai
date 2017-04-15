var ByteBuffer=require("../ByteBuffer");
var PlayerUpdate=function(){
//
	this.player={};
//1:添加,2:更改,3:删除
	this.oper=0;

this.write=function(bodybuff)
{
	var player_buf=new ByteBuffer();
	player_buf.initBlank();
	player_buf.putByte(1);
	this.player.write(player_buf);
	bodybuff.appendByteBuffer(player_buf);
	player_buf=null;
	bodybuff.putInt(this.oper);
};
this.read=function(buffer)
{
	var player_b=buffer.readByte();
	if(player_b){
var RoleInfo=require("./RoleInfo");
		var player_info=new RoleInfo();
		player_info.read(buffer);
		this.player=player_info;
	}
	this.oper=buffer.readInt();
};
this.clone=function()
{
var cloneObj={};
cloneObj.player=this.player.clone();
cloneObj.oper=this.oper;
cloneObj.read=this.read;
cloneObj.write=this.write;
return cloneObj;
};
};
module.exports = PlayerUpdate;
