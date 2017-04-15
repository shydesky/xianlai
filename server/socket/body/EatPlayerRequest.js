var ByteBuffer=require("../ByteBuffer");
var EatPlayerRequest=function(){
//
	this.number1=0;
//
	this.deadUid="";
//
	this.myNumber=0;

this.write=function(bodybuff)
{
	bodybuff.putInt(this.number1);
	bodybuff.putUTF(this.deadUid);
	bodybuff.putInt(this.myNumber);
};
this.read=function(buffer)
{
	this.number1=buffer.readInt();
	this.deadUid=buffer.readUTF();
	this.myNumber=buffer.readInt();
};
this.clone=function()
{
var cloneObj={};
cloneObj.number1=this.number1;
cloneObj.deadUid=this.deadUid;
cloneObj.myNumber=this.myNumber;
cloneObj.read=this.read;
cloneObj.write=this.write;
return cloneObj;
};
};
module.exports = EatPlayerRequest;
