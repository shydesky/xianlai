var ByteBuffer=require("../ByteBuffer");
var PlayResponse=function(){
//0:,-1:
	this.state=0;
//
	this.size=0;
//
	this.code="";

this.write=function(bodybuff)
{
	bodybuff.putInt(this.state);
	bodybuff.putInt(this.size);
	bodybuff.putUTF(this.code);
};
this.read=function(buffer)
{
	this.state=buffer.readInt();
	this.size=buffer.readInt();
	this.code=buffer.readUTF();
};
this.clone=function()
{
var cloneObj={};
cloneObj.state=this.state;
cloneObj.size=this.size;
cloneObj.code=this.code;
cloneObj.read=this.read;
cloneObj.write=this.write;
cloneObj.clone=this.clone;
return cloneObj;
};
};
module.exports = PlayResponse;
