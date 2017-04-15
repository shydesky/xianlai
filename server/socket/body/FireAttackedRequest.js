var ByteBuffer=require("../ByteBuffer");
var FireAttackedRequest=function(){
//
	this.shellId=0;
//0:炮弹吃我，1:我吃炮弹
	this.type=0;
//我的名称
	this.name="";
//
	this.number=0;

this.write=function(bodybuff)
{
	bodybuff.putInt(this.shellId);
	bodybuff.putInt(this.type);
	bodybuff.putUTF(this.name);
	bodybuff.putInt(this.number);
};
this.read=function(buffer)
{
	this.shellId=buffer.readInt();
	this.type=buffer.readInt();
	this.name=buffer.readUTF();
	this.number=buffer.readInt();
};
this.clone=function()
{
var cloneObj={};
cloneObj.shellId=this.shellId;
cloneObj.type=this.type;
cloneObj.name=this.name;
cloneObj.number=this.number;
cloneObj.read=this.read;
cloneObj.write=this.write;
return cloneObj;
};
};
module.exports = FireAttackedRequest;
