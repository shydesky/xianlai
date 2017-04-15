var ByteBuffer=require("../ByteBuffer");
var ServerHandPayRequest=function(){
//交易号
	this.tradeNo="";
//用户id
	this.userId="";
//水晶数量
	this.diamond=0;

this.write=function(bodybuff)
{
	bodybuff.putUTF(this.tradeNo);
	bodybuff.putUTF(this.userId);
	bodybuff.putInt(this.diamond);
};
this.read=function(buffer)
{
	this.tradeNo=buffer.readUTF();
	this.userId=buffer.readUTF();
	this.diamond=buffer.readInt();
};
this.clone=function()
{
var cloneObj={};
cloneObj.tradeNo=this.tradeNo;
cloneObj.userId=this.userId;
cloneObj.diamond=this.diamond;
cloneObj.read=this.read;
cloneObj.write=this.write;
cloneObj.clone=this.clone;
return cloneObj;
};
};
module.exports = ServerHandPayRequest;
