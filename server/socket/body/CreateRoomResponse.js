var ByteBuffer=require("../ByteBuffer");
var CreateRoomResponse=function(){
//0:成功,-1:失败
	this.state=0;
//
	this.txt="";

this.write=function(bodybuff)
{
	bodybuff.putInt(this.state);
	bodybuff.putUTF(this.txt);
};
this.read=function(buffer)
{
	this.state=buffer.readInt();
	this.txt=buffer.readUTF();
};
this.clone=function()
{
var cloneObj={};
cloneObj.state=this.state;
cloneObj.txt=this.txt;
cloneObj.read=this.read;
cloneObj.write=this.write;
cloneObj.clone=this.clone;
return cloneObj;
};
};
module.exports = CreateRoomResponse;
