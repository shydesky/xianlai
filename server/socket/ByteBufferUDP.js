/**
 * Created by yungu on 16/7/28.
 */

function Utf8ArrayToStr(array) {
    var out, i, len, c;
    var char2, char3;

    out = "";
    len = array.length;
    i = 0;
    while(i < len) {
        c = array[i++];
        switch(c >> 4)
        {
            case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
            // 0xxxxxxx
            out += String.fromCharCode(c);
            break;
            case 12: case 13:
            // 110x xxxx   10xx xxxx
            char2 = array[i++];
            out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
            break;
            case 14:
                // 1110 xxxx  10xx xxxx  10xx xxxx
                char2 = array[i++];
                char3 = array[i++];
                out += String.fromCharCode(((c & 0x0F) << 12) |
                    ((char2 & 0x3F) << 6) |
                    ((char3 & 0x3F) << 0));
                break;
        }
    }

    return out;
}

var ByteBufferUDP=function () {
    this.appendByteBuffer=function (byteBuf) {

        byteBuf.offset=0;
        var n=byteBuf.count;
        this.extendBuffer(n);
        for(var i=0;i<n;i++)
        {
            var a=byteBuf.readUint8();
            this.putUint8(a);
        }
    };
    this.initBlank=function()
    {
        this.buffer= new ArrayBuffer(2048);
        this.view = new DataView(this.buffer);
        this.offset=0;
        this.count=0;
        this.length=2048;
    };
    this.unuse=function()
    {
        this.offset=0;
        this.count=0;
        this.length=2048;
    };
    this.reuse=function()
    {
        this.offset=0;
        this.count=0;
        this.length=2048;
    }
    this.extendBuffer=function (n) {
        if((this.count+n)>=this.length)
        {
            if(n<200)
            {
                n=200;
            }
            var newLength=this.count+n;
            var newBuffer=new ArrayBuffer(newLength);
            var view = new Uint8Array(newBuffer);
            var oldview = new Uint8Array(this.buffer);
            for(var  i=0;i<this.count;i++)
            {
                view[i]=oldview[i];

            }
            this.buffer=view.buffer;
            this.length=newLength;
            this.view = new DataView(this.buffer);

        }
    }
    this.setMsg=function (message) {
        // function stobuf(buf) {
        //     var length = buf.length;
        //     var arrayBuf = new ArrayBuffer(length);
        //     var view = new Uint8Array(arrayBuf);
        //
        //     for (var i = 0; i < length; i++) {
        //         view[i] = buf[i];
        //     }
        //
        //     return view.buffer;
        // }
        //
        // // Discard empty messages
        // if (message.length == 0) {
        //     return;
        // }
        //
        // this.bufferstobuf(message);


        // Discard empty messages
        if (message.length == 0) {
            return;
        }


        var length = message.length;
        for (var i = 0; i < length; i++) {
            this.putUint8(message[i]);
        }
        //this.view = new DataView(this.buffer);
        this.offset=0;
    };
    this.readUint8=function () {
        var a=this.view.getUint8(this.offset);
        this.offset+=1;
        return a;
    };

    this.readInt=function () {
        var a=this.view.getInt32(this.offset,true);
        this.offset+=4;
        return a;
    };
    this.readShort=function () {
        var a=this.view.getInt16(this.offset,true);
        this.offset+=2;
        return a;
    };
    this.readByte=function () {
        var a=this.view.getInt8(this.offset);
        this.offset+=1;
        return a;
    };

    this.readInt8=function () {
        var a=this.view.getInt8(this.offset);
        this.offset+=1;
        return a;
    };

    this.readInt16=function () {
        var a=this.view.getInt16(this.offset,true);
        this.offset+=2;
        return a;
    };
    this.readInt32=function () {
        var a=this.view.getInt32(this.offset,true);
        this.offset+=4;
        return a;
    };
    this.readLongType=function () {
        return this.readInt32();
    }
    this.readUTF=function () {
        var len=this.view.getInt16(this.offset,true);
        this.offset+=2;
        var str="";

        var ab = new ArrayBuffer(len);
        var view = new Uint8Array(ab);
        for(var i=0;i<len;i++)
        {
            view[i]= this.view.getUint8(this.offset,true);
            this.offset++;
           // var charCode=strArray[i];
        }
        str=Utf8ArrayToStr(view);
       // str=String.fromCharCode.apply(String, strArray)

        console.log("字符串:"+str);

        return str;
    };


    this.readFloat32=function () {
        var a=this.view.getFloat32(this.offset,true);
        this.offset+=4;
        return a;
    };
    this.readFloat=function () {
        var a=this.view.getFloat32(this.offset,true);
        this.offset+=4;
        return a;
    };
    this.readFloat64=function () {
        var a=this.view.getFloat64(this.offset,true);
        this.offset+=8;
        return a;
    };
    this.readDouble=function () {
        var a=this.view.getFloat32(this.offset,true);
        this.offset+=4;
        return a;
    };

    this.putByte=function (a) {
        this.extendBuffer(1);
        this.view.setInt8(this.offset,a);
        this.offset+=1;
        this.count+=1;
    };

    this.putShort=function (a) {
        this.extendBuffer(2);
        this.view.setInt16(this.offset,a,true);
        this.offset+=2;
        this.count+=2;
    };
    this.putInt=function (a) {
        this.extendBuffer(4);
        this.view.setInt32(this.offset,a,true);
        this.offset+=4;
        this.count+=4;
    };

    this.putInt8=function (a) {
        this.extendBuffer(1);
        this.view.setInt8(this.offset,a);
        this.offset+=1;
        this.count+=1;
    };
    this.putInt16=function (a) {
        this.extendBuffer(2);
        this.view.setInt16(this.offset,a,true);
        this.offset+=2;
        this.count+=2;
    };
    this.putInt32=function (a) {
        this.extendBuffer(4);
        this.view.setInt32(this.offset,a,true);
        this.offset+=4;
        this.count+=4;
    };
    this.putLongType=function (a) {

        this.putInt32(a);
    };
    this.putFloat=function (a) {
        this.extendBuffer(4);
        //this.view.setFloat32(this.offset,a,true);
        var b=a*1000000;
        this.view.setInt32(this.offset,b,true);
        this.offset+=4;
        this.count+=4;
    };

    this.putFloat32=function (a) {
        this.extendBuffer(4);
        this.view.setFloat32(this.offset,a,true);
        this.offset+=4;
        this.count+=4;
    };
    this.putFloat64=function (a) {
        this.extendBuffer(8);
        this.view.setFloat64(this.offset,a,true);
        this.offset+=8;
        this.count+=8;
    };
    this.putUTF=function (a) {

        var len=a.length;
        this.putInt16(len);
        this.extendBuffer(len);
        for(var i=0;i<len;i++)
        {
            this.view.setUint16(this.offset,a.charCodeAt(i),true);
            this.offset+=2;
            this.count+=2;
        }

    };
    this.putDouble=function (a) {
        this.extendBuffer(4);
        this.view.setFloat32(this.offset,a,true);
        this.offset+=4;
        this.count+=4;
    };
    this.putUint8=function (a) {
        this.extendBuffer(1);
        this.view.setUint8(this.offset,a);
        this.offset+=1;
        this.count+=1;
    };
};


module.exports = ByteBufferUDP;