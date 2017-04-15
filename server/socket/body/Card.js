var ByteBuffer=require("../ByteBuffer");
var Card=function(){
//0:大写,1:小写
	this.type=0;
//
	this.value=0;
//
	this.c_id=0;
//0:正面,1:反面
	this.isBack=0;
//0:普通,1:开局发到的牌
	this.flg=0;
//0:不是,1:最后胡的牌
	this.flg2=0;
//0:,1:摸得牌,2:打出的牌
	this.flg3=0;

this.write=function(bodybuff)
{
	bodybuff.putInt(this.type);
	bodybuff.putInt(this.value);
	bodybuff.putInt(this.c_id);
	bodybuff.putInt(this.isBack);
	bodybuff.putInt(this.flg);
	bodybuff.putInt(this.flg2);
	bodybuff.putInt(this.flg3);
};
this.read=function(buffer)
{
	this.type=buffer.readInt();
	this.value=buffer.readInt();
	this.c_id=buffer.readInt();
	this.isBack=buffer.readInt();
	this.flg=buffer.readInt();
	this.flg2=buffer.readInt();
	this.flg3=buffer.readInt();
};
this.clone=function()
{
var cloneObj={};
cloneObj.type=this.type;
cloneObj.value=this.value;
cloneObj.c_id=this.c_id;
cloneObj.isBack=this.isBack;
cloneObj.flg=this.flg;
cloneObj.flg2=this.flg2;
cloneObj.flg3=this.flg3;
cloneObj.read=this.read;
cloneObj.write=this.write;
cloneObj.clone=this.clone;
return cloneObj;
};
};
module.exports = Card;
