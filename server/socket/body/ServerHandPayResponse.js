var ByteBuffer=require("../ByteBuffer");
var ServerHandPayResponse=function(){
//交易号
	this.tradeNo="";

this.write=function(bodybuff)
{
	bodybuff.putUTF(this.tradeNo);
};
this.read=function(buffer)
{
	this.tradeNo=buffer.readUTF();
};
this.clone=function()
{
var cloneObj={};
cloneObj.tradeNo=this.tradeNo;
cloneObj.read=this.read;
cloneObj.write=this.write;
cloneObj.clone=this.clone;
return cloneObj;
};
};
module.exports = ServerHandPayResponse;
