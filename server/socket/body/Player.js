var ByteBuffer=require("../ByteBuffer");
var Player=function(){
//
	this.uid="";
//
	this.name="";
//
	this.gold=0;
//
	this.diamond=0;
//总胡息
	this.score1=0;
//当前局的胡
	this.score2=0;
//手中胡
	this.shouZhongScore=0;
//
	this.headIcon="";
//0:,1:庄,2:闲
	this.roleType=0;
//顺序
	this.index=0;
//
	this.actions=[];
//0:无,1:开明胶
	this.state=0;

this.write=function(bodybuff)
{
	bodybuff.putUTF(this.uid);
	bodybuff.putUTF(this.name);
	bodybuff.putInt(this.gold);
	bodybuff.putInt(this.diamond);
	bodybuff.putInt(this.score1);
	bodybuff.putInt(this.score2);
	bodybuff.putInt(this.shouZhongScore);
	bodybuff.putUTF(this.headIcon);
	bodybuff.putInt(this.roleType);
	bodybuff.putInt(this.index);
	var actions_size=this.actions.length;
	bodybuff.putInt(actions_size);
	for(var i=0;i<actions_size;i++)
	{
		var obj=this.actions[i];
		var buf=new ByteBuffer();
		buf.initBlank();
		buf.putByte(1);
		obj.write(buf);
		bodybuff.appendByteBuffer(buf);
		buf=null;
	}
	bodybuff.putInt(this.state);
};
this.read=function(buffer)
{
	this.uid=buffer.readUTF();
	this.name=buffer.readUTF();
	this.gold=buffer.readInt();
	this.diamond=buffer.readInt();
	this.score1=buffer.readInt();
	this.score2=buffer.readInt();
	this.shouZhongScore=buffer.readInt();
	this.headIcon=buffer.readUTF();
	this.roleType=buffer.readInt();
	this.index=buffer.readInt();
	var actions_size=buffer.readInt();
	for(var i=0;i<actions_size;i++)
	{
		buffer.readByte();
var Action=require("./Action");
		var info=new Action();
		info.read(buffer);
		this.actions.push(info);
	}
	this.state=buffer.readInt();
};
this.clone=function()
{
var cloneObj={};
cloneObj.uid=this.uid;
cloneObj.name=this.name;
cloneObj.gold=this.gold;
cloneObj.diamond=this.diamond;
cloneObj.score1=this.score1;
cloneObj.score2=this.score2;
cloneObj.shouZhongScore=this.shouZhongScore;
cloneObj.headIcon=this.headIcon;
cloneObj.roleType=this.roleType;
cloneObj.index=this.index;
cloneObj.actions=[];
	var actions_size=this.actions.length;
	for(var i=0;i<actions_size;i++)
	{
		var obj=this.actions[i];
cloneObj.actions.push(obj.clone());
	}
cloneObj.state=this.state;
cloneObj.read=this.read;
cloneObj.write=this.write;
cloneObj.clone=this.clone;
return cloneObj;
};
};
module.exports = Player;
