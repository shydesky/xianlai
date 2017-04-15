var ByteBuffer=require("../ByteBuffer");
var FlowsNotify=function(){
//
	this.flows=[];
//消息ID
	this.flows_id=0;

this.write=function(bodybuff)
{
	var flows_size=this.flows.length;
	bodybuff.putInt(flows_size);
	for(var i=0;i<flows_size;i++)
	{
		var obj=this.flows[i];
		var buf=new ByteBuffer();
		buf.initBlank();
		buf.putByte(1);
		obj.write(buf);
		bodybuff.appendByteBuffer(buf);
		buf=null;
	}
	bodybuff.putInt(this.flows_id);
};
this.read=function(buffer)
{
	var flows_size=buffer.readInt();
	for(var i=0;i<flows_size;i++)
	{
		buffer.readByte();
var Flow=require("./Flow");
		var info=new Flow();
		info.read(buffer);
		this.flows.push(info);
	}
	this.flows_id=buffer.readInt();
};
this.clone=function()
{
var cloneObj={};
cloneObj.flows=[];
	var flows_size=this.flows.length;
	for(var i=0;i<flows_size;i++)
	{
		var obj=this.flows[i];
cloneObj.flows.push(obj.clone());
	}
cloneObj.flows_id=this.flows_id;
cloneObj.read=this.read;
cloneObj.write=this.write;
cloneObj.clone=this.clone;
return cloneObj;
};
};
module.exports = FlowsNotify;
