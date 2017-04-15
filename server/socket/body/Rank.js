var ByteBuffer=require("../ByteBuffer");
var Rank=function(){
//
	this.uid="";
//
	this.name="";
//
	this.head="";
//
	this.value=0;
//0:在线,1:离线
	this.isOnline=0;

this.write=function(bodybuff)
{
	bodybuff.putUTF(this.uid);
	bodybuff.putUTF(this.name);
	bodybuff.putUTF(this.head);
	bodybuff.putInt(this.value);
	bodybuff.putShort(this.isOnline);
};
this.read=function(buffer)
{
	this.uid=buffer.readUTF();
	this.name=buffer.readUTF();
	this.head=buffer.readUTF();
	this.value=buffer.readInt();
	this.isOnline=buffer.readShort();
};
this.clone=function()
{
var cloneObj={};
cloneObj.uid=this.uid;
cloneObj.name=this.name;
cloneObj.head=this.head;
cloneObj.value=this.value;
cloneObj.isOnline=this.isOnline;
cloneObj.read=this.read;
cloneObj.write=this.write;
cloneObj.clone=this.clone;
return cloneObj;
};
};
module.exports = Rank;
