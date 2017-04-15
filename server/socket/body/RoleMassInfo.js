var ByteBuffer=require("../ByteBuffer");
var RoleMassInfo=function(){
//mass
	this.name="";
//mass
	this.boold=0;
//分身
	this.spares=[];

this.write=function(bodybuff)
{
	bodybuff.putUTF(this.name);
	bodybuff.putLongType(this.boold);
	var spares_size=this.spares.length;
	bodybuff.putInt(spares_size);
	for(var i=0;i<spares_size;i++)
	{
		var obj=this.spares[i];
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
	this.name=buffer.readUTF();
	this.boold=buffer.readLongType();
	var spares_size=buffer.readInt();
	for(var i=0;i<spares_size;i++)
	{
		buffer.readByte();
var RoleSpareMassInfo=require("./RoleSpareMassInfo");
		var info=new RoleSpareMassInfo();
		info.read(buffer);
		this.spares.push(info);
	}
};
this.clone=function()
{
var cloneObj={};
cloneObj.name=this.name;
cloneObj.boold=this.boold;
cloneObj.spares=[];
	var spares_size=this.spares.length;
	for(var i=0;i<spares_size;i++)
	{
		var obj=this.spares[i];
cloneObj.spares.push(obj.clone());
	}
cloneObj.read=this.read;
cloneObj.write=this.write;
return cloneObj;
};
};
module.exports = RoleMassInfo;
