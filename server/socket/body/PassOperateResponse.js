var ByteBuffer=require("../ByteBuffer");
var PassOperateResponse=function(){
//0:成功,-1:失败
	this.state=0;
//
	this.uid="";

this.write=function(bodybuff)
{
	bodybuff.putInt(this.state);
	bodybuff.putUTF(this.uid);
};
this.read=function(buffer)
{
	this.state=buffer.readInt();
	this.uid=buffer.readUTF();
};
this.clone=function()
{
var cloneObj={};
cloneObj.state=this.state;
cloneObj.uid=this.uid;
cloneObj.read=this.read;
cloneObj.write=this.write;
cloneObj.clone=this.clone;
return cloneObj;
};
};
module.exports = PassOperateResponse;
