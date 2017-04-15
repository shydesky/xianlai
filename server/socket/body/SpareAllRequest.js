var ByteBuffer=require("../ByteBuffer");
var SpareAllRequest=function(){
//
	this.number=0;

this.write=function(bodybuff)
{
	bodybuff.putInt(this.number);
};
this.read=function(buffer)
{
	this.number=buffer.readInt();
};
this.clone=function()
{
var cloneObj={};
cloneObj.number=this.number;
cloneObj.read=this.read;
cloneObj.write=this.write;
return cloneObj;
};
};
module.exports = SpareAllRequest;
