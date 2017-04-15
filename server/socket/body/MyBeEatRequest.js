var ByteBuffer=require("../ByteBuffer");
var MyBeEatRequest=function(){
//
	this.attackerID="";
//
	this.attackerName="";

this.write=function(bodybuff)
{
	bodybuff.putUTF(this.attackerID);
	bodybuff.putUTF(this.attackerName);
};
this.read=function(buffer)
{
	this.attackerID=buffer.readUTF();
	this.attackerName=buffer.readUTF();
};
this.clone=function()
{
var cloneObj={};
cloneObj.attackerID=this.attackerID;
cloneObj.attackerName=this.attackerName;
cloneObj.read=this.read;
cloneObj.write=this.write;
return cloneObj;
};
};
module.exports = MyBeEatRequest;
