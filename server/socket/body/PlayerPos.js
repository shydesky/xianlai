var ByteBuffer=require("../ByteBuffer");
var PlayerPos=function(){
//
	this.name="";
//
	this.p=[];
//
	this.mapX=0;
//
	this.mapY=0;
//
	this.scl=0;
//
	this.count=0;
//
	this.skin="";
//
	this.boold=0;
//
	this.money=0;
//
	this.jiasu=0;
//
	this.lv=0;
//
	this.chouren="";
//
	this.arrowSkin="";
//
	this.dt=0;

this.write=function(bodybuff)
{
	bodybuff.putUTF(this.name);
	var p_size=this.p.length;
	bodybuff.putInt(p_size);
	for(var i=0;i<p_size;i++)
	{
		var obj=this.p[i];
		var buf=new ByteBuffer();
		buf.initBlank();
		buf.putByte(1);
		obj.write(buf);
		bodybuff.appendByteBuffer(buf);
		buf=null;
	}
	bodybuff.putFloat(this.mapX);
	bodybuff.putFloat(this.mapY);
	bodybuff.putFloat(this.scl);
	bodybuff.putShort(this.count);
	bodybuff.putUTF(this.skin);
	bodybuff.putLongType(this.boold);
	bodybuff.putLongType(this.money);
	bodybuff.putShort(this.jiasu);
	bodybuff.putInt(this.lv);
	bodybuff.putUTF(this.chouren);
	bodybuff.putUTF(this.arrowSkin);
	bodybuff.putFloat(this.dt);
};
this.read=function(buffer)
{
	this.name=buffer.readUTF();
	var p_size=buffer.readInt();
	for(var i=0;i<p_size;i++)
	{
		buffer.readByte();
var PosInfo2=require("./PosInfo2");
		var info=new PosInfo2();
		info.read(buffer);
		this.p.push(info);
	}
	this.mapX=buffer.readFloat();
	this.mapY=buffer.readFloat();
	this.scl=buffer.readFloat();
	this.count=buffer.readShort();
	this.skin=buffer.readUTF();
	this.boold=buffer.readLongType();
	this.money=buffer.readLongType();
	this.jiasu=buffer.readShort();
	this.lv=buffer.readInt();
	this.chouren=buffer.readUTF();
	this.arrowSkin=buffer.readUTF();
	this.dt=buffer.readFloat();
};
this.clone=function()
{
var cloneObj={};
cloneObj.name=this.name;
cloneObj.p=[];
	var p_size=this.p.length;
	for(var i=0;i<p_size;i++)
	{
		var obj=this.p[i];
cloneObj.p.push(obj.clone());
	}
cloneObj.mapX=this.mapX;
cloneObj.mapY=this.mapY;
cloneObj.scl=this.scl;
cloneObj.count=this.count;
cloneObj.skin=this.skin;
cloneObj.boold=this.boold;
cloneObj.money=this.money;
cloneObj.jiasu=this.jiasu;
cloneObj.lv=this.lv;
cloneObj.chouren=this.chouren;
cloneObj.arrowSkin=this.arrowSkin;
cloneObj.dt=this.dt;
cloneObj.read=this.read;
cloneObj.write=this.write;
return cloneObj;
};
};
module.exports = PlayerPos;
