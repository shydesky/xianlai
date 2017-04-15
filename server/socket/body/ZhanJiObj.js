var ByteBuffer=require("../ByteBuffer");
var ZhanJiObj=function(){
//
	this.uid="";
//
	this.name="";
//
	this.zonghuxi=0;
//
	this.dunshu=0;
//
	this.dunshu2=0;
//
	this.huxi=0;

this.write=function(bodybuff)
{
	bodybuff.putUTF(this.uid);
	bodybuff.putUTF(this.name);
	bodybuff.putInt(this.zonghuxi);
	bodybuff.putInt(this.dunshu);
	bodybuff.putInt(this.dunshu2);
	bodybuff.putInt(this.huxi);
};
this.read=function(buffer)
{
	this.uid=buffer.readUTF();
	this.name=buffer.readUTF();
	this.zonghuxi=buffer.readInt();
	this.dunshu=buffer.readInt();
	this.dunshu2=buffer.readInt();
	this.huxi=buffer.readInt();
};
this.clone=function()
{
var cloneObj={};
cloneObj.uid=this.uid;
cloneObj.name=this.name;
cloneObj.zonghuxi=this.zonghuxi;
cloneObj.dunshu=this.dunshu;
cloneObj.dunshu2=this.dunshu2;
cloneObj.huxi=this.huxi;
cloneObj.read=this.read;
cloneObj.write=this.write;
cloneObj.clone=this.clone;
return cloneObj;
};
};
module.exports = ZhanJiObj;
