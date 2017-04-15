var ByteBuffer=require("../ByteBuffer");
var BindMyResponse=function(){
//
	this.users=[];

this.write=function(bodybuff)
{
	var users_size=this.users.length;
	bodybuff.putInt(users_size);
	for(var i=0;i<users_size;i++)
	{
		var obj=this.users[i];
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
	var users_size=buffer.readInt();
	for(var i=0;i<users_size;i++)
	{
		buffer.readByte();
var BindObj=require("./BindObj");
		var info=new BindObj();
		info.read(buffer);
		this.users.push(info);
	}
};
this.clone=function()
{
var cloneObj={};
cloneObj.users=[];
	var users_size=this.users.length;
	for(var i=0;i<users_size;i++)
	{
		var obj=this.users[i];
cloneObj.users.push(obj.clone());
	}
cloneObj.read=this.read;
cloneObj.write=this.write;
cloneObj.clone=this.clone;
return cloneObj;
};
};
module.exports = BindMyResponse;
