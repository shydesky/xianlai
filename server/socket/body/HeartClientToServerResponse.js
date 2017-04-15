var ByteBuffer=require("../ByteBuffer");
var HeartClientToServerResponse=function(){
//
	this.m_id=0;

this.write=function(bodybuff)
{
	bodybuff.putShort(this.m_id);
};
this.read=function(buffer)
{
	this.m_id=buffer.readShort();
};
this.clone=function()
{
var cloneObj={};
cloneObj.m_id=this.m_id;
cloneObj.read=this.read;
cloneObj.write=this.write;
cloneObj.clone=this.clone;
return cloneObj;
};
};
module.exports = HeartClientToServerResponse;
