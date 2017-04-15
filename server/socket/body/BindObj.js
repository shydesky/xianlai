var ByteBuffer=require("../ByteBuffer");
var BindObj=function(){
//
	this.uid="";
//
	this.bindUid="";
//
	this.name="";
//
	this.bindName="";
//
	this.headUrl="";
//
	this.bindHeadUrl="";
//
	this.date="";

this.write=function(bodybuff)
{
	bodybuff.putUTF(this.uid);
	bodybuff.putUTF(this.bindUid);
	bodybuff.putUTF(this.name);
	bodybuff.putUTF(this.bindName);
	bodybuff.putUTF(this.headUrl);
	bodybuff.putUTF(this.bindHeadUrl);
	bodybuff.putUTF(this.date);
};
this.read=function(buffer)
{
	this.uid=buffer.readUTF();
	this.bindUid=buffer.readUTF();
	this.name=buffer.readUTF();
	this.bindName=buffer.readUTF();
	this.headUrl=buffer.readUTF();
	this.bindHeadUrl=buffer.readUTF();
	this.date=buffer.readUTF();
};
this.clone=function()
{
var cloneObj={};
cloneObj.uid=this.uid;
cloneObj.bindUid=this.bindUid;
cloneObj.name=this.name;
cloneObj.bindName=this.bindName;
cloneObj.headUrl=this.headUrl;
cloneObj.bindHeadUrl=this.bindHeadUrl;
cloneObj.date=this.date;
cloneObj.read=this.read;
cloneObj.write=this.write;
cloneObj.clone=this.clone;
return cloneObj;
};
};
module.exports = BindObj;
