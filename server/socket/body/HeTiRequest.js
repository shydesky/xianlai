var ByteBuffer=require("../ByteBuffer");
var HeTiRequest=function(){
//
	this.number1=0;
//
	this.number2=0;

this.write=function(bodybuff)
{
	bodybuff.putInt(this.number1);
	bodybuff.putInt(this.number2);
};
this.read=function(buffer)
{
	this.number1=buffer.readInt();
	this.number2=buffer.readInt();
};
this.clone=function()
{
var cloneObj={};
cloneObj.number1=this.number1;
cloneObj.number2=this.number2;
cloneObj.read=this.read;
cloneObj.write=this.write;
return cloneObj;
};
};
module.exports = HeTiRequest;
