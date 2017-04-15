var ByteBuffer=require("../ByteBuffer");
var PlayerCards=function(){
//
	this.roleType=0;
//
	this.uid="";
//
	this.cards1=[];
//
	this.cards2=[];
//
	this.cards3=[];

this.write=function(bodybuff)
{
	bodybuff.putInt(this.roleType);
	bodybuff.putUTF(this.uid);
	var cards1_size=this.cards1.length;
	bodybuff.putInt(cards1_size);
	for(var i=0;i<cards1_size;i++)
	{
		var obj=this.cards1[i];
		var buf=new ByteBuffer();
		buf.initBlank();
		buf.putByte(1);
		obj.write(buf);
		bodybuff.appendByteBuffer(buf);
		buf=null;
	}
	var cards2_size=this.cards2.length;
	bodybuff.putInt(cards2_size);
	for(var i=0;i<cards2_size;i++)
	{
		var obj=this.cards2[i];
		var buf=new ByteBuffer();
		buf.initBlank();
		buf.putByte(1);
		obj.write(buf);
		bodybuff.appendByteBuffer(buf);
		buf=null;
	}
	var cards3_size=this.cards3.length;
	bodybuff.putInt(cards3_size);
	for(var i=0;i<cards3_size;i++)
	{
		var obj=this.cards3[i];
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
	this.roleType=buffer.readInt();
	this.uid=buffer.readUTF();
	var cards1_size=buffer.readInt();
	for(var i=0;i<cards1_size;i++)
	{
		buffer.readByte();
var Card=require("./Card");
		var info=new Card();
		info.read(buffer);
		this.cards1.push(info);
	}
	var cards2_size=buffer.readInt();
	for(var i=0;i<cards2_size;i++)
	{
		buffer.readByte();
var GroupCard=require("./GroupCard");
		var info=new GroupCard();
		info.read(buffer);
		this.cards2.push(info);
	}
	var cards3_size=buffer.readInt();
	for(var i=0;i<cards3_size;i++)
	{
		buffer.readByte();
var Card=require("./Card");
		var info=new Card();
		info.read(buffer);
		this.cards3.push(info);
	}
};
this.clone=function()
{
var cloneObj={};
cloneObj.roleType=this.roleType;
cloneObj.uid=this.uid;
cloneObj.cards1=[];
	var cards1_size=this.cards1.length;
	for(var i=0;i<cards1_size;i++)
	{
		var obj=this.cards1[i];
cloneObj.cards1.push(obj.clone());
	}
cloneObj.cards2=[];
	var cards2_size=this.cards2.length;
	for(var i=0;i<cards2_size;i++)
	{
		var obj=this.cards2[i];
cloneObj.cards2.push(obj.clone());
	}
cloneObj.cards3=[];
	var cards3_size=this.cards3.length;
	for(var i=0;i<cards3_size;i++)
	{
		var obj=this.cards3[i];
cloneObj.cards3.push(obj.clone());
	}
cloneObj.read=this.read;
cloneObj.write=this.write;
cloneObj.clone=this.clone;
return cloneObj;
};
};
module.exports = PlayerCards;
