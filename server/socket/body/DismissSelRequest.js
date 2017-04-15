var ByteBuffer=require("../ByteBuffer");
var DismissSelRequest=function(){
//
	this.uid="";
//
	this.roomId="";
//1:同意,2:拒绝
	this.state=0;

this.write=function(bodybuff)
{
	bodybuff.putUTF(this.uid);
	bodybuff.putUTF(this.roomId);
	bodybuff.putInt(this.state);
};
this.read=function(buffer)
{
	this.uid=buffer.readUTF();
	this.roomId=buffer.readUTF();
	this.state=buffer.readInt();
};
this.clone=function()
{
var cloneObj={};
cloneObj.uid=this.uid;
cloneObj.roomId=this.roomId;
cloneObj.state=this.state;
cloneObj.read=this.read;
cloneObj.write=this.write;
cloneObj.clone=this.clone;
return cloneObj;
};
};
module.exports = DismissSelRequest;
