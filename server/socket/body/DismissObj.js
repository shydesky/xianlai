var ByteBuffer=require("../ByteBuffer");
var DismissObj=function(){
//
	this.uid="";
//0:等待选择,1:同意,2:拒绝
	this.state=0;
//0:选择者，1:发起者
	this.type=0;

this.write=function(bodybuff)
{
	bodybuff.putUTF(this.uid);
	bodybuff.putInt(this.state);
	bodybuff.putInt(this.type);
};
this.read=function(buffer)
{
	this.uid=buffer.readUTF();
	this.state=buffer.readInt();
	this.type=buffer.readInt();
};
this.clone=function()
{
var cloneObj={};
cloneObj.uid=this.uid;
cloneObj.state=this.state;
cloneObj.type=this.type;
cloneObj.read=this.read;
cloneObj.write=this.write;
cloneObj.clone=this.clone;
return cloneObj;
};
};
module.exports = DismissObj;
