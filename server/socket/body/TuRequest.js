var ByteBuffer=require("../ByteBuffer");
var TuRequest=function(){
//
	this.date="";

this.write=function(bodybuff)
{
	bodybuff.putUTF(this.date);
};
this.read=function(buffer)
{
	this.date=buffer.readUTF();
};
this.clone=function()
{
var cloneObj={};
cloneObj.date=this.date;
cloneObj.read=this.read;
cloneObj.write=this.write;
return cloneObj;
};
};
module.exports = TuRequest;
