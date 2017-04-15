var ByteBuffer=require("../ByteBuffer");
var PlayBackFinishInfoNotify=function(){
//
	this.infos=[];

this.write=function(bodybuff)
{
	var infos_size=this.infos.length;
	bodybuff.putInt(infos_size);
	for(var i=0;i<infos_size;i++)
	{
		var obj=this.infos[i];
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
	var infos_size=buffer.readInt();
	for(var i=0;i<infos_size;i++)
	{
		buffer.readByte();
var PlayBackFinisheGameInfo=require("./PlayBackFinisheGameInfo");
		var info=new PlayBackFinisheGameInfo();
		info.read(buffer);
		this.infos.push(info);
	}
};
this.clone=function()
{
var cloneObj={};
cloneObj.infos=[];
	var infos_size=this.infos.length;
	for(var i=0;i<infos_size;i++)
	{
		var obj=this.infos[i];
cloneObj.infos.push(obj.clone());
	}
cloneObj.read=this.read;
cloneObj.write=this.write;
cloneObj.clone=this.clone;
return cloneObj;
};
};
module.exports = PlayBackFinishInfoNotify;
