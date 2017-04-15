var ByteBuffer=require("../ByteBuffer");
var BindUserResponse=function(){
//0:成功,1:已经绑定用户,-1：失败
	this.state=0;
//
	this.txt="";
//
	this.user={};

this.write=function(bodybuff)
{
	bodybuff.putInt(this.state);
	bodybuff.putUTF(this.txt);
	var user_buf=new ByteBuffer();
	user_buf.initBlank();
	user_buf.putByte(1);
	this.user.write(user_buf);
	bodybuff.appendByteBuffer(user_buf);
	user_buf=null;
};
this.read=function(buffer)
{
	this.state=buffer.readInt();
	this.txt=buffer.readUTF();
	var user_b=buffer.readByte();
	if(user_b){
var BindObj=require("./BindObj");
		var user_info=new BindObj();
		user_info.read(buffer);
		this.user=user_info;
	}
};
this.clone=function()
{
var cloneObj={};
cloneObj.state=this.state;
cloneObj.txt=this.txt;
cloneObj.user=this.user.clone();
cloneObj.read=this.read;
cloneObj.write=this.write;
cloneObj.clone=this.clone;
return cloneObj;
};
};
module.exports = BindUserResponse;
