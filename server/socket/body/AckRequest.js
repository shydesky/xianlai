var ByteBuffer=require("../ByteBuffer");
var AckRequest=function(){
//0
	this.flows_id=0;
//0:发牌,1:提,2:跑,3:可吃,4:吃,5:可胡，6:胡，7:可碰,8:碰,9:等待出牌,10:出牌,11:隐藏选择按钮,12:取消超时等待
	this.type=0;
//
	this.uid="";
//
	this.roomId="";

this.write=function(bodybuff)
{
	bodybuff.putInt(this.flows_id);
	bodybuff.putInt(this.type);
	bodybuff.putUTF(this.uid);
	bodybuff.putUTF(this.roomId);
};
this.read=function(buffer)
{
	this.flows_id=buffer.readInt();
	this.type=buffer.readInt();
	this.uid=buffer.readUTF();
	this.roomId=buffer.readUTF();
};
this.clone=function()
{
var cloneObj={};
cloneObj.flows_id=this.flows_id;
cloneObj.type=this.type;
cloneObj.uid=this.uid;
cloneObj.roomId=this.roomId;
cloneObj.read=this.read;
cloneObj.write=this.write;
cloneObj.clone=this.clone;
return cloneObj;
};
};
module.exports = AckRequest;
