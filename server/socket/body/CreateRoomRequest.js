var ByteBuffer=require("../ByteBuffer");
var CreateRoomRequest=function(){
//
	this.uid="";
//人数
	this.renshu=0;
//0:gps,1:ip
	this.gongneng=0;
//0,1,2
	this.choushui=0;
//1:一胡一息,3:三胡一息,5:五胡一息
	this.gunze=0;
//8,10,20,100
	this.ju=0;
//
	this.qita=0;
//
	this.roomType=0;

this.write=function(bodybuff)
{
	bodybuff.putUTF(this.uid);
	bodybuff.putInt(this.renshu);
	bodybuff.putInt(this.gongneng);
	bodybuff.putInt(this.choushui);
	bodybuff.putInt(this.gunze);
	bodybuff.putInt(this.ju);
	bodybuff.putInt(this.qita);
	bodybuff.putInt(this.roomType);
};
this.read=function(buffer)
{
	this.uid=buffer.readUTF();
	this.renshu=buffer.readInt();
	this.gongneng=buffer.readInt();
	this.choushui=buffer.readInt();
	this.gunze=buffer.readInt();
	this.ju=buffer.readInt();
	this.qita=buffer.readInt();
	this.roomType=buffer.readInt();
};
this.clone=function()
{
var cloneObj={};
cloneObj.uid=this.uid;
cloneObj.renshu=this.renshu;
cloneObj.gongneng=this.gongneng;
cloneObj.choushui=this.choushui;
cloneObj.gunze=this.gunze;
cloneObj.ju=this.ju;
cloneObj.qita=this.qita;
cloneObj.roomType=this.roomType;
cloneObj.read=this.read;
cloneObj.write=this.write;
cloneObj.clone=this.clone;
return cloneObj;
};
};
module.exports = CreateRoomRequest;
