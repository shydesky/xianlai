var ByteBuffer=require("../ByteBuffer");
var ShellNotify=function(){
//
	this.shellInfo=[];

this.write=function(bodybuff)
{
	var shellInfo_size=this.shellInfo.length;
	bodybuff.putInt(shellInfo_size);
	for(var i=0;i<shellInfo_size;i++)
	{
		var obj=this.shellInfo[i];
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
	var shellInfo_size=buffer.readInt();
	for(var i=0;i<shellInfo_size;i++)
	{
		buffer.readByte();
var ShellInfo=require("./ShellInfo");
		var info=new ShellInfo();
		info.read(buffer);
		this.shellInfo.push(info);
	}
};
this.clone=function()
{
var cloneObj={};
cloneObj.shellInfo=[];
	var shellInfo_size=this.shellInfo.length;
	for(var i=0;i<shellInfo_size;i++)
	{
		var obj=this.shellInfo[i];
cloneObj.shellInfo.push(obj.clone());
	}
cloneObj.read=this.read;
cloneObj.write=this.write;
return cloneObj;
};
};
module.exports = ShellNotify;
