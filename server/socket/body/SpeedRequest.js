var ByteBuffer=require("../ByteBuffer");
var SpeedRequest=function(){
//
	this.money=0;

this.write=function(bodybuff)
{
	bodybuff.putInt(this.money);
};
this.read=function(buffer)
{
	this.money=buffer.readInt();
};
this.clone=function()
{
var cloneObj={};
cloneObj.money=this.money;
cloneObj.read=this.read;
cloneObj.write=this.write;
return cloneObj;
};
};
module.exports = SpeedRequest;
