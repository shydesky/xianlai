var ByteBuffer=require("../ByteBuffer");
var EnterSceneRequest=function(){
//
	this.name="";
//
	this.uid="";
//
	this.ip="";
//
	this.gps="";

this.write=function(bodybuff)
{
	bodybuff.putUTF(this.name);
	bodybuff.putUTF(this.uid);
	bodybuff.putUTF(this.ip);
	bodybuff.putUTF(this.gps);
};
this.read=function(buffer)
{
	this.name=buffer.readUTF();
	this.uid=buffer.readUTF();
	this.ip=buffer.readUTF();
	this.gps=buffer.readUTF();
};
this.clone=function()
{
var cloneObj={};
cloneObj.name=this.name;
cloneObj.uid=this.uid;
cloneObj.ip=this.ip;
cloneObj.gps=this.gps;
cloneObj.read=this.read;
cloneObj.write=this.write;
cloneObj.clone=this.clone;
return cloneObj;
};
};
module.exports = EnterSceneRequest;
