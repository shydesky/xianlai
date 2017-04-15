var ByteBuffer=require("../ByteBuffer");
var FinishUserInfo=function(){
//
	this.uid="";
//0:,1:庄家,2:闲
	this.roleType=0;
//0:否,1:是
	this.isHuPai=0;
//
	this.huxi=0;
//
	this.dunshu=0;
//
	this.zonghuxi=0;
//结算得分
	this.score=0;
//
	this.yuanbao=0;
//
	this.cards1=[];
//
	this.cards2=[];
//
	this.cards3=[];
//0:否,1:是
	this.isFangPao=0;
//胡息墩数
	this.dunshu2=0;

this.write=function(bodybuff)
{
	bodybuff.putUTF(this.uid);
	bodybuff.putInt(this.roleType);
	bodybuff.putInt(this.isHuPai);
	bodybuff.putInt(this.huxi);
	bodybuff.putInt(this.dunshu);
	bodybuff.putInt(this.zonghuxi);
	bodybuff.putInt(this.score);
	bodybuff.putInt(this.yuanbao);
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
	bodybuff.putInt(this.isFangPao);
	bodybuff.putInt(this.dunshu2);
};
this.read=function(buffer)
{
	this.uid=buffer.readUTF();
	this.roleType=buffer.readInt();
	this.isHuPai=buffer.readInt();
	this.huxi=buffer.readInt();
	this.dunshu=buffer.readInt();
	this.zonghuxi=buffer.readInt();
	this.score=buffer.readInt();
	this.yuanbao=buffer.readInt();
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
	this.isFangPao=buffer.readInt();
	this.dunshu2=buffer.readInt();
};
this.clone=function()
{
var cloneObj={};
cloneObj.uid=this.uid;
cloneObj.roleType=this.roleType;
cloneObj.isHuPai=this.isHuPai;
cloneObj.huxi=this.huxi;
cloneObj.dunshu=this.dunshu;
cloneObj.zonghuxi=this.zonghuxi;
cloneObj.score=this.score;
cloneObj.yuanbao=this.yuanbao;
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
cloneObj.isFangPao=this.isFangPao;
cloneObj.dunshu2=this.dunshu2;
cloneObj.read=this.read;
cloneObj.write=this.write;
cloneObj.clone=this.clone;
return cloneObj;
};
};
module.exports = FinishUserInfo;
