/**
 * Created by yungu on 16/12/20.
 */
var RoomManager=require('./RoomManager');
var Room=require('./Room');
var Socket=require("./socket");
var FlowDefine=require("./FlowDefine");
var RoomDefine=require("./RoomDefine");
var MsgManager=require("./MsgManager");
var UserManager=require("./UserManager");
var GameInfo=require('./GameInfo');

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

String.prototype.startWith=function(str){
    if(str==null||str==""||this.length==0||str.length>this.length)
        return false;
    if(this.substr(0,str.length)==str)
        return true;
    else
        return false;
    return true;
}
var GameLogic_BinZhou=function () {

    this.app=null;

    this.run=function () {
        setTimeout(this.logic.bind(this), 500);
    }

    this.logic=function () {
        setTimeout(this.logic.bind(this), 500);

        var offLineRoom=[];
        var rooms=RoomManager.getInstance().rooms;
        for(var roomId in rooms)
        {
            var room=rooms[roomId];
            if(room.roomType!=RoomDefine.ROOM_TYPE_BINZHOU)
            {
                continue;
            }
            if(room.state==RoomDefine.ROOM_WAIT_START_STATE)
            {
                //检查是否开局,人数是否到齐,是否准备好.

                //console.log("Object.keys(this.roomUsers).length:"+Object.keys(room.roomUsers).length);
                if(room.checkHasJoinAll()&&room.isAllReady())
                {

                    if(room.playerCount==3)
                    {
                        room.qiHuValue=9;
                    }
                    else if(room.playerCount==4){

                        room.qiHuValue=3;
                    }
                    room.setRoomState(RoomDefine.ROOM_ACTION_STATE);
                    room.setFlowNomber(FlowDefine.START_NO);
                    room.startDate=new Date().Format("yyyy/MM/dd hh:mm");
                    room.fillRoomInfoNotify();//记录历史回放用
                    var res3=new Socket.FlushRoomNotify();
                    //扣除元宝
                    var users=room.getRoomUsers();
                    for(var uid in users) {
                        var u=users[uid];

                        u.roomUser.qiHuValue=room.qiHuValue;

                        if(uid==room.uid)
                        {
                            UserManager.getInstance().subGold(uid,room.needGold);
                        }

                        var roleInfoNotify=new Socket.RoleInfoNotify();
                        roleInfoNotify.user=u;
                        MsgManager.getInstance().sendTo(user,Socket.MsgNumber.ROLEINFO_NOTIFY,roleInfoNotify);


                        var roomUserInfo=new Socket.RoomUserInfo();
                        roomUserInfo.index=u.roomUser.index;
                        roomUserInfo.user=u;
                        roomUserInfo.type=u.roomUser.type;
                        if(u.roomUser.isOnline)
                        {
                            roomUserInfo.isOnline=1;
                        }
                        else{
                            roomUserInfo.isOnline=0;
                        }
                        res3.roomUsers.push(roomUserInfo)

                    }
                    console.log("[游戏人数凑齐,扣除元宝,推送更新]");
                    MsgManager.getInstance().sendToRoomUser(room,Socket.MsgNumber.FLUSH_ROOM_NOTIFY,res3);

                }


            }
            var isOffLine=true;
            var room_users=room.getRoomUsers();
            for(var uid in room_users) {
                var user = room_users[uid];
                var roomUser = user.roomUser;

                var notifyFlows=roomUser.notifyFlows;
                var notifyCount=notifyFlows.length;

                if(roomUser.isOnline)
                {
                   // isOffLine=false;

                    //检查用户是否收到之前的流程
                    if(notifyCount>0)
                    {
                        var notifyObj=notifyFlows[0];
                        notifyObj.waitTime+=0.5;
                        if(notifyObj.waitTime>10)
                        {
                            //10s 用户还未收到则重新发送
                            MsgManager.getInstance().sendTo(user,Socket.MsgNumber.FLOWS_NOTIFY,notifyObj.notify);
                            notifyObj.waitTime=0;//重新计时

                            console.log("[房间:"+room.roomId+",用户:"+user.name+",流程超时间,重新发送!]");
                        }

                    }

                }
                else{
                    if(notifyCount>0)
                    {
                        console.log("[用户下线,清除历史流程]");
                        roomUser.clearNofityFlows();
                    }

                }




            }
            if(isOffLine)
            {
                //console.log("[房间玩家全部下线:"+roomId+"]");
                // offLineRoom.push(roomId);
                // continue;
            }

            if(room.state==RoomDefine.ROOM_WAIT_START_STATE)
            {
                continue;
            }

            switch(room.state)
            {
                case RoomDefine.ROOM_WAIT_START_STATE:
                {

                }
                    break;
                case RoomDefine.ROOM_ACTION_STATE:
                {
                    var flowsNotify=new Socket.FlowsNotify();
                    flowsNotify.flows_id=room.flowsIdCount++;
                    var flows=[];
                    flows.finished=0;
                    
                    flowsNotify.flows=flows;
                    this.logicFlow(room.flowNo,room,flows);
                    if(flowsNotify.flows.length>0)
                    {
                        console.log("flowsNotify.flows.length:"+flowsNotify.flows.length);
                        room.appendHistoryFlows(flows);
                       // MsgManager.getInstance().sendToRoomUser(room,Socket.MsgNumber.FLOWS_NOTIFY,flowsNotify);

                        room.currentFlowsId=flowsNotify.flows_id;

                        
                        //每个用户记录发送的流程
                        var room_users=room.getRoomUsers();
                        for(var uid in room_users) {
                            var user = room_users[uid];
                            var roomUser = user.roomUser;

                            if(roomUser.notifyFlowsCount()>0)
                            {

                            }
                            else{
                                MsgManager.getInstance().sendTo(user,Socket.MsgNumber.FLOWS_NOTIFY,flowsNotify);
                            }

                            roomUser.appendNotifyFlows(flowsNotify);
                        }
                    }

                }
                    break;
                case RoomDefine.ROOM_WAIT_PUT_CARD_STATE:
                {



                    var currentTime=new Date().getTime();
                    var t=(currentTime-room.startTime)/1000;

                    if(t>=20)
                    {

                        //出牌超时间
                        var users=room.getRoomUsers();
                        for(var uid in users) {
                            var user = users[uid];
                            var roomUser=user.roomUser;

                            if(RoomDefine.NO_WAIT_TIMEOUT==1)
                            {
                                if(!uid.startWith("@"))
                                {
                                    continue;
                                }
                            }

                            if(room.isPutCard(uid))
                            {
                                //自动选择一张牌出
                                var card=null;
                                // if(RoomDefine.isTest==1)
                                // {
                                //     var cards=roomUser.getCardByTypeValueInCards1(1,2);
                                //     card=cards[0];
                                //    // console.log("name:"+user.name+",card:"+card);
                                //     roomUser.moveTo(card,this.cards1,null);//移动牌
                                // }
                                // else{
                                //card=roomUser.randomPopCard();
                                // }
                                card=room.randomPopCardFromUser(roomUser);

                                console.log("[超时自动出牌]");
                                room.setCurrentCardOnTableTop(uid,card,RoomDefine.ROOM_PUT_CARD_TYPE);
                                room.setRoomState(RoomDefine.ROOM_ACTION_STATE);
                                room.setFlowNomber(FlowDefine.PUT_CARD_NO);

                                var res=new Socket.PutCardResponse();
                                res.state=0;
                                MsgManager.getInstance().sendToRoomUser(room,Socket.MsgNumber.PUT_CARD_RESPONSE,res);


                                break;
                            }
                        }



                    }
                    else{
                        var r=Math.random()*10+2;
                        if(t>r)
                        {

                            //检查是否有托管用户
                            var users=room.getRoomUsers();
                            for(var uid in users) {
                                var user = users[uid];
                                var roomUser = user.roomUser;

                                if(RoomDefine.NO_WAIT_TIMEOUT==1)
                                {
                                    if(!uid.startWith("@"))
                                    {
                                        continue;
                                    }
                                }

                                if(room.isPutCard(uid)&&roomUser.isTuoGuan==1)
                                {
                                    console.log("托管出牌");

                                    // var card=roomUser.randomPopCard();
                                    var card=room.randomPopCardFromUser(roomUser);

                                    room.setCurrentCardOnTableTop(uid,card,RoomDefine.ROOM_PUT_CARD_TYPE);
                                    room.setRoomState(RoomDefine.ROOM_ACTION_STATE);
                                    room.setFlowNomber(FlowDefine.PUT_CARD_NO);

                                    var res=new Socket.PutCardResponse();
                                    res.state=0;
                                    MsgManager.getInstance().sendToRoomUser(room,Socket.MsgNumber.PUT_CARD_RESPONSE,res);

                                    break;
                                }

                            }

                        }
                    }


                }
                    break;
                case RoomDefine.ROOM_WAIT_SELECTED_STATE:
                {


                    //检查是否结束计时,玩家全部放弃操作
                    //if(room.canSelectedUserActionCount()==0)
                    var queue=room.operateQueue;
                    var queueLen=queue.length;
                    var hasFlg=false;


                    if(queueLen>0)//0:碰,1:吃,2:胡
                    {
                        var flg=false;

                        var opr=null;

                        //先检查是否有胡
                        for(var i=0;i<queueLen;i++)
                        {
                            var oper=queue[i];
                            if(oper.type==2)
                            {
                                opr=oper;
                                break;
                            }


                        }

                        if(opr!=null)
                        {
                            //检查上家是否已经不 胡 了
                            var hasShangJiaHu=false;

                            var actionHu=room.getActionInCanSelected(room.tableTopObj.uid,RoomDefine.ACTION_KEHU);
                            if(actionHu==null)
                            {
                                actionHu=room.getActionInCanSelected(room.tableTopObj.uid,RoomDefine.ACTION_KEHU2);
                            }
                            if(actionHu!=null)
                            {
                                console.log("等待上家先胡#.........");
                                hasShangJiaHu=true;
                            }
                            else
                            {
                                var nextUser=room.getNextUserByUidNoXian(room.tableTopObj.uid);
                                if(nextUser.uid==opr.uid)
                                {


                                }
                                else{

                                    var actionHu2=room.getActionInCanSelected(nextUser.uid,RoomDefine.ACTION_KEHU);
                                    if(actionHu2==null)
                                    {
                                        actionHu2=room.getActionInCanSelected(nextUser.uid,RoomDefine.ACTION_KEHU2);
                                    }
                                    if(actionHu2!=null)
                                    {
                                        console.log("等待上家先胡.........");
                                        hasShangJiaHu=true;
                                    }


                                }
                            }

                            if(!hasShangJiaHu)
                            {
                                flg=true;
                            }
                        }
                        else{

                            //先检查碰
                            for(var i=0;i<queueLen;i++)
                            {
                                var oper=queue[i];
                                if(oper.type==0)
                                {
                                    opr=oper;
                                    break;
                                }


                            }

                            //  if((!room.checkHasActionInCanSelected(opr.uid,RoomDefine.ACTION_KEHU))&&(!room.checkHasActionInCanSelected(opr.uid,RoomDefine.ACTION_KEHU2)))
                            {

                                if(opr!=null)
                                {
                                    //检查是否还有 胡 没有胡 则碰

                                    if((!room.checkHasActionInCanSelected(opr.uid,RoomDefine.ACTION_KEHU))&&(!room.checkHasActionInCanSelected(opr.uid,RoomDefine.ACTION_KEHU2)))
                                    {
                                        console.log("[已经没有胡了,可以执行碰了]");
                                        flg=true;

                                    }


                                }
                                else{
                                    // if(!room.checkHasActionInCanSelected(opr.uid,RoomDefine.ACTION_KEPENG))
                                    {
                                        //先检查吃
                                        for(var i=0;i<queueLen;i++)
                                        {
                                            var oper=queue[i];
                                            if(oper.type==1)
                                            {

                                                if((!room.checkHasActionInCanSelected(oper.uid,RoomDefine.ACTION_KEHU))&&(!room.checkHasActionInCanSelected(oper.uid,RoomDefine.ACTION_KEHU2)))
                                                {
                                                    if(!room.checkHasActionInCanSelected(oper.uid,RoomDefine.ACTION_KEPENG))
                                                    {
                                                        //检查是否出牌这本人,本人先吃
                                                        if(oper.uid==room.tableTopObj.uid)
                                                        {
                                                            opr=oper;
                                                            flg=true;

                                                            console.log("[发牌者先吃]");

                                                            break;

                                                        }
                                                        else{
                                                            var ac=room.getActionInCanSelected(room.tableTopObj.uid,RoomDefine.ACTION_KECHI);
                                                            if(ac==null)
                                                            {

                                                                opr=oper;
                                                                flg=true;
                                                                console.log("[发牌者不吃了,可以执行吃了]");

                                                                break;
                                                            }


                                                        }
                                                    }

                                                }



                                            }


                                        }
                                    }

                                }

                            }


                        }










                        if(flg)
                        {

                            room.clearOperateQueue();
                            room.pushOperateQueue(opr.uid,opr.type,opr.cardIds);

                            hasFlg=true;

                            room.setRoomState(RoomDefine.ROOM_ACTION_STATE);
                            if(opr.type==0)//0:碰,1:吃,2:胡
                            {
                                room.setFlowNomber(FlowDefine.PENG_NO);
                            }
                            else if(opr.type==1)
                            {
                                room.setFlowNomber(FlowDefine.CHI_NO);
                            }
                            else if(opr.type==2)
                            {
                                room.setFlowNomber(FlowDefine.HU_NO);
                            }


                            var user=room.getUserByUid(opr.uid);
                            user.roomUser.removeChouChi(room.tableTopObj.card);
                            user.roomUser.removeChouPeng(room.tableTopObj.card);


                            var res=new Socket.OperateCardResponse();
                            res.state=0;
                            MsgManager.getInstance().sendToAckRoomUser(room,Socket.MsgNumber.OPERATE_CARD_RESPONSE,res,room.currentFlowsId);
                       
                        }

                        //  var hasChiAction=false;
                        // //检查是否有等待吃的
                        // var operQueue=room.operateQueue;
                        // var operCount=operQueue.length;
                        // for(var oIndex=0;oIndex<operCount;oIndex++)
                        // {
                        //     var obj=operQueue[oIndex];
                        //     if(obj.type==1)////0:碰,1:吃,2:胡
                        //     {
                        //
                        //        // user.roomUser.removeChouPeng(room.tableTopObj.card);
                        //
                        //         break;
                        //     }
                        //
                        //
                        // }



                        // if(!hasChiAction)
                        // {
                        //     room.setRoomState(RoomDefine.ROOM_ACTION_STATE);
                        //     room.setFlowNomber(FlowDefine.TAKE_IN_AND_TOUCH);
                        // }

                    }

                    if(!hasFlg)
                    {
                        if(room.canSelectedUserActionCount2()==0)
                        {
                            console.log("无可等待选择action");
                            // room.setRoomState(RoomDefine.ROOM_ACTION_STATE);
                            //room.setFlowNomber(FlowDefine.TAKE_IN_AND_TOUCH);

                            room.setRoomState(RoomDefine.ROOM_ACTION_STATE);
                            room.setFlowNomber(FlowDefine.FORCE_ACTION_AFTER_OPER);

                            var res=new Socket.OperateCardResponse();
                            res.state=0;
                            MsgManager.getInstance().sendToAckRoomUser(room,Socket.MsgNumber.OPERATE_CARD_RESPONSE,res,room.currentFlowsId);
                        }
                        else{

                            if(RoomDefine.NO_WAIT_TIMEOUT!=1)
                            {
                                var currentTime=new Date().getTime();
                                var t=(currentTime-room.startTime)/1000;


                                if(t>=20)
                                {
                                    console.log("等待选择超时");
                                    if(queueLen>0&&queue[0].type==1)
                                    {
                                        var obj=queue[0];

                                        var isValid=true;
                                        // if(RoomDefine.NO_WAIT_TIMEOUT==1)
                                        // {
                                        //     if(!obj.uid.startWith("@"))
                                        //     {
                                        //         isValid=false;
                                        //     }
                                        // }


                                        if(isValid)
                                        {
                                            room.setRoomState(RoomDefine.ROOM_ACTION_STATE);
                                            room.setFlowNomber(FlowDefine.CHI_NO);


                                            var user=room.getUserByUid(obj.uid);
                                            user.roomUser.removeChouChi(room.tableTopObj.card)
                                            user.roomUser.removeChouPeng(room.tableTopObj.card);
                                        }


                                    }
                                    else{




                                        var users=room.getRoomUsers();
                                        for(var uid in users) {
                                            var user = users[uid];
                                            var roomUser = user.roomUser;
                                            if(RoomDefine.NO_WAIT_TIMEOUT==1)
                                            {
                                                if(!uid.startWith("@"))
                                                {
                                                    continue;
                                                }
                                            }
                                            var arr=room.canSelectedUserAction[uid];
                                            if(arr!=undefined)
                                            {

                                                var actionCount=arr.length;
                                                for(var i=0;i<actionCount;i++)
                                                {
                                                    var ac=arr[i];
                                                    if(ac.type==RoomDefine.ACTION_KECHI)
                                                    {
                                                        roomUser.appendChouChi(room.tableTopObj.card);
                                                        break;
                                                    }

                                                }

                                            }
                                        }

                                        room.setRoomState(RoomDefine.ROOM_ACTION_STATE);
                                        room.setFlowNomber(FlowDefine.FORCE_ACTION_AFTER_OPER);


                                        //
                                        // //选择操作超时
                                        // room.setRoomState(RoomDefine.ROOM_ACTION_STATE);
                                        // room.setFlowNomber(FlowDefine.TAKE_IN_AND_TOUCH);
                                    }
                                    var res=new Socket.OperateCardResponse();
                                    res.state=0;
                                    MsgManager.getInstance().sendToAckRoomUser(room,Socket.MsgNumber.OPERATE_CARD_RESPONSE,res,room.currentFlowsId);



                                }
                                else{
                                    var r=Math.random()*10+2;
                                    if(t>r)
                                    {
                                        // console.log("选择托管检查");
                                        //检查是否有托管用户
                                        var users=room.getRoomUsers();
                                        for(var uid in users) {
                                            var user = users[uid];
                                            var roomUser = user.roomUser;

                                            if(RoomDefine.NO_WAIT_TIMEOUT==1)
                                            {
                                                if(!uid.startWith("@"))
                                                {
                                                    continue;
                                                }
                                            }

                                            if(roomUser.waitSelected==undefined||(!roomUser.waitSelected))
                                            {
                                                continue;
                                            }
                                            if(roomUser.isTuoGuan==1)
                                            {
                                                var action=room.getActionInCanSelected(uid,RoomDefine.ACTION_KEHU);
                                                if(action==null)
                                                {
                                                    action=room.getActionInCanSelected(uid,RoomDefine.ACTION_KEHU2);
                                                }
                                                if(action!=null)
                                                {
                                                    //先检查是否有胡
                                                    console.log("托管-胡");

                                                    var req=new Socket.OperateCardRequest();
                                                    req.uid=uid;
                                                    req.roomId=room.roomId;
                                                    req.type=2;
                                                    req.cardIds=[];
                                                    req.user=user;

                                                    var obj={};
                                                    obj.body=req;
                                                    obj.sessionId=user.sessionId;
                                                    this.app.onReceive( Socket.MsgNumber.OPERATE_CARD_REQUEST,obj);

                                                }
                                                else{
                                                    action=room.getActionInCanSelected(uid,RoomDefine.ACTION_KEPENG);
                                                    if(action!=null)//碰
                                                    {
                                                        console.log("托管-碰");

                                                        var req=new Socket.OperateCardRequest();
                                                        req.uid=uid;
                                                        req.roomId=room.roomId;
                                                        req.type=0;//0:碰,1:吃,2:胡
                                                        req.cardIds=[];
                                                        req.user=user;

                                                        var obj={};
                                                        obj.body=req;
                                                        obj.sessionId=user.sessionId;
                                                        this.app.onReceive( Socket.MsgNumber.OPERATE_CARD_REQUEST,obj);

                                                    }
                                                    else{
                                                        action=room.getActionInCanSelected(uid,RoomDefine.ACTION_KECHI);
                                                        if(action!=null)
                                                        {



                                                            var cardIds=[];
                                                            var groupCards=action.groupCards;
                                                            var cLen=groupCards.length;
                                                            for(var i=0;i<cLen;i++)
                                                            {
                                                                var group=groupCards[i];
                                                                var cards=group.cards;
                                                                var cLen2=cards.length;
                                                                for(var j=0;j<cLen2;j++)
                                                                {
                                                                    var card=cards[j];
                                                                    cardIds.push(card.c_id);
                                                                }

                                                                var childCards=group.childCards;
                                                                cLen2=childCards.length;
                                                                if(cLen2>0)
                                                                {

                                                                    var childGroup=childCards[0];
                                                                    var cards2=childGroup.cards;
                                                                    cLen2=cards2.length;
                                                                    for(var j=0;j<cLen2;j++)
                                                                    {
                                                                        var card=cards2[j];
                                                                        cardIds.push(card.c_id);
                                                                    }

                                                                    var childCards2=childGroup.childCards;
                                                                    cLen2=childCards2.length;
                                                                    if(cLen2>0)
                                                                    {

                                                                        var childGroup2=childCards2[0];
                                                                        var cards3=childGroup2.cards;
                                                                        cLen2=cards3.length;
                                                                        for(var j=0;j<cLen2;j++)
                                                                        {
                                                                            var card=cards3[j];
                                                                            cardIds.push(card.c_id);
                                                                        }


                                                                    }

                                                                }

                                                                break;

                                                            }
                                                            console.log("托管-吃");



                                                            var req=new Socket.OperateCardRequest();
                                                            req.uid=uid;
                                                            req.roomId=room.roomId;
                                                            req.type=1;//0:碰,1:吃,2:胡
                                                            req.cardIds=cardIds;
                                                            req.user=user;

                                                            var obj={};
                                                            obj.body=req;
                                                            obj.sessionId=user.sessionId;
                                                            this.app.onReceive( Socket.MsgNumber.OPERATE_CARD_REQUEST,obj);




                                                        }
                                                    }
                                                }



                                            }

                                        }

                                    }
                                }
                            }


                        }

                    }



                }
                    break;
                case RoomDefine.ROOM_WAIT_GOON_STATE:
                {
                    //检查是否都准备好
                    var count=0;
                    var users=room.getRoomUsers();
                    for(var uid in users) {
                        var user = users[uid];
                        var roomUser = user.roomUser;
                        if(roomUser.isReady==0||(!roomUser.isOnline))
                        {
                            count++;
                        }
                    }
                    if(count==room.playerCount)
                    {
                        this.nextGame(room);

                    }
                    else{
                        // var currentTime=new Date().getTime();
                        // var t=(currentTime-room.startTime)/1000;
                        // if(t>=30)//检查是否超时间
                        // {
                        //     this.nextGame(room);
                        // }

                    }


                }
                    break;
                case RoomDefine.ROOM_WAIT_ACK_STATE:
                {
                    //检查ack
                    var flg=true;
                    var allUser=room.getRoomUsers();
                    for(var uid in allUser) {
                        var user = allUser[uid];
                        var roomUser=user.roomUser;
                        if(roomUser.isOnline)
                        {
                            if(roomUser.clientAck==0)
                            {
                                //用户还未返回ack
                                flg=false;
                                break;

                            }

                        }
                    }

                    // var t_t=(new Date().getTime()-room.waitAckTime)/1000;
                    // if(t_t>=20)
                    // {
                    //     console.log("Ack超过时间,roomId:"+room.roomId);
                    //     flg=true;
                    // }
                    if(flg)
                    {
                        console.log("[ack 切换状态:"+room.ackNextState+"]");
                        room.startTime=new Date().getTime();
                        room.setRoomState(room.ackNextState);

                        //检查是否有压后处理的
                        while(room.hasNextAckObj())
                        {
                            var ackObj=room.popAckObj();
                            if(ackObj!=null)
                            {
                                //console.log("body &&&&&roomId:"+ackObj.msgNumber+"==="+ackObj.body.roomId);
                                this.app.onReceive(ackObj.msgNumber,ackObj.obj);
                                console.log("[处理ack压后请求:ackObj.msgNumber:"+ackObj.msgNumber+"]");
                            }

                        }

                    }

                }
                    break;
                case RoomDefine.ROOM_DISMISS_STATE:
                {
                    var t=new Date().getTime()-room.disMissWaitTime;
                    t=t/1000;
                    if(t>GameInfo.getInstance().disMissWaitTime)
                    {
                        //
                        console.log("[超过2分钟,房间自动同意解散,roomId:"+room.roomId+"]");
                        offLineRoom.push(room.roomId);

                        //  var res=new Socket.DismissResponse();
                        //  //0:等待玩家同意,1:直接退出,2:房间解散
                        //  res.state=2;
                        //  //房主解散房间
                        //  res.txt="解散房间!";
                        // // console.log("[房主解散房间,roomId:"+roomId+"]");
                        //  MsgManager.getInstance().sendToRoomUser(room, Socket.MsgNumber.DISMISS_RESPONSE, res);


                        var res=this.createGameFinishNotify(room,1,true);
                        res.state=2;//0:小局结束,1:全局结束
                        MsgManager.getInstance().sendToRoomUser(room,Socket.MsgNumber.GAME_FINISHED_NOTIFY,res);


                        break;
                    }

                }
                    break;


            }

            //检查房间玩家是否都已经下线



        }

        var len=offLineRoom.length;
        for(var i=0;i<len;i++)
        {
            var roomId=offLineRoom[i];
            RoomManager.getInstance().removeRoom(roomId);
            console.log("[移除房间:"+roomId+"]");
        }



    }

    this.createFlow=function (room,type) {

        var flow=new Socket.Flow();
        flow.type=type;//0:创建玩家,1:玩家动作,2:臭牌
        flow.players=[];
        var users=room.getRoomUsers();
        for(var uid in users) {
            var user = users[uid];
            var roomUser=user.roomUser;

            var player=new Socket.Player();
            player.uid=user.uid;
            player.name=user.name;
            player.gold=user.gold;
            player.diamond=user.diamond;
            player.score1=roomUser.score1;
            player.score2=roomUser.score2;
            player.shouZhongScore=roomUser.shouZhongScore;
            player.headIcon=user.headIcon;
            player.roleType=roomUser.type;
            player.index=roomUser.index;
            if(roomUser.canPengAndChi)
            {
                player.state=0;
            }
            else{
                player.state=1;
            }
            flow.players.push(player);
        }
        var that=this;
        flow.pushAction=function (user,action) {

            var len=this.players.length;
            for(var i=0;i<len;i++)
            {
                var player=this.players[i];
                if(player.uid==user.uid)
                {
                    player.actions.push(action);

                    //根据action加分
                    that.addScore(user,player,action);

                    return player;
                }

            }

            console.log("[Flow中不存在此玩家,uid:"+uid+"]");

            return null;

        }
        return flow;

    }

    this.addScore=function (user,player,action) {

        var roomUser=user.roomUser;
        roomUser.checkScore2();
        roomUser.checkShouZhongHu(true,null);

        player.score1=roomUser.score1;
        player.score2=roomUser.score2;
        player.shouZhongScore=roomUser.shouZhongScore;

        console.log("[name:"+user.name+",桌面胡息:"+roomUser.score2+",手中胡息:"+roomUser.shouZhongScore+"]");
    }

    this.logFlowName=function (flowNo) {
        switch(flowNo) {
            case FlowDefine.WAIT_NO:
            {
                console.log("[FlowDefine.WAIT_NO]");
            }
                break;
            case FlowDefine.START_NO:
            {
                console.log("[FlowDefine.START_NO]");
            }
                break;
            case FlowDefine.WAIT_PUT_CARD_NO:
            {
                console.log("[FlowDefine.WAIT_PUT_CARD_NO]");
            }
                break;
            case FlowDefine.PUT_CARD_NO:
            {
                console.log("[FlowDefine.PUT_CARD_NO]");
            }
                break;
            case FlowDefine.PENG_NO:
            {
                console.log("[FlowDefine.PENG_NO]");
            }
                break;
            case FlowDefine.CHI_NO:
            {
                console.log("[FlowDefine.CHI_NO]");
            }
                break;
            case FlowDefine.HU_NO:
            {
                console.log("[FlowDefine.HU_NO]");
            }
                break;
            case FlowDefine.PUT_CARD_TIMEOUT_NO:
            {
                console.log("[FlowDefine.PUT_CARD_TIMEOUT_NO]");
            }
                break;
            case FlowDefine.SELECTD_TIMEOUT_NO:
            {
                console.log("[FlowDefine.SELECTD_TIMEOUT_NO]");
            }
                break;
            case FlowDefine.NO_ACTION_NO:
            {
                console.log("[FlowDefine.NO_ACTION_NO]");
            }
                break;
            case FlowDefine.CANCLE_SELECTED_NO:
            {
                console.log("[FlowDefine.CANCLE_SELECTED_NO]");
            }
                break;
            case FlowDefine.TAKE_IN_AND_TOUCH:
            {
                console.log("[FlowDefine.TAKE_IN_AND_TOUCH]");
            }
                break;
            case FlowDefine.TOUCH_CARD:
            {
                console.log("[FlowDefine.TOUCH_CARD]");
            }
                break;
            case FlowDefine.FORCE_ACTION_AFTER_OPER:
            {
                console.log("[FlowDefine.FORCE_ACTION_AFTER_OPER]");
            }
                break;
            case FlowDefine.START_AFTER_NO:
            {
                console.log("[FlowDefine.START_AFTER_NO]");
            }
                break
            default:
            {
                console.log("[未知流程]");
            }
                break;


        }
    }

    this.logicFlow=function (flowNo,room,flows) {


        var strDate=new Date().Format("yyyy/MM/dd hh:mm:ss");
        console.log("==================="+strDate+"===========================");
        // console.log("flowNo:"+flowNo);
        this.logFlowName(flowNo);

        switch(flowNo)
        {
            case FlowDefine.WAIT_NO:
            {

            }
                break;
            case FlowDefine.START_NO:
            {


                room.clearCanSelectedUserAction();

                room.playGameCount++;

                /*[设定庄家]
                 */
                //检查上局是否有人胡牌,如果胡牌则设置为本次庄家
                var zhuangJiaUser=null;

                room.clear();

                var users=room.getRoomUsers();

                for(var uid in users)
                {
                    var user=users[uid];
                    user.roomUser.clear();
                }

                for(var uid in users)
                {
                    var user=users[uid];
                    var roomUser=user.roomUser;
                    roomUser.type=RoomDefine.PLAYER_TYPE;

                    if(roomUser.lastHuPai==1)
                    {
                        hasSetZhuangJia=true;
                        roomUser.type=RoomDefine.ZHUANGJIA_TYPE;//设置为本次庄家

                        zhuangJiaUser=user;

                        room.setPutCardUid(user.uid);//设置出牌者

                        room.lastZhuangUid=user.uid;

                    }
                    else{
                        roomUser.type=RoomDefine.PLAYER_TYPE;
                    }

                }
                var testPos=0;
                if(RoomDefine.isTest2==1)
                {

                    //================测试===============================

                    var testCount=0;
                    for(var uid in users)
                    {
                        var user=users[uid];
                        testCount++;
                        if(testCount==2)
                        {
                            zhuangJiaUser=user;
                            zhuangJiaUser.roomUser.type=RoomDefine.ZHUANGJIA_TYPE;//设置为本次庄家
                            room.setPutCardUid(user.uid);//设置出牌者

                            if(testCount==1)
                            {
                                testPos=1;
                            }
                            else if(testCount==2)
                            {
                                testPos=2
                            }
                            else if(testCount==3)
                            {
                                testPos=2;
                            }
                            else if(testCount==4)
                            {
                                testPos=3;
                            }
                            break;
                        }



                    }

                    //===========================================
                }
                else{
                    if(room.lastZhuangUid==null)
                    {
                        if(zhuangJiaUser==null)
                        {
                            var tmpArray=[];
                            //随机一个庄家
                            for(var uid in users)
                            {
                                var user=users[uid];
                                //tmpArray.push(user);

                                if(uid==room.uid)
                                {
                                    //第一局开放者为庄家
                                    zhuangJiaUser=user;
                                    break;

                                }


                            }
                            zhuangJiaUser.roomUser.type=RoomDefine.ZHUANGJIA_TYPE;//设置为本次庄家
                            room.setPutCardUid(zhuangJiaUser.uid);//设置出牌者

                            console.log("设定庄家:"+zhuangJiaUser.roomUser.type+","+zhuangJiaUser.name);

                            room.lastZhuangUid=zhuangJiaUser.uid;
                        }
                    }
                    else{
                        var u=room.getUserByUid(room.lastZhuangUid);
                        zhuangJiaUser=u;
                        zhuangJiaUser.roomUser.type=RoomDefine.ZHUANGJIA_TYPE;//设置为本次庄家
                        room.setPutCardUid(u.uid);//设置出牌者
                        console.log("继续做庄家:"+zhuangJiaUser.roomUser.type+","+u.name);

                    }

                }




                //设定数醒
                if(room.playerCount==4)
                {
                    // //4人玩法需要设定数醒,庄家对门为数醒
                    // for(var uid in users) {
                    //     var user = users[uid];
                    //     var roomUser = user.roomUser;
                    //     var a=roomUser.index-zhuangJiaUser.roomUser.index;
                    //     if(a==2||a==-2)
                    //     {
                    //         roomUser.type=RoomDefine.XIANJIA_TYPE;
                    //
                    //         console.log("设定闲:"+roomUser.type+","+user.name);
                    //         break;
                    //     }
                    //
                    // }

                }
                var flow1=this.createFlow(room,0);
                flows.push(flow1);//创建玩家

                //随机发牌
                if(RoomDefine.isTest2==1)
                {
                    room.clearCard_test();

                    room.appendUserCard_test(1,1,2);
                    //room.appendUserCard_test(1,1,2);
                    room.appendUserCard_test(1,0,2);
                    //  room.appendUserCard_test(1,1,1);


                    room.appendUserCard_test(1,1,2);
                    room.appendUserCard_test(1,1,7);
                    room.appendUserCard_test(1,1,10);

                    room.appendUserCard_test(1,1,1);
                    room.appendUserCard_test(1,1,1);
                    room.appendUserCard_test(1,1,1);
                    //  room.appendUserCard_test(1,1,3);

                    room.appendUserCard_test(1,0,3);
                    room.appendUserCard_test(1,0,3);
                    room.appendUserCard_test(1,0,3);

                    //room.appendUserCard_test(1,0,4);
                    //room.appendUserCard_test(1,1,10);
                    //room.appendUserCard_test(1,0,10);

                    room.appendUserCard_test(1,1,6);
                    room.appendUserCard_test(1,0,6);
                    room.appendUserCard_test(1,0,6);

                    room.appendUserCard_test(1,0,8);
                    room.appendUserCard_test(1,0,8);
                    room.appendUserCard_test(1,0,8);

                    room.appendUserCard_test(1,1,8);
                    room.appendUserCard_test(1,1,9);
                    room.appendUserCard_test(1,1,10);


                    // room.appendUserCard_test(1,0,3);
                    // room.appendUserCard_test(1,0,3);

                    // room.appendUserCard_test(2,0,3);
                    //room.appendUserCard_test(2,0,2);


                    //room.appendUserCard_test(3,1,2);

                    room.appendLeftCard_test(1,2);
                    //room.appendLeftCard_test(1,2);

                    room.fillLeftCard_test(1);

                    room.dispatchCard();//发牌


                    console.log("[测试--发牌]");
                }
                else{
                    room.resetCards();//打乱牌
                    room.dispatchCard();//发牌
                }


                var flow2=this.createFlow(room,1);
                for(var uid in users) {
                    var user = users[uid];
                    var roomUser=user.roomUser;
                    var cards1=roomUser.cards1;

                    var action=new Socket.Action();
                    action.type=RoomDefine.ACTION_FAPAI;//0:发牌,1:提,2:跑,3:可吃,4:吃,5:可胡，6:胡，7:可碰,8:碰,9:等待出牌,10:出牌,11:隐藏选择按钮,12:取消超时等待
                    var groupCard=new Socket.GroupCard();
                    action.groupCards.push(groupCard);

                    console.log("[发牌数目:"+Object.keys(cards1).length+"]");
                    for(var c_id in cards1)
                    {
                        groupCard.cards.push(cards1[c_id]);
                    }
                    flow2.pushAction(user,action);

                }
                flows.push(flow2);//发牌动作


                //庄家的第21张牌要亮出来
                var card_21=room.nextCard();

                console.log("card_21:"+card_21.c_id);
               // zhuangJiaUser.roomUser.cards1[card_21.c_id]=card_21;
                var flow_21=this.createFlow(room,1);
                var action_21=new Socket.Action();
                action_21.type=RoomDefine.ACTION_TOUCH_CARD2;//0:发牌,1:提,2:跑,3:可吃,4:吃,5:可胡，6:胡，7:可碰,8:碰,9:等待出牌,10:出牌,11:隐藏选择按钮,12:取消超时等待
                var groupCard_21=new Socket.GroupCard();
                action_21.groupCards.push(groupCard_21);
                groupCard_21.cards.push(card_21);
                flow_21.pushAction(zhuangJiaUser,action_21);
                flows.push(flow_21);//21张牌动作

                room.setCurrentCardOnTableTop(zhuangJiaUser.uid,card_21,RoomDefine.ROOM_TOUCH_CARD_TYPE);
                room.lastTableObj=room.tableTopObj;


                var hasTianHu=false;
                //检查是否天胡
                if(zhuangJiaUser!=null)
                {
                    var action=zhuangJiaUser.roomUser.checkKeHu(card_21,true,RoomDefine.ROOM_TOUCH_CARD_TYPE);
                    if(action!=null)
                    {
                        var flow3=this.createFlow(room,1);
                        action.type2=1;//1:天胡,2:地胡,3:自摸胡
                        flow3.pushAction(zhuangJiaUser,action);
                        flows.push(flow3);//发牌动作

                        room.clearOperateQueue();
                        room.appendCanSelectedUserAction(zhuangJiaUser.uid,action);

                        room.setAckState(RoomDefine.ROOM_WAIT_SELECTED_STATE);


                        console.log("[有天胡]");

                        hasTianHu=true;
                    }
                    else{
                        console.log("[检查无天胡]");
                    }

                }
                var hasDiHu=false;
                //检查地胡
                if(!hasTianHu)
                {


                    for(var uid in users) {
                        var user = users[uid];
                        if(user==zhuangJiaUser)
                        {
                            continue;
                        }


                        var roomUser=user.roomUser;
                        var action=roomUser.checkKeHu(card_21,false,RoomDefine.ROOM_TOUCH_CARD_TYPE);
                        if(action!=null)
                        {
                            var flow3=this.createFlow(room,1);
                            action.type2=2;//1:天胡,2:地胡,3:自摸胡
                            flow3.pushAction(user,action);
                            flows.push(flow3);//发牌动作

                            room.clearOperateQueue();
                            room.appendCanSelectedUserAction(user.uid,action);
                            room.setAckState(RoomDefine.ROOM_WAIT_SELECTED_STATE);

                            console.log("[有地胡]");

                            hasDiHu=true;
                        }


                    }




                }
                

                if(!hasTianHu&&(!hasDiHu))
                {
                    this.logicFlow(FlowDefine.START_AFTER_NO,room,flows);
                }



            }
                break;
            case FlowDefine.START_AFTER_NO:
            {

                var users=room.getRoomUsers();

                for(var uid in users) {
                    var user = users[uid];
                    var roomUser = user.roomUser;

                    if (roomUser.type == RoomDefine.ZHUANGJIA_TYPE) {

                        var card=room.tableTopObj.card;
                        roomUser.cards1[card.c_id]=card;

                        var flow_21=this.createFlow(room,1);
                        var action_21=new Socket.Action();
                        action_21.type=RoomDefine.ACTION_TAKE_IN2;//0:发牌,1:提,2:跑,3:可吃,4:吃,5:可胡，6:胡，7:可碰,8:碰,9:等待出牌,10:出牌,11:隐藏选择按钮,12:取消超时等待
                        var groupCard_21=new Socket.GroupCard();
                        action_21.groupCards.push(groupCard_21);
                        groupCard_21.cards.push(card);
                        flow_21.pushAction(user,action_21);
                        flows.push(flow_21);//21张牌动作

                        break;
                    }

                }





                var hasAddTi=false;
                //检查自摸的[提]

                for(var uid in users) {
                    var user = users[uid];
                    var roomUser=user.roomUser;

                    if(roomUser.type==RoomDefine.ZHUANGJIA_TYPE)
                    {
                        var action=roomUser.checkTi();

                        if(action!=null)
                        {
                            var flow3=this.createFlow(room,1);
                            flow3.pushAction(user,action);
                            flows.push(flow3);
                            if(action.groupCards.length>=2)
                            {
                                var flow4=this.createFlow(room,1);
                                //2条龙先补发一张牌
                                var action2=new Socket.Action();
                                action2.type=RoomDefine.ACTION_GET;
                                var groupCard2=new Socket.GroupCard();
                                action2.groupCards.push(groupCard2);
                                var nextCatd=room.nextCard();
                                groupCard2.cards.push(nextCatd);
                                flow4.pushAction(user,action2);
                                flows.push(flow4);

                                roomUser.moveTo(nextCatd,null,roomUser.cards1);//移动牌
                            }


                            roomUser.firstFour=false;

                            break;
                        }


                    }

                }



                this.logicFlow(FlowDefine.WAIT_PUT_CARD_NO,room,flows);

                var flow5=this.createFlow(room,1);
                for(var uid in users) {
                    var user = users[uid];
                    var roomUser=user.roomUser;

                    if(roomUser.type!=RoomDefine.ZHUANGJIA_TYPE)
                    {
                        var action=roomUser.checkTi();

                        if(action!=null)
                        {
                            flow5.pushAction(user,action);

                            roomUser.firstFour=false;

                            if(action.groupCards.length>=2)
                            {
                                //补一张牌
                                var action2=new Socket.Action();
                                action2.type=RoomDefine.ACTION_GET;
                                var groupCard2=new Socket.GroupCard();
                                action2.groupCards.push(groupCard2);
                                var nextCatd=room.nextCard();
                                groupCard2.cards.push(nextCatd);
                                flow5.pushAction(user,action2);
                                roomUser.moveTo(nextCatd,null,roomUser.cards1);//移动牌
                            }
                        }

                    }


                }
                flows.push(flow5);//发牌动作

            }
                break;
            case FlowDefine.WAIT_PUT_CARD_NO:
            {

                var canPutCard=true;

                var flow=this.createFlow(room,1);
                var users=room.getRoomUsers();
                var flg=false;
                for(var uid in users) {
                    var user = users[uid];
                    var roomUser=user.roomUser;
                    roomUser.clientAck=0;//反馈标志

                    //  console.log("cardId:"+room.currentPutCardUID+","+uid+","+room.isPutCard(uid));
                    if(room.isPutCard(uid))
                    {
                        // console.log("[等待发牌:"+user.name+"]");
                        //检查是否可以出牌,如果最后剩一个坎 是不可以出牌的

                        if(!roomUser.checkCanPutCard())//如果玩家,剩余的牌不可以打出,则自动下家摸牌
                        {
                            console.log("[玩家剩余的牌不可以打出,跳到下家摸牌]");
                            var flgIndex=roomUser.index;
                            flgIndex+=1;
                            if(flgIndex>=room.playerCount)
                            {
                                flgIndex=0;
                            }
                            var nextUser=room.getUserByIndex(flgIndex);
                            if(nextUser.roomUser.type==RoomDefine.XIANJIA_TYPE)
                            {
                                flgIndex+=1;
                                if(flgIndex>=room.playerCount)
                                {
                                    flgIndex=0;
                                }
                                //nextUser=room.getUserByIndex(flgIndex);
                            }

                            room.setTouchUserIndex(flgIndex);
                            this.logicFlow(FlowDefine.TOUCH_CARD,room,flows);

                            canPutCard=false;

                            break;

                        }



                        var action=new Socket.Action();
                        action.type=RoomDefine.ACTION_WAIT_PUT;//0:发牌,1:提,2:跑,3:可吃,4:吃,5:可胡，6:胡，7:可碰,8:碰,9:等待出牌,10:出牌,11:隐藏选择按钮,12:取消超时等待
                        //0:非反馈动作,1:需要反馈动作
                        action.ack=1;
                        flow.pushAction(user,action);

                        flg=true;

                    }
                }

                if(!flg)
                {
                    console.log("[等待出牌用户ID错误]");
                }


                if(canPutCard)
                {
                    flows.push(flow);//发牌动作

                    // room.startTime=new Date().getTime();
                    room.setAckState(RoomDefine.ROOM_WAIT_PUT_CARD_STATE);
                }


            }
                break;
            case FlowDefine.PUT_CARD_NO:
            {

                var tableTopObj=room.tableTopObj;
                room.lastTableObj=tableTopObj;

                room.clearCanSelectedUserAction();

                if(tableTopObj.touchOrPut==RoomDefine.ROOM_PUT_CARD_TYPE)
                {
                    console.log("[打出牌-type:"+tableTopObj.card.type+",value:"+tableTopObj.card.value+",uid:"+tableTopObj.uid+"]");
                }
                else{
                    console.log("[摸牌-type:"+tableTopObj.card.type+",value:"+tableTopObj.card.value+",uid:"+tableTopObj.uid+"]");
                }

                var users=room.getRoomUsers();
                var userArr=[];

                console.log("room.playerCount::"+room.playerCount);
                for(var i=0;i<room.playerCount;i++)
                {
                    userArr[i]=null;
                }
                // if(RoomDefine.isTest==1)
                // {
                //     userArr[0]=null;
                //     userArr[1]=null;
                // }
                // else{
                //     if(room.playerCount==RoomDefine.POS_3_PLAYER)
                //     {
                //         userArr[0]=null;
                //         userArr[1]=null;
                //         userArr[2]=null;
                //
                //     }
                //     else{
                //         userArr[0]=null;
                //         userArr[1]=null;
                //         userArr[2]=null;
                //         userArr[3]=null;
                //     }
                //
                // }



                for(var uid in users) {
                    var user = users[uid];
                    var roomUser=user.roomUser;
                    var index=roomUser.index;
                    roomUser.clientAck=1;
                    if(userArr[index]==null)
                    {
                        userArr[index]=user;
                    }

                }
                var len=userArr.length;
                // console.log("userArr len:"+len);
                var userArr2=[];
                var flg=false;
                for(var i=0;i<len;i++) {
                    var user = userArr[i];
                    if(user.uid==tableTopObj.uid)
                    {
                        flg=true;

                        //发牌或者摸牌动作
                        var flow2=this.createFlow(room,1);
                        var action=new Socket.Action();
                        if(tableTopObj.touchOrPut==RoomDefine.ROOM_PUT_CARD_TYPE)
                        {
                            action.type=RoomDefine.ACTION_PUT;//0:发牌,1:提,2:跑,3:可吃,4:吃,5:可胡，6:胡，7:可碰,8:碰,9:等待出牌,10:出牌,11:隐藏选择按钮,12:取消超时等待

                            user.roomUser.appendChouChi(tableTopObj.card);

                            // 0:,1:摸得牌,2:打出的牌
                            tableTopObj.card.flg3=2;

                            console.log("[手中打出牌,name:"+user.name+",type:"+tableTopObj.card.type+",value:"+tableTopObj.card.value+"]");

                        }
                        else{
                            action.type=RoomDefine.ACTION_TOUCH;

                            tableTopObj.card.flg3=1;

                            console.log("[手中摸到牌,name:"+user.name+",type:"+tableTopObj.card.type+",value:"+tableTopObj.card.value+"]");

                        }
                        tableTopObj.card.flg=0;

                        var groupCard=new Socket.GroupCard();
                        action.groupCards.push(groupCard);
                        groupCard.cards.push(tableTopObj.card);
                        flow2.pushAction(user,action);
                        flows.push(flow2);//发牌动作

                        //console.log("[出牌动作组装]");

                    }

                    if(flg)
                    {
                        userArr2.push(user);
                    }

                }
                flg=false;
                for(var i=0;i<len;i++) {
                    var user = userArr[i];
                    if(user.uid==tableTopObj.uid)
                    {
                        flg=true;

                    }

                    if(!flg)
                    {
                        userArr2.push(user);
                    }

                }

                var actionUserKeHu={};
                var hasDianPao=false;

               // if(tableTopObj.count==1)
                //{
                    // //庄家第一张牌
                    // console.log("[庄家打出的第一张牌,检查地胡]");
                    //
                    // var len=userArr2.length;
                    // for(var i=0;i<len;i++) {
                    //     var user = userArr2[i];
                    //     var roomUser = user.roomUser;
                    //
                    //     if(roomUser.type==RoomDefine.ZHUANGJIA_TYPE)
                    //     {
                    //         continue;
                    //     }
                    //     var uid=user.uid;
                    //     var isSelf=false;
                    //
                    //     var action=roomUser.checkKeHu(tableTopObj.card,isSelf);
                    //
                    //     if(action!=null)
                    //     {
                    //
                    //
                    //         //0:非反馈动作,1:需要反馈动作
                    //         action.ack=1;
                    //         var obj={};
                    //         obj.action=action;
                    //         obj.user=user;
                    //         actionUserKeHu[uid]=obj;
                    //
                    //         action.type2=2;//1:天胡,2:地胡,3:自摸胡
                    //
                    //         console.log("[地胡,name:"+user.name+"]");
                    //
                    //
                    //     }
                    //
                    // }

               // }
               // else
                {


                    //if(tableTopObj.touchOrPut==RoomDefine.ROOM_TOUCH_CARD_TYPE)
                    {

                        var len=userArr2.length;
                        for(var i=0;i<len;i++) {
                            var user = userArr2[i];
                            var roomUser = user.roomUser;
                            var uid=user.uid;
                            var isSelf=false;
                            if(uid==tableTopObj.uid)
                            {
                                isSelf=true;
                            }

                            if(isSelf&&tableTopObj.touchOrPut==RoomDefine.ROOM_PUT_CARD_TYPE)
                            {
                                //自己打出的牌 不检查胡
                                continue;

                            }
                            var action=roomUser.checkKeHu(tableTopObj.card,isSelf,tableTopObj.touchOrPut);


                            if(action!=null)
                            {
                                console.log("[可胡,name:"+user.name+"]");

                                //0:非反馈动作,1:需要反馈动作
                                action.ack=1;
                                var obj={};
                                obj.action=action;
                                obj.user=user;
                                actionUserKeHu[uid]=obj;

                                if(isSelf)
                                {
                                    action.type2=3;//1:天胡,2:地胡,3:自摸胡
                                }
                                else if(tableTopObj.touchOrPut==RoomDefine.ROOM_PUT_CARD_TYPE)
                                {
                                    action.type2=6;//1:天胡,2:地胡,3:自摸胡 6:放炮

                                    action.type=RoomDefine.ACTION_KEHU2;//点炮必胡

                                    hasDianPao=true;
                                }

                                //flow.pushAction(user,action);
                                //hasAction=true;
                                // room.appendCanSelectedUserAction(uid,action);

                            }

                        }


                    }
                }



                var hasForceAction=false;
                var forceActionUser=null;
                var hasAction=false;
                var flow=this.createFlow(room,1);
                len=userArr2.length;
                for(var i=0;i<len;i++)
                {
                    var user = userArr2[i];
                    var roomUser=user.roomUser;
                    var uid=user.uid;

                    if(user.uid==tableTopObj.uid)
                    {
                        if(tableTopObj.touchOrPut==RoomDefine.ROOM_TOUCH_CARD_TYPE)
                        {
                            var checkTiFlg=true;

                            var action=roomUser.checkTiAndPao(tableTopObj.card,true,true,true);

                            if(actionUserKeHu[uid]!=undefined&&action!=null&&(action.type==RoomDefine.ACTION_TI||action.type==RoomDefine.ACTION_TI2))
                            {

                                action=roomUser.checkTiAndPao(tableTopObj.card,true,true,false);

                                // //检查是否有胡的牌型
                                // var ac=roomUser.checkHasHuCardGroup(tableTopObj.card);
                                // if(ac!=null)
                                // {
                                //     //提胡
                                //     checkTiFlg=false;
                                //     console.log("[提胡]");
                                // }
                                // else{
                                //     //非提胡 需要先提
                                //     //删掉-胡
                                //     delete actionUserKeHu[uid];
                                //     console.log("[非提胡]");
                                //
                                //
                                // }
                                //删除出自己以外的胡

                                var tmpArr=[];
                                for(var kk in actionUserKeHu)
                                {
                                    tmpArr.push(kk);
                                }
                                var tmpCount=tmpArr.length;
                                for(var tIndex=0;tIndex<tmpCount;tIndex++)
                                {
                                    var tUserId=tmpArr[tIndex];
                                    if(tUserId!=uid)
                                    {
                                        delete actionUserKeHu[tUserId];
                                    }
                                    else{
                                        if(roomUser.checkIsHu2(null))
                                        {
                                            //如果提完手里无牌,则必须胡
                                            var huObj=actionUserKeHu[uid];
                                            huObj.action.type=RoomDefine.ACTION_KEHU2;
                                            console.log("[提胡--胡2]");
                                        }

                                    }

                                }

                                checkTiFlg=true;
                                hasForceAction=true;
                                room.appendCanSelectedUserAction(uid,action);

                                console.log("[检测到胡和提,先提再胡]");
                            }
                            else if(action!=null&&(action.type==RoomDefine.ACTION_PAO||action.type==RoomDefine.ACTION_PAO2))
                            {




                                if(Object.keys(actionUserKeHu).length>0)
                                {

                                    checkTiFlg=false;

                                    if(actionUserKeHu[uid]!=undefined)
                                    {
                                        if(roomUser.checkIsHu2(action))
                                        {

                                            var huObj=actionUserKeHu[uid];
                                            huObj.action.type=RoomDefine.ACTION_KEHU2;
                                            console.log("[跑胡#3--胡2]");
                                        }

                                    }
                                    hasForceAction=true;
                                    room.appendCanSelectedUserAction(uid,action);

                                    if(!roomUser.firstFour)//只有第一次跑才出牌,其他情况下不出牌
                                    {
                                        action.firstFour=false;
                                    }
                                    else{
                                        action.firstFour=true;
                                    }

                                    console.log("[检测到胡和跑,先胡再跑#--自己摸到牌]");
                                }
                                else{
                                    action=roomUser.checkTiAndPao(tableTopObj.card,true,true,false);

                                    console.log("[跑##1]");

                                }

                            }
                            else{
                                action=roomUser.checkTiAndPao(tableTopObj.card,true,true,false);
                                if(action!=null)
                                {
                                    console.log("[提##1]");
                                }

                            }


                            if(checkTiFlg)
                            {
                                //检查是否有者提
                                //var action=roomUser.checkTiAndPao(tableTopObj.card,true,true,false);
                                if(action!=null)
                                {
                                    //检查是否提了以后 还可以胡,如果是 则是 提胡 否则就要提不能胡



                                    flow.pushAction(user,action);
                                    hasForceAction=true;


                                    room.setPutCardUid(uid);//设置出牌者

                                    if(!roomUser.firstFour)//只有第一次跑才出牌,其他情况下不出牌
                                    {
                                        forceActionUser=user;
                                        action.firstFour=false;
                                    }
                                    else{
                                        action.firstFour=true;
                                    }
                                    roomUser.firstFour=false;


                                    if(action.type==RoomDefine.ACTION_TI||action.type==RoomDefine.ACTION_TI2)
                                    {

                                        console.log("[提,name:"+user.name+",first:"+action.firstFour+"]");

                                    }
                                    else{
                                        console.log("[跑,name:"+user.name+",first:"+action.firstFour+"]");
                                    }

                                    break;
                                }

                            }

                        }
                    }
                    else{
                        //if(actionUserKeHu[uid]==undefined)//没有胡的话 才检查跑了
                        {
                            if(tableTopObj.touchOrPut==RoomDefine.ROOM_TOUCH_CARD_TYPE)
                            {
                                //检查是否有跑或者提
                                var action=roomUser.checkTiAndPao(tableTopObj.card,false,true,true);
                                if(action!=null)
                                {


                                    if(Object.keys(actionUserKeHu).length>0)
                                    {

                                        // if(roomUser.leftCardInHand()<=3)
                                        // {
                                        //     //如果提完手里无牌,则必须胡
                                        //     var huAction=actionUserKeHu[uid];
                                        //     huAction.type=RoomDefine.ACTION_KEHU2;
                                        // }

                                        if(actionUserKeHu[uid]!=undefined)
                                        {
                                            if(roomUser.checkIsHu2(action))
                                            {

                                                var huObj=actionUserKeHu[uid];
                                                huObj.action.type=RoomDefine.ACTION_KEHU2;
                                                console.log("[跑胡#2--胡2]");
                                            }

                                        }
                                        hasForceAction=true;
                                        room.appendCanSelectedUserAction(uid,action);

                                        if(!roomUser.firstFour)//只有第一次跑才出牌,其他情况下不出牌
                                        {
                                            action.firstFour=false;
                                        }
                                        else{
                                            action.firstFour=true;
                                        }

                                        console.log("[检测到胡和跑,先胡再跑#1]");
                                    }
                                    else{

                                        action=roomUser.checkTiAndPao(tableTopObj.card,false,true,false);

                                        flow.pushAction(user,action);
                                        hasForceAction=true;


                                        room.setPutCardUid(uid);//设置出牌者

                                        if(!roomUser.firstFour)//只有第一次跑才出牌,其他情况下不出牌
                                        {
                                            forceActionUser=user;
                                            action.firstFour=false;
                                        }
                                        else{
                                            action.firstFour=true;
                                        }
                                        roomUser.firstFour=false;

                                        console.log("[跑#2,name:"+user.name+",first:"+action.firstFour+"]");

                                    }


                                    break;
                                }
                            }
                            else{
                                //检查是否有跑或者提
                                var action=roomUser.checkTiAndPao(tableTopObj.card,false,false,true);
                                if(action!=null)
                                {

                                    if(Object.keys(actionUserKeHu).length>0)
                                    {

                                        if(actionUserKeHu[uid]!=undefined)
                                        {
                                            if(roomUser.checkIsHu2(action))
                                            {

                                                var huObj=actionUserKeHu[uid];
                                                huObj.action.type=RoomDefine.ACTION_KEHU2;

                                                console.log("[跑胡#1--胡2]");
                                            }

                                        }

                                        hasForceAction=true;
                                        room.appendCanSelectedUserAction(uid,action);

                                        console.log("[检测到胡和跑,先胡再跑#2]");
                                    }
                                    else{

                                        action=roomUser.checkTiAndPao(tableTopObj.card,false,false,false);

                                        flow.pushAction(user,action);
                                        hasForceAction=true;


                                        room.setPutCardUid(uid);//设置出牌者

                                        if(!roomUser.firstFour)//只有第一次跑才出牌,其他情况下不出牌
                                        {
                                            forceActionUser=user;

                                            action.firstFour=false;
                                        }
                                        else{
                                            action.firstFour=true;
                                        }
                                        roomUser.firstFour=false;

                                        console.log("[跑#3,name:"+user.name+",first:"+action.firstFour+"]");
                                    }


                                    break;
                                }
                            }


                        }


                    }

                    if(hasForceAction)
                    {
                        break;
                    }


                }




                if(!hasForceAction&&(!hasDianPao))//没有吃或者提的情况下 检查[碰/偎]
                {


                    len=userArr2.length;
                    for(var i=0;i<len;i++) {
                        var user = userArr2[i];
                        var roomUser = user.roomUser;
                        var uid=user.uid;

                        if(user.uid==tableTopObj.uid)
                        {
                            if(tableTopObj.touchOrPut==RoomDefine.ROOM_TOUCH_CARD_TYPE)
                            {

                                // if(actionUserKeHu[uid]==undefined)//有胡的话就不可以 再偎了 只能执行胡,偎胡
                                {
                                    //[偎]
                                    var action=roomUser.checkPeng(tableTopObj.card,true,false);
                                    if(action!=null)
                                    {

                                        if(actionUserKeHu[uid]!=undefined)
                                        {

                                            //删除出自己以外的胡

                                            var tmpArr=[];
                                            for(var kk in actionUserKeHu)
                                            {
                                                tmpArr.push(kk);
                                            }
                                            var tmpCount=tmpArr.length;
                                            for(var tIndex=0;tIndex<tmpCount;tIndex++)
                                            {
                                                var tUserId=tmpArr[tIndex];
                                                if(tUserId!=uid)
                                                {
                                                    delete actionUserKeHu[tUserId];
                                                }

                                            }
                                            if(actionUserKeHu[uid]!=undefined)
                                            {
                                                if(roomUser.checkIsHu2(null))
                                                {

                                                    var huObj=actionUserKeHu[uid];
                                                    huObj.action.type=RoomDefine.ACTION_KEHU2;

                                                    console.log("[偎胡--胡2]");
                                                }

                                            }
                                            console.log("[检测到胡和偎,先偎再胡]");
                                            hasForceAction=true;
                                            room.appendCanSelectedUserAction(uid,action);
                                        }
                                        // else{
                                        //
                                        //     action=roomUser.checkPeng(tableTopObj.card,true,false);
                                        //     flow.pushAction(user,action);
                                        //     hasForceAction=true;//偎是
                                        //     room.setPutCardUid(uid);//设置出牌者
                                        // }


                                        //action=roomUser.checkPeng(tableTopObj.card,true,false);
                                        flow.pushAction(user,action);
                                        hasForceAction=true;//偎是
                                        room.setPutCardUid(uid);//设置出牌者

                                        console.log("[偎,name:"+user.name+"]");

                                        break;
                                    }
                                }

                            }
                        }
                        else{

                            var hasChouPai=false;
                            //检查是否为臭牌
                            // for(var j=0;j<len;j++) {
                            //     var user2 = userArr2[j];
                            //     var roomUser2 = user2.roomUser;
                            //
                            //
                            //
                            // }
                            if(roomUser.checkHasChouPeng(tableTopObj.card))
                            {
                                //臭牌
                                console.log("[臭牌不可以碰:"+tableTopObj.card.type+","+tableTopObj.card.value+"]");
                                hasChouPai=true;
                                break;
                            }

                            if(!hasChouPai)
                            {
                                //检查是否有碰
                                var action=roomUser.checkPeng(tableTopObj.card,false,false);
                                if(action!=null)
                                {
                                    var isPenghu=false;
                                    //检查是否为 碰胡
                                    if(actionUserKeHu[uid]!=undefined)
                                    {

                                        //检查碰完是否只剩下 一坎 如果是 则不显示 碰 只显示 胡
                                        if(roomUser.checkPengHu(action))
                                        {
                                            isPenghu=true;
                                            console.log("[碰胡----只显示胡]");
                                        }
                                        else{

                                            isPenghu=false;
                                        }



                                    }

                                    if(!isPenghu)
                                    {

                                        if((roomUser.leftCardInHand()-2)>=1)//碰完手中必须有牌
                                        {

                                            //0:非反馈动作,1:需要反馈动作
                                            action.ack=1;

                                            flow.pushAction(user,action);
                                            hasAction=true;
                                            roomUser.appendChouPeng(tableTopObj.card);
                                            room.appendCanSelectedUserAction(uid,action);

                                            console.log("[碰,name:"+user.name+"]");

                                        }
                                        else{
                                            console.log("[碰完手中就无牌了,所以不可以碰]");
                                        }

                                    }
                                }
                            }
                        }
                    }

                }

                if(!hasForceAction&&(!hasDianPao))
                {
                    //检查吃 只有下家可以吃

                    var nextUser=room.getNextUserByUidNoXian(tableTopObj.uid);
                    var nextIsXiaJia=false;
                    len=userArr2.length;
                    for(var i=0;i<len;i++) {
                        var user = userArr2[i];
                        var roomUser = user.roomUser;
                        var uid=user.uid;


                       // if(roomUser.type!=RoomDefine.XIANJIA_TYPE)
                        {
                            var hasChouPai=false;
                            //检查是否为臭牌
                            // for(var j=0;j<len;j++) {
                            //     var user2 = userArr2[j];
                            //    臭牌不可以吃 var roomUser2 = user2.roomUser;
                            //     if(uid==user2.uid&&roomUser2.checkHasChouChi(tableTopObj.card))
                            //     {
                            //         //臭牌
                            //         console.log("[臭牌不可以吃:"+tableTopObj.card.type+","+tableTopObj.card.value+"]");
                            //         hasChouPai=true;
                            //         break;
                            //     }
                            //
                            //
                            // }
                            if(roomUser.checkHasChouChi(tableTopObj.card))
                            {
                                console.log("[臭牌不可以吃:"+tableTopObj.card.type+","+tableTopObj.card.value+"]");
                                hasChouPai=true;
                            }
                            if(!hasChouPai)
                            {
                                var action=roomUser.checkChi(tableTopObj.card);
                                if(action!=null)
                                {

                                    var canChiAction=false;
                                    if(user.uid==tableTopObj.uid)
                                    {
                                        if(tableTopObj.touchOrPut==RoomDefine.ROOM_TOUCH_CARD_TYPE)
                                        {
                                            canChiAction=true;

                                        }

                                    }
                                    else{
                                        if(nextUser==user)
                                        {
                                            //下家才可以吃牌
                                            canChiAction=true;
                                        }

                                    }


                                    if(canChiAction)
                                    {

                                        //检查是否为 吃胡
                                        var isChiHu=false;

                                        if(actionUserKeHu[uid]!=undefined)
                                        {
                                            //如果吃完 只剩下 一坎 或者 一张 则不可以吃 只显示 胡
                                            if(roomUser.checkChiHu(action))
                                            {
                                                isChiHu=true;
                                                console.log("[吃胡---只显示胡]");
                                            }
                                            else{
                                                isChiHu=false;
                                            }

                                        }
                                        else{
                                            isChiHu=false;
                                        }

                                        if(!isChiHu)
                                        {

                                            var groupCards=action.groupCards;
                                            var gCount=groupCards.length;
                                            var chiCount=0;
                                            for(var gIndex=0;gIndex<gCount;gIndex++)
                                            {
                                                var group=groupCards[gIndex];
                                                var cards=group.cards;
                                                var cCount=cards.length;
                                                var childCards=group.childCards;
                                                chiCount=3;
                                                if(childCards.length>0)
                                                {
                                                    chiCount+=3;
                                                    break;
                                                }

                                                break;
                                            }
                                            chiCount-=1;
                                            var leftHandCount=(roomUser.leftCardInHand()-chiCount);
                                            if(leftHandCount>=1)//吃完手中必须有牌
                                            {
                                                //0:非反馈动作,1:需要反馈动作
                                                action.ack=1;
                                                flow.pushAction(user,action);
                                                hasAction=true;
                                                room.appendCanSelectedUserAction(uid,action);

                                                console.log("[吃,name:"+user.name+"]");

                                            }
                                            else{
                                                console.log("[吃完手中就无牌了,所以不可以吃]");
                                            }

                                        }

                                    }



                                }
                            }



                        }


                    }


                }
                // //检查是否可[胡]
                // if(!hasForceAction)
                // {
                //     //检查吃 只有下家可以吃
                //
                //     len=userArr2.length;
                //     for(var i=0;i<len;i++) {
                //         var user = userArr2[i];
                //         var roomUser = user.roomUser;
                //         var uid=user.uid;
                //         var action=roomUser.checkKeHu();
                //         if(action!=null)
                //         {
                //             console.log("[可胡]");
                //
                //             //0:非反馈动作,1:需要反馈动作
                //             action.ack=1;
                //
                //             flow.pushAction(user,action);
                //             hasAction=true;
                //             room.appendCanSelectedUserAction(uid,action);
                //
                //         }
                //
                //     }
                //
                //
                // }



                flows.push(flow);

                if(hasForceAction)//吃 提 偎 强制出牌
                {


                    if(room.canSelectedUserActionCount()>0)
                    {

                        var users2=room.getRoomUsers();
                        for(var uid in users2) {
                            var user = users2[uid];
                            var roomUser=user.roomUser;
                            roomUser.clientAck=0;//反馈标志
                        }

                        //先显示 胡 ,再提或者偎或者跑
                        for(var uid in actionUserKeHu)
                        {
                            var obj=actionUserKeHu[uid];
                            flow.pushAction(obj.user,obj.action);
                            room.appendCanSelectedUserAction(uid,obj.action);
                            console.log("[可胡玩家:"+obj.user.name+"]");
                        }
                        room.clearOperateQueue();
                        room.setAckState(RoomDefine.ROOM_WAIT_SELECTED_STATE);
                        console.log("[等待选择-有强制]");

                    }
                    else{
                        if(forceActionUser!=null)
                        {
                            var flgIndex=forceActionUser.roomUser.index;
                            flgIndex+=1;
                            if(flgIndex>=room.playerCount)
                            {
                                flgIndex=0;
                            }
                            // var nextUser=room.getUserByIndex(flgIndex);
                            // if(nextUser.roomUser.type==RoomDefine.XIANJIA_TYPE)
                            // {
                            //     flgIndex+=1;
                            //     if(flgIndex>=room.playerCount)
                            //     {
                            //         flgIndex=0;
                            //     }
                            //     //nextUser=room.getUserByIndex(flgIndex);
                            // }

                            room.setTouchUserIndex(flgIndex);
                            this.logicFlow(FlowDefine.TOUCH_CARD,room,flows);
                        }
                        else{
                            this.logicFlow(FlowDefine.WAIT_PUT_CARD_NO,room,flows);
                        }

                    }


                }
                else if(hasAction||Object.keys(actionUserKeHu).length>0)
                {

                    // room.startTime=new Date().getTime();
                    if(hasForceAction)
                    {

                    }
                    var users2=room.getRoomUsers();
                    for(var uid in users2) {
                        var user = users2[uid];
                        var roomUser=user.roomUser;
                        roomUser.clientAck=0;//反馈标志
                    }


                    for(var uid in actionUserKeHu)
                    {
                        var obj=actionUserKeHu[uid];
                        flow.pushAction(obj.user,obj.action);
                        room.appendCanSelectedUserAction(uid,obj.action);

                        console.log("[可胡玩家:"+obj.user.name+"]");
                    }

                    room.clearOperateQueue();
                    room.setAckState(RoomDefine.ROOM_WAIT_SELECTED_STATE);
                    console.log("[等待选择]");
                }
                else{

                    //收摸牌流程
                    this.logicFlow(FlowDefine.TAKE_IN_AND_TOUCH,room,flows);

                }



            }
                break;
            case FlowDefine.PENG_NO:
            {
                var oper=room.operateQueue[0];
                room.clearOperateQueue();

                if(oper==undefined||oper==null)
                {
                    console.log("操作对象为null!!!");
                    return;
                }
                var users=room.getRoomUsers();
                for(var uid in users) {
                    var user = users[uid];
                    var roomUser=user.roomUser;
                    if(uid==oper.uid)
                    {

                        var arr=room.canSelectedUserAction[uid];
                        if(arr==undefined)
                        {
                            console.log("选择Action错误,uid:"+uid+",operUId:"+oper.uid+",canSelectedUserActionCount:"+room.canSelectedUserActionCount());
                            room.printCanSelectedUserAction();
                            return;
                        }

                        var len=arr.length;

                        for(var i=0;i<len;i++)
                        {
                            var action=arr[i];
                            console.log("can slected action.type:"+action.type);

                            if(action.type==RoomDefine.ACTION_KEPENG)
                            {
                                console.log("can slected action ACTION_KEPENG:");

                                var flow=this.createFlow(room,1);
                                action.type=RoomDefine.ACTION_PENG;
                                flow.pushAction(user,action);
                                flows.push(flow);//发牌动作

                                room.setPutCardUid(uid);//设置出牌者


                                var groupCards=action.groupCards;
                                var gSize=groupCards.length;
                                for(var j=0;j<gSize;j++)
                                {
                                    var gc=groupCards[j];
                                    var cards=gc.cards;

                                    roomUser.moveToCards2(cards);//移动牌
                                    break;
                                }


                                break;
                            }


                        }

                        break;
                    }

                }


                this.logicFlow(FlowDefine.WAIT_PUT_CARD_NO,room,flows);


            }
                break;
            case FlowDefine.CHI_NO:
            {

                var oper=room.operateQueue[0];
                room.clearOperateQueue();


                var users=room.getRoomUsers();
                for(var uid in users) {
                    var user = users[uid];
                    var roomUser=user.roomUser;
                    if(uid==oper.uid)
                    {
                        var flow=this.createFlow(room,1);
                        var action=new Socket.Action();
                        action.type=RoomDefine.ACTION_CHI;

                        var cardIds=oper.cardIds;
                        var size=cardIds.length;
                        var groupCard=new Socket.GroupCard();
                        for(var j=1;j<=size;j++)
                        {
                            var card=room.getCardById(roomUser,cardIds[j-1]);
                            if(card==null)
                            {
                                console.log("错误吃牌的Id"+cardIds[j-1]);

                                continue;
                            }

                            groupCard.cards.push(card);
                            if(j%3==0)
                            {
                                roomUser.moveToCards2(groupCard.cards);//移动牌

                                action.groupCards.push(groupCard);
                                groupCard=new Socket.GroupCard();


                            }

                        }
                        flow.pushAction(user,action);
                        flows.push(flow);//发牌动作
                        room.setPutCardUid(uid);//设置出牌者


                        break;
                    }

                }

                this.logicFlow(FlowDefine.WAIT_PUT_CARD_NO,room,flows);
            }
                break;
            case FlowDefine.HU_NO:
            {
                console.log("[胡牌流程]");

                var oper=room.operateQueue[0];
                room.clearOperateQueue();

                //var res=new Socket.GameFinishedNotify();

                var gameOver=false;

                var users=room.getRoomUsers();

                var zhuangjiaUser=null;
                for(var uid in users) {
                    var user = users[uid];
                    var roomUser = user.roomUser;
                    if(roomUser.type==RoomDefine.ZHUANGJIA_TYPE)
                    {
                        zhuangjiaUser=user;
                        break;
                    }
                }
                var flow=this.createFlow(room,1);
                var huAction=null;

                var huPaiUser=null;

                for(var uid in users) {
                    var user = users[uid];
                    var roomUser = user.roomUser;
                    roomUser.isReady=1;
                    roomUser.jiesuanHu=0;

                    if(uid==oper.uid)
                    {

                        huAction=room.getActionInCanSelected2(uid,RoomDefine.ACTION_KEHU);
                        if(huAction==null)
                        {
                            huAction=room.getActionInCanSelected2(uid,RoomDefine.ACTION_KEHU2);
                        }



                        roomUser.lastHuPai=1;//0:上局未胡牌,1:上局胡牌


                        var isSelf=false;
                        if(uid==room.tableTopObj.uid)
                        {
                            isSelf=true;
                        }
                        var obj=null;
                        if(room.lastTableObj!=null)
                        {
                            obj=roomUser.getRoomUserCardCaculateInfo(room.lastTableObj.card,isSelf,room.lastTableObj.touchOrPut);

                        }
                        else{
                            obj=roomUser.getRoomUserCardCaculateInfo(null,isSelf,0);
                        }


                        roomUser.obj=obj;

                        var qihu=9;
                        if(room.playerCount==4)
                        {
                            qihu=3;
                        }

                        var dunShu=obj.tableScore+obj.huScore-qihu;
                        if(dunShu<0)
                        {
                            dunShu=0;
                        }
                        else{
                            dunShu=dunShu/room.rule;//墩数
                            dunShu+=1;
                        }


                        dunShu=parseInt(dunShu);

                        roomUser.dunshu2=dunShu;

                        roomUser.jiesuanHu=obj.tableScore+obj.huScore;
                        roomUser.dunshu=dunShu;

                        huPaiUser=user;

                        //检查胡牌类型



                        //天胡
                        if(huAction!=null&&huAction.type2==1)//0:,1:天胡,2:地胡,3:自摸胡,4:脱庄,5:闲加分 6:放炮
                        {
                            roomUser.dunshu*=2;
                            console.log("[天胡囤x2]");
                        }

                        //地胡
                        if(huAction!=null&&huAction.type2==2)//1:天胡,2:地胡,3:自摸胡
                        {
                            roomUser.dunshu*=2;
                            console.log("[地胡囤x2]");
                        }
                        //自摸
                        if(huAction!=null&&huAction.type2==3)//1:天胡,2:地胡,3:自摸胡
                        {
                            roomUser.dunshu*=2;

                            console.log("[自摸囤x2]");
                        }

                        myDunShu=roomUser.dunshu;

                        //放炮
                        if(huAction!=null&&huAction.type2==6)//1:天胡,2:地胡,3:自摸胡
                        {

                            roomUser.dunshu*=room.playerCount;

                            console.log("[放炮x"+room.playerCount+"]");
                        }


                        var counts=roomUser.getRedCardCount();
                        var readCount=counts[0];
                        var maxCount=counts[1];



                        maxCount+=1;
                        if(room.lastTableObj!=null)
                        {
                            if(room.lastTableObj.card.value==2||room.lastTableObj.card.value==7||room.lastTableObj.card.value==10)
                            {
                                readCount+=1;
                            }
                        }

                        console.log("readCount:"+readCount+",maxCount:"+maxCount);

                        // //红胡
                        // if(readCount>=13)
                        // {
                        //     huAction.type3.push(7);
                        //
                        //     roomUser.dunshu*=2;
                        //
                        //     console.log("[红胡]");
                        // }
                        // //乌胡
                        // if(readCount==0)
                        // {
                        //     huAction.type3.push(8);
                        //
                        //     roomUser.dunshu*=2;
                        //
                        //     console.log("[乌胡]");
                        // }



                        if(huAction!=null&&huAction.type2==6)
                        {

                        }
                        else{
                            roomUser.dunshu=roomUser.dunshu*(room.playerCount-1);
                        }

                        roomUser.score1+=roomUser.dunshu;



                    }
                    else{

                        roomUser.lastHuPai=0;//0:上局未胡牌,1:上局胡牌

                    }




                }







                for(var uid in users) {
                    var user = users[uid];
                    var roomUser = user.roomUser;
                    roomUser.isFangPao=0;

                    // console.log("roomUser.jiesuanHu::"+roomUser.jiesuanHu);
                    if (uid == oper.uid) {

                        roomUser.score2=roomUser.jiesuanHu;
                        var action=new Socket.Action();
                        action.type=RoomDefine.ACTION_HU;
                        if(huAction!=null)
                        {
                            action.type2=huAction.type2;
                            action.type3=huAction.type3;
                        }

                        var player=flow.pushAction(user,action);
                        player.score1=roomUser.score1;
                        player.score2=roomUser.obj.tableScore;
                        player.shouZhongScore=roomUser.obj.huScore;

                    }
                    else{

                        if(huAction!=null&&huAction.type2==6)
                        {
                            //放炮者
                            if(room.tableTopObj.uid==uid)
                            {

                                roomUser.score1-=(myDunShu*room.playerCount);
                                roomUser.dunshu=-(myDunShu*room.playerCount);
                                roomUser.isFangPao=1;

                                var action=new Socket.Action();
                                action.type=RoomDefine.ACTION_NO;
                                flow.pushAction(user,action);

                                roomUser.score2=roomUser.jiesuanHu;

                                var action=new Socket.Action();
                                action.type=RoomDefine.ACTION_NO;
                                action.type2=0;
                                flow.pushAction(user,action);
                            }
                            else{

                                roomUser.score1-=0;
                                roomUser.dunshu=0;

                                var action=new Socket.Action();
                                action.type=RoomDefine.ACTION_NO;
                                flow.pushAction(user,action);

                                roomUser.score2=roomUser.jiesuanHu;

                                var action=new Socket.Action();
                                action.type=RoomDefine.ACTION_NO;
                                action.type2=0;
                                flow.pushAction(user,action);
                            }

                        }
                        else{
                            roomUser.score1-=myDunShu;
                            roomUser.dunshu=-myDunShu;

                            var action=new Socket.Action();
                            action.type=RoomDefine.ACTION_NO;
                            flow.pushAction(user,action);

                            roomUser.score2=roomUser.jiesuanHu;

                            var action=new Socket.Action();
                            action.type=RoomDefine.ACTION_NO;
                            action.type2=0;
                            flow.pushAction(user,action);
                        }



                    }

                }
                flows.finished=1;
                flows.push(flow);




                if((room.gameCount-1)<=0)
                {
                    var res=this.createGameFinishNotify(room,0,true);
                    res.state=1;//0:小局结束,1:全局结束
                    if(huAction!=null)
                    {
                        res.type=huAction.type2;
                        res.type2=huAction.type3;
                    }

                    MsgManager.getInstance().sendToRoomUser(room,Socket.MsgNumber.GAME_FINISHED_NOTIFY,res);
                    RoomManager.getInstance().removeRoom(room.roomId);
                }
                else{
                    var res=this.createGameFinishNotify(room,0,false);

                    if(huAction!=null)
                    {
                        res.type=huAction.type2;
                        res.type2=huAction.type3;
                    }

                    res.state=0;//0:小局结束,1:全局结束
                    MsgManager.getInstance().sendToRoomUser(room,Socket.MsgNumber.GAME_FINISHED_NOTIFY,res);

                    room.startTime=new Date().getTime();
                    room.setRoomState(RoomDefine.ROOM_WAIT_GOON_STATE);
                }



            }
                break;
            case FlowDefine.PUT_CARD_TIMEOUT_NO:
            {


            }
                break;
            case FlowDefine.SELECTD_TIMEOUT_NO:
            {


            }
                break;
            case FlowDefine.NO_ACTION_NO:
            {


            }
                break;
            case FlowDefine.CANCLE_SELECTED_NO:
            {


            }
                break;
            case FlowDefine.TAKE_IN_AND_TOUCH:
            {

                var tableTopObj=room.tableTopObj;
                var users=room.getRoomUsers();
                var nextUser=null;
                var flgIndex=-1;
                for(var uid in users)
                {
                    var user=users[uid];
                    var roomUser = user.roomUser;
                    if(uid==tableTopObj.uid)//收牌
                    {
                        var flow=this.createFlow(room,1);
                        var action=new Socket.Action();
                        action.type=RoomDefine.ACTION_TAKE_IN;
                        var groupCard=new Socket.GroupCard();
                        action.groupCards.push(groupCard);
                        groupCard.cards.push(tableTopObj.card);
                        flow.pushAction(user,action);
                        flows.push(flow);
                        roomUser.moveToCards3(tableTopObj.card);
                        flgIndex=roomUser.index;
                        flgIndex+=1;
                        if(RoomDefine.isTest==1)
                        {
                            room.playerCount=2;
                        }
                        if(flgIndex>=room.playerCount)
                        {
                            flgIndex=0;
                        }
                        // nextUser=room.getUserByIndex(flgIndex);
                        // if(nextUser.roomUser.type==RoomDefine.XIANJIA_TYPE)
                        // {
                        //     flgIndex+=1;
                        //     if(flgIndex>=room.playerCount)
                        //     {
                        //         flgIndex=0;
                        //     }
                        //     //nextUser=room.getUserByIndex(flgIndex);
                        // }

                        console.log("[old index:"+roomUser.index+",nextIndex:"+flgIndex+"]");
                        break;
                    }


                }

                room.setTouchUserIndex(flgIndex);
                this.logicFlow(FlowDefine.TOUCH_CARD,room,flows);

            }
                break;
            case FlowDefine.TOUCH_CARD:
            {

                var user=room.getUserByIndex(room.touchUserIndex);

                if(user==null)
                {
                    console.log("[错误:未找到下一个玩家]");
                }
                var flow=this.createFlow(room,1);

                var nextCard=room.nextCard();
                if(nextCard==null)
                {

                    console.log("[桌面无牌可发放]");


                    var action=new Socket.Action();
                    action.type=RoomDefine.ACTION_HUANGZHUANG;
                    flow.pushAction(user,action);



                    //var res=new Socket.GameFinishedNotify();

                    var zhuangJiaUser=null;
                    var users=room.getRoomUsers();
                    for(var uid in users) {
                        var user = users[uid];
                        var roomUser = user.roomUser;
                        roomUser.isReady=1;
                        roomUser.lastHuPai=0;
                        roomUser.jiesuanHu=0;
                        roomUser.dunshu=0;
                        roomUser.dunshu2=0;
                        roomUser.isFangPao=0;

                        if(roomUser.type==RoomDefine.ZHUANGJIA_TYPE)
                        {
                            zhuangJiaUser=user;
                        }
                        // var userInfo=new Socket.FinishUserInfo();
                        // userInfo.huxi=roomUser.score2;
                        // userInfo.zonghuxi=roomUser.score1;
                        // userInfo.uid=uid;
                        // userInfo.choushui=room.choushui;
                        // ////0:一胡一息,1:三胡一息,2:五胡一息
                        // if(room.rule==0)
                        // {
                        //     userInfo.score=roomUser.score2;
                        // }
                        // else if(room.rule==1)
                        // {
                        //     userInfo.score=roomUser.score2/3;
                        // }
                        // else if(room.rule==2)
                        // {
                        //     userInfo.score=roomUser.score2/5;
                        // }
                        //
                        // res.usersInfo.push(userInfo);
                    }

                    if(zhuangJiaUser!=null)
                    {
                        var xianUser=null;
                        for(var uid in users) {
                            var user = users[uid];
                            var roomUser = user.roomUser;
                            if (roomUser.type == RoomDefine.XIANJIA_TYPE) {


                                xianUser=user;
                                break;

                            }

                        }

                        // zhuangJiaUser.roomUser.score1-=10;
                        // zhuangJiaUser.roomUser.jiesuanHu=-10;

                        console.log("[黄庄-庄家 - "+10+"]");

                        if(xianUser!=null)
                        {
                            xianUser.roomUser.score1+=10;
                            xianUser.roomUser.jiesuanHu=10;

                            console.log("[黄庄-闲家 + "+10+"]");
                        }

                        //下家做庄

                        var flgIndex=zhuangJiaUser.roomUser.index;
                        flgIndex+=1;
                        if(flgIndex>=room.playerCount)
                        {
                            flgIndex=0;
                        }
                        var nextUser=room.getUserByIndex(flgIndex);
                        if(nextUser.roomUser.type==RoomDefine.XIANJIA_TYPE)
                        {
                            flgIndex+=1;
                            if(flgIndex>=room.playerCount)
                            {
                                flgIndex=0;
                            }

                        }


                        var nextZhuangJiaRoomUser=room.getUserByIndex(flgIndex);
                        room.lastZhuangUid=nextZhuangJiaRoomUser.uid;

                    }



                    for(var uid in users) {
                        var user = users[uid];
                        var roomUser = user.roomUser;
                        var action=new Socket.Action();
                        action.type=RoomDefine.ACTION_NO;
                        flow.pushAction(user,action);
                    }
                    flows.finished=2;
                    flows.push(flow);

                    var res=this.createGameFinishNotify(room,0,false);
                    if((room.gameCount-1)<=0)
                    {

                        res.state=1;
                        MsgManager.getInstance().sendToRoomUser(room,Socket.MsgNumber.GAME_FINISHED_NOTIFY,res);

                        RoomManager.getInstance().removeRoom(room.roomId);
                    }
                    else{
                        res.state=0;
                        MsgManager.getInstance().sendToRoomUser(room,Socket.MsgNumber.GAME_FINISHED_NOTIFY,res);

                        room.startTime=new Date().getTime();
                        room.setRoomState(RoomDefine.ROOM_WAIT_GOON_STATE);
                    }

                }
                else{
                    room.setCurrentCardOnTableTop(user.uid,nextCard,RoomDefine.ROOM_TOUCH_CARD_TYPE);
                    this.logicFlow(FlowDefine.PUT_CARD_NO,room,flows);
                }

            }
                break;
            case FlowDefine.FORCE_ACTION_AFTER_OPER:
            {
                //检查是否有胡

                var flow=this.createFlow(room,1);

                var forceAction=null;
                var foceUser=null;
                var isFirstFour=false;

                //检查是否有提
                var users=room.getRoomUsers();


                for(var uid in users) {
                    var user = users[uid];
                    var roomUser = user.roomUser;

                    var tianHu=room.getActionInCanSelected2(uid,RoomDefine.ACTION_KEHU);
                    if(tianHu!=null&&tianHu.type2==1)//1:天胡,2:地胡,3:自摸胡
                    {
                        //天胡

                        this.logicFlow(FlowDefine.START_AFTER_NO,room,flows);
                        console.log("[天胡,超时间后流程]");

                        return;
                    }
                    else if(tianHu!=null&&tianHu.type2==2)//地胡
                    {
                        this.logicFlow(FlowDefine.START_AFTER_NO,room,flows);
                        console.log("[地胡,流程]");

                        return;
                    }


                    //检查是否有胡2,强制胡
                    var action=room.getActionInCanSelected2(uid,RoomDefine.ACTION_KEHU2);
                    if(action!=null)
                    {
                        room.clearOperateQueue();
                        var arr=[];
                        room.pushOperateQueue(uid,2,arr);
                        this.logicFlow(FlowDefine.HU_NO,room,flows);

                        console.log("[超时间,强制胡牌-胡2]");

                        return;
                    }
                }

                for(var uid in users)
                {
                    var user=users[uid];
                    var roomUser=user.roomUser;

                    if(user.uid==room.tableTopObj.uid)
                    {
                        if(room.tableTopObj.touchOrPut==RoomDefine.ROOM_TOUCH_CARD_TYPE)
                        {

                            var action=room.getActionInCanSelected2(uid,RoomDefine.ACTION_TI);
                            if(action==null)
                            {
                                action=room.getActionInCanSelected2(uid,RoomDefine.ACTION_TI2);
                            }

                            if(action!=null)
                            {
                                console.log("[选择操作后处理-提]");
                                foceUser=user;
                                isFirstFour=action.firstFour;
                                //forceAction=roomUser.checkTiAndPao(room.tableTopObj.card,true,true,false);
                                break;
                            }
                            else{


                                action=room.getActionInCanSelected2(uid,RoomDefine.ACTION_PAO);
                                if(action==null)
                                {
                                    action=room.getActionInCanSelected2(uid,RoomDefine.ACTION_PAO2);
                                }

                                if(action!=null)
                                {
                                    isFirstFour=action.firstFour;

                                    console.log("[选择操作后处理-跑#1]");
                                    foceUser=user;
                                    forceAction=roomUser.checkTiAndPao(room.tableTopObj.card,false,true,false);


                                    break;
                                }

                            }

                        }
                    }
                    else{ //检查是否有跑

                        var action=room.getActionInCanSelected2(uid,RoomDefine.ACTION_PAO);
                        if(action==null)
                        {
                            action=room.getActionInCanSelected2(uid,RoomDefine.ACTION_PAO2);
                        }

                        if(action!=null)
                        {
                            isFirstFour=action.firstFour;

                            if(room.tableTopObj.touchOrPut==RoomDefine.ROOM_TOUCH_CARD_TYPE)
                            {
                                console.log("[选择操作后处理-跑#3]");

                                foceUser=user;
                                forceAction=roomUser.checkTiAndPao(room.tableTopObj.card,false,true,false);

                            }
                            else{
                                console.log("[选择操作后处理-跑#4]");
                                foceUser=user;
                                forceAction=roomUser.checkTiAndPao(room.tableTopObj.card,false,false,false);

                            }

                            break;
                        }



                    }



                }
                var isWei=false;
                //检查是否有偎
                for(var uid in users)
                {
                    var user=users[uid];
                    var roomUser=user.roomUser;

                    var action=room.getActionInCanSelected2(uid,RoomDefine.ACTION_WEI);

                    if(action!=null)
                    {
                        if(room.tableTopObj.touchOrPut==RoomDefine.ROOM_TOUCH_CARD_TYPE)
                        {
                            console.log("[选择操作后处理-偎]");
                            foceUser=user;
                            isWei=true;
                            //forceAction = roomUser.checkPeng(room.tableTopObj.card, true, true);
                        }
                        break;
                    }

                }

                if(foceUser!=null)
                {
                    if(forceAction!=null)
                    {
                        flow.pushAction(foceUser,forceAction);
                        flows.push(flow);
                        console.log("[选择后处理-跑-加入流程]");
                    }
                    else {
                        console.log("[选择后处理-action为null]");
                    }


                    room.setPutCardUid(foceUser.uid);//设置出牌者

                    if(isWei)
                    {
                        this.logicFlow(FlowDefine.WAIT_PUT_CARD_NO,room,flows)
                    }
                    else{
                        if(!isFirstFour)//只有第一次跑才出牌,其他情况下不出牌
                        {
                            var flgIndex=foceUser.roomUser.index;
                            flgIndex+=1;
                            if(flgIndex>=room.playerCount)
                            {
                                flgIndex=0;
                            }
                            // var nextUser=room.getUserByIndex(flgIndex);
                            // if(nextUser.roomUser.type==RoomDefine.XIANJIA_TYPE)
                            // {
                            //     flgIndex+=1;
                            //     if(flgIndex>=room.playerCount)
                            //     {
                            //         flgIndex=0;
                            //     }
                            //     //nextUser=room.getUserByIndex(flgIndex);
                            // }

                            room.setTouchUserIndex(flgIndex);
                            this.logicFlow(FlowDefine.TOUCH_CARD,room,flows);

                        }
                        else{
                            this.logicFlow(FlowDefine.WAIT_PUT_CARD_NO,room,flows)
                        }
                        foceUser.roomUser.firstFour=false;
                    }



                }
                else{
                    this.logicFlow(FlowDefine.TAKE_IN_AND_TOUCH,room,flows)
                }

            }
                break;


        }

    }


    this.nextGame=function (room) {

        room.gameCount--;
        if(room.gameCount>0)
        {
            //下一局
            console.log("[下一局开始:"+room.gameCount+"]");
            room.setRoomState(RoomDefine.ROOM_ACTION_STATE);
            room.setFlowNomber(FlowDefine.START_NO);

            var roomInfo=room.getRoomInfo();
            var res=new Socket.RoomInfoFlushNotify();
            res.roomInfo=roomInfo;
            MsgManager.getInstance().sendToRoomUser(room,Socket.MsgNumber.ROOM_INFO_FLUSH_NOTIFY,res);

        }
        else{
            //牌局结束
            console.log("[牌局结束]");

        }

    }

    this.createGameFinishNotify=function (room,type,isGameOver) {


        var res=new Socket.GameFinishedNotify();
        room.appendRoomHistoryFinishedNotify(res);


        var nextCard=room.nextCard();
        while(nextCard!=null)
        {
            res.cards.push(nextCard);
            nextCard=room.nextCard();
        }
        var users=room.getRoomUsers();
        var nextUser=null;
        var flgIndex=-1;
        for(var uid in users) {
            var user = users[uid];
            var roomUser = user.roomUser;
            var obj=roomUser.obj;


            // if(isGameOver)
            // {
            //
            //     for(var uid in users) {
            //         var user = users[uid];
            //         var roomUser = user.roomUser;
            //         var val=Math.round(roomUser.score1);
            //         console.log("[牌局结束,总胡息四舍五入,原值:"+roomUser.score1+",舍入后:"+val+"]");
            //         roomUser.score1=val;
            //
            //     }
            //
            // }


            var userInfo=new Socket.FinishUserInfo();

            if(type==0)//正常打完
            {
                userInfo.huxi=roomUser.jiesuanHu;
                if(roomUser.dunshu!=undefined)
                {
                    userInfo.dunshu=roomUser.dunshu;
                    userInfo.dunshu2=roomUser.dunshu2;
                }
                else{
                    userInfo.dunshu=0;
                    userInfo.dunshu2=0;
                }
                userInfo.zonghuxi=roomUser.score1;
                userInfo.uid=uid;
                userInfo.roleType=roomUser.type;
                userInfo.isHuPai=roomUser.lastHuPai;
                userInfo.isFangPao=0;

                if(roomUser.isFangPao!=undefined)
                {
                    userInfo.isFangPao=roomUser.isFangPao;
                }
            }
            else{//打了半局结束
                userInfo.huxi=0;
                userInfo.zonghuxi=roomUser.score1;
                userInfo.uid=uid;
                userInfo.roleType=roomUser.type;
                userInfo.isHuPai=0;
                userInfo.dunshu=0;
                roomUser.dunshu2=0;
            }


            ////0:一胡一息,1:三胡一息,2:五胡一息
            if(room.rule==0)
            {
                userInfo.score=roomUser.score2;
            }
            else if(room.rule==1)
            {
                userInfo.score=roomUser.score2/3;
            }
            else if(room.rule==2)
            {
                userInfo.score=roomUser.score2/5;
            }
            userInfo.yuanbao=user.gold;


            if(userInfo.isHuPai==1)
            {


                var cLen=obj.cards2.length;
                for(var i=0;i<cLen;i++)
                {
                    var arr=obj.cards2[i];

                    var  size=arr.length;
                    for(var j=0;j<size;j++)
                    {
                        var cc=arr[j];
                        if(room.lastTableObj!=null&&cc.c_id==room.lastTableObj.card.c_id)
                        {
                            cc.flg2=1;
                        }

                    }

                    var groupCard=new Socket.GroupCard();
                    groupCard.cards=arr;
                    userInfo.cards2.push(groupCard);
                }

                cLen=obj.cards1.length;
                for(var i=0;i<cLen;i++)
                {
                    var arr=obj.cards1[i];

                    var  size=arr.length;
                    for(var j=0;j<size;j++)
                    {
                        var cc=arr[j];
                        if(room.lastTableObj!=null&&cc.c_id==room.lastTableObj.card.c_id)
                        {
                            cc.flg2=1;
                        }

                    }


                    var groupCard=new Socket.GroupCard();
                    groupCard.cards=arr;
                    userInfo.cards2.push(groupCard);
                }

                console.log("userInfo.cards2:::"+userInfo.cards2.length);

                // var groupArr=[];
                // if(roomUser.checkIsBiZi(roomUser.cards1,groupArr))
                // {
                //     var gLen=groupArr.length;
                //     for(var k=0;k<gLen;k++)
                //     {
                //         var tmpArr=groupArr[k];
                //
                //         var groupCard=new Socket.GroupCard();
                //         groupCard.cards=tmpArr;
                //         userInfo.cards2.push(groupCard);
                //     }
                //
                // }
                // else{
                //     console.log("[***胡牌状态和牌对不上!]");
                // }



            }
            else{
                // for(var c_id in roomUser.cards1)
                // {
                //     userInfo.cards1.push(roomUser.cards1[c_id]);
                //
                // }
                //
                var cLen=roomUser.cards2.length;
                for(var i=0;i<cLen;i++)
                {
                    var arr=roomUser.cards2[i];
                    var groupCard=new Socket.GroupCard();
                    groupCard.cards=arr;
                    userInfo.cards2.push(groupCard);
                }

                var group=roomUser.sortRoomUserCard();
                var cLen=group.length;
                for(var i=0;i<cLen;i++)
                {
                    var arr=group[i];
                    var groupCard=new Socket.GroupCard();
                    groupCard.cards=arr;
                    userInfo.cards2.push(groupCard);
                }

            }


            // cLen=roomUser.cards3.length;
            // for(var i=0;i<cLen;i++)
            // {
            //     var cd=roomUser.cards3[i];
            //     userInfo.cards3.push(cd);
            // }
            res.usersInfo.push(userInfo);

        }

        return res;

    }


}

module.exports = GameLogic_BinZhou;
