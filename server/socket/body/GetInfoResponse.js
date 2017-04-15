var ByteBuffer=require("../ByteBuffer");
var GetInfoResponse=function(){
//0:邮件
	this.type=0;
//
	this.value=[];

this.write=function(bodybuff)
{
	bodybuff.putInt(this.type);
	var value_size=this.value.length;
	bodybuff.putInt(value_size);
	for(var i=0;i<value_size;i++)
	{
		bodybuff.putUTF(this.value[i]);
	}
};
this.read=function(buffer)
{
	this.type=buffer.readInt();
	var value_size=buffer.readInt();
	for(var i=0;i<value_size;i++)
	{
		var x=buffer.readUTF();
		this.value.push(x);
	}
};
this.clone=function()
{
var cloneObj={};
cloneObj.type=this.type;
cloneObj.value=[];
	var value_size=this.value.length;
	for(var i=0;i<value_size;i++)
	{
cloneObj.value.push(this.value[i]);
	}
cloneObj.read=this.read;
cloneObj.write=this.write;
cloneObj.clone=this.clone;
return cloneObj;
};
};
module.exports = GetInfoResponse;
