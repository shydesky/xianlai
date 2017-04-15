var ByteBuffer=require("../ByteBuffer");
var PlayerInAreaNotify=function(){
//
	this.playerNames=[];

this.write=function(bodybuff)
{
	var playerNames_size=this.playerNames.length;
	bodybuff.putInt(playerNames_size);
	for(var i=0;i<playerNames_size;i++)
	{
		bodybuff.putUTF(this.playerNames[i]);
	}
};
this.read=function(buffer)
{
	var playerNames_size=buffer.readInt();
	for(var i=0;i<playerNames_size;i++)
	{
		var x=buffer.readUTF();
		this.playerNames.push(x);
	}
};
this.clone=function()
{
var cloneObj={};
cloneObj.playerNames=[];
	var playerNames_size=this.playerNames.length;
	for(var i=0;i<playerNames_size;i++)
	{
cloneObj.playerNames.push(this.playerNames[i]);
	}
cloneObj.read=this.read;
cloneObj.write=this.write;
return cloneObj;
};
};
module.exports = PlayerInAreaNotify;
