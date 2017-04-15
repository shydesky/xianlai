var ByteBuffer=require("../ByteBuffer");
var ChangeDirectResponse=function(){
//
	this.i_d=0;

this.write=function(bodybuff)
{
	bodybuff.putShort(this.i_d);
};
this.read=function(buffer)
{
	this.i_d=buffer.readShort();
};
};
module.exports = ChangeDirectResponse;
