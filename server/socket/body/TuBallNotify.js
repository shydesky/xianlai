var ByteBuffer=require("../ByteBuffer");
var TuBallNotify=function(){
//
	this.balls=[];

this.write=function(bodybuff)
{
	var balls_size=this.balls.length;
	bodybuff.putInt(balls_size);
	for(var i=0;i<balls_size;i++)
	{
		var obj=this.balls[i];
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
	var balls_size=buffer.readInt();
	for(var i=0;i<balls_size;i++)
	{
		buffer.readByte();
var TuBall=require("./TuBall");
		var info=new TuBall();
		info.read(buffer);
		this.balls.push(info);
	}
};
this.clone=function()
{
var cloneObj={};
cloneObj.balls=[];
	var balls_size=this.balls.length;
	for(var i=0;i<balls_size;i++)
	{
		var obj=this.balls[i];
cloneObj.balls.push(obj.clone());
	}
cloneObj.read=this.read;
cloneObj.write=this.write;
return cloneObj;
};
};
module.exports = TuBallNotify;
