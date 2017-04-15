var ByteBuffer=require("../ByteBuffer");
var ZhanJi=function(){
//
	this.time="";
//
	this.time2="";
//
	this.ju=0;
//
	this.renshu=0;
//
	this.score=0;
//
	this.code="";
//
	this.roomType=0;
//
	this.juList=[];

this.write=function(bodybuff)
{
	bodybuff.putUTF(this.time);
	bodybuff.putUTF(this.time2);
	bodybuff.putInt(this.ju);
	bodybuff.putInt(this.renshu);
	bodybuff.putInt(this.score);
	bodybuff.putUTF(this.code);
	bodybuff.putInt(this.roomType);
	var juList_size=this.juList.length;
	bodybuff.putInt(juList_size);
	for(var i=0;i<juList_size;i++)
	{
		var obj=this.juList[i];
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
	this.time=buffer.readUTF();
	this.time2=buffer.readUTF();
	this.ju=buffer.readInt();
	this.renshu=buffer.readInt();
	this.score=buffer.readInt();
	this.code=buffer.readUTF();
	this.roomType=buffer.readInt();
	var juList_size=buffer.readInt();
	for(var i=0;i<juList_size;i++)
	{
		buffer.readByte();
var ZhanjiMeiJu=require("./ZhanjiMeiJu");
		var info=new ZhanjiMeiJu();
		info.read(buffer);
		this.juList.push(info);
	}
};
this.clone=function()
{
var cloneObj={};
cloneObj.time=this.time;
cloneObj.time2=this.time2;
cloneObj.ju=this.ju;
cloneObj.renshu=this.renshu;
cloneObj.score=this.score;
cloneObj.code=this.code;
cloneObj.roomType=this.roomType;
cloneObj.juList=[];
	var juList_size=this.juList.length;
	for(var i=0;i<juList_size;i++)
	{
		var obj=this.juList[i];
cloneObj.juList.push(obj.clone());
	}
cloneObj.read=this.read;
cloneObj.write=this.write;
cloneObj.clone=this.clone;
return cloneObj;
};
};
module.exports = ZhanJi;
