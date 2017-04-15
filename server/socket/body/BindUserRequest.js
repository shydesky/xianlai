var ByteBuffer=require("../ByteBuffer");
var BindUserRequest=function(){
//
	this.uid="";
//
	this.bindUid="";

this.write=function(bodybuff)
{
	bodybuff.putUTF(this.uid);
	bodybuff.putUTF(this.bindUid);
};
this.read=function(buffer)
{
	this.uid=buffer.readUTF();
	this.bindUid=buffer.readUTF();
};
this.clone=function()
{
var cloneObj={};
cloneObj.uid=this.uid;
cloneObj.bindUid=this.bindUid;
cloneObj.read=this.read;
cloneObj.write=this.write;
cloneObj.clone=this.clone;
return cloneObj;
};
};
module.exports = BindUserRequest;
