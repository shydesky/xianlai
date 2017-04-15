var ByteBuffer=require("../ByteBuffer");
var Action=function(){
//0:发牌,1:提,2:跑,3:可吃,4:吃,5:可胡，6:胡，7:可碰,8:碰,9:等待出牌,10:出牌,11:隐藏选择按钮,12:取消超时等待
	this.type=0;
//
	this.groupCards=[];
//0:非反馈动作,1:需要反馈动作
	this.ack=0;
//0:,1:天胡,2:地胡,3:自摸胡,4:脱庄,5:闲加分,6:,7:无胡,8:3拢4坎,9:黑摆
	this.type2=0;
//6:朱胡。7:红胡,8:乌胡
	this.type3=[];

this.write=function(bodybuff)
{
	bodybuff.putInt(this.type);
	var groupCards_size=this.groupCards.length;
	bodybuff.putInt(groupCards_size);
	for(var i=0;i<groupCards_size;i++)
	{
		var obj=this.groupCards[i];
		var buf=new ByteBuffer();
		buf.initBlank();
		buf.putByte(1);
		obj.write(buf);
		bodybuff.appendByteBuffer(buf);
		buf=null;
	}
	bodybuff.putInt(this.ack);
	bodybuff.putInt(this.type2);
	var type3_size=this.type3.length;
	bodybuff.putInt(type3_size);
	for(var i=0;i<type3_size;i++)
	{
		bodybuff.putInt(this.type3[i]);
	}
};
this.read=function(buffer)
{
	this.type=buffer.readInt();
	var groupCards_size=buffer.readInt();
	for(var i=0;i<groupCards_size;i++)
	{
		buffer.readByte();
var GroupCard=require("./GroupCard");
		var info=new GroupCard();
		info.read(buffer);
		this.groupCards.push(info);
	}
	this.ack=buffer.readInt();
	this.type2=buffer.readInt();
	var type3_size=buffer.readInt();
	for(var i=0;i<type3_size;i++)
	{
		var x=buffer.readInt();
		this.type3.push(x);
	}
};
this.clone=function()
{
var cloneObj={};
cloneObj.type=this.type;
cloneObj.groupCards=[];
	var groupCards_size=this.groupCards.length;
	for(var i=0;i<groupCards_size;i++)
	{
		var obj=this.groupCards[i];
cloneObj.groupCards.push(obj.clone());
	}
cloneObj.ack=this.ack;
cloneObj.type2=this.type2;
cloneObj.type3=[];
	var type3_size=this.type3.length;
	for(var i=0;i<type3_size;i++)
	{
cloneObj.type3.push(this.type3[i]);
	}
cloneObj.read=this.read;
cloneObj.write=this.write;
cloneObj.clone=this.clone;
return cloneObj;
};
};
module.exports = Action;
