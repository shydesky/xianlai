var ByteBuffer=require("../ByteBuffer");
var PlayerPosUpdate=function(){
//
	this.posArray=[];

this.write=function(bodybuff)
{
	var posArray_size=this.posArray.length;
	bodybuff.putInt(posArray_size);
	for(var i=0;i<posArray_size;i++)
	{
		var obj=this.posArray[i];
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
	var posArray_size=buffer.readInt();
	for(var i=0;i<posArray_size;i++)
	{
		buffer.readByte();
var PosInfo=require("./PosInfo");
		var info=new PosInfo();
		info.read(buffer);
		this.posArray.push(info);
	}
};
this.clone=function()
{
var cloneObj={};
cloneObj.posArray=[];
	var posArray_size=this.posArray.length;
	for(var i=0;i<posArray_size;i++)
	{
		var obj=this.posArray[i];
cloneObj.posArray.push(obj.clone());
	}
cloneObj.read=this.read;
cloneObj.write=this.write;
return cloneObj;
};
};
module.exports = PlayerPosUpdate;
