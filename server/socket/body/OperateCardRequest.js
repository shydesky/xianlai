var ByteBuffer=require("../ByteBuffer");
var OperateCardRequest=function(){
//
	this.uid="";
//
	this.roomId="";
//0:碰,1:吃,2:胡
	this.type=0;
//
	this.cardIds=[];
//
	this.flowsId=0;

this.write=function(bodybuff)
{
	bodybuff.putUTF(this.uid);
	bodybuff.putUTF(this.roomId);
	bodybuff.putInt(this.type);
	var cardIds_size=this.cardIds.length;
	bodybuff.putInt(cardIds_size);
	for(var i=0;i<cardIds_size;i++)
	{
		bodybuff.putInt(this.cardIds[i]);
	}
	bodybuff.putInt(this.flowsId);
};
this.read=function(buffer)
{
	this.uid=buffer.readUTF();
	this.roomId=buffer.readUTF();
	this.type=buffer.readInt();
	var cardIds_size=buffer.readInt();
	for(var i=0;i<cardIds_size;i++)
	{
		var x=buffer.readInt();
		this.cardIds.push(x);
	}
	this.flowsId=buffer.readInt();
};
this.clone=function()
{
var cloneObj={};
cloneObj.uid=this.uid;
cloneObj.roomId=this.roomId;
cloneObj.type=this.type;
cloneObj.cardIds=[];
	var cardIds_size=this.cardIds.length;
	for(var i=0;i<cardIds_size;i++)
	{
cloneObj.cardIds.push(this.cardIds[i]);
	}
cloneObj.flowsId=this.flowsId;
cloneObj.read=this.read;
cloneObj.write=this.write;
cloneObj.clone=this.clone;
return cloneObj;
};
};
module.exports = OperateCardRequest;
