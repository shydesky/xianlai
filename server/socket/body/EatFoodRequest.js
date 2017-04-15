var ByteBuffer=require("../ByteBuffer");
var EatFoodRequest=function(){
//
	this.foodId="";
//哪个分身吃的食物
	this.roleNumber=0;

this.write=function(bodybuff)
{
	bodybuff.putUTF(this.foodId);
	bodybuff.putInt(this.roleNumber);
};
this.read=function(buffer)
{
	this.foodId=buffer.readUTF();
	this.roleNumber=buffer.readInt();
};
this.clone=function()
{
var cloneObj={};
cloneObj.foodId=this.foodId;
cloneObj.roleNumber=this.roleNumber;
cloneObj.read=this.read;
cloneObj.write=this.write;
return cloneObj;
};
};
module.exports = EatFoodRequest;
