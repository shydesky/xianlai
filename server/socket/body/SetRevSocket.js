var ByteBuffer=require("../ByteBuffer");
var SetRevSocket=function(){
//0:发送,1:接受
	this.type=0;
//
	this.name="";

this.write=function(bodybuff)
{
	bodybuff.putInt(this.type);
	bodybuff.putUTF(this.name);
};
this.read=function(buffer)
{
	this.type=buffer.readInt();
	this.name=buffer.readUTF();
};
this.clone=function()
{
var cloneObj={};
cloneObj.type=this.type;
cloneObj.name=this.name;
cloneObj.read=this.read;
cloneObj.write=this.write;
return cloneObj;
};
};
module.exports = SetRevSocket;
