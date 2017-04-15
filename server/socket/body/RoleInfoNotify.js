var ByteBuffer=require("../ByteBuffer");
var RoleInfoNotify=function(){
//
	this.user={};

this.write=function(bodybuff)
{
	var user_buf=new ByteBuffer();
	user_buf.initBlank();
	user_buf.putByte(1);
	this.user.write(user_buf);
	bodybuff.appendByteBuffer(user_buf);
	user_buf=null;
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
};
this.clone=function()
{
var cloneObj={};
cloneObj.user=this.user.clone();
cloneObj.read=this.read;
cloneObj.write=this.write;
cloneObj.clone=this.clone;
return cloneObj;
};
};
module.exports = RoleInfoNotify;
