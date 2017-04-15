var ByteBuffer=require("../ByteBuffer");
var AckResponse=function(){
//0
	this.flows_id=0;
//0:发牌,1:提,2:跑,3:可吃,4:吃,5:可胡，6:胡，7:可碰,8:碰,9:等待出牌,10:出牌,11:隐藏选择按钮,12:取消超时等待
	this.type=0;
//0
	this.state=0;

this.write=function(bodybuff)
{
	bodybuff.putInt(this.flows_id);
	bodybuff.putInt(this.type);
	bodybuff.putInt(this.state);
};
this.read=function(buffer)
{
	this.flows_id=buffer.readInt();
	this.type=buffer.readInt();
	this.state=buffer.readInt();
};
this.clone=function()
{
var cloneObj={};
cloneObj.flows_id=this.flows_id;
cloneObj.type=this.type;
cloneObj.state=this.state;
cloneObj.read=this.read;
cloneObj.write=this.write;
cloneObj.clone=this.clone;
return cloneObj;
};
};
module.exports = AckResponse;
