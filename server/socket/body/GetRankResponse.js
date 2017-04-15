var ByteBuffer=require("../ByteBuffer");
var GetRankResponse=function(){
//
	this.ranks=[];

this.write=function(bodybuff)
{
	var ranks_size=this.ranks.length;
	bodybuff.putInt(ranks_size);
	for(var i=0;i<ranks_size;i++)
	{
		var obj=this.ranks[i];
		var buf=new ByteBuffer();
		buf.initBlank();
		buf.putByte(1);
		obj.write(buf);
		bodybuff.appendByteBuffer(buf);
		buf=null;
	}
};
this.read=function(buffer)
{
	var ranks_size=buffer.readInt();
	for(var i=0;i<ranks_size;i++)
	{
		buffer.readByte();
var Rank=require("./Rank");
		var info=new Rank();
		info.read(buffer);
		this.ranks.push(info);
	}
};
this.clone=function()
{
var cloneObj={};
cloneObj.ranks=[];
	var ranks_size=this.ranks.length;
	for(var i=0;i<ranks_size;i++)
	{
		var obj=this.ranks[i];
cloneObj.ranks.push(obj.clone());
	}
cloneObj.read=this.read;
cloneObj.write=this.write;
cloneObj.clone=this.clone;
return cloneObj;
};
};
module.exports = GetRankResponse;
