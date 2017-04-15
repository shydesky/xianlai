var ByteBuffer=require("../ByteBuffer");
var FlowsAckRequest=function(){
//0
	this.flows_id=0;
//
	this.uid="";
//
	this.roomId="";

this.write=function(bodybuff)
{
	bodybuff.putInt(this.flows_id);
	bodybuff.putUTF(this.uid);
	bodybuff.putUTF(this.roomId);
};
this.read=function(buffer)
{
	this.flows_id=buffer.readInt();
	this.uid=buffer.readUTF();
	this.roomId=buffer.readUTF();
};
this.clone=function()
{
var cloneObj={};
cloneObj.flows_id=this.flows_id;
cloneObj.uid=this.uid;
cloneObj.roomId=this.roomId;
cloneObj.read=this.read;
cloneObj.write=this.write;
cloneObj.clone=this.clone;
return cloneObj;
};
};
module.exports = FlowsAckRequest;
