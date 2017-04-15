var ByteBuffer=require("../ByteBuffer");
var ShellEatFoodRequest=function(){
//
	this.shellId=0;

this.write=function(bodybuff)
{
	bodybuff.putInt(this.shellId);
};
this.read=function(buffer)
{
	this.shellId=buffer.readInt();
};
this.clone=function()
{
var cloneObj={};
cloneObj.shellId=this.shellId;
cloneObj.read=this.read;
cloneObj.write=this.write;
return cloneObj;
};
};
module.exports = ShellEatFoodRequest;
