var ByteBuffer=require("../ByteBuffer");
var HeartServerToClientResponse=function(){
//
	this.m_id=0;
//
	this.data="";

this.write=function(bodybuff)
{
	bodybuff.putShort(this.m_id);
	bodybuff.putUTF(this.data);
};
this.read=function(buffer)
{
	this.m_id=buffer.readShort();
	this.data=buffer.readUTF();
};
this.clone=function()
{
var cloneObj={};
cloneObj.m_id=this.m_id;
cloneObj.data=this.data;
cloneObj.read=this.read;
cloneObj.write=this.write;
cloneObj.clone=this.clone;
return cloneObj;
};
};
module.exports = HeartServerToClientResponse;
