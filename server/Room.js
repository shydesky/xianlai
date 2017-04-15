/**
 * Created by yungu on 16/11/4.
 */

var Socket=require("./socket");
var RoomDefine=require("./RoomDefine");
var Mongo=require("./mongo");
var ByteBuffer=require("./socket/ByteBuffer");
var fs = require('fs');
var GameInfo=require('./GameInfo');

//
// var PLAYER_TYPE=0;
// var ZHUANGJIA_TYPE=1;
// var XIANJIA_TYPE=2;
//
// //比 偎 提 跑 是强制动作
// var ACTION_FAPAI=0;//发牌
// var ACTION_TI=1;//1:提
// var ACTION_PAO=2;//2:跑
// var ACTION_KECHI=3;//3:可吃
// var ACTION_CHI=4;//4:吃
// var ACTION_KEHU=5;//5:可胡
// var ACTION_HU=6;//6:胡
// var ACTION_KEPENG=7;//7:可碰
// var ACTION_PENG=8;//8:碰
// var ACTION_WAIT_PUT=9;//9:等待出牌
// var ACTION_PUT=10;//10:出牌
// var ACTION_HIDE_BUTTON=11;// 11:隐藏选择按钮
// var ACTION_CANCLE_TIMEOUT=12;// 12:取消超时等待
// var ACTION_WEI=13;// 13:偎
//
//
// var POS_3_PLAYER=3;
// var POS_4_PLAYER=4;

// var Card=function () {
//     this.c_id=0;
//     this.value=0;//1-10;
//     this.type=0;//0:大写,1:小写
//     this.flg=0;//0:普通,1:庄家最后一张牌
// }

