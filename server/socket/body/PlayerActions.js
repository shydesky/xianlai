var ByteBuffer=require("../ByteBuffer");
var PlayerActions=function(){
//
	this.actions=[];
//
	this.name="";
//
	this.scl=0;
//
	this.score=0;

this.write=function(bodybuff)
{
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
	bodybuff.putUTF(this.name);
	bodybuff.putFloat(this.scl);
	bodybuff.putInt(this.score);
};
this.read=function(buffer)
{
	var actions_size=buffer.readInt();
	for(var i=0;i<actions_size;i++)
	{
		buffer.readByte();
var Action=require("./Action");
		var info=new Action();
		info.read(buffer);
		this.actions.push(info);
	}
	this.name=buffer.readUTF();
	this.scl=buffer.readFloat();
	this.score=buffer.readInt();
};
this.clone=function()
{
var cloneObj={};
cloneObj.actions=[];
	var actions_size=this.actions.length;
	for(var i=0;i<actions_size;i++)
	{
		var obj=this.actions[i];
cloneObj.actions.push(obj.clone());
	}
cloneObj.name=this.name;
cloneObj.scl=this.scl;
cloneObj.score=this.score;
cloneObj.read=this.read;
cloneObj.write=this.write;
return cloneObj;
};
};
module.exports = PlayerActions;
