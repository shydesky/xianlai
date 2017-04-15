var ByteBuffer=require("../ByteBuffer");
var GetZhanJiResponse=function(){
//
	this.zhanjis=[];

this.write=function(bodybuff)
{
	var zhanjis_size=this.zhanjis.length;
	bodybuff.putInt(zhanjis_size);
	for(var i=0;i<zhanjis_size;i++)
	{
		var obj=this.zhanjis[i];
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
	var zhanjis_size=buffer.readInt();
	for(var i=0;i<zhanjis_size;i++)
	{
		buffer.readByte();
var ZhanJi=require("./ZhanJi");
		var info=new ZhanJi();
		info.read(buffer);
		this.zhanjis.push(info);
	}
};
this.clone=function()
{
var cloneObj={};
cloneObj.zhanjis=[];
	var zhanjis_size=this.zhanjis.length;
	for(var i=0;i<zhanjis_size;i++)
	{
		var obj=this.zhanjis[i];
cloneObj.zhanjis.push(obj.clone());
	}
cloneObj.read=this.read;
cloneObj.write=this.write;
cloneObj.clone=this.clone;
return cloneObj;
};
};
module.exports = GetZhanJiResponse;