Date.prototype.Format = function (fmt) { //author: meizz
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

var RoomUser=function () {
    this.cards1={};//未出牌
    this.cards2=[];//亮出的牌
    this.cards3=[];//
    this.type=0;//0:,1:庄家,2:闲
    this.index=0;//座次顺序 0,1,2,3
    this.lastHuPai=0;//0:上局未胡牌,1:上局胡牌
    this.score2=0;//亮出的胡
    this.score1=0;//总的胡
    this.shouZhongScore=0;
    this.chouPeng={};//可碰没有碰的
    this.chouChi={};//可吃没有吃的
    this.firstFour=true;
    this.isReady=1;//0:已经准备好,1:等待
    this.isOnline=false;
    this.isTuoGuan=0;//0:非托管,1:托管
    this.clientAck=1;//
    this.canPengAndChi=true;
    this.notifyFlows=[];
    this.ackWaitResponse={};

    this.appendAckWaitResponse=function (flowsId,msgNumber,body) {

        var obj={};
        obj.msgNumber=msgNumber;
        obj.body=body;

        var arr=this.ackWaitResponse[flowsId];
        if(arr==undefined)
        {
            arr=[];
            this.ackWaitResponse[flowsId]=arr;
        }

        arr.push(obj);

    }
    this.removeAckWaitResponse=function (flowsId) {

        delete this.ackWaitResponse[flowsId];
    }
    this.getAckWaitResponse=function (flowsId) {

        return this.ackWaitResponse[flowsId];
    }

    this.appendNotifyFlows=function (notifyFlows) {

        var obj={};
        obj.notify=notifyFlows;
        obj.waitTime=0;
        this.notifyFlows.push(obj);
    }
    this.notifyFlowsCount=function () {

        return this.notifyFlows.length;
    }
    this.removeNotifyFlowsById=function (id) {

        var len=this.notifyFlows.length;
        for(var i=0;i<len;i++)
        {
            var obj=this.notifyFlows[i];
            if(obj.notify.flows_id==id)
            {
                this.notifyFlows.splice(i,1);
                break;
            }

        }

    }

    this.clearNofityFlows=function () {

        this.notifyFlows=[];
        this.ackWaitResponse={};

    }
    
    this.checkCanPutCard=function () {
        //检查剩下的牌是否可以 打出
        var len=Object.keys(this.cards1).length;
        if(len==0)//len==1||
        {
            return false;
        }

        //检查剩余牌是否为坎
        var flg=false;

        var groups=this.getCardsByGroup();
        var arr=[];
        for(var key in groups)
        {
            var list=groups[key];
            if(list.length==3)
            {

            }
            else
            {
                flg=true;
                break;
            }

        }


        return flg;


    }

    this.checkIsHu2=function (action) {

        var tmpCards=[];
        if(action!=null)
        {
            var group=action.groupCards;
            var len=group.length;
            for(var i=0;i<len;i++)
            {
                var g=group[i];
                var cards=g.cards;
                var count=cards.length;
                for(var j=0;j<count;j++)
                {
                    var c=cards[j];
                    if(this.cards1[c.c_id]!=undefined)
                    {
                        tmpCards.push(this.cards1[c.c_id]);
                        delete this.cards1[c.c_id];
                    }

                }

            }


        }

        var flg=this.checkCanPutCard();

        var size=tmpCards.length;
        for(var i=0;i<size;i++)
        {
            var c=tmpCards[i];
            this.cards1[c.c_id]=c;
        }

        return (!flg);


    }

    this.setTuoGuan=function (isTuo) {
        if(isTuo)
        {
            this.isTuoGuan=1;
        }
        else{
            this.isTuoGuan=0;
        }
    }
    this.clear=function () {
        this.cards1={};//未出牌
        this.cards2=[];//亮出的牌
        this.cards3=[];//
        this.type=RoomDefine.PLAYER_TYPE;
        this.score2=0;//当前胡
        this.shouZhongScore=0;
        this.firstFour=true;
        this.clientAck=1;//
        this.chouPeng={};//可碰没有碰的
        this.chouChi={};//可吃没有吃的
        this.canPengAndChi=true;
    }

    this.appendChouChi=function (card) {


        this.chouChi[card.c_id]=card;
    }
    this.appendChouPeng=function (card) {

        this.chouPeng[card.c_id]=card;
    }
    this.removeChouChi=function (card) {
        delete this.chouChi[card.c_id];
    }
    this.removeChouPeng=function (card) {
        delete this.chouPeng[card.c_id];
    }
    this.checkHasChouChi=function (card) {

        for(var key in this.chouChi)
        {
            var c=this.chouChi[key];
            if(c.type==card.type&&c.value==card.value)
            {
                return true;
            }

        }
        return false;
    }
    this.checkHasChouPeng=function (card) {

        for(var key in this.chouPeng)
        {
            var c=this.chouPeng[key];
            if(c.type==card.type&&c.value==card.value)
            {
                return true;
            }

        }
        return false;
    }

    this.leftCardInHand=function () {

        return Object.keys(this.cards1).length;
    }
    // this.randomPopCard=function (noCard) {
    //
    //     var arr=[];
    //     for(var c_id in this.cards1)
    //     {
    //         arr.push(this.cards1[c_id]);
    //
    //     }
    //     arr.sort(function(){ return 0.5 - Math.random() });
    //
    //     var selectedCard=null;
    //     var index=0;
    //     var flg=true;
    //     var len=arr.length;
    //     while(len>0)
    //     {
    //         var card=arr[index];
    //         var list=this.getCardByTypeValueInCards1(card.type,card.value);
    //         if(list.length<3&&(card.type!=noCard.type&&card.value!=noCard.value))
    //         {
    //             selectedCard=card;
    //             break;
    //         }
    //
    //         index++;
    //         if(index>=len)
    //         {
    //             break;
    //         }
    //     }
    //
    //     if(selectedCard!=null)
    //     {
    //         delete this.cards1[selectedCard.c_id];
    //         return selectedCard;
    //     }
    // }
    this.moveTo=function (card,from,to) {
        if(from!=null)
        {
            delete from[card.c_id];
        }
        if(to!=null)
        {
            to[card.c_id]=card;
        }

    }
    this.moveToCards2=function (cards) {

        var len=cards.length;
        for(var i=0;i<len;i++)
        {
            var card=cards[i];
            delete this.cards1[card.c_id];
        }
        this.cards2.push(cards);
    }
    this.moveToCards3=function (card) {

        delete this.cards1[card.c_id];
        this.cards3.push(card);
    }

    //[提]被动
    this.checkTi=function () {
        //检查是否有[提]
        var groupCards={};
        for(var c_id in this.cards1)
        {
            var card=this.cards1[c_id];
            var key=card.type+"_"+card.value;
            var arr=groupCards[key];
            if(arr==undefined)
            {
                arr=[];
                arr.push(card);
                groupCards[key]=arr;
            }
            else{
                arr.push(card);
            }

        }


        var action=new Socket.Action();
        action.type=RoomDefine.ACTION_TI;
        for(var key in groupCards)
        {
            var arr=groupCards[key];
            var len=arr.length;
            if(len>=4)
            {
                //提
                var groupCard=new Socket.GroupCard();
                action.groupCards.push(groupCard);
                for(var i=0;i<len;i++)
                {
                    var cd=arr[i];
                    if(i<3)
                    {
                        cd.isBack=1;
                    }
                    else{
                        cd.isBack=0;
                    }
                    groupCard.cards.push(cd);
                }
                this.moveToCards2(arr);

            }

        }

        if(action.groupCards.length>0)
        {
            return action;
        }
        else{
            return null;
        }

    }
    //[提/跑]
    this.checkTiAndPao=function (card,isSelf,isTouch,isCheck) {

        if(isSelf&&isTouch)
        {
            //检查是否为[提] 自己摸到的牌,和[偎]组成提
            var tmpCards=[];

            var cardLen=this.cards2.length;
            for(var i=0;i<cardLen;i++)
            {
                var arr=this.cards2[i];
                if(arr.length==3)
                {
                    var cd=arr[0];
                    var cd1=arr[1];
                    var cd2=arr[2];
                    if(cd.type==cd1.type&&cd.value==cd1.value&&cd.type==cd2.type&&cd.value==cd2.value)
                    {
                        if(cd.isBack==1&&cd.type==card.type&&cd.value==card.value)
                        {
                            tmpCards=arr;
                            break;
                        }
                    }



                }

            }
            var len=tmpCards.length+1;
            if(len>=4)//提
            {
                var action=new Socket.Action();
                action.type=RoomDefine.ACTION_TI2;
                var groupCard=new Socket.GroupCard();
                action.groupCards.push(groupCard);
                for(var i=0;i<tmpCards.length;i++)
                {
                    var c=tmpCards[i];
                    groupCard.cards.push(c);
                    if(!isCheck)
                    {
                        if(i>=1)
                        {
                            c.isBack=1;
                        }
                        else{
                            c.isBack=0;
                        }
                    }

                }

                groupCard.cards.push(card);
                if(!isCheck)
                {
                    card.isBack=1;
                    tmpCards.push(card);
                }


                return action;
            }

            //自摸的提
            tmpCards=[];
            for(var c_id in this.cards1)
            {
                var cd=this.cards1[c_id];
                if(cd.type==card.type&&cd.value==card.value)
                {
                    tmpCards.push(cd);
                }

            }

            var len=tmpCards.length+1;
            if(len>=4)//提
            {
                var action=new Socket.Action();
                action.type=RoomDefine.ACTION_TI;
                var groupCard=new Socket.GroupCard();
                action.groupCards.push(groupCard);
                for(var i=0;i<tmpCards.length;i++)
                {
                    var c=tmpCards[i];
                    if(!isCheck)
                    {
                        c.isBack=1;
                    }

                    groupCard.cards.push(c);
                }

                groupCard.cards.push(card);
                if(!isCheck)
                {
                    card.isBack=0;
                    tmpCards.push(card);
                    this.moveToCards2(tmpCards);
                }


                return action;
            }



            //检查是否为跑 自己摸到的牌,在亮的牌中是否有跑 [碰]
            tmpCards=[];

            var cardLen=this.cards2.length;
            for(var i=0;i<cardLen;i++)
            {
                var arr=this.cards2[i];
                if(arr.length==3)
                {
                    var cd=arr[0];
                    var cd1=arr[1];
                    var cd2=arr[2];
                    if(cd.type==cd1.type&&cd.value==cd1.value&&cd.type==cd2.type&&cd.value==cd2.value)
                    {
                        if(cd.isBack==0&&cd.type==card.type&&cd.value==card.value)
                        {
                            tmpCards=arr;
                            break;
                        }
                    }


                }

            }

            len=tmpCards.length+1;
            if(len>=4)//跑
            {
                var action=new Socket.Action();
                action.type=RoomDefine.ACTION_PAO2;
                var groupCard=new Socket.GroupCard();
                action.groupCards.push(groupCard);
                for(var i=0;i<tmpCards.length;i++)
                {
                    var c=tmpCards[i];
                    if(!isCheck)
                    {
                        c.isBack=0;
                    }

                    groupCard.cards.push(c);
                }

                groupCard.cards.push(card);
                if(!isCheck)
                {
                    card.isBack=0;
                    tmpCards.push(card);
                }

                return action;
            }



        }
        else{

            if(!isSelf)
            {
                var tmpCards=[];
                var cardLen=this.cards2.length;
                for(var i=0;i<cardLen;i++)
                {
                    var arr=this.cards2[i];
                    if(arr.length==3)
                    {
                        var cd=arr[0];
                        var cd1=arr[1];
                        var cd2=arr[2];
                        if(cd.type==cd1.type&&cd.value==cd1.value&&cd.type==cd2.type&&cd.value==cd2.value)
                        {
                            if(cd.isBack==1&&cd.type==card.type&&cd.value==card.value)
                            {
                                tmpCards=arr;
                                break;
                            }
                        }



                    }

                }
                var len=tmpCards.length+1;
                if(len>=4)//跑
                {
                    var action=new Socket.Action();
                    action.type=RoomDefine.ACTION_PAO2;
                    var groupCard=new Socket.GroupCard();
                    action.groupCards.push(groupCard);
                    for(var i=0;i<tmpCards.length;i++)
                    {
                        var c=tmpCards[i];
                        if(!isCheck)
                        {
                            c.isBack=0;
                        }

                        groupCard.cards.push(c);
                    }
                    groupCard.cards.push(card);
                    if(!isCheck)
                    {
                        card.isBack=0;
                        tmpCards.push(card);
                    }


                    return action;
                }

            }

            //不是自己摸的牌,检查是否有跑
            var tmpCards=[];
            for(var c_id in this.cards1)
            {
                var cd=this.cards1[c_id];
                if(cd.type==card.type&&cd.value==card.value)
                {
                    tmpCards.push(cd);
                }

            }

            var len=tmpCards.length+1;
            if(len>=4)//跑
            {
                var action=new Socket.Action();
                action.type=RoomDefine.ACTION_PAO;
                var groupCard=new Socket.GroupCard();
                action.groupCards.push(groupCard);
                for(var i=0;i<tmpCards.length;i++)
                {
                    var c=tmpCards[i];
                    if(!isCheck)
                    {
                        c.isBack=0;
                    }
                    groupCard.cards.push(c);

                }
                groupCard.cards.push(card);
                if(!isCheck)
                {
                    card.isBack=0;
                    tmpCards.push(card);
                    this.moveToCards2(tmpCards);
                }


                return action;
            }

            if(isTouch)//摸出的牌 需要检查玩家的碰是否可以组合
            {

                tmpCards=[];

                var cardLen=this.cards2.length;
                for(var i=0;i<cardLen;i++)
                {
                    var arr=this.cards2[i];
                    if(arr.length==3)
                    {
                        var cd=arr[0];
                        var cd1=arr[1];
                        var cd2=arr[2];
                        if(cd.type==cd1.type&&cd.value==cd1.value&&cd.type==cd2.type&&cd.value==cd2.value)
                        {
                            if(cd.isBack==0&&cd.type==card.type&&cd.value==card.value)
                            {
                                tmpCards=arr;
                                break;
                            }
                        }


                    }

                }

                len=tmpCards.length+1;
                if(len>=4)//跑
                {
                    var action=new Socket.Action();
                    action.type=RoomDefine.ACTION_PAO2;
                    var groupCard=new Socket.GroupCard();
                    action.groupCards.push(groupCard);
                    for(var i=0;i<tmpCards.length;i++)
                    {
                        var c=tmpCards[i];
                        if(!isCheck)
                        {
                            c.isBack=0;
                        }
                        groupCard.cards.push(c);
                    }
                    groupCard.cards.push(card);
                    if(!isCheck)
                    {
                        card.isBack=0;
                        tmpCards.push(card);
                    }

                    return action;
                }

            }




        }

        return null;
    }

    //[碰/偎]
    this.checkPeng=function (card,isSelfTouch,isChecked) {


        var tmpCards=[];
        for(var c_id in this.cards1)
        {
            var cd=this.cards1[c_id];
            if(cd.type==card.type&&cd.value==card.value)
            {
                tmpCards.push(cd);
            }

        }
        var len=tmpCards.length+1;
        if(len==3)//碰
        {
            var action=new Socket.Action();
            if(isSelfTouch)//自己摸,检查偎
            {
                action.type=RoomDefine.ACTION_WEI;
            }
            else{
                action.type=RoomDefine.ACTION_KEPENG;

                if(!this.canPengAndChi)
                {
                    console.log("[听牌(偎),不可以再碰]");
                    return null;
                }
            }

            var groupCard=new Socket.GroupCard();
            action.groupCards.push(groupCard);
            for(var i=0;i<tmpCards.length;i++)
            {
                var c=tmpCards[i];
                if(!isChecked)
                {
                    if(isSelfTouch)
                    {
                        c.isBack=1;
                    }
                    else{
                        c.isBack=0;
                    }
                }

                groupCard.cards.push(c);

            }



            groupCard.cards.push(card);

            if(action.type==RoomDefine.ACTION_WEI)
            {
                if(!isChecked)
                {
                    tmpCards.push(card);
                    this.moveToCards2(tmpCards);
                }

            }

            return action;
        }

        return null;

    }

    this.checkChildGroup=function (type,value,hasChecked) {

        var childGroup=[];

        var card=null;
        for(var c_id in this.cards1)
        {
            var c=this.cards1[c_id];
            if(c.type==type&&c.value==value&&hasChecked[c_id]==undefined)
            {
                card=c;
                break;

            }

        }

        if(card==null)
        {
            //console.log("#1");
            return childGroup;
        }

        //顺子
        var c1=this.getCardByTypeValueInCards1Except(card.type,card.value-2,hasChecked);
        if(c1.length>0&&c1.length<3)//[坎]是不能拆的 所以找3个以下的
        {
            var c1_2=this.getCardByTypeValueInCards1Except(card.type,card.value-1,hasChecked);
            if(c1_2.length>0&&c1_2.length<3)
            {
                //组成顺子
                var groupCard=new Socket.GroupCard();
                groupCard.cards.push(c1[0]);
                groupCard.cards.push(c1_2[0]);
                groupCard.cards.push(card);

                var hasChecked2={};
                for(var key in hasChecked)
                {
                    hasChecked2[key]=hasChecked[key];
                }
                hasChecked2[c1[0].c_id]=c1[0];
                hasChecked2[c1_2[0].c_id]=c1_2[0];
                hasChecked2[card.c_id]=card;

                var hasCard=this.getCardByTypeValueInCards1Except(card.type,card.value,hasChecked2);
                if(hasCard.length>0)
                {
                    var childCards=this.checkChildGroup(card.type,card.value,hasChecked2);
                    if(childCards.length<=0)
                    {
                        console.log("[无子比不能吃1]");

                        return [];

                    }
                    else{
                        groupCard.childCards=childCards;
                        childGroup.push(groupCard);
                    }
                }
                else{

                    groupCard.childCards=[];
                    childGroup.push(groupCard);
                }


            }
        }

        c1=this.getCardByTypeValueInCards1Except(card.type,card.value-1,hasChecked);
        if(c1.length>0&&c1.length<3)//[坎]是不能拆的 所以找3个以下的
        {
            var c1_2=this.getCardByTypeValueInCards1Except(card.type,card.value+1,hasChecked);
            if(c1_2.length>0&&c1_2.length<3)
            {
                //组成顺子
                var groupCard=new Socket.GroupCard();
                groupCard.cards.push(c1[0]);
                groupCard.cards.push(card);
                groupCard.cards.push(c1_2[0]);


                var hasChecked2={};
                for(var key in hasChecked)
                {
                    hasChecked2[key]=hasChecked[key];
                }
                hasChecked2[c1[0].c_id]=c1[0];
                hasChecked2[c1_2[0].c_id]=c1_2[0];
                hasChecked2[card.c_id]=card;


                var hasCard=this.getCardByTypeValueInCards1Except(card.type,card.value,hasChecked2);
                if(hasCard.length>0)
                {
                    var childCards=this.checkChildGroup(card.type,card.value,hasChecked2);
                    if(childCards.length<=0)
                    {
                        console.log("[无子比不能吃2]");
                        return [];
                    }
                    else{
                        groupCard.childCards=childCards;
                        childGroup.push(groupCard);
                    }
                }
                else{

                    groupCard.childCards=[];
                    childGroup.push(groupCard);
                }

            }
        }

        c1=this.getCardByTypeValueInCards1Except(card.type,card.value+1,hasChecked);
      //  console.log("##2##:"+card.type+":"+card.value+":"+c1.length);
        if(c1.length>0&&c1.length<3)//[坎]是不能拆的 所以找3个以下的
        {
            var c1_2=this.getCardByTypeValueInCards1Except(card.type,card.value+2,hasChecked);
            //console.log("##4##:"+c1_2.type+":"+c1_2.value);
            if(c1_2.length>0&&c1_2.length<3)
            {
                //组成顺子
                var groupCard=new Socket.GroupCard();
                groupCard.cards.push(card);
                groupCard.cards.push(c1[0]);
                groupCard.cards.push(c1_2[0]);

               // console.log("####3");

                var hasChecked2={};
                for(var key in hasChecked)
                {
                    hasChecked2[key]=hasChecked[key];
                }
                hasChecked2[c1[0].c_id]=c1[0];
                hasChecked2[c1_2[0].c_id]=c1_2[0];
                hasChecked2[card.c_id]=card;


                var hasCard=this.getCardByTypeValueInCards1Except(card.type,card.value,hasChecked2);
                if(hasCard.length>0)
                {
                    var childCards=this.checkChildGroup(card.type,card.value,hasChecked2);
                    if(childCards.length<=0)
                    {
                        console.log("[无子比不能吃3]");
                        return [];
                    }
                    else{
                        groupCard.childCards=childCards;
                        childGroup.push(groupCard);
                    }
                }
                else{

                    groupCard.childCards=[];
                    childGroup.push(groupCard);
                }


            }
        }

        //2/7/10
        if(card.value==2||card.value==7||card.value==10)
        {
            if(card.value==2)
            {
                var a1=this.getCardByTypeValueInCards1Except(card.type,7,hasChecked);
                if(a1.length>0&&a1.length<3)
                {
                    var a2=this.getCardByTypeValueInCards1Except(card.type,10,hasChecked);
                    if(a2.length>0&&a2.length<3)
                    {
                        var groupCard=new Socket.GroupCard();
                        groupCard.cards.push(card);
                        groupCard.cards.push(a1[0]);
                        groupCard.cards.push(a2[0]);

                        var hasChecked2={};
                        for(var key in hasChecked)
                        {
                            hasChecked2[key]=hasChecked[key];
                        }
                        hasChecked2[a1[0].c_id]=a1[0];
                        hasChecked2[a2[0].c_id]=a2[0];
                        hasChecked2[card.c_id]=card;


                        var hasCard=this.getCardByTypeValueInCards1Except(card.type,card.value,hasChecked2);
                        if(hasCard.length>0)
                        {
                            var childCards=this.checkChildGroup(card.type,card.value,hasChecked2);
                            if(childCards.length<=0)
                            {
                                console.log("[无子比不能吃4]");
                                return [];
                            }
                            else{
                                groupCard.childCards=childCards;
                                childGroup.push(groupCard);
                            }
                        }
                        else{

                            groupCard.childCards=[];
                            childGroup.push(groupCard);
                        }



                    }
                }

            }
            else if(card.value==7)
            {
                var a1=this.getCardByTypeValueInCards1Except(card.type,2,hasChecked);
                if(a1.length>0&&a1.length<3)
                {
                    var a2=this.getCardByTypeValueInCards1Except(card.type,10,hasChecked);
                    if(a2.length>0&&a2.length<3)
                    {
                        var groupCard=new Socket.GroupCard();
                        groupCard.cards.push(a1[0]);
                        groupCard.cards.push(card);
                        groupCard.cards.push(a2[0]);


                        var hasChecked2={};
                        for(var key in hasChecked)
                        {
                            hasChecked2[key]=hasChecked[key];
                        }
                        hasChecked2[a1[0].c_id]=a1[0];
                        hasChecked2[a2[0].c_id]=a2[0];
                        hasChecked2[card.c_id]=card;


                        var hasCard=this.getCardByTypeValueInCards1Except(card.type,card.value,hasChecked2);
                        if(hasCard.length>0)
                        {
                            var childCards=this.checkChildGroup(card.type,card.value,hasChecked2);
                            if(childCards.length<=0)
                            {
                                console.log("[无子比不能吃5]");
                                return [];
                            }
                            else{
                                groupCard.childCards=childCards;
                                childGroup.push(groupCard);
                            }
                        }
                        else{

                            groupCard.childCards=[];
                            childGroup.push(groupCard);
                        }


                    }
                }

            }
            else if(card.value==10)
            {
                var a1=this.getCardByTypeValueInCards1Except(card.type,2,hasChecked);
                if(a1.length>0&&a1.length<3)
                {
                    var a2=this.getCardByTypeValueInCards1Except(card.type,7,hasChecked);
                    if(a2.length>0&&a2.length<3)
                    {
                        var groupCard=new Socket.GroupCard();
                        groupCard.cards.push(a1[0]);
                        groupCard.cards.push(a2[0]);
                        groupCard.cards.push(card);


                        var hasChecked2={};
                        for(var key in hasChecked)
                        {
                            hasChecked2[key]=hasChecked[key];
                        }
                        hasChecked2[a1[0].c_id]=a1[0];
                        hasChecked2[a2[0].c_id]=a2[0];
                        hasChecked2[card.c_id]=card;

                        var hasCard=this.getCardByTypeValueInCards1Except(card.type,card.value,hasChecked2);
                        if(hasCard.length>0)
                        {
                            var childCards=this.checkChildGroup(card.type,card.value,hasChecked2);
                            if(childCards.length<=0)
                            {
                                console.log("[无子比不能吃6]");
                                return [];
                            }
                            else{
                                groupCard.childCards=childCards;
                                childGroup.push(groupCard);
                            }
                        }
                        else{

                            groupCard.childCards=[];
                            childGroup.push(groupCard);
                        }



                    }
                }

            }

        }

        //大小三搭
        //0:大写,1:小写
        if(card.type==0)
        {
            var a1=this.getCardByTypeValueInCards1Except(1,card.value,hasChecked);
            if(a1.length==2)
            {
                var groupCard=new Socket.GroupCard();
                groupCard.cards.push(card);
                groupCard.cards.push(a1[0]);
                groupCard.cards.push(a1[1]);


                var hasChecked2={};
                for(var key in hasChecked)
                {
                    hasChecked2[key]=hasChecked[key];
                }
                hasChecked2[a1[0].c_id]=a1[0];
                hasChecked2[a1[1].c_id]=a1[1];
                hasChecked2[card.c_id]=card;


                var hasCard=this.getCardByTypeValueInCards1Except(card.type,card.value,hasChecked2);
                if(hasCard.length>0)
                {
                    var childCards=this.checkChildGroup(card.type,card.value,hasChecked2);
                    if(childCards.length<=0)
                    {
                        //无比不能吃
                        console.log("[大小三搭#5]");
                    }
                    else{
                        groupCard.childCards=childCards;
                        childGroup.push(groupCard);
                    }
                }
                else{

                    groupCard.childCards=[];
                    childGroup.push(groupCard);
                }






            }
            // else if(a1.length==1)
            // {
            //     var a2=this.getCardByTypeValueInCards1Except(0,card.value,hasChecked);
            //     if(a2.length==1)
            //     {
            //
            //         var groupCard=new Socket.GroupCard();
            //         groupCard.cards.push(a1[0]);
            //         groupCard.cards.push(a2[0]);
            //         groupCard.cards.push(card);
            //
            //
            //         var hasChecked2={};
            //         for(var key in hasChecked)
            //         {
            //             hasChecked2[key]=hasChecked[key];
            //         }
            //         hasChecked2[a1[0].c_id]=a1[0];
            //         hasChecked2[a2[0].c_id]=a2[0];
            //         hasChecked2[card.c_id]=card;
            //
            //         var childCards=this.checkChildGroup(card.type,card.value,hasChecked2);
            //         groupCard.childCards=childCards;
            //
            //         childGroup.push(groupCard);
            //
            //
            //     }
            //
            // }

        }
        else{
            var a1=this.getCardByTypeValueInCards1Except(0,card.value,hasChecked);
            if(a1.length==2)
            {
                var groupCard=new Socket.GroupCard();
                groupCard.cards.push(card);
                groupCard.cards.push(a1[0]);
                groupCard.cards.push(a1[1]);

                var hasChecked2={};
                for(var key in hasChecked)
                {
                    hasChecked2[key]=hasChecked[key];
                }
                hasChecked2[a1[0].c_id]=a1[0];
                hasChecked2[a1[1].c_id]=a1[1];
                hasChecked2[card.c_id]=card;




                var hasCard=this.getCardByTypeValueInCards1Except(card.type,card.value,hasChecked2);
                if(hasCard.length>0)
                {
                    var childCards=this.checkChildGroup(card.type,card.value,hasChecked2);
                    if(childCards.length<=0)
                    {
                        //无比不能吃
                        console.log("[大小三搭#6]");
                    }
                    else{
                        groupCard.childCards=childCards;
                        childGroup.push(groupCard);
                    }
                }
                else{

                    groupCard.childCards=[];
                    childGroup.push(groupCard);
                }



            }
            // else if(a1.length==1)
            // {
            //     var a2=this.getCardByTypeValueInCards1Except(1,card.value,hasChecked);
            //     if(a2.length==1)
            //     {
            //
            //         var groupCard=new Socket.GroupCard();
            //         groupCard.cards.push(a1[0]);
            //         groupCard.cards.push(a2[0]);
            //         groupCard.cards.push(card);
            //
            //
            //         var hasChecked2={};
            //         for(var key in hasChecked)
            //         {
            //             hasChecked2[key]=hasChecked[key];
            //         }
            //         hasChecked2[a1[0].c_id]=a1[0];
            //         hasChecked2[a2[0].c_id]=a2[0];
            //         hasChecked2[card.c_id]=card;
            //
            //         var childCards=this.checkChildGroup(card.type,card.value,hasChecked2);
            //         groupCard.childCards=childCards;
            //
            //         childGroup.push(groupCard);
            //
            //
            //     }
            //
            // }
        }

        return childGroup;

    }
    //[吃]
    this.checkChi=function (card) {

        var action=new Socket.Action();
        action.type=RoomDefine.ACTION_KECHI;

        if(!this.canPengAndChi)
        {
            console.log("[听牌(偎),不可以再吃]");
            return null;
        }

        //检查是吃还是比

        var cc=this.getCardByTypeValueInCards1(card.type,card.value);
        if(cc.length>0)
        {
            //[可比]
            
            //顺子
            var c1=this.getCardByTypeValueInCards1(card.type,card.value-2);
            if(c1.length>0&&c1.length<3)//[坎]是不能拆的 所以找3个以下的
            {
                var c1_2=this.getCardByTypeValueInCards1(card.type,card.value-1);
                if(c1_2.length>0&&c1_2.length<3)
                {
                    //组成顺子
                    var groupCard=new Socket.GroupCard();
                    groupCard.cards.push(c1[0]);
                    groupCard.cards.push(c1_2[0]);
                    groupCard.cards.push(card);

                    var hasChecked={};
                    hasChecked[c1[0].c_id]=c1[0];
                    hasChecked[c1_2[0].c_id]=c1_2[0];
                    hasChecked[card.c_id]=card;

                    var childCards=this.checkChildGroup(card.type,card.value,hasChecked);
                    if(childCards.length<=0)
                    {
                        //无比不能吃
                        console.log("[#1无比不能吃]");
                    }
                    else{
                        action.groupCards.push(groupCard);
                        groupCard.childCards=childCards;
                    }


                }
            }

            c1=this.getCardByTypeValueInCards1(card.type,card.value-1);
            if(c1.length>0&&c1.length<3)//[坎]是不能拆的 所以找3个以下的
            {
                var c1_2=this.getCardByTypeValueInCards1(card.type,card.value+1);
                if(c1_2.length>0&&c1_2.length<3)
                {
                    //组成顺子
                    var groupCard=new Socket.GroupCard();
                    groupCard.cards.push(c1[0]);
                    groupCard.cards.push(card);
                    groupCard.cards.push(c1_2[0]);

                    var hasChecked={};
                    hasChecked[c1[0].c_id]=c1[0];
                    hasChecked[c1_2[0].c_id]=c1_2[0];
                    hasChecked[card.c_id]=card;

                    var childCards=this.checkChildGroup(card.type,card.value,hasChecked);
                    if(childCards.length<=0)
                    {
                        //无比不能吃
                        console.log("[#2无比不能吃]");
                    }
                    else{
                        action.groupCards.push(groupCard);
                        groupCard.childCards=childCards;
                    }


                }
            }

            c1=this.getCardByTypeValueInCards1(card.type,card.value+1);
            if(c1.length>0&&c1.length<3)//[坎]是不能拆的 所以找3个以下的
            {
                var c1_2=this.getCardByTypeValueInCards1(card.type,card.value+2);
                if(c1_2.length>0&&c1_2.length<3)
                {
                    //组成顺子
                    var groupCard=new Socket.GroupCard();
                    groupCard.cards.push(card);
                    groupCard.cards.push(c1[0]);
                    groupCard.cards.push(c1_2[0]);


                    var hasChecked={};
                    hasChecked[c1[0].c_id]=c1[0];
                    hasChecked[c1_2[0].c_id]=c1_2[0];
                    hasChecked[card.c_id]=card;

                    var childCards=this.checkChildGroup(card.type,card.value,hasChecked);
                    if(childCards.length<=0)
                    {
                        //无比不能吃
                        console.log("[#3无比不能吃]");
                    }
                    else{
                        action.groupCards.push(groupCard);
                        groupCard.childCards=childCards;
                    }



                }
            }

            //2/7/10
            if(card.value==2||card.value==7||card.value==10)
            {
                if(card.value==2)
                {
                    var a1=this.getCardByTypeValueInCards1(card.type,7);
                    if(a1.length>0&&a1.length<3)
                    {
                        var a2=this.getCardByTypeValueInCards1(card.type,10);
                        if(a2.length>0&&a2.length<3)
                        {
                            var groupCard=new Socket.GroupCard();
                            groupCard.cards.push(card);
                            groupCard.cards.push(a1[0]);
                            groupCard.cards.push(a2[0]);


                            var hasChecked={};
                            hasChecked[a1[0].c_id]=a1[0];
                            hasChecked[a2[0].c_id]=a2[0];
                            hasChecked[card.c_id]=card;

                            var childCards=this.checkChildGroup(card.type,card.value,hasChecked);
                            if(childCards.length<=0)
                            {
                                //无比不能吃
                                console.log("[#4无比不能吃]");
                            }
                            else{
                                action.groupCards.push(groupCard);
                                groupCard.childCards=childCards;
                            }


                        }
                    }

                }
                else if(card.value==7)
                {
                    var a1=this.getCardByTypeValueInCards1(card.type,2);
                    if(a1.length>0&&a1.length<3)
                    {
                        var a2=this.getCardByTypeValueInCards1(card.type,10);
                        if(a2.length>0&&a2.length<3)
                        {
                            var groupCard=new Socket.GroupCard();
                            groupCard.cards.push(a1[0]);
                            groupCard.cards.push(card);
                            groupCard.cards.push(a2[0]);


                            var hasChecked={};
                            hasChecked[a1[0].c_id]=a1[0];
                            hasChecked[a2[0].c_id]=a2[0];
                            hasChecked[card.c_id]=card;

                            var childCards=this.checkChildGroup(card.type,card.value,hasChecked);
                            if(childCards.length<=0)
                            {
                                //无比不能吃
                                console.log("[#5无比不能吃]");
                            }
                            else{
                                action.groupCards.push(groupCard);
                                groupCard.childCards=childCards;
                            }


                        }
                    }

                }
                else if(card.value==10)
                {
                    var a1=this.getCardByTypeValueInCards1(card.type,2);
                    if(a1.length>0&&a1.length<3)
                    {
                        var a2=this.getCardByTypeValueInCards1(card.type,7);
                        if(a2.length>0&&a2.length<3)
                        {
                            var groupCard=new Socket.GroupCard();
                            groupCard.cards.push(a1[0]);
                            groupCard.cards.push(a2[0]);
                            groupCard.cards.push(card);


                            var hasChecked={};
                            hasChecked[a1[0].c_id]=a1[0];
                            hasChecked[a2[0].c_id]=a2[0];
                            hasChecked[card.c_id]=card;

                            var childCards=this.checkChildGroup(card.type,card.value,hasChecked);
                            if(childCards.length<=0)
                            {
                                //无比不能吃
                                console.log("[#6无比不能吃]");
                            }
                            else{
                                action.groupCards.push(groupCard);
                                groupCard.childCards=childCards;
                            }




                        }
                    }

                }

            }

            //大小三搭
            //0:大写,1:小写
            if(card.type==0)
            {
                var a1=this.getCardByTypeValueInCards1(1,card.value);
                if(a1.length==2)
                {
                    var groupCard=new Socket.GroupCard();
                    groupCard.cards.push(card);
                    groupCard.cards.push(a1[0]);
                    groupCard.cards.push(a1[1]);


                    var hasChecked={};
                    hasChecked[a1[0].c_id]=a1[0];
                    hasChecked[a1[1].c_id]=a1[1];
                    hasChecked[card.c_id]=card;

                    var childCards=this.checkChildGroup(card.type,card.value,hasChecked);
                    if(childCards.length<=0)
                    {
                        //无比不能吃
                        console.log("[无比不能吃-大小三搭1]");
                    }
                    else{
                        action.groupCards.push(groupCard);
                        groupCard.childCards=childCards;
                    }



                }

                a1=this.getCardByTypeValueInCards1(0,card.value);
                if(a1.length>=1&&a1.length<3)
                {
                    var a2=this.getCardByTypeValueInCards1(1,card.value);
                    if(a2.length>=1&&a2.length<3)
                    {

                        var groupCard=new Socket.GroupCard();
                        groupCard.cards.push(card);
                        groupCard.cards.push(a1[0]);
                        groupCard.cards.push(a2[0]);



                        var hasChecked={};
                        hasChecked[a1[0].c_id]=a1[0];
                        hasChecked[a2[0].c_id]=a2[0];
                        hasChecked[card.c_id]=card;

                        if(a1.length>1)
                        {
                            var childCards=this.checkChildGroup(card.type,card.value,hasChecked);
                            if(childCards.length<=0)
                            {
                                //无比不能吃
                                console.log("[无比不能吃-大小三搭4]");
                            }
                            else{
                                action.groupCards.push(groupCard);
                                groupCard.childCards=childCards;
                            }
                        }
                        else{
                            action.groupCards.push(groupCard);
                        }
                    }

                }

            }
            else{
                var a1=this.getCardByTypeValueInCards1(0,card.value);
                if(a1.length==2)
                {
                    var groupCard=new Socket.GroupCard();
                    groupCard.cards.push(card);
                    groupCard.cards.push(a1[0]);
                    groupCard.cards.push(a1[1]);

                    var hasChecked={};
                    hasChecked[a1[0].c_id]=a1[0];
                    hasChecked[a1[1].c_id]=a1[1];
                    hasChecked[card.c_id]=card;

                    var childCards=this.checkChildGroup(card.type,card.value,hasChecked);
                    if(childCards.length<=0)
                    {
                        //无比不能吃
                        console.log("[无比不能吃-大小三搭2]");
                    }
                    else{
                        action.groupCards.push(groupCard);
                        groupCard.childCards=childCards;
                    }


                }

                a1=this.getCardByTypeValueInCards1(1,card.value);
                if(a1.length>=1&&a1.length<3)
                {
                    var a2=this.getCardByTypeValueInCards1(0,card.value);
                    if(a2.length>=1&&a2.length<3)
                    {

                        var groupCard=new Socket.GroupCard();

                        groupCard.cards.push(card);
                        groupCard.cards.push(a1[0]);
                        groupCard.cards.push(a2[0]);



                        var hasChecked={};
                        hasChecked[a1[0].c_id]=a1[0];
                        hasChecked[a2[0].c_id]=a2[0];
                        hasChecked[card.c_id]=card;

                        if(a1.length>1)
                        {
                            var childCards=this.checkChildGroup(card.type,card.value,hasChecked);
                            if(childCards.length<=0)
                            {
                                //无比不能吃
                                console.log("[无比不能吃-大小三搭4]");
                            }
                            else{
                                action.groupCards.push(groupCard);
                                groupCard.childCards=childCards;
                            }
                        }
                        else{
                            action.groupCards.push(groupCard);
                        }



                    }

                }

            }



            // if(action.groupCards.length<(cc.length+1))
            // {
            //     action.groupCards=[];
            // }
            console.log("[action.groupCards.length:"+action.groupCards.length+"]");

        }
        else{
            //[可吃]

            //顺子
            var c1=this.getCardByTypeValueInCards1(card.type,card.value-2);
            if(c1.length>0&&c1.length<3)//[坎]是不能拆的 所以找3个以下的
            {
                var c1_2=this.getCardByTypeValueInCards1(card.type,card.value-1);
                if(c1_2.length>0&&c1_2.length<3)
                {
                    //组成顺子
                    var groupCard=new Socket.GroupCard();
                    action.groupCards.push(groupCard);
                    groupCard.cards.push(c1[0]);
                    groupCard.cards.push(c1_2[0]);
                    groupCard.cards.push(card);
                }
            }

            c1=this.getCardByTypeValueInCards1(card.type,card.value-1);
            if(c1.length>0&&c1.length<3)//[坎]是不能拆的 所以找3个以下的
            {
                var c1_2=this.getCardByTypeValueInCards1(card.type,card.value+1);
                if(c1_2.length>0&&c1_2.length<3)
                {
                    //组成顺子
                    var groupCard=new Socket.GroupCard();
                    action.groupCards.push(groupCard);
                    groupCard.cards.push(c1[0]);
                    groupCard.cards.push(card);
                    groupCard.cards.push(c1_2[0]);
                }
            }

            c1=this.getCardByTypeValueInCards1(card.type,card.value+1);
            if(c1.length>0&&c1.length<3)//[坎]是不能拆的 所以找3个以下的
            {
                var c1_2=this.getCardByTypeValueInCards1(card.type,card.value+2);
                if(c1_2.length>0&&c1_2.length<3)
                {
                    //组成顺子
                    var groupCard=new Socket.GroupCard();
                    action.groupCards.push(groupCard);
                    groupCard.cards.push(card);
                    groupCard.cards.push(c1[0]);
                    groupCard.cards.push(c1_2[0]);
                }
            }

            //2/7/10
            if(card.value==2||card.value==7||card.value==10)
            {
                if(card.value==2)
                {
                    var a1=this.getCardByTypeValueInCards1(card.type,7);
                    if(a1.length>0&&a1.length<3)
                    {
                        var a2=this.getCardByTypeValueInCards1(card.type,10);
                        if(a2.length>0&&a2.length<3)
                        {
                            var groupCard=new Socket.GroupCard();
                            action.groupCards.push(groupCard);
                            groupCard.cards.push(card);
                            groupCard.cards.push(a1[0]);
                            groupCard.cards.push(a2[0]);

                        }
                    }

                }
                else if(card.value==7)
                {
                    var a1=this.getCardByTypeValueInCards1(card.type,2);
                    if(a1.length>0&&a1.length<3)
                    {
                        var a2=this.getCardByTypeValueInCards1(card.type,10);
                        if(a2.length>0&&a2.length<3)
                        {
                            var groupCard=new Socket.GroupCard();
                            action.groupCards.push(groupCard);
                            groupCard.cards.push(a1[0]);
                            groupCard.cards.push(card);
                            groupCard.cards.push(a2[0]);

                        }
                    }

                }
                else if(card.value==10)
                {
                    var a1=this.getCardByTypeValueInCards1(card.type,2);
                    if(a1.length>0&&a1.length<3)
                    {
                        var a2=this.getCardByTypeValueInCards1(card.type,7);
                        if(a2.length>0&&a2.length<3)
                        {
                            var groupCard=new Socket.GroupCard();
                            action.groupCards.push(groupCard);
                            groupCard.cards.push(a1[0]);
                            groupCard.cards.push(a2[0]);
                            groupCard.cards.push(card);

                        }
                    }

                }

            }

            //大小三搭
            //0:大写,1:小写
            if(card.type==0)
            {
                var a1=this.getCardByTypeValueInCards1(1,card.value);
                if(a1.length==2)
                {
                    var groupCard=new Socket.GroupCard();
                    action.groupCards.push(groupCard);
                    groupCard.cards.push(card);
                    groupCard.cards.push(a1[0]);
                    groupCard.cards.push(a1[1]);

                }
                else if(a1.length==1)
                {
                    var a2=this.getCardByTypeValueInCards1(0,card.value);
                    if(a2.length==1)
                    {

                        var groupCard=new Socket.GroupCard();

                        groupCard.cards.push(a1[0]);
                        groupCard.cards.push(a2[0]);
                        groupCard.cards.push(card);

                        action.groupCards.push(groupCard);

                    }

                }
            }
            else{
                var a1=this.getCardByTypeValueInCards1(0,card.value);
                if(a1.length==2)
                {
                    var groupCard=new Socket.GroupCard();
                    action.groupCards.push(groupCard);
                    groupCard.cards.push(card);
                    groupCard.cards.push(a1[0]);
                    groupCard.cards.push(a1[1]);

                }
                else if(a1.length==1)
                {
                    var a2=this.getCardByTypeValueInCards1(1,card.value);
                    if(a2.length==1)
                    {

                        var groupCard=new Socket.GroupCard();

                        groupCard.cards.push(a1[0]);
                        groupCard.cards.push(a2[0]);
                        groupCard.cards.push(card);

                        action.groupCards.push(groupCard);

                    }

                }
            }


        }


        if(action.groupCards.length>0)
        {
            return action;
        }
        else{
            return null;
        }


    }

    this.getCardCountInAction=function (group,type,value) {

        var count=0;
        var size=group.length;
        for(var i=0;i<size;i++)
        {
            var g=group[i];
            var cards=g.cards;
            var childCards=g.childCards;

            if(cards!=undefined&&cards.length>0)
            {
                for(var j=0;j<cards.length;j++)
                {
                    var c=cards[j];
                    if(c.type==type&&c.value==value)
                    {
                        count++;

                    }

                }




            }




        }

    }
    this.getCardsByGroup=function () {

        //检查是否有3个一样
        var tmpCards={};
        for(var c_id in this.cards1)
        {
            var cd=this.cards1[c_id];
            var type=cd.type;
            var value=cd.value;
            var key=type+"_"+value;
            var arr=tmpCards[key];
            if(arr==undefined)
            {
                arr=[];
                arr.push(cd);
                tmpCards[key]=arr;
            }
            else{

                arr.push(cd);
            }

        }

        return tmpCards;

    }

    this.getCardsByGroup2=function () {

        //检查是否有3个一样
        var tmpCards={};
        for(var c_id in this.cards1)
        {
            var cd=this.cards1[c_id];
            var type=cd.type;
            var value=cd.value;
            var key=type+"_"+value;
            var arr=tmpCards[key];
            if(arr==undefined)
            {
                arr=[];
                arr.push(cd);
                tmpCards[key]=arr;
            }
            else{

                arr.push(cd);
            }

        }
        var count=this.cards2.length;
        for(var i=0;i<count;i++)
        {
            var arr=this.cards2[i];

            var size=arr.length;
            for(var j=0;j<size;j++)
            {
                var cd=arr[j];

                var type=cd.type;
                var value=cd.value;
                var key=type+"_"+value;
                var arr=tmpCards[key];
                if(arr==undefined)
                {
                    arr=[];
                    arr.push(cd);
                    tmpCards[key]=arr;
                }
                else{

                    arr.push(cd);
                }

            }



        }

        return tmpCards;

    }

    this.getFourGroup2=function () {

        var groups=this.getCardsByGroup2();
        var arr=[];
        for(var key in groups)
        {
            var list=groups[key];
            if(list.length==4)
            {
                arr.push(list);
            }

        }

        return arr;

    }

    this.getFourGroup=function () {

        var groups=this.getCardsByGroup();
        var arr=[];
        for(var key in groups)
        {
            var list=groups[key];
            if(list.length==4)
            {
                arr.push(list);
            }

        }

        return arr;

    }

    this.getThreeGroup=function () {

        var groups=this.getCardsByGroup();
        var arr=[];
        for(var key in groups)
        {
            var list=groups[key];
            if(list.length==3)
            {
                arr.push(list);
            }

        }

        return arr;

    }
    this.checkScore2=function () {
        this.score2=this.checkScore3(this.cards2);
        return this.score2;
    }

    this.checkScore3=function (scoreCards) {

        var score=0;

        var cardLen=scoreCards.length;
        for(var i=0;i<cardLen;i++) {
            var arr = scoreCards[i];
            if(arr.length==4)
            {
                var isTi=0;
                var isBig=false;
                var len=arr.length;
                for(var j=0;j<len;j++)
                {
                    var c=arr[j];
                    if(c.type==0)
                    {
                        isBig=true;
                    }
                    if(c.isBack==1)
                    {
                        isTi++;

                    }


                }
                if(isBig)
                {

                    if(isTi>=3)//必须有3张盖的才算提
                    {

                        score+=12;
                    }
                    else{
                        score+=9;
                    }
                }
                else{
                    if(isTi>=3)
                    {

                        score+=9;
                    }
                    else{
                        score+=6;
                    }
                }


            }
            else if(arr.length==3)
            {
                var c1=arr[0];
                var c2=arr[1];
                var c3=arr[2];

                if(c1.type==c2.type&&c1.type==c3.type&&c1.value==c2.value&&c1.value==c3.value)
                {
                    if(c1.type==0)
                    {
                        if(c1.isBack==1||c2.isBack==1||c3.isBack==1)
                        {
                            score+=6;
                        }
                        else{
                            score+=3;
                        }
                    }
                    else{

                        if(c1.isBack==1||c2.isBack==1||c3.isBack==1)
                        {
                            score+=3;
                        }
                        else{
                            score+=1;
                        }
                    }

                }
                else if(c1.value==1||c2.value==1||c3.value==1)
                {


                    for(var k=0;k<3;k++)
                    {
                        var cc=arr[k];
                        if(cc.value==1)
                        {
                            for(var k2=0;k2<3;k2++) {
                                var cc2 = arr[k2];
                                if(cc2.value==2)
                                {
                                    for(var k3=0;k3<3;k3++) {
                                        var cc3 = arr[k3];
                                        if(cc3.value==3)
                                        {
                                            if(cc3.type==0)
                                            {
                                                score+=6;
                                            }
                                            else{
                                                score+=3;
                                            }

                                            break;
                                        }

                                    }
                                    break;
                                }

                            }
                            break;
                        }

                    }

                }
                else if(c1.value==2||c2.value==7||c3.value==10)
                {


                    for(var k=0;k<3;k++)
                    {
                        var cc=arr[k];
                        if(cc.value==2)
                        {
                            for(var k2=0;k2<3;k2++) {
                                var cc2 = arr[k2];
                                if(cc2.value==7)
                                {
                                    for(var k3=0;k3<3;k3++) {
                                        var cc3 = arr[k3];
                                        if(cc3.value==10)
                                        {
                                            if(cc3.type==0)
                                            {
                                                score+=6;
                                            }
                                            else{
                                                score+=3;
                                            }

                                            break;
                                        }

                                    }
                                    break;
                                }

                            }
                            break;
                        }

                    }

                }



            }



        }

        return score;
    }

    this.sortRoomUserCard=function () {


        var result=[];
        var hasChecked={};

        //检查4各
        var fourList=this.getFourGroup();
        if(fourList.length>0)
        {

            var aCount=fourList.length;
            for(var i=0;i<aCount;i++)
            {
                var list=fourList[i];
                var count=list.length;

                for(var j=0;j<count;j++)
                {

                    var cd=list[j];
                    hasChecked[cd.c_id]=cd;
                }
                result.push(list);


            }




        }
        //检查3个
        var arrList=this.getThreeGroup();
        if(arrList.length>0)
        {

            var aCount=arrList.length;
            for(var i=0;i<aCount;i++)
            {
                var list=arrList[i];
                var count=list.length;
                for(var j=0;j<count;j++)
                {
                    var cd=list[j];
                    hasChecked[cd.c_id]=cd;

                }

                result.push(list);

            }

        }

        var allCards=[];
        for(var c_id in this.cards1)
        {
            allCards.push(this.cards1[c_id]);
        }
        var r1=this.getCardByTypeValueInCards1(0,1);
        var size=r1.length;
        for(var i=0;i<size;i++)
        {
            var card=r1[i];
            if(hasChecked[card.c_id]!=undefined)
            {
                continue;
            }
            var arr1=this.getOneTwoThree(allCards,hasChecked,card);
            if(arr1.length>0)
            {
                for(var k=0;k<arr1.length;k++)
                {
                    var cd=arr1[k];

                    hasChecked[cd.c_id]=cd;

                }
                arr1.push(card);
                hasChecked[card.c_id]=card;

                result.push(arr1);
            }
            else{
                break;
            }

        }

        r1=this.getCardByTypeValueInCards1(1,1);
        size=r1.length;
        for(var i=0;i<size;i++)
        {
            var card=r1[i];
            if(hasChecked[card.c_id]!=undefined)
            {
                continue;
            }
            var arr1=this.getOneTwoThree(allCards,hasChecked,card);
            if(arr1.length>0)
            {
                for(var k=0;k<arr1.length;k++)
                {
                    var cd=arr1[k];

                    hasChecked[cd.c_id]=cd;

                }
                arr1.push(card);
                hasChecked[card.c_id]=card;

                result.push(arr1);
            }
            else{
                break;
            }

        }


        r1=this.getCardByTypeValueInCards1(0,2);
        size=r1.length;
        for(var i=0;i<size;i++)
        {
            var card=r1[i];
            if(hasChecked[card.c_id]!=undefined)
            {
                continue;
            }
            var arr1=this.getTwoSevenTen(allCards,hasChecked,card);
            if(arr1.length>0)
            {
                for(var k=0;k<arr1.length;k++)
                {
                    var cd=arr1[k];

                    hasChecked[cd.c_id]=cd;

                }
                arr1.push(card);
                hasChecked[card.c_id]=card;

                result.push(arr1);
            }
            else{
                break;
            }

        }

        r1=this.getCardByTypeValueInCards1(1,2);
        size=r1.length;
        for(var i=0;i<size;i++)
        {
            var card=r1[i];
            if(hasChecked[card.c_id]!=undefined)
            {
                continue;
            }
            var arr1=this.getTwoSevenTen(allCards,hasChecked,card);
            if(arr1.length>0)
            {
                for(var k=0;k<arr1.length;k++)
                {
                    var cd=arr1[k];

                    hasChecked[cd.c_id]=cd;

                }
                arr1.push(card);
                hasChecked[card.c_id]=card;

                result.push(arr1);
            }
            else{
                break;
            }

        }

        //大小三搭
        len=allCards.length;
        for(var i=0;i<len;i++)
        {
            var card1=allCards[i];

            if(hasChecked[card1.c_id]!=undefined)
            {
                continue;
            }

            var arr=[];


            var cArray=this.getArrayCardByTypeValue(allCards,card1.type,card1.value,hasChecked);
            var c2=this.getCardByTypeValue(allCards,this.getOtherType(card1.type),card1.value,hasChecked);
            if(cArray.length==2&&c2!=null)
            {

                arr.push(cArray[0]);
                arr.push(cArray[1]);
                arr.push(c2);
                result.push(arr);

                hasChecked[cArray[0].c_id]=cArray[0];
                hasChecked[cArray[1].c_id]=cArray[1];
                hasChecked[c2.c_id]=c2;

            }
            else{
                cArray=this.getArrayCardByTypeValue(allCards,this.getOtherType(card1.type),card1.value,hasChecked);
                if(cArray.length==2)
                {

                    arr.push(cArray[0]);
                    arr.push(cArray[1]);
                    arr.push(card1);
                    result.push(arr);

                    hasChecked[cArray[0].c_id]=cArray[0];
                    hasChecked[cArray[1].c_id]=cArray[1];
                    hasChecked[card1.c_id]=card1;

                }

            }




        }

        //顺子
        len=allCards.length;
        for(var i=0;i<len;i++)
        {
            var card1=allCards[i];

            if(hasChecked[card1.c_id]!=undefined)
            {
                continue;
            }

            var arr=[];
            flg=false;
            var c1=this.getCardByTypeValue(allCards,card1.type,card1.value+1,hasChecked);
            var c2=this.getCardByTypeValue(allCards,card1.type,card1.value+2,hasChecked);
            if(c1!=null&&c2!=null)
            {
                flg=true;
                arr.push(card1);
                arr.push(c1);
                arr.push(c2);

            }
            else{
                c1=this.getCardByTypeValue(allCards,card1.type,card1.value-1,hasChecked);
                c2=this.getCardByTypeValue(allCards,card1.type,card1.value+1,hasChecked);
                if(c1!=null&&c2!=null)
                {
                    flg=true;


                    arr.push(c1);
                    arr.push(card1);
                    arr.push(c2);
                }
                else{
                    c1=this.getCardByTypeValue(allCards,card1.type,card1.value-2,hasChecked);
                    c2=this.getCardByTypeValue(allCards,card1.type,card1.value-1,hasChecked);
                    if(c1!=null&&c2!=null)
                    {
                        flg=true;

                        arr.push(c1);
                        arr.push(c2);
                        arr.push(card1);
                    }
                }


            }


            if(flg)
            {

                result.push(arr);
                hasChecked[c1.c_id]=c1;
                hasChecked[c2.c_id]=c2;
                hasChecked[card1.c_id]=card1;
            }

        }

        //吊子
        var len=allCards.length;
        for(var i=0;i<len;i++) {
            var card1 = allCards[i];

            if (hasChecked[card1.c_id] != undefined) {
                continue;
            }
            var cArray = this.getArrayCardByTypeValue(allCards, card1.type, card1.value, hasChecked);
            if(cArray.length==2)
            {
                var ct1=cArray[0];
                var ct2=cArray[1];

                if(ct1!=card1&&ct2!=card1)
                {
                    cArray.splice(0,1);
                    cArray.push(card1);

                    hasChecked[ct2.c_id]=ct2;
                    hasChecked[card1.c_id]=card1;
                }
                else{
                    hasChecked[ct2.c_id]=ct2;
                    hasChecked[ct1.c_id]=ct1;
                }

                result.push(cArray);



            }

        }






        //半顺
        len=allCards.length;
        for(var i=0;i<len;i++)
        {
            var card1=allCards[i];

            if(hasChecked[card1.c_id]!=undefined)
            {
                continue;
            }

            var arr=[];
            flg=false;
            var c1=this.getCardByTypeValue(allCards,card1.type,card1.value+1,hasChecked);
            if(c1!=null)
            {
                flg=true;
                arr.push(card1);
                arr.push(c1);
            }
            else{
                c1=this.getCardByTypeValue(allCards,card1.type,card1.value-1,hasChecked);
                if(c1!=null)
                {
                    flg=true;
                    arr.push(c1);
                    arr.push(card1);
                }
            }

            if(flg)
            {
                result.push(arr);
                hasChecked[c1.c_id]=c1;
                hasChecked[card1.c_id]=card1;
            }

        }


        //其他
        var tike=0;
        var tmpArr=[];
        len=allCards.length;
        for(var i=0;i<len;i++) {
            var card1 = allCards[i];

            if (hasChecked[card1.c_id] != undefined) {
                continue;
            }
            hasChecked[card1.c_id]=card1;

            tmpArr.push(card1);
            tike++;
            if(tike%3==0)
            {
                result.push(tmpArr);
                tmpArr=[];
                tike=0;
            }
        }
        if(tmpArr.length>0)
        {
            result.push(tmpArr);
        }

        return result;


    }
    this.checkShouZhongHu=function (isSelf,touchCard) {//手中的户息

        var score=0;
       // var count_small_2=0;
      //  var count_big_2=0;

        // var flg1=false;
        // var flg2=false;
        // var flg3=false;
        // var flg4=false;

        var hasChecked={};

        //检查4各
        var fourList=this.getFourGroup();
        if(fourList.length>0)
        {

            var aCount=fourList.length;
            for(var i=0;i<aCount;i++)
            {
                var list=fourList[i];
                var count=list.length;
                var type=0;
                for(var j=0;j<count;j++)
                {

                    var cd=list[j];

                    hasChecked[cd.c_id]=cd;

                    type=cd.type;


                }

                if(type==0)
                {

                    if(isSelf)
                    {
                        score+=12;
                    }
                    else{
                        score+=9;
                    }

                }
                else{

                    if(isSelf)
                    {
                        score+=9;
                    }
                    else{
                        score+=6;
                    }
                }




            }




        }
        //检查3个
        var arrList=this.getThreeGroup();
        if(arrList.length>0)
        {

            var aCount=arrList.length;
            for(var i=0;i<aCount;i++)
            {
                var list=arrList[i];
                var count=list.length;
                var type=0;
                var isPeng=false;
                for(var j=0;j<count;j++)
                {
                    var cd=list[j];
                    hasChecked[cd.c_id]=cd;
                    type=cd.type;

                    if(touchCard!=null&&touchCard==cd&&(!isSelf))
                    {
                        isPeng=true;

                    }



                }

                if(type==0)
                {

                    if(isPeng)
                    {
                        score+=3;
                    }
                    else{
                        score+=6;
                    }


                }
                else{

                    if(isPeng)
                    {
                        score+=1;
                    }
                    else{
                        score+=3;
                    }
                }




            }




        }

        var allCards=[];
        for(var c_id in this.cards1)
        {
            allCards.push(this.cards1[c_id]);
        }
        var r1=this.getCardByTypeValueInCards1(0,1);
        var size=r1.length;
        for(var i=0;i<size;i++)
        {
            var card=r1[i];
            if(hasChecked[card.c_id]!=undefined)
            {
                continue;
            }
            var arr1=this.getOneTwoThree(allCards,hasChecked,card);
            if(arr1.length>0)
            {
                for(var k=0;k<arr1.length;k++)
                {
                    var cd=arr1[k];

                    hasChecked[cd.c_id]=cd;

                }
                hasChecked[card.c_id]=card;

                score+=6;
            }
            else{
                break;
            }

        }

        r1=this.getCardByTypeValueInCards1(1,1);
        size=r1.length;
        for(var i=0;i<size;i++)
        {
            var card=r1[i];
            if(hasChecked[card.c_id]!=undefined)
            {
                continue;
            }
            var arr1=this.getOneTwoThree(allCards,hasChecked,card);
            if(arr1.length>0)
            {
                for(var k=0;k<arr1.length;k++)
                {
                    var cd=arr1[k];

                    hasChecked[cd.c_id]=cd;

                }
                hasChecked[card.c_id]=card;

                score+=3;
            }
            else{
                break;
            }

        }


        r1=this.getCardByTypeValueInCards1(0,2);
        size=r1.length;
        for(var i=0;i<size;i++)
        {
            var card=r1[i];
            if(hasChecked[card.c_id]!=undefined)
            {
                continue;
            }
            var arr1=this.getTwoSevenTen(allCards,hasChecked,card);
            if(arr1.length>0)
            {
                for(var k=0;k<arr1.length;k++)
                {
                    var cd=arr1[k];

                    hasChecked[cd.c_id]=cd;

                }
                hasChecked[card.c_id]=card;

                score+=6;
            }
            else{
                break;
            }

        }

        r1=this.getCardByTypeValueInCards1(1,2);
        size=r1.length;
        for(var i=0;i<size;i++)
        {
            var card=r1[i];
            if(hasChecked[card.c_id]!=undefined)
            {
                continue;
            }
            var arr1=this.getTwoSevenTen(allCards,hasChecked,card);
            if(arr1.length>0)
            {
                for(var k=0;k<arr1.length;k++)
                {
                    var cd=arr1[k];

                    hasChecked[cd.c_id]=cd;

                }
                hasChecked[card.c_id]=card;

                score+=3;
            }
            else{
                break;
            }

        }


        this.shouZhongScore=score;

        return score;


    }
    this.getArrayCardByTypeValue=function (cards,type,value,hasChecked) {

        var array=[];
        var len=cards.length;
        for(var i=0;i<len;i++)
        {
            var c=cards[i];
            if(hasChecked[c.c_id]!=undefined)
            {
                continue;
            }
            if(c.type==type&&c.value==value)
            {
                array.push(c);
            }

        }

        return array;

    }
    this.getOtherType=function (type) {

        if(type==0)
        {
            return 1;
        }
        else{
            return 0;
        }
    }
    this.getCardByTypeValue=function (cards,type,value,hasChecked) {

        var len=cards.length;
        for(var i=0;i<len;i++)
        {
            var c=cards[i];
            if(hasChecked[c.c_id]!=undefined)
            {
                continue;
            }
            if(c.type==type&&c.value==value)
            {
                return c;
            }

        }

        return null;

    }

    this.getCardByTypeValue2=function (cards,type,value,hasChecked) {

        var arr=[];
        var len=cards.length;
        for(var i=0;i<len;i++)
        {
            var c=cards[i];
            if(hasChecked[c.c_id]!=undefined)
            {
                continue;
            }
            if(c.type==type&&c.value==value)
            {
                arr.push(c);
            }

        }

        return arr;

    }

    this.getShunZi=function (allCards,checkedCards,cd) {

        var result=[];
        var c1=this.getCardByTypeValue(allCards,cd.type,cd.value+1,checkedCards);
        if(c1!=null)
        {
            var c2=this.getCardByTypeValue(allCards,cd.type,cd.value+2,checkedCards);
            if(c2!=null)
            {
                var arr=[];
                arr.push(cd);
                arr.push(c1);
                arr.push(c2);

                result.push(arr);
            }
        }

        c1=this.getCardByTypeValue(allCards,cd.type,cd.value-1,checkedCards);
        if(c1!=null)
        {
            var c2=this.getCardByTypeValue(allCards,cd.type,cd.value+1,checkedCards);
            if(c2!=null)
            {
                var arr=[];
                arr.push(cd);
                arr.push(c1);
                arr.push(c2);

                result.push(arr);
            }
        }

        c1=this.getCardByTypeValue(allCards,cd.type,cd.value-2,checkedCards);
        if(c1!=null)
        {
            var c2=this.getCardByTypeValue(allCards,cd.type,cd.value-1,checkedCards);
            if(c2!=null)
            {
                var arr=[];
                arr.push(cd);
                arr.push(c1);
                arr.push(c2);

                result.push(arr);
            }
        }

        return result;


    }
    this.copyMap=function (from) {

        var arr={};
       for(var key in from)
        {
            arr[key]=from[key];

        }
        return arr;

    }
    this.getOneTwoThree=function (allCards,checkedCards,card) {

        var arr=[];

        if(card.value!=1&&card.value!=2&&card.value!=3)
        {
            return arr;
        }

        if(card.value==1)
        {
            var c1=this.getCardByTypeValue(allCards,card.type,2,checkedCards);
            if(c1==null)
            {
                return arr;
            }
            var c2=this.getCardByTypeValue(allCards,card.type,3,checkedCards);
            if(c2==null)
            {
                return arr;
            }
            arr.push(c1);
            arr.push(c2);

        }
        else if(card.value==2)
        {

            var c1=this.getCardByTypeValue(allCards,card.type,1,checkedCards);
            if(c1==null)
            {
                return arr;
            }
            var c2=this.getCardByTypeValue(allCards,card.type,3,checkedCards);
            if(c2==null)
            {
                return arr;
            }
            arr.push(c1);
            arr.push(c2);
        }
        else if(card.value==3)
        {
            var c1=this.getCardByTypeValue(allCards,card.type,1,checkedCards);
            if(c1==null)
            {
                return arr;
            }
            var c2=this.getCardByTypeValue(allCards,card.type,2,checkedCards);
            if(c2==null)
            {
                return arr;
            }
            arr.push(c1);
            arr.push(c2);

        }



        return arr;


    }
    this.getTwoSevenTen=function (allCards,checkedCards,card) {

        var arr=[];

        if(card.value!=2&&card.value!=7&&card.value!=10)
        {
            return arr;
        }

        if(card.value==2)
        {
            var c1=this.getCardByTypeValue(allCards,card.type,7,checkedCards);
            if(c1==null)
            {
                return arr;
            }
            var c2=this.getCardByTypeValue(allCards,card.type,10,checkedCards);
            if(c2==null)
            {
                return arr;
            }
            arr.push(c1);
            arr.push(c2);

        }
        else if(card.value==7)
        {

            var c1=this.getCardByTypeValue(allCards,card.type,2,checkedCards);
            if(c1==null)
            {
                return arr;
            }
            var c2=this.getCardByTypeValue(allCards,card.type,10,checkedCards);
            if(c2==null)
            {
                return arr;
            }
            arr.push(c1);
            arr.push(c2);
        }
        else if(card.value==10)
        {
            var c1=this.getCardByTypeValue(allCards,card.type,2,checkedCards);
            if(c1==null)
            {
                return arr;
            }
            var c2=this.getCardByTypeValue(allCards,card.type,7,checkedCards);
            if(c2==null)
            {
                return arr;
            }
            arr.push(c1);
            arr.push(c2);

        }

        return arr;


    }

    this.checkIsTingPai=function () {



        var result=[];

        for(var i=1;i<=10;i++)
        {

            this.cardIdCount++;
            var tmpCard=new Socket.Card();
            tmpCard.c_id=this.cardIdCount;
            tmpCard.value=i;
            tmpCard.type=0;
            tmpCard.isBack=0;

            var action=this.checkKeHu(tmpCard,false,true);

            if(action!=null)
            {
                result.push(tmpCard);
            }
        }



        for(var i=1;i<=10;i++)
        {
            resultArr=[];

            this.cardIdCount++;
            var tmpCard=new Socket.Card();
            tmpCard.c_id=this.cardIdCount;
            tmpCard.value=i;
            tmpCard.type=1;
            tmpCard.isBack=0;


            var action=this.checkKeHu(tmpCard,false,true);

            if(action!=null)
            {
                result.push(tmpCard);
            }

        }

        return result;

    }
    this.checkBizi4=function (allCards) {

        var checkedCards={};
        var allGroup=[];

        var len=allCards.length;
        for(var i=0;i<len;i++)
        {
            var card=allCards[i];

            var list=[];

            var shunziList=this.getShunZi(allCards,checkedCards,card);
            var count=shunziList.length;
            for(var j=0;j<count;j++)
            {
                //一个一个顺子检查
                var arr=shunziList[j];
                list.push(arr);

            }



            //编子
            var c1=this.getCardByTypeValue(allCards,card.type,card.value,checkedCards);
            var c2=this.getCardByTypeValue(allCards,this.getOtherType(card.type),card.value,checkedCards);
            if(c1!=null&&c2!=null)
            {
                var arr=[];
                arr.push(c1);
                arr.push(c2);
                arr.push(card);

                list.push(arr);

            }

            var  cArr= this.getArrayCardByTypeValue(allCards, this.getOtherType(card.type), card.value, checkedCards);
            if(cArr.length==2)
            {
                cArr.push(card);

                list.push(cArr);

            }


            //1/2/3
            var arr1=this.getOneTwoThree(allCards,checkedCards,card);
            if(arr1.length>0)
            {
                arr1.push(card);

                list.push(arr1);
            }

            //2/7/10
            var arr2=this.getTwoSevenTen(allCards,checkedCards,card);
            if(arr2.length>0)
            {
                arr2.push(card);

                list.push(arr2);
            }

            //对子
            var duizi=this.getCardByTypeValue(allCards,card.type,card.value,checkedCards)
            if(duizi!=null)
            {
                var arr=[];
                arr.push(duizi);
                arr.push(card);

                list.push(arr);

            }

            if(list.len<=0)
            {
                return false;
            }

            allGroup.push(list);

        }

        var resultAll=[];
        var groupArr=[];

        this.checkAllZuhe(allGroup,0,groupArr,resultAll);

        console.log("[总共组合数目:"+resultAll.length+"]");



    }
    
    this.checkAllZuhe=function (allGroup,index,groupArr,resultAll) {

        if(index>=allGroup.length)
        {
            var a=[];
            var size=groupArr.length;
            for(var i=0;i<size;i++)
            {
                var tmp=groupArr[i];
                a.push(tmp);

            }
            resultAll.push(a);
            return;
        }
        var groups=allGroup[index++];
        var count=groups.length;
        for(var i=0;i<count;i++)
        {
            var arr=groups[i];
            groupArr.push(arr);
            this.checkAllZuhe(allGroup,index,groupArr,resultAll);
            groupArr.splice(groupArr.length-1,1);
        }


    }

    this.chcekcBizi2=function (allCards,checkedCards,groupArr,depth,allGroups) {

        //console.log("****allCards:"+allCards.length+","+Object.keys(checkedCards).length);

        var len=allCards.length;
        for(var i=0;i<len;i++)
        {
            var card=allCards[i];
            if(checkedCards[card.c_id]!=undefined)
            {
                continue;
            }

            checkedCards[card.c_id]=card;

            var shunziList=this.getShunZi(allCards,checkedCards,card);
            var count=shunziList.length;
            for(var j=0;j<count;j++)
            {
                //一个一个顺子检查
                var arr=shunziList[j];

                var flg=this.checkIsBiZi3(allCards,checkedCards,arr,groupArr,depth+1,allGroups);
                if(flg)
                {
                   // return true;

                    groupArr.splice(groupArr.length-1,1);
                }
            }



            //编子
            var c1=this.getCardByTypeValue(allCards,card.type,card.value,checkedCards);
            var c2=this.getCardByTypeValue(allCards,this.getOtherType(card.type),card.value,checkedCards);
            if(c1!=null&&c2!=null)
            {
                var arr=[];
                arr.push(c1);
                arr.push(c2);
                arr.push(card);

                var flg=this.checkIsBiZi3(allCards,checkedCards,arr,groupArr,depth+1,allGroups);
                if(flg)
                {
                    //return true;

                    groupArr.splice(groupArr.length-1,1);
                }

            }

            var  cArr= this.getArrayCardByTypeValue(allCards, this.getOtherType(card.type), card.value, checkedCards);
            if(cArr.length==2)
            {
                cArr.push(card);
                var flg=this.checkIsBiZi3(allCards,checkedCards,cArr,groupArr,depth+1,allGroups);
                if(flg)
                {
                    //return true;

                    groupArr.splice(groupArr.length-1,1);
                }

            }
            else if(cArr.length==3)
            {

                cArr.splice(cArr.length-1,1);
                cArr.push(card);
                var flg=this.checkIsBiZi3(allCards,checkedCards,cArr,groupArr,depth+1,allGroups);
                if(flg)
                {
                    //return true;

                    groupArr.splice(groupArr.length-1,1);
                }

            }


            //1/2/3
            var arr1=this.getOneTwoThree(allCards,checkedCards,card);
            if(arr1.length>0)
            {
                arr1.push(card);
                var flg=this.checkIsBiZi3(allCards,checkedCards,arr1,groupArr,depth+1,allGroups);
                if(flg)
                {
                    //return true;

                    groupArr.splice(groupArr.length-1,1);
                }
            }

            //2/7/10
            var arr2=this.getTwoSevenTen(allCards,checkedCards,card);
            if(arr2.length>0)
            {
                arr2.push(card);
                var flg=this.checkIsBiZi3(allCards,checkedCards,arr2,groupArr,depth+1,allGroups);
                if(flg)
                {
                   // return true;

                    groupArr.splice(groupArr.length-1,1);
                }
            }

            //对子
            var duizi=this.getCardByTypeValue(allCards,card.type,card.value,checkedCards)
            if(duizi!=null)
            {
                var arr=[];
                arr.push(duizi);
                arr.push(card);

                var flg=this.checkIsBiZi3(allCards,checkedCards,arr,groupArr,depth+1,allGroups);
                if(flg)
                {
                    //return true;

                    groupArr.splice(groupArr.length-1,1);
                }

            }

           // console.log("最后剩下的card:"+card.type+","+card.value);

           return false;


        }


        var groupOne=[];
        var gCount=groupArr.length;
        for(var i=0;i<gCount;i++)
        {
            groupOne.push(groupArr[i]);
        }
        allGroups.push(groupOne);


        return true;



    }
    this.checkIsBiZi3=function (allCards,checkedCards,exceptArr,groupArr,depth,allGroups) {

        var hasChecked=this.copyMap(checkedCards);
        var count=exceptArr.length;
        var arr=[];
        var str="";
        for(var i=0;i<count;i++)
        {
            var c=exceptArr[i];
            hasChecked[c.c_id]=c;
            arr.push(c);

            //str+="(type:"+c.type+",value:"+c.value+")";
        }

        // var fg="";
        // for(var t=0;t<depth;t++)
        // {
        //     fg+="*";
        //
        // }

        //console.log(fg+str);

        groupArr.push(arr);

        var a=this.chcekcBizi2(allCards,hasChecked,groupArr,depth,allGroups);
        if(a)
        {
            return true;
        }
        else{
            groupArr.splice(groupArr.length-1,1);
        }

        return false;

    }
    this.checkIsBiZi=function (inputCards,outPutGroup,tableCard,cardFlg) {

       // console.log("剩余数目:"+this.leftCardInHand());
        if(this.leftCardInHand()<=0)
        {
            return true;
        }
        var fourArray=[];
        var threeArray=[];
        var shunziArray=[];
        var daxiaosandaArray=[];
        var towArray=[];
        var two_7_array=[];
        var shunzi2_array=[];
        var otherArray=[];


        var tmpArray=[];
        for(var key in inputCards)
        {
            tmpArray.push(inputCards[key]);
        }

        var groupArr=[];
        if(outPutGroup!=null)
        {
            groupArr=outPutGroup;
        }
        //三\四张检查
        var hasChecked={};
        len=tmpArray.length;


        var checkPoPaoHu=false;
      //  cc.log("[发牌数:"+len+"]");
        for(var i=0;i<len;i++)
        {
            var card1=tmpArray[i];


            var checkPoPaoHu2=false;
            
            if(hasChecked[card1.c_id]!=undefined)
            {
                continue;
            }



            var tmpList=[];
            for(var j=0;j<len;j++)
            {
                var card2=tmpArray[j];
                if(card2==card1)
                {
                    continue;
                }
                if(hasChecked[card2.c_id]!=undefined)
                {
                    continue;
                }
                if(card1.type==card2.type&&card1.value==card2.value)
                {
                    tmpList.push(card2);

                }
            }

            tmpList.push(card1);
            if(tmpList.length==4)
            {
                var arr=[];

                if(cardFlg)//如果是跑 则不组合跑,破跑胡检查
                {

                    for(var k=0;k<4;k++)
                    {
                        var c=tmpList[k];
                        if(c.c_id==tableCard.c_id)
                        {
                            checkPoPaoHu=true;
                            checkPoPaoHu2=true;
                            break;

                        }
                    }


                }
                if(!checkPoPaoHu2)
                {
                    for(var k=0;k<4;k++)
                    {
                        var c=tmpList[k];
                        arr.push(c);
                        hasChecked[c.c_id]=c;
                    }
                    groupArr.push(arr);
                }
                else{

                    for(var k=0;k<4;k++)
                    {
                        var c=tmpList[k];
                        if(c.c_id==tableCard.c_id)
                        {
                            console.log("破跑胡牌 不加入#1");
                        }
                        else{
                            arr.push(c);
                            hasChecked[c.c_id]=c;
                        }

                    }
                    groupArr.push(arr);
                }


            }
            else if(tmpList.length==3)
            {
                var arr=[];

                if(cardFlg)//如果是碰 则不组合跑,破碰 胡检查
                {

                    for(var k=0;k<3;k++)
                    {
                        var c=tmpList[k];
                        if(c.c_id==tableCard.c_id)
                        {
                            checkPoPaoHu=true;
                            checkPoPaoHu2=true;
                            break;

                        }
                    }


                }

                if(!checkPoPaoHu2)
                {
                    for(var k=0;k<3;k++)
                    {
                        var c=tmpList[k];
                        arr.push(c);
                        hasChecked[c.c_id]=c;
                    }

                    groupArr.push(arr);
                }




            }

        }

        if(cardFlg&&(!checkPoPaoHu))
        {

            return false;
        }
        else if(cardFlg)
        {
            console.log("破跑胡检查");
        }

        // for(var key in hasChecked)
        // {
        //     var c=hasChecked[key];
        //     console.log("*type:"+c.type+",value:"+c.value);
        //
        // }
        //console.log("tmpArray:"+tmpArray.length+",hasChecked:"+Object.keys(hasChecked).length);

        var allGroups=[];
        var tmpArr=[];
        var flg=this.chcekcBizi2(tmpArray,hasChecked,tmpArr,0,allGroups);

        var groupCount=allGroups.length;
        console.log("[成比子组数:"+groupCount+"]");

        flg=false;



        console.log("====================前置比子===================");
        var gCount2=groupArr.length;
        for(var i=0;i<gCount2;i++)
        {
            var ar=groupArr[i];
            var size=ar.length;
            var str="";
            str+="(";
            for(var j=0;j<size;j++)
            {
                var cc=ar[j];
                str+=""+cc.type+":"+cc.value+",";

            }
            str+=")";
            console.log(str);
        }
        console.log("==================================================");


        var lastGroup=null;
        var lastScore=0;

        for(var x=0;x<groupCount;x++)
        {

            var groupArr2=allGroups[x];
            //if(groupCount>0)
            {
                console.log("=====================第"+x+"组 bizi===================");

                var gCount=groupArr2.length;
                for(var i=0;i<gCount;i++)
                {
                    var ar=groupArr2[i];
                    var size=ar.length;
                    var str="";
                    str+="(";
                    for(var j=0;j<size;j++)
                    {
                        var cc=ar[j];
                        str+=""+cc.type+":"+cc.value+",";

                    }
                    str+=")";
                    console.log(str);
                }
                console.log("==================================================");

            }


            // if(flg)
            // {
            //     continue;
            // }
            //检查2个以上对子不可以胡
            var duiziCount=0;
            var fourCount=0;
            var gCount=groupArr2.length;
            for(var i=0;i<gCount;i++)
            {
                var ar=groupArr2[i];
                if(ar.length==2)
                {
                    duiziCount++;
                }
                else if(ar.length==4)
                {


                    fourCount++;
                }

            }

            if(this.room.roomType!=RoomDefine.ROOM_TYPE_BINZHOU&&this.room.roomType!=RoomDefine.ROOM_TYPE_LUZHOUDAER)
            {
                if((!this.firstFour)&&fourCount>=1)
                {
                    console.log("【只有第一次提或者跑可以胡!");
                    //return false;

                    continue;
                }
            }



            if(duiziCount>=2)
            {
                console.log("【对子2个或者2个以上不能胡!");
               // return false;
                continue;
            }

            flg=true;



            var currentGroup=[];

            gCount=groupArr.length;
            for(var i=0;i<gCount;i++)
            {

                currentGroup.push(groupArr[i]);

            }

            gCount=groupArr2.length;
            for(var i=0;i<gCount;i++)
            {

                currentGroup.push(groupArr2[i]);

            }

            var currentScore=this.checkScoreValue(currentGroup,tableCard);

            if(lastGroup==null)
            {
                lastGroup=currentGroup;
                lastScore=currentScore;
            }
            else{

                if(lastScore<currentScore)
                {
                    lastGroup=currentGroup;
                    lastScore=currentScore;
                }


            }








        }

        groupArr.splice(0,groupArr.length);
        if(lastGroup!=null)
        {
            var gCount2=lastGroup.length;
            for(var i=0;i<gCount2;i++)
            {
                groupArr.push(lastGroup[i]);

            }
        }
        else if(flg){
            console.log("错误 last group is null!!!!!!!!!!!!!");
        }



        return flg;

    }


    this.checkScoreValue=function (resultArr,tableCard) {

        var score=0;

        var rCount=resultArr.length;
        for(var i=0;i<rCount;i++)
        {
            var arr=resultArr[i];
            if(arr.length==4)//跑
            {
                var hasInputCard=false;

                if(tableCard!=null)
                {
                    var aLen=arr.length;
                    for(var j=0;j<aLen;j++)
                    {
                        var c=arr[j];
                        if(c.c_id==tableCard.c_id)
                        {
                            hasInputCard=true;
                            break;
                        }

                    }
                }

                if(hasInputCard)
                {
                    if(isSelf&&touchOrPut==RoomDefine.ROOM_TOUCH_CARD_TYPE)
                    {//提

                       // tableCard.isBack=1;

                        if(arr[0].type==0)
                        {
                            score+=12;
                        }
                        else{
                            score+=9;
                        }
                    }
                    else{
                        //跑
                        if(arr[0].type==0)
                        {
                            score+=9;
                        }
                        else{
                            score+=6;
                        }
                    }

                }
                else{
                    //提
                    if(arr[0].type==0)
                    {
                        score+=12;
                    }
                    else{
                        score+=9;
                    }

                }


            }
            else if(arr.length==3)
            {

                var count=arr.length;
                var type=0;
                var isPeng=false;
                var isWei=false;
                var c1=arr[0];
                var c2=arr[1];
                var c3=arr[2];

                if(arr[0].type==arr[1].type&&arr[0].value==arr[1].value&&arr[0].type==arr[2].type&&arr[0].value==arr[2].value)
                {
                    if(tableCard!=null)
                    {
                        if(arr[0].c_id==tableCard.c_id||arr[1].c_id==tableCard.c_id||arr[2].c_id==tableCard.c_id)
                        {
                            if(isSelf&&touchOrPut==RoomDefine.ROOM_TOUCH_CARD_TYPE)
                            {


                                isWei=true;

                               // tableCard.isBack=1;
                            }
                            else{
                                isPeng=true;
                            }

                        }
                    }

                    if(arr[0].type==0)
                    {

                        if(isPeng)
                        {
                            score+=3;
                        }
                        else{
                            score+=6;
                        }


                    }
                    else{

                        if(isPeng)
                        {
                            score+=1;
                        }
                        else{
                            score+=3;
                        }
                    }

                }
                else if(c1.value==1||c2.value==1||c3.value==1)
                {


                    for(var k=0;k<3;k++)
                    {
                        var cc=arr[k];
                        if(cc.value==1)
                        {
                            for(var k2=0;k2<3;k2++) {
                                var cc2 = arr[k2];
                                if(cc2.value==2)
                                {
                                    for(var k3=0;k3<3;k3++) {
                                        var cc3 = arr[k3];
                                        if(cc3.value==3)
                                        {
                                            if(cc3.type==0)
                                            {
                                                score+=6;
                                            }
                                            else{
                                                score+=3;
                                            }

                                            break;
                                        }

                                    }
                                    break;
                                }

                            }
                            break;
                        }

                    }

                }
                else if(c1.value==7||c2.value==7||c3.value==7)
                {


                    for(var k=0;k<3;k++)
                    {
                        var cc=arr[k];
                        if(cc.value==2)
                        {
                            for(var k2=0;k2<3;k2++) {
                                var cc2 = arr[k2];
                                if(cc2.value==7)
                                {
                                    for(var k3=0;k3<3;k3++) {
                                        var cc3 = arr[k3];
                                        if(cc3.value==10)
                                        {
                                            if(cc3.type==0)
                                            {
                                                score+=6;
                                            }
                                            else{
                                                score+=3;
                                            }

                                            break;
                                        }

                                    }
                                    break;
                                }

                            }
                            break;
                        }

                    }

                }



            }


        }//

        return score;

    }
    
    this.checkPengHu=function (action) {

        var delCards=[];
        var groupCards=action.groupCards;
        var len=groupCards.length;
        for(var i=0;i<len;i++)
        {
            var group=groupCards[i];
            var cards=group.cards;

            if(cards.length==3)
            {
                for(var j=0;j<3;j++)
                {
                    var card=cards[j];
                    if(this.cards1[card.c_id]!=undefined)
                    {
                        delCards.push(card);
                        delete this.cards1[card.c_id];
                    }

                }

            }
            else{
                console.log("碰胡检查错误############");
            }

            break;
        }


        var flg=false;
        // var checkAction=this.checkKeHu(null,false);
        // if(checkAction!=null)
        // {
        //     flg=true;
        // }

        var checkFlg=this.checkCanPutCard();
        if(checkFlg)
        {
            flg=false;
        }
        else{
            flg=true;
        }

        var count=delCards.length;
        for(var i=0;i<count;i++)
        {
            var c=delCards[i];
            this.cards1[c.c_id]=c;
        }

        return flg;
    }
    this.checkChiHu=function (action) {


        var groupCards=action.groupCards;
        var len=groupCards.length;
        var delGroup=[];
        for(var i=0;i<len;i++)
        {
            var group=groupCards[i];
            var cards=group.cards;

            var delCards=[];

            var size=cards.length;
            for(var j=0;j<size;j++)
            {
                var card=cards[j];

                if(this.cards1[card.c_id]!=undefined)
                {
                    delCards.push(card);
                    delete this.cards1[card.c_id];
                }

            }


            // var checkAction=this.checkKeHu(null,false);
            // if(checkAction!=null)
            // {
            //     delGroup.push(group);
            // }

            var checkFlg=this.checkCanPutCard();
            if(!checkFlg)
            {
                delGroup.push(group);
            }


            var count=delCards.length;
            for(var k=0;k<count;k++)
            {
                var c=delCards[k];
                this.cards1[c.c_id]=c;
            }

           
        }


        var gCount=delGroup.length;
        for(var i=0;i<gCount;i++)
        {
            var g=delGroup[i];
            var len=action.groupCards.length;
            for(var j=0;j<len;j++) {
                var group = action.groupCards[j];

                if(g==group)
                {
                    action.groupCards.splice(j,1);
                    break;
                }

            }


        }


        if(action.groupCards.length>0)
        {
            return false;
        }

        return true;
    }


    this.getRoomUserCardCaculateInfo=function (inputCard,isSelf,touchOrPut) {

        var tmpCards1={};
        var tmpCards2=[];

        for(var c_id in this.cards1)
        {

            tmpCards1[c_id]=this.cards1[c_id]
        }

        var len=this.cards2.length;
        for(var i=0;i<len;i++)
        {
            var arr=this.cards2[i];
            var size=arr.length;
            for(var j=0;j<size;j++)
            {
                var cc=arr[j];
                if(inputCard!=null&&cc.c_id==inputCard.c_id)
                {
                    inputCard=null;
                    console.log("inputCard set null!!!!");
                }

            }
            var count=arr.length;
            var tmpArr=[];
            for(var k=0;k<count;k++)
            {
                tmpArr.push(arr[k]);
            }
            tmpCards2.push(tmpArr);

        }
        var isInCards2=0;

        var tableCard=null;
        if(inputCard!=null) {

            tableCard=inputCard.clone();
            //=========================
            var hasAdd=false;
            var len=tmpCards2.length;
            for(var i=0;i<len;i++)
            {
                var arr=tmpCards2[i];
                var count=arr.length;
                if(count==3)
                {
                    var bFlg=true;
                    var isWei=false;

                    for(var j=0;j<count;j++)
                    {
                        var cd=arr[j];
                        if(cd.type!=tableCard.type||cd.value!=tableCard.value)
                        {
                            bFlg=false;
                            break;

                        }
                        if(cd.isBack==1)
                        {
                            isWei=true;
                        }

                    }
                    if(bFlg)
                    {
                        if(isWei)//偎 可以跑别人打出的牌,可以提 自己摸到的牌
                        {
                            if(isSelf&&touchOrPut==RoomDefine.ROOM_TOUCH_CARD_TYPE)
                            {
                                //提
                                tableCard.isBack=1;
                                isInCards2=1;

                                arr.push(tableCard);
                                hasAdd=true;

                                console.log("#1加入到cards2");
                            }
                            else{
                                //跑
                                isInCards2=2;

                                arr.push(tableCard);
                                hasAdd=true;

                                console.log("#2加入到cards2");
                            }

                        }
                        else{
                            //碰 只可以跑 摸到的牌
                            if(touchOrPut==RoomDefine.ROOM_TOUCH_CARD_TYPE)
                            {
                                isInCards2=2;

                                arr.push(tableCard);
                                hasAdd=true;

                                console.log("#3加入到cards2");
                            }

                        }
                        console.log("#摸到的牌,检查是否可胡,加入到cards2");



                        break;
                    }

                }


            }
            //===============================

            if(!hasAdd)
            {
                console.log("#摸到的牌,检查是否可胡,加入到cards1");
                tmpCards1[tableCard.c_id]=tableCard;

            }



        }


        var obj={};
        obj.tableScore=this.checkScore3(tmpCards2);
        obj.huScore=0;
        obj.isBizi=false;
        obj.cards1=[];
        obj.cards2=tmpCards2;

        var resultArr=[];
        var flg=false;


        if(tableCard!=null&&tmpCards1[tableCard.c_id]!=undefined)
        {
            flg=this.checkIsBiZi(tmpCards1,resultArr,null,false);

            if(!flg)//检查破跑胡
            {
                if(isSelf&&touchOrPut==RoomDefine.ROOM_TOUCH_CARD_TYPE)
                {
                    console.log("[自己摸到的牌 不检查破跑胡]");
                }
                else{
                    resultArr=[];
                    flg=this.checkIsBiZi(tmpCards1,resultArr,tableCard,true);
                }


            }
        }
        else{
            flg=this.checkIsBiZi(tmpCards1,resultArr,null,false);
        }
        if(!flg&&(isInCards2==2))
        {
            console.log("[桌面有跑,但是需要先检查手中时候胡]");
            resultArr=[];
            tmpCards1[tableCard.c_id]=tableCard;

            flg=this.checkIsBiZi(tmpCards1,resultArr,null,false);

            if(!flg)//检查破跑胡
            {
                if(isSelf&&touchOrPut==RoomDefine.ROOM_TOUCH_CARD_TYPE)
                {

                }
                else{
                    resultArr=[];
                    flg=this.checkIsBiZi(tmpCards1,resultArr,tableCard,true);
                }


            }

            if(flg)
            {
                var tCount=tmpCards2.length;
                for(var i=0;i<tCount;i++)
                {
                    var arr=tmpCards2[i];
                    var aCount=arr.length;
                    var hasSplice=false;
                    for(var j=0;j<aCount;j++)
                    {
                        var cc=arr[j];
                        if(cc.c_id==tableCard.c_id)
                        {
                            arr.splice(j,1);
                            hasSplice=true;
                            break;
                        }

                    }
                    if(hasSplice)
                    {
                        break;
                    }

                }

                obj.tableScore=this.checkScore3(tmpCards2);
                obj.cards2=tmpCards2;
            }

        }
        if(flg)
        {
            obj.isBizi=true;
            obj.cards1=resultArr;

            var rCount=resultArr.length;
            for(var i=0;i<rCount;i++)
            {
                var arr=resultArr[i];
                if(arr.length==4)//跑
                {
                    var hasInputCard=false;

                    if(tableCard!=null)
                    {
                        var aLen=arr.length;
                        for(var j=0;j<aLen;j++)
                        {
                            var c=arr[j];
                            if(c.c_id==tableCard.c_id)
                            {
                                hasInputCard=true;
                                break;
                            }

                        }
                    }

                    if(hasInputCard)
                    {
                        if(isSelf&&touchOrPut==RoomDefine.ROOM_TOUCH_CARD_TYPE)
                        {//提

                            tableCard.isBack=1;

                            if(arr[0].type==0)
                            {
                                obj.huScore+=12;
                            }
                            else{
                                obj.huScore+=9;
                            }
                        }
                        else{
                            //跑
                            if(arr[0].type==0)
                            {
                                obj.huScore+=9;
                            }
                            else{
                                obj.huScore+=6;
                            }
                        }

                    }
                    else{
                        //提
                        if(arr[0].type==0)
                        {
                            obj.huScore+=12;
                        }
                        else{
                            obj.huScore+=9;
                        }

                    }


                }
                else if(arr.length==3)
                {

                    var count=arr.length;
                    var type=0;
                    var isPeng=false;
                    var isWei=false;
                    var c1=arr[0];
                    var c2=arr[1];
                    var c3=arr[2];

                    if(arr[0].type==arr[1].type&&arr[0].value==arr[1].value&&arr[0].type==arr[2].type&&arr[0].value==arr[2].value)
                    {
                        if(tableCard!=null)
                        {
                            if(arr[0].c_id==tableCard.c_id||arr[1].c_id==tableCard.c_id||arr[2].c_id==tableCard.c_id)
                            {
                                if(isSelf&&touchOrPut==RoomDefine.ROOM_TOUCH_CARD_TYPE)
                                {


                                    isWei=true;

                                    tableCard.isBack=1;
                                }
                                else{
                                    isPeng=true;
                                }

                            }
                        }

                        if(arr[0].type==0)
                        {

                            if(isPeng)
                            {
                                obj.huScore+=3;
                            }
                            else{
                                obj.huScore+=6;
                            }


                        }
                        else{

                            if(isPeng)
                            {
                                obj.huScore+=1;
                            }
                            else{
                                obj.huScore+=3;
                            }
                        }

                    }
                    else if(c1.value==1||c2.value==1||c3.value==1)
                    {


                        for(var k=0;k<3;k++)
                        {
                            var cc=arr[k];
                            if(cc.value==1)
                            {
                                for(var k2=0;k2<3;k2++) {
                                    var cc2 = arr[k2];
                                    if(cc2.value==2)
                                    {
                                        for(var k3=0;k3<3;k3++) {
                                            var cc3 = arr[k3];
                                            if(cc3.value==3)
                                            {
                                                if(cc3.type==0)
                                                {
                                                    obj.huScore+=6;
                                                }
                                                else{
                                                    obj.huScore+=3;
                                                }

                                                break;
                                            }

                                        }
                                        break;
                                    }

                                }
                                break;
                            }

                        }

                    }
                    else if(c1.value==7||c2.value==7||c3.value==7)
                    {


                        for(var k=0;k<3;k++)
                        {
                            var cc=arr[k];
                            if(cc.value==2)
                            {
                                for(var k2=0;k2<3;k2++) {
                                    var cc2 = arr[k2];
                                    if(cc2.value==7)
                                    {
                                        for(var k3=0;k3<3;k3++) {
                                            var cc3 = arr[k3];
                                            if(cc3.value==10)
                                            {
                                                if(cc3.type==0)
                                                {
                                                    obj.huScore+=6;
                                                }
                                                else{
                                                    obj.huScore+=3;
                                                }

                                                break;
                                            }

                                        }
                                        break;
                                    }

                                }
                                break;
                            }

                        }

                    }



                }


            }//


        }


        return obj;

    }

    this.checkKeHu2=function (card,isSelf,touchOrPut) {

        //检查无胡,3拢4坎,黑摆

        var action=null;
        var obj=this.getRoomUserCardCaculateInfo(card,isSelf,touchOrPut);

        console.log("[checkKeHu2 桌面胡息:"+obj.tableScore+",胡-胡息:"+obj.huScore+",手中胡息"+shouZhongScore+"]");
        if(obj.isBizi)
        {

            if((obj.tableScore+obj.huScore)==0&&this.room.roomType==RoomDefine.ROOM_TYPE_LUZHOUDAER)
            {
                //泸州大贰 无胡
                action=new Socket.Action();
                action.type=RoomDefine.ACTION_KEHU;
                action.type2=7;
                var groupCard=new Socket.GroupCard();
                action.groupCards.push(groupCard);

                console.log("[roomId:"+this.room.roomId+",无胡]");
            }
            else{
                console.log("[不满足"+this.qiHuValue+"胡]");
            }

        }
        else if(this.room.roomType==RoomDefine.ROOM_TYPE_LUZHOUDAER)
        {
            if(card!=null)
            {
                this.cards1[card.c_id]=card;
            }


            //检查是否有 3拢4坎,
            var fourArr=this.getFourGroup();
            if(fourArr.length>=3)
            {
                action=new Socket.Action();
                action.type=RoomDefine.ACTION_KEHU;
                action.type2=8;//8:3拢4坎,9:黑摆
                var groupCard=new Socket.GroupCard();
                action.groupCards.push(groupCard);

                console.log("[3拢牌,可胡]");
                return action;
            }
            var threeArr=this.getThreeGroup();
            if(threeArr.length>=4)
            {
                action=new Socket.Action();
                action.type=RoomDefine.ACTION_KEHU;
                action.type2=8;//8:3拢4坎,9:黑摆
                var groupCard=new Socket.GroupCard();
                action.groupCards.push(groupCard);

                console.log("[4坎牌,可胡]");

                return action;

            }

            //黑摆 手中无红牌
            var counts=this.getRedCardCount();
            var readCount=counts[0];
            var maxCount=counts[1];
            if(readCount==0)
            {
                action=new Socket.Action();
                action.type=RoomDefine.ACTION_KEHU;
                action.type2=9;//8:3拢4坎,9:黑摆
                var groupCard=new Socket.GroupCard();
                action.groupCards.push(groupCard);

                console.log("[黑摆,可胡]");

                return action;

            }

            if(card!=null)
            {
                delete this.cards1[card.c_id];
            }


        }


        return action;


    }

    this.checkKeHu=function (card,isSelf,touchOrPut) {

        //检查是否为 碰转跑 或者 偎转提
        var bFlg=false;

        var tmpArr=null;


        var shouZhongScore=0;//this.checkShouZhongHu(isSelf,card);


        var action=null;
        var obj=this.getRoomUserCardCaculateInfo(card,isSelf,touchOrPut);

        console.log("[桌面胡息:"+obj.tableScore+",胡-胡息:"+obj.huScore+",手中胡息"+shouZhongScore+"]");
        if(obj.isBizi)
        {


            if((obj.tableScore+obj.huScore)>=this.qiHuValue)
            {
                action=new Socket.Action();
                action.type=RoomDefine.ACTION_KEHU;
                var groupCard=new Socket.GroupCard();
                action.groupCards.push(groupCard);
            }
            else{
                console.log("[不满足"+this.qiHuValue+"胡]");
            }

        }


        return action;


    }

    this.checkHasHuCardGroup=function (card) {


        var action=null;
        var cardsTmp=[];
        if(card!=null)
        {
            for(var key in this.cards1)
            {
                var c=this.cards1[key];
                if(c.type==card.type&&c.value==card.value)
                {
                    cardsTmp.push(c);
                }

            }


        }

        if(cardsTmp.length>0)
        {
            var size=cardsTmp.length;
            for(var i=0;i<size;i++)
            {
                var c=cardsTmp[i];
                delete this.cards1[c.c_id];

            }

        }

        //var shouZhongScore=this.checkShouZhongHu();
        //检查是否满足10胡
        //if((this.score2+shouZhongScore)>=RoomDefine.CAN_HU_COUNT)
        {
            //检查手中牌是否成比子
            if(this.checkIsBiZi(this.cards1,null,null,false))
            {
                var action=new Socket.Action();
                action.type=RoomDefine.ACTION_KEHU;
                var groupCard=new Socket.GroupCard();
                action.groupCards.push(groupCard);


            }

        }

        if(cardsTmp.length>0)
        {
            var size=cardsTmp.length;
            for(var i=0;i<size;i++)
            {
                var c=cardsTmp[i];
                this.cards1[c.c_id]=c;

            }

        }

        return action;


    }

    //获取红色牌数
    this.getRedCardCount=function () {
        var count=0;
        var maxCount=0;
        for(var c_id in this.cards1)
        {
            var c=this.cards1[c_id];
            if(c.value==2||c.value==7||c.value==10)
            {
                count++;
            }
            maxCount++;

        }

        var cards2=this.cards2;
        var cCount=cards2.length;
        for(var i=0;i<cCount;i++) {
            var arr = cards2[i];
            var len=arr.length;
            for(var j=0;j<len;j++)
            {
                var c=arr[j];
                if(c.value==2||c.value==7||c.value==10)
                {
                    count++;
                }
                maxCount++;
            }

        }

        var list=[];
        list.push(count);
        list.push(maxCount);

        return list;

    }


    this.getCardByTypeValueInCards1=function (type,value) {
        var cards=[];
        for(var c_id in this.cards1)
        {
            var c=this.cards1[c_id];
            if(c.type==type&&c.value==value)
            {
                cards.push(c);
            }

        }
        return cards;

    }
    this.getCardByTypeValueInCards1Except=function (type,value,hasAdd) {
        var cards=[];
        for(var c_id in this.cards1)
        {
            var c=this.cards1[c_id];
            if(c.type==type&&c.value==value&&hasAdd[c.c_id]==undefined)
            {
                cards.push(c);
            }

        }
        return cards;

    }
    this.getCardByIdInCards1=function (cardId) {

        for(var c_id in this.cards1)
        {
            var c=this.cards1[c_id];
            if(c.c_id==cardId)
            {
              return c;
            }

        }
        return null;
    }

}
var Room=function () {

    this.roomUsers={};
    this.roomId=0;
    this.state=RoomDefine.ROOM_WAIT_START_STATE;
    this.flowNo=-1;
    this.rule=1;//0:一胡一息,1:三胡一息,2:五胡一息
    this.gameCount=100;//8,10,20,100局(百胡结束)
    this.maxCount=100;
    this.choushui=0;//0,1,2
    this.playerCount=3;
    this.showInfoFlg=0;//1:ip,2:gps,3:ip 和 gps
    this.fangfei=0;//0:均摊房费,1:标准房费,2:代开房费
    this.jiadi=1;//0:不加底,1:加底
    this.fengding=32;//封顶数目
    this.roomType=0;
    this.qita=0;

    //泸州大贰
    this.zimofanbeo=1;//0:无,1:自摸翻倍
    this.fangpaobaopei=1;//0:无,1:放炮包赔
    this.gui=1;//0:无,1:归

    this.cards=[];
    this.tableTopObj={};
    this.tableTopObj.card=null;
    this.tableTopObj.uid="";//谁摸出的牌
    this.lastTableObj=null;
    this.uid="";//创建者ID
    this.currentPutCardUID="";
    this.cardIndex=0;
    this.canSelectedUserAction={};
    this.operateQueue=[];
    this.touchUserIndex=0;
    this.ackQueue=[];
    this.lastZhuangUid=null;
    this.overUserId=null;
    this.playGameCount=0;
    this.startDate=null;
    this.disMissWaitTime=0;
    this.roomHistoryFlows=[];
    this.roomInfoNotify=null;
    this.roomHistoryFinishedNotify=[];
    this.qiHuValue=RoomDefine.CAN_HU_COUNT;
    this.flowsIdCount=0;
    this.waitRequest=[];
    this.zhuangjiaFirstCard=null;
    this.juArr=[];
    this.hasPlayCount=0;
    this.expireFlows={};
    this.roomFlowsGroup=[];

    this.touchCardCount=0;//发完牌,第几张摸牌,用来判断水上漂

    this.appendExpireFlows=function (flowsId) {

        this.expireFlows[flowsId]=flowsId;
    }
    this.isExpireFlows=function (flowsId) {

        if(this.expireFlows[flowsId]==undefined)
        {
            return false;
        }

        return true;
    }
    this.hasNoResponseNotifyFlow=function () {


        for(var uid in this.roomUsers)
        {
            var user=this.roomUsers[uid];
            var count=user.roomUser.notifyFlows.length;
            if(count>0)
            {
                return true;
            }

        }


        return false;
    }
    
    this.hasNoResponseNotifyFlowUser=function (uid) {


        var user=this.roomUsers[uid];
        var count=user.roomUser.notifyFlows.length;
        if(count>0)
        {
            return true;
        }

        return false;
    }

    this.isAllReady=function () {

        for(var uid in this.roomUsers)
        {
            var user=this.roomUsers[uid];
            if(user.roomUser.isReady==1)
            {
                return false;
            }

        }

        return true;

    },

    this.appendHistoryFlows=function (flows) {

        var hasFinished=false;

        var len=flows.length;
        for(var i=0;i<len;i++)
        {
            var flow=flows[i];
            var flow2=flow.clone();
            this.roomHistoryFlows.push(flow2);


        }

        if(flows.finished!=undefined&&flows.finished>0)
        {
            var arr=[];
            var flowsCount=this.roomHistoryFlows.length;
            for(var i=0;i<flowsCount;i++)
            {
                arr.push(this.roomHistoryFlows[i]);
            }
            this.roomHistoryFlows=[];
            this.roomFlowsGroup.push(arr);
        }


    }
    this.appendRoomHistoryFinishedNotify=function (finishedNotify) {

      //  var gameFinish=finishedNotify.clone();
        this.hasPlayCount++;

        if(this.hasPlayCount>this.playGameCount)
        {
            return;
        }
        this.roomHistoryFinishedNotify.push(finishedNotify);

        var obj={};
        obj.gameCount=this.hasPlayCount;
        obj.players=[];

        var users=this.getRoomUsers();
        for(var uid in users) {
            var user = users[uid];
            var roomUser = user.roomUser;

            var obj2={};
            obj2.zonghuxi=roomUser.zonghuxi;
            obj2.dunshu=roomUser.dunshu;
            obj2.dunshu2=roomUser.dunshu2;
            obj2.huxi=roomUser.huxi;
            obj2.uid=uid;
            obj2.name=user.name;
            obj.players.push(obj2);
        }

        this.juArr.push(obj);


    }

    this.setGameOverUserId=function (uid) {
        this.overUserId=uid;
    }
    this.pushAckObj=function (obj) {

        this.ackQueue.push(obj);
    }
    this.popAckObj=function () {
        if(this.ackQueue.length>0)
        {
            var obj=this.ackQueue[0];
            this.ackQueue.splice(0,1);
            return obj;
        }
        return null;

    }
    this.hasNextAckObj=function () {

        return (this.ackQueue.length>0);
    }
    this.checkIsRoomInAckState=function()
    {
        return (this.state==RoomDefine.ROOM_WAIT_ACK_STATE);
    }
    this.setTouchUserIndex=function (index) {
        this.touchUserIndex=index;
    }
    this.getRoomInfo=function () {
        var roomInfo=new Socket.RoomInfo();
        roomInfo.roomId=this.roomId+"";
        roomInfo.leftCount=this.gameCount;
        roomInfo.uid=this.uid;
        roomInfo.choushui=this.choushui;
        roomInfo.renshu=this.playerCount;
        roomInfo.gongneng=this.showInfoFlg;
        roomInfo.gunze=this.rule;

        return roomInfo;
    }
    this.clearOperateQueue=function () {
        this.operateQueue=[];
    }
    this.pushOperateQueue=function (uid,type,cardIds,flowsId) {

        this.pushOperateQueue2(uid,type,cardIds,0,flowsId);
    }
    this.pushOperateQueue2=function (uid,type,cardIds,waitReason,flowsId) {
        var obj={};
        obj.uid=uid;
        obj.type=type;
        obj.cardIds=cardIds;
        obj.waitReason=waitReason;//0:无理由,//1:等待碰,//2:等待摸得玩家吃,3:等待胡
        obj.flows_id=flowsId;
        this.operateQueue.push(obj);
    }

    this.operateQueueCount=function () {
        return this.operateQueue.length;
    }
    this.clearCanSelectedUserAction=function () {
        this.canSelectedUserAction={};

        for(var uid in this.roomUsers) {
            var user = this.roomUsers[uid];
            user.roomUser.waitSelected=false;
        }

    }
    this.appendCanSelectedUserAction=function (uid,action) {

        action.isDrop=false;
        var arr=this.canSelectedUserAction[uid];
        if(arr==undefined)
        {
            arr=[];
            arr.push(action);
            this.canSelectedUserAction[uid]=arr;
        }
        else {

            arr.push(action);
        }
        var user=this.getUserByUid(uid);
        user.roomUser.waitSelected=true;


    }
    this.dropCanSelectedUserAction=function (uid) {

        var arr= this.canSelectedUserAction[uid];
        if(arr!=undefined)
        {
            var len=arr.length;
            for(var i=0;i<len;i++)
            {
                var action=arr[i];
                action.isDrop=true;
            }
        }
    }
    this.dropCanSelectedUserActionByType=function (uid,type) {

        var arr= this.canSelectedUserAction[uid];
        if(arr!=undefined)
        {
            var len=arr.length;
            for(var i=0;i<len;i++)
            {
                var action=arr[i];
                if(action.type==type)
                {
                    action.isDrop=true;
                    break;
                }

            }
        }
    }
    this.canSelectedUserActionCount=function () {

        var count=0;
        for(var uid in this.canSelectedUserAction)
        {
            var arr=this.canSelectedUserAction[uid];

            var len=arr.length;
            for(var i=0;i<len;i++)
            {
                var action=arr[i];
                if(!action.isDrop)
                {
                    count++;

                }
            }

        }

        return count;
    }
    this.canSelectedUserActionCount2=function () {

        var count=0;
        for(var uid in this.canSelectedUserAction)
        {
            var arr=this.canSelectedUserAction[uid];

            var len=arr.length;
            for(var i=0;i<len;i++)
            {
                var action=arr[i];
                if(!action.isDrop&&action.type!=RoomDefine.ACTION_TI&&action.type!=RoomDefine.ACTION_TI2&&action.type!=RoomDefine.ACTION_PAO&&action.type!=RoomDefine.ACTION_PAO2&&action.type!=RoomDefine.ACTION_WEI)
                {
                    count++;

                }
            }

        }

        return count;
    }
    
    this.printCanSelectedUserAction=function () {

        console.log("==============start====================");
        for(var uid in this.canSelectedUserAction)
        {
            var arr=this.canSelectedUserAction[uid];
            var user=this.getUserByUid(uid);
            console.log("uid:"+uid+",name:"+user.name+",actionCount:"+arr.length);

        }
        console.log("===============end===================");

    }
    this.checkHasActionInCanSelected=function (noUid,type) {

        for(var uid in this.canSelectedUserAction)
        {
            if(uid==noUid)
            {
                continue;
            }
            var arr=this.canSelectedUserAction[uid];
            var len=arr.length;
            for(var i=0;i<len;i++)
            {
                var action=arr[i];
                if(action.isDrop)
                {
                    continue;
                }
                if(action.type==type)
                {
                    return true;
                }

            }

        }

        return false;

    }
    this.checkHasActionInCanSelected2=function (type) {

        for(var uid in this.canSelectedUserAction)
        {

            var arr=this.canSelectedUserAction[uid];
            var len=arr.length;
            for(var i=0;i<len;i++)
            {
                var action=arr[i];
                if(action.isDrop)
                {
                    continue;
                }
                if(action.type==type)
                {
                    return true;
                }

            }

        }

        return false;

    }
    this.getActionInCanSelected=function (uid,type) {

        var arr=this.canSelectedUserAction[uid];
        if(arr==undefined)
        {
            return null;
        }
        var len=arr.length;
        for(var i=0;i<len;i++)
        {
            var action=arr[i];
            if(action.isDrop)
            {
                continue;
            }
            if(action.type==type)
            {
                return action;
            }

        }

        return null;

    }
    this.getActionInCanSelected2=function (uid,type) {//包括drop掉的

        var arr=this.canSelectedUserAction[uid];
        if(arr==undefined)
        {
            return null;
        }
        var len=arr.length;
        for(var i=0;i<len;i++)
        {
            var action=arr[i];
            // if(action.isDrop)
            // {
            //     continue;
            // }
            if(action.type==type)
            {
                return action;
            }

        }

        return null;

    }
    this.getCardById=function (roomUser,cardId) {
        var card=roomUser.getCardByIdInCards1(cardId);
        if(card==null)
        {
            if(this.tableTopObj.card.c_id==cardId)
            {
                card=this.tableTopObj.card;
            }

        }
        return card;
    }
    this.setCurrentCardOnTableTop=function (uid,card,touchOrPut) {
        this.tableTopObj.uid=uid;
        this.tableTopObj.card=card;
        this.tableTopObj.touchOrPut=touchOrPut;//0:put,1:touch
        this.tableTopObj.count++;
    }
    
    this.clear=function () {

        this.tableTopObj.count=0;
        this.zhuangjiaFirstCard=null;
    }

    this.setPutCardUid=function (putCardUid) {
        
        this.currentPutCardUID=putCardUid;
    }
    this.isPutCard=function (uid) {

        return (this.currentPutCardUID==uid);
    }
    this.joinRoom=function (user) {
        var u= this.roomUsers[user.uid];
        if(u!=undefined)
        {
            user.roomUser=u.roomUser;
            this.roomUsers[user.uid]=user;
            user.roomUser.isOnline=true;
            user.roomUser.setTuoGuan(false);
        }
        else{
            this.appendUser(user);
            user.roomUser.isOnline=true;
            user.roomUser.setTuoGuan(false);
        }
        user.roomUser.room=this;
        user.room=this;
        user.roomUser.clearNofityFlows();

       // user.roomUser.score1=100;

        //
        if(RoomDefine.isTest==1)
        {
            // // //测试
            if(user.roomUser.index==0)
            {
                this.cardIdCount=0;
                var arr1=[];
                arr1.push(this.createTestCard(1,4,0));
                arr1.push(this.createTestCard(1,4,1));
                arr1.push(this.createTestCard(1,4,1));
                user.roomUser.cards2.push(arr1);

                this.setCards1Test(user,1,2);
                this.setCards1Test(user,1,3);

            }
            else if(user.roomUser.index==1)
            {

            }
            else{

                this.clear();

                var arr1=[];
                arr1.push(this.createTestCard(0,5,0));
                arr1.push(this.createTestCard(0,5,1));
                arr1.push(this.createTestCard(0,5,1));
                user.roomUser.cards2.push(arr1);

                var arr2=[];
                arr2.push(this.createTestCard(0,6,0));
                arr2.push(this.createTestCard(0,6,1));
                arr2.push(this.createTestCard(0,6,1));
                arr2.push(this.createTestCard(0,6,1));
                user.roomUser.cards2.push(arr2);

                this.setCards1Test(user,1,2);
                this.setCards1Test(user,1,2);
               //this.setCards1Test(user,1,4);

                this.setCards1Test(user,1,3);
                this.setCards1Test(user,1,3);

                this.cards.push(this.createTestCard(1,3,0));

            }





            //this.setCards1Test(user,0,3);
           // this.setCards1Test(user,0,3);
            //this.setCards1Test(user,1,3);


            // var c=this.createTestCard(1,6,0);
            //
            // var obj=user.roomUser.getRoomUserCardCaculateInfo(c,false);
            // console.log("[桌面胡息:"+obj.tableScore+",胡-胡息:"+obj.huScore+"]");
            // if(obj.isBizi)
            // {
            //     console.log("胡");
            // }
            // else{
            //     console.log("非胡");
            // }
        }

    }
    //===========test======================
    this.setCards1Test=function (user,type,value) {
        var card=this.createTestCard(type,value,0);
        user.roomUser.cards1[card.c_id]=card;
    }
    this.createTestCard=function (type,value,isBack) {
        var card=new Socket.Card();
        card.c_id=this.cardIdCount++;
        card.value=value;
        card.type=type;
        card.isBack=isBack;
        return card;
    }
    //================================
    this.appendUser=function (user) {
        //检查未使用座位
        var pos=-1;

       // console.log("this.playerCount:"+this.playerCount);
        if(this.playerCount==RoomDefine.POS_3_PLAYER)//3人座
        {
            for(var i=0;i<3;i++)
            {
                var flg=true;
                for(var uid in this.roomUsers) {
                    var ru = this.roomUsers[uid];
                    if(ru.roomUser.index==i)
                    {
                        flg=false;
                        break;
                    }

                }
                //console.log("roomUsersroomUsersroomUsers:"+Object.keys());
                if(flg)
                {
                    pos=i;
                    break;
                }

            }
        }
        else//4人
        {
            for(var i=0;i<4;i++)
            {
                var flg=true;
                for(var uid in this.roomUsers) {
                    var ru = this.roomUsers[uid];
                    if(ru.roomUser.index==i)
                    {
                        flg=false;
                        break;
                    }

                }

                if(flg)
                {
                    pos=i;
                    break;
                }

            }
        }


        this.roomUsers[user.uid]=user;
        //var len=Object.keys(this.roomUsers).length;
        var roomUser=new RoomUser();
        roomUser.index=pos;
        user.roomUser=roomUser;
    }
    this.removeUser=function (uid) {

        delete this.roomUsers[uid];
    }
    this.getUserByIndex=function (index) {
        if(index>=this.playerCount)
        {
            console.log("[不存在此座次:"+index+"的玩家]");
            return null;
        }
        for(var uid in this.roomUsers)
        {
            var user=this.roomUsers[uid];
            var roomUser=user.roomUser;
            if(roomUser.index==index)
            {
                return user;
            }

        }

        return null;

    }
    this.getNextUserByUidNoXian=function (userId) {//获取非闲的下一个玩家

        var index=-1;
        for(var uid in this.roomUsers)
        {
            var user=this.roomUsers[uid];
            var roomUser=user.roomUser;
            if(uid==userId)
            {
                index=roomUser.index;
                break;
            }

        }

        if(index!=-1)
        {
            index+=1;

            if(index>=this.playerCount)
            {
                index=0;
            }
            var u=this.getUserByIndex(index);


                if(u.roomUser.type==RoomDefine.XIANJIA_TYPE)
                {
                    index+=1;
                    if(index>=this.playerCount)
                    {
                        index=0;
                    }
                    var u=this.getUserByIndex(index);
                    return u;
                }
                else{
                    return u;
                }


            

        }


        return null;

    }

    // getUserCountInRoom=function () {
    //
    //     return Object.keys(this.roomUsers).length;
    // }
    this.getUserByUid=function (uid) {

        for(var uid2 in this.roomUsers)
        {
            var user=this.roomUsers[uid2];
            if(user.uid==uid)
            {
                return user;
            }

        }

        return null;

    }
    this.checkHasJoinAll=function () {

        var len=Object.keys(this.roomUsers).length;
        if(len>= this.playerCount)
        {
            return true;
        }

        return false;

    }
    this.getRoomUsers=function () {

        return this.roomUsers;
    }
    this.hasNextCard=function () {

        var len=this.cards.length;
        if(this.cardIndex<len)
        {
            return true;
        }

        return false;
    }
    this.nextCard=function () {

        var len=this.cards.length;
        if(this.cardIndex<len)
        {
            var card=this.cards[this.cardIndex];
            card.flg=0;
            this.cardIndex++;

            if(this.cardIndex==62)
            {
                //计算水上漂的牌
                card.isShuiShangPiao=1;

            }
            return card;
        }

        return null;
    }
    this.leftCard=function () {

        return (this.cards.length-this.cardIndex);
    }
    this.dispatchCard=function () {//分发牌

        var len=this.cards.length;
        console.log("[总牌数:"+len+"]");


        for(var uid in this.roomUsers)
        {
            var user=this.roomUsers[uid];
            var roomUser=user.roomUser;

            var maxCount=20;
            if(this.roomType!=RoomDefine.ROOM_TYPE_BINZHOU)
            {
                if(roomUser.type==RoomDefine.XIANJIA_TYPE)
                {
                    continue;
                }
            }
            else{
                if(this.playerCount==4)
                {
                    maxCount=14;//郴州字牌 4人玩法发14张牌
                }

            }


            var count=0;
            if(roomUser.type==RoomDefine.ZHUANGJIA_TYPE)
            {
                //maxCount=21;
            }

            for(;this.cardIndex<len&&count<maxCount;this.cardIndex++)
            {
                var card=this.cards[this.cardIndex];
                // console.log("count:"+count+","+card.c_id);
                roomUser.cards1[card.c_id]=card;
                count++;

                card.flg=1;

                // if(this.cardIndex==20)
                // {
                //     console.log("@name:"+user.name+","+card.type+","+card.value);
                // }
            }

        }

    }

    this.clearCard_test=function () {
        this.a1=[];
        this.a2=[];
        this.a3=[];
        this.b=[];
        if(this.cardIdCount==undefined)
        {
            this.cardIdCount=0;
        }
        this.cardIndex=0;
    }
    this.appendUserCard_test=function (pos,type,value) {

        var card=new Socket.Card();
        card.c_id=this.cardIdCount++;
        card.value=value;
        card.type=type;
        if(pos==1)
        {

            this.a1.push(card);
        }
        else if(pos==2)
        {
            this.a2.push(card);
        }
        else if(pos==3)
        {
            this.a3.push(card);
        }

        
    }
    this.appendLeftCard_test=function (type,value) {

        var card=new Socket.Card();
        card.c_id=this.cardIdCount++;
        card.value=value;
        card.type=type;
        this.b.push(card);

    }
    this.fillLeftCard_test=function (pos) {

        var tmpCards=[];
        for(var i=1;i<=8;i++)
        {
            for(var j=0;j<10;j++)
            {
                this.cardIdCount++;
                var card=new Socket.Card();
                card.c_id=this.cardIdCount;
                card.value=j+1;
                if(i%2==0)
                {
                    card.type=1;
                }
                else{
                    card.type=0;
                }
                tmpCards.push(card);
            }

        }

        var len1=this.a1.length;
        for(var i=0;i<len1;i++)
        {
           var c=this.a1[i];
            var count=tmpCards.length;
            for(var j=0;j<count;j++)
            {
                var c2=tmpCards[j];
                if(c2.type==c.type&&c2.value==c.value)
                {
                    tmpCards.splice(j,1);
                    break;
                }

            }

        }
        len1=this.a2.length;
        for(var i=0;i<len1;i++)
        {
            var c=this.a2[i];
            var count=tmpCards.length;
            for(var j=0;j<count;j++)
            {
                var c2=tmpCards[j];
                if(c2.type==c.type&&c2.value==c.value)
                {
                    tmpCards.splice(j,1);
                    break;
                }

            }

        }

        len1=this.a3.length;
        for(var i=0;i<len1;i++)
        {
            var c=this.a3[i];
            var count=tmpCards.length;
            for(var j=0;j<count;j++)
            {
                var c2=tmpCards[j];
                if(c2.type==c.type&&c2.value==c.value)
                {
                    tmpCards.splice(j,1);
                    break;
                }

            }

        }

        len1=this.b.length;
        for(var i=0;i<len1;i++)
        {
            var c=this.b[i];
            var count=tmpCards.length;
            for(var j=0;j<count;j++)
            {
                var c2=tmpCards[j];
                if(c2.type==c.type&&c2.value==c.value)
                {
                    tmpCards.splice(j,1);
                    break;
                }

            }

        }
        tmpCards.sort(function(){ return 0.5 - Math.random() });

        var index=0;
        len1=this.a1.length;
        for(var i=0;i<len1;i++)
        {
            this.cards.push(this.a1[i]);

            console.log("this.cards1:"+this.cards.length);


        }

        var maxSize=20;
        if(pos==1)
        {
            //maxSize=21;

        }

        var size=maxSize-this.a1.length;

       // console.log("#########:"+size+","+maxSize+","+this.a1.length);
        for(var j=0;j<size;j++)
        {
            this.cards.push(tmpCards[index++]);
        }


        len1=this.a2.length;
        for(var i=0;i<len1;i++)
        {
            this.cards.push(this.a2[i]);

            console.log("this.cards 2:"+this.cards.length);



        }
        maxSize=20;
        if(pos==2)
        {
           // maxSize=21;

        }
        size=maxSize-this.a2.length;
        for(var j=0;j<size;j++)
        {
            this.cards.push(tmpCards[index++]);
        }


        len1=this.a3.length;
        for(var i=0;i<len1;i++)
        {
            this.cards.push(this.a3[i]);

            var maxSize=20;
            if(pos==3)
            {
               // maxSize=21;

            }


        }
        maxSize=20;
        if(pos==2)
        {
           // maxSize=21;

        }
        size=maxSize-this.a3.length;
        for(var j=0;j<size;j++)
        {
            this.cards.push(tmpCards[index++]);
        }


        len1=this.b.length;
        for(var i=0;i<len1;i++)
        {
            this.cards.push(this.b[i]);

        }

        while(index<tmpCards.length)
        {
            this.cards.push(tmpCards[index++]);
        }

    }
    this.resetCards=function () {

        this.cardIndex=0;
        if(this.cardIdCount==undefined)
        {
            this.cardIdCount=0;
        }


        var len=this.cards.length;
        if(len<=0)
        {

            for(var i=1;i<=8;i++)
            {
                for(var j=0;j<10;j++)
                {
                    this.cardIdCount++;
                    var card=new Socket.Card();
                    card.c_id=this.cardIdCount;
                    card.value=j+1;
                    if(i%2==0)
                    {
                        card.type=1;//0:大写,1:小写
                    }
                    else{
                        card.type=0;
                    }
                    this.cards.push(card);
                }

            }


        }

        for(var i=0;i<len;i++)//初始化一些数据
        {
            var card=this.cards[i];
            card.flg=0;//0:普通,1:开局发到的牌
            card.isBack=0;//0:正面,1:反面
            card.flg2=0;
            card.flg3=0;
        }

        this.cards.sort(function(){ return 0.5 - Math.random() });




    }
    this.checkHasInWei=function (card,uid) {

        var allUser=this.getRoomUsers();
        for(var key in allUser)
        {
            var u=allUser[key];
            if(u.uid==uid)
            {
                continue;
            }
            var roomU=u.roomUser;
            var cards2=roomU.cards2;
            var cCount=cards2.length;

            for(var i=0;i<cCount;i++)
            {
                var arr=cards2[i];
                if(arr.length==3)
                {
                    var c1=arr[0];
                    var c2=arr[1];
                    var c3=arr[2];
                    if(c1.isBack==1||c2.isBack==1||c3.isBack==1)
                    {
                        if(c1.type==card.type&&c1.value==card.value)
                        {
                            //检查玩家出完牌是否听牌

                            return true;
                        }



                    }



                }

            }


        }

        return false;
    }
    this.randomPopCardFromUser=function (roomUser) {

        //检查是否有玩家偎起牌
        var arr=[];
        for(var c_id in roomUser.cards1)
        {
            arr.push(roomUser.cards1[c_id]);

        }
        arr.sort(function(){ return 0.5 - Math.random() });

        var selectedCard=null;
        var index=0;
        var flg=true;
        var len=arr.length;
        var isInWeiCard=null;

        while(len>0)
        {
            var card=arr[index];
            var list=roomUser.getCardByTypeValueInCards1(card.type,card.value);
            if(list.length<3)
            {
                if((!this.checkHasInWei(card,roomUser.uid)))
                {
                    selectedCard=card;
                    break;
                }
                else{
                    console.log("[有偎的牌,不可以随机出这张,type:"+card.type+",value:"+card.value+"]");
                    isInWeiCard=card;
                }
            }

            index++;
            if(index>=len)
            {
                break;
            }
        }

        if(selectedCard==null&&isInWeiCard!=null)
        {
            selectedCard=isInWeiCard;
        }

        if(selectedCard!=null)
        {
            delete roomUser.cards1[selectedCard.c_id];
            return selectedCard;
        }


    }
    // this.addHu=function (user,huCount) {
    //     var roomUser=user.roomUser;
    //     roomUser.score2+=huCount;
    //     var val=0;
    //     if(this.rule==0)//0:一胡一息,1:三胡一息,2:五胡一息
    //     {
    //         val=roomUser.score2;
    //     }
    //     else if(this.rule==1)
    //     {
    //         val=roomUser.score2/3;
    //     }
    //     else if(this.rule==2)
    //     {
    //         val=roomUser.score2/5;
    //     }
    //     user.score=roomUser.score+val;
    // }

    //
    
    this.setRoomState=function (roomState) {
        this.state=roomState;
    }
    this.setAckState=function (roomState) {

        // this.state=RoomDefine.ROOM_WAIT_ACK_STATE;
        // this.ackNextState=roomState;
        // this.waitAckTime=new Date().getTime();

        this.state=roomState;

    }
    this.setDisMissState=function (res) {

        this.disMissObj={};
        this.disMissObj.dismissLastState=this.state;
        this.disMissObj.res=res;
        this.state=RoomDefine.ROOM_DISMISS_STATE;

    }
    this.setFlowNomber=function (nomber) {
        this.flowNo=nomber;
    }
    this.isRoomState=function (roomState) {

        return this.state==roomState;
    }

    this.fillRoomInfoNotify=function () {

        this.roomInfoNotify=new Socket.RoomInfoNotify();
        var roomInfo=new Socket.RoomInfo();
        this.roomInfoNotify.roomInfo=roomInfo;
        roomInfo.roomId=this.roomId+"";
        roomInfo.leftCount=this.gameCount;
        roomInfo.uid=this.uid;
        roomInfo.choushui=this.choushui;
        roomInfo.renshu=this.playerCount;
        roomInfo.gongneng=this.showInfoFlg;
        roomInfo.gunze=this.rule;
        roomInfo.roomType=this.roomType;
        roomInfo.time=new Date().Format("yyyy/MM/dd hh:mm:ss");
        roomInfo.qita=this.qita;

        var allUsersInRoom=this.getRoomUsers();
        for(var key in allUsersInRoom)
        {
            var u=allUsersInRoom[key];
            var roomUserInfo=new Socket.RoomUserInfo();
            roomUserInfo.index=u.roomUser.index;
            roomUserInfo.user=u;
            roomUserInfo.type=u.roomUser.type;
            roomUserInfo.isOnline=1;
            roomInfo.roomUsers.push(roomUserInfo);
        }


    }
    this.close=function () {

        if(this.roomInfoNotify!=null)
        {

            var byteBuffer=new ByteBuffer()
            byteBuffer.initBlank();

            var byteBuffer2=new ByteBuffer()
            byteBuffer2.initBlank();

            this.roomInfoNotify.write(byteBuffer2);

            byteBuffer.putShort(byteBuffer2.count);
            byteBuffer.appendByteBuffer(byteBuffer2);

            console.log("byteBuffer count#1#:"+byteBuffer2.count);

            var byteBuffer3=new ByteBuffer()
            byteBuffer3.initBlank();

            var len2=this.roomHistoryFinishedNotify.length;
            byteBuffer3.putShort(len2);
            for(var i=0;i<len2;i++)
            {
                var finshNotify=this.roomHistoryFinishedNotify[i];
                finshNotify.write(byteBuffer3);
            }
            byteBuffer.putShort(byteBuffer3.count);
            byteBuffer.appendByteBuffer(byteBuffer3);


            var byteBufferFlows=new ByteBuffer()
            byteBufferFlows.initBlank();

            var flowGroupCount=this.roomFlowsGroup.length;

            //总共几局
            byteBuffer.putShort(flowGroupCount);

            var flowAllCount=0;
            for(var i=0;i<flowGroupCount;i++)
            {
                var flowArr=this.roomFlowsGroup[i];
                var byteLen=0;
                var flowCount=flowArr.length;
                for(var j=0;j<flowCount;j++)
                {
                    var flow=flowArr[j];

                    var byteBuffer4=new ByteBuffer()
                    byteBuffer4.initBlank();
                    flow.write(byteBuffer4);

                    byteBufferFlows.putShort(byteBuffer4.count);
                    byteBufferFlows.appendByteBuffer(byteBuffer4);

                    byteLen+=2;
                    byteLen+=byteBuffer4.count;

                    flowAllCount++;
                }

                //if(byteLen>0)
                {
                    console.log("[第"+(i+1)+"局大小:"+byteLen+"]");
                    byteBuffer.putInt32(byteLen);
                    byteBuffer.putShort(flowCount);
                }

            }

            byteBuffer.putShort(flowAllCount);
            byteBuffer.appendByteBuffer(byteBufferFlows);

            // var len=this.roomHistoryFlows.length;
            // byteBuffer.putShort(len);
            //
            // for(var i=0;i<len;i++)
            // {
            //     var flow=this.roomHistoryFlows[i];
            //
            //     var byteBuffer4=new ByteBuffer()
            //     byteBuffer4.initBlank();
            //     flow.write(byteBuffer4);
            //
            //     byteBuffer.putShort(byteBuffer4.count);
            //     byteBuffer.appendByteBuffer(byteBuffer4);
            // }



            console.log("byteBuffer count#2#:"+byteBuffer.count);

            var n=parseInt(Math.random()*3+5);
            var code="";
            for(var i=0;i<n;i++)
            {
                code+=parseInt(Math.random()*9);

            }
            var fileName=GameInfo.getInstance().playHistoryDir+"/"+code+".bin";
            console.log("[房间:"+this.roomId+",数据回放大小:"+byteBuffer.count+",code:"+code+"]");
            fs.writeFile(fileName,new Buffer(byteBuffer.buffer),function(err){
                if(err)
                {
                    console.log("[写入文件错误]");
                }

            });

            for(var uid in this.roomUsers)
            {
                var user=this.roomUsers[uid];
                var roomUser=user.roomUser;
                var zhanji={};



                zhanji.time=this.startDate;
                zhanji.time2=new Date().Format("yyyy/MM/dd hh:mm");
                zhanji.jushu=this.playGameCount;
                zhanji.renshu=this.playerCount;
                zhanji.hushu=roomUser.score1;
                zhanji.uid=uid;
                zhanji.code=code;
                zhanji.ju=this.juArr;
                zhanji.roomType=this.roomType;

                Mongo.DaoManager.getInstance().appendZhanji(zhanji,function (state) {

                    if(state!=0)
                    {
                        console.log("[战绩存储失败,uid:"+uid+"]");
                    }

                });




            }


        }








    }

}

module.exports = Room;
