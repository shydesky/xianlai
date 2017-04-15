var ByteBuffer=require("../ByteBuffer");
var PlayEffectRequest=function(){
//
	this.fromUid="";
//
	this.toUid="";
//
	this.roomId="";
//1:炸弹,2:钻石,3:鲜花,4:鸡蛋
	this.type=0;

this.write=function(bodybuff)
{
	bodybuff.putUTF(this.fromUid);
	bodybuff.putUTF(this.toUid);
	bodybuff.putUTF(this.roomId);
	bodybuff.putInt(this.type);
};
this.read=function(buffer)
{
	this.fromUid=buffer.readUTF();
	this.toUid=buffer.readUTF();
	this.roomId=buffer.readUTF();
	this.type=buffer.readInt();
};
this.clone=function()
{
var cloneObj={};
cloneObj.fromUid=this.fromUid;
cloneObj.toUid=this.toUid;
cloneObj.roomId=this.roomId;
cloneObj.type=this.type;
cloneObj.read=this.read;
cloneObj.write=this.write;
cloneObj.clone=this.clone;
return cloneObj;
};
};
module.exports = PlayEffectRequest;
