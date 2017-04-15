var ByteBuffer=require("../ByteBuffer");
var RoomUserInfo=function(){
//
	this.user={};
//座次顺序
	this.index=0;
//0:,1:庄家,2:闲
	this.type=0;
//当前胡息
	this.huxi=0;
//总胡息
	this.zonghuxi=0;
//yuanbao
	this.yuanbao=0;
//0:离线,1:在线
	this.isOnline=0;
//0:准备好,1:未准备好
	this.isReady=0;

this.write=function(bodybuff)
{
	var user_buf=new ByteBuffer();
	user_buf.initBlank();
	user_buf.putByte(1);
	this.user.write(user_buf);
	bodybuff.appendByteBuffer(user_buf);
	user_buf=null;
	bodybuff.putInt(this.index);
	bodybuff.putInt(this.type);
	bodybuff.putInt(this.huxi);
	bodybuff.putInt(this.zonghuxi);
	bodybuff.putInt(this.yuanbao);
	bodybuff.putInt(this.isOnline);
	bodybuff.putInt(this.isReady);
};
this.read=function(buffer)
{
	var user_b=buffer.readByte();
	if(user_b){
var RoleInfo=require("./RoleInfo");
		var user_info=new RoleInfo();
		user_info.read(buffer);
		this.user=user_info;
	}
	this.index=buffer.readInt();
	this.type=buffer.readInt();
	this.huxi=buffer.readInt();
	this.zonghuxi=buffer.readInt();
	this.yuanbao=buffer.readInt();
	this.isOnline=buffer.readInt();
	this.isReady=buffer.readInt();
};
this.clone=function()
{
var cloneObj={};
cloneObj.user=this.user.clone();
cloneObj.index=this.index;
cloneObj.type=this.type;
cloneObj.huxi=this.huxi;
cloneObj.zonghuxi=this.zonghuxi;
cloneObj.yuanbao=this.yuanbao;
cloneObj.isOnline=this.isOnline;
cloneObj.isReady=this.isReady;
cloneObj.read=this.read;
cloneObj.write=this.write;
cloneObj.clone=this.clone;
return cloneObj;
};
};
module.exports = RoomUserInfo;
