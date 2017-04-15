var ByteBuffer=require("../ByteBuffer");
var GetInfoRequest=function(){
//0:公告
	this.type=0;

this.write=function(bodybuff)
{
	bodybuff.putInt(this.type);
};
this.read=function(buffer)
{
	this.type=buffer.readInt();
};
this.clone=function()
{
var cloneObj={};
cloneObj.type=this.type;
cloneObj.read=this.read;
cloneObj.write=this.write;
cloneObj.clone=this.clone;
return cloneObj;
};
};
module.exports = GetInfoRequest;
