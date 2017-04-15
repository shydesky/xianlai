var EnterSceneRequest=require("./body/EnterSceneRequest");
var EnterSceneResponse=require("./body/EnterSceneResponse");
var RandomMatchRequest=require("./body/RandomMatchRequest");
var RandomMatchResponse=require("./body/RandomMatchResponse");
var CreateRoomRequest=require("./body/CreateRoomRequest");
var CreateRoomResponse=require("./body/CreateRoomResponse");
var JoinRoomRequest=require("./body/JoinRoomRequest");
var JoinRoomResponse=require("./body/JoinRoomResponse");
var PutCardRequest=require("./body/PutCardRequest");
var PutCardResponse=require("./body/PutCardResponse");
var OperateCardRequest=require("./body/OperateCardRequest");
var OperateCardResponse=require("./body/OperateCardResponse");
var PassOperateRequest=require("./body/PassOperateRequest");
var PassOperateResponse=require("./body/PassOperateResponse");
var ReadyRequest=require("./body/ReadyRequest");
var ReadyResponse=require("./body/ReadyResponse");
var GetZhanJiRequest=require("./body/GetZhanJiRequest");
var GetZhanJiResponse=require("./body/GetZhanJiResponse");
var CheckOldRoomRequest=require("./body/CheckOldRoomRequest");
var CheckOldRoomResponse=require("./body/CheckOldRoomResponse");
var AckRequest=require("./body/AckRequest");
var GetInfoRequest=require("./body/GetInfoRequest");
var GetInfoResponse=require("./body/GetInfoResponse");
var GetRankRequest=require("./body/GetRankRequest");
var GetRankResponse=require("./body/GetRankResponse");
var MsgRequest=require("./body/MsgRequest");
var MsgResponse=require("./body/MsgResponse");
var DismissRequest=require("./body/DismissRequest");
var DismissResponse=require("./body/DismissResponse");
var DismissSelRequest=require("./body/DismissSelRequest");
var PlayRequest=require("./body/PlayRequest");
var PlayResponse=require("./body/PlayResponse");
var GetRoleInfoRequest=require("./body/GetRoleInfoRequest");
var PlayEffectRequest=require("./body/PlayEffectRequest");
var PlayEffectResponse=require("./body/PlayEffectResponse");
var AckResponse=require("./body/AckResponse");
var FlowsAckRequest=require("./body/FlowsAckRequest");
var BindUserRequest=require("./body/BindUserRequest");
var BindUserResponse=require("./body/BindUserResponse");
var BindMyRequest=require("./body/BindMyRequest");
var BindMyResponse=require("./body/BindMyResponse");
var FlowsNotify=require("./body/FlowsNotify");
var RoomInfoNotify=require("./body/RoomInfoNotify");
var FlushRoomNotify=require("./body/FlushRoomNotify");
var LeaveRoomNotify=require("./body/LeaveRoomNotify");
var RoomInfoFlushNotify=require("./body/RoomInfoFlushNotify");
var GameFinishedNotify=require("./body/GameFinishedNotify");
var OffLineNotify=require("./body/OffLineNotify");
var RoomPlayerCardsNotify=require("./body/RoomPlayerCardsNotify");
var YuYinNotify=require("./body/YuYinNotify");
var DismissNotify=require("./body/DismissNotify");
var GongGaoNotify=require("./body/GongGaoNotify");
var RoleInfoNotify=require("./body/RoleInfoNotify");
var PlayBackFinishInfoNotify=require("./body/PlayBackFinishInfoNotify");
var IndexHandRequest=require("./body/IndexHandRequest");
var ServerHandPayRequest=require("./body/ServerHandPayRequest");
var ServerHandPayResponse=require("./body/ServerHandPayResponse");
var HeartServerToClientRequest=require("./body/HeartServerToClientRequest");
var HeartServerToClientResponse=require("./body/HeartServerToClientResponse");
var HeartClientToServerRequest=require("./body/HeartClientToServerRequest");
var HeartClientToServerResponse=require("./body/HeartClientToServerResponse");
var UserSessionClosed=require("./body/UserSessionClosed");
var RoleInfo=require("./body/RoleInfo");
var Flow=require("./body/Flow");
var Player=require("./body/Player");
var Action=require("./body/Action");
var GroupCard=require("./body/GroupCard");
var Card=require("./body/Card");
var RoomUserInfo=require("./body/RoomUserInfo");
var RoomInfo=require("./body/RoomInfo");
var FinishUserInfo=require("./body/FinishUserInfo");
var ZhanJi=require("./body/ZhanJi");
var PlayerCards=require("./body/PlayerCards");
var Rank=require("./body/Rank");
var DismissObj=require("./body/DismissObj");
var PlayBackFinisheGameInfo=require("./body/PlayBackFinisheGameInfo");
var BindObj=require("./body/BindObj");
var ZhanjiMeiJu=require("./body/ZhanjiMeiJu");
var ZhanJiObj=require("./body/ZhanJiObj");

var MsgNumber=require("./MsgIds");
var MessageFactory=(function()
{
 var unique;
 function getInstance(){
 return unique || ( unique = new MessageFactoryClass() );
}
return {
getInstance : getInstance
 }
})();
var MessageFactoryClass= function()
{
	this.build=function( msgNumber,buf)
	{
		var responseObj;
 		switch (msgNumber) {
		case MsgNumber.ENTER_SCENE_REQUEST:
		{
			responseObj=new EnterSceneRequest();
			responseObj.read(buf);
		}
 		break;
		case MsgNumber.ENTER_SCENE_RESPONSE:
		{
			responseObj=new EnterSceneResponse();
			responseObj.read(buf);
		}
 		break;
		case MsgNumber.RANDOM_MATCH_REQUEST:
		{
			responseObj=new RandomMatchRequest();
			responseObj.read(buf);
		}
 		break;
		case MsgNumber.RANDOM_MATCH_RESPONSE:
		{
			responseObj=new RandomMatchResponse();
			responseObj.read(buf);
		}
 		break;
		case MsgNumber.CREATE_ROOM_REQUEST:
		{
			responseObj=new CreateRoomRequest();
			responseObj.read(buf);
		}
 		break;
		case MsgNumber.CREATE_ROOM_RESPONSE:
		{
			responseObj=new CreateRoomResponse();
			responseObj.read(buf);
		}
 		break;
		case MsgNumber.JOIN_ROOM_REQUEST:
		{
			responseObj=new JoinRoomRequest();
			responseObj.read(buf);
		}
 		break;
		case MsgNumber.JOIN_ROOM_RESPONSE:
		{
			responseObj=new JoinRoomResponse();
			responseObj.read(buf);
		}
 		break;
		case MsgNumber.PUT_CARD_REQUEST:
		{
			responseObj=new PutCardRequest();
			responseObj.read(buf);
		}
 		break;
		case MsgNumber.PUT_CARD_RESPONSE:
		{
			responseObj=new PutCardResponse();
			responseObj.read(buf);
		}
 		break;
		case MsgNumber.OPERATE_CARD_REQUEST:
		{
			responseObj=new OperateCardRequest();
			responseObj.read(buf);
		}
 		break;
		case MsgNumber.OPERATE_CARD_RESPONSE:
		{
			responseObj=new OperateCardResponse();
			responseObj.read(buf);
		}
 		break;
		case MsgNumber.PASS_OPERATE_REQUEST:
		{
			responseObj=new PassOperateRequest();
			responseObj.read(buf);
		}
 		break;
		case MsgNumber.PASS_OPERATE_RESPONSE:
		{
			responseObj=new PassOperateResponse();
			responseObj.read(buf);
		}
 		break;
		case MsgNumber.READY_REQUEST:
		{
			responseObj=new ReadyRequest();
			responseObj.read(buf);
		}
 		break;
		case MsgNumber.READY_RESPONSE:
		{
			responseObj=new ReadyResponse();
			responseObj.read(buf);
		}
 		break;
		case MsgNumber.GET_ZHANJI_REQUEST:
		{
			responseObj=new GetZhanJiRequest();
			responseObj.read(buf);
		}
 		break;
		case MsgNumber.GET_ZHANJI_RESPONSE:
		{
			responseObj=new GetZhanJiResponse();
			responseObj.read(buf);
		}
 		break;
		case MsgNumber.CHECK_OLD_ROOM_REQUEST:
		{
			responseObj=new CheckOldRoomRequest();
			responseObj.read(buf);
		}
 		break;
		case MsgNumber.CHECK_OLD_ROOM_RESPONSE:
		{
			responseObj=new CheckOldRoomResponse();
			responseObj.read(buf);
		}
 		break;
		case MsgNumber.ACK_REQUEST:
		{
			responseObj=new AckRequest();
			responseObj.read(buf);
		}
 		break;
		case MsgNumber.GET_INFO_REQUEST:
		{
			responseObj=new GetInfoRequest();
			responseObj.read(buf);
		}
 		break;
		case MsgNumber.GET_INFO_RESPONSE:
		{
			responseObj=new GetInfoResponse();
			responseObj.read(buf);
		}
 		break;
		case MsgNumber.GET_RANK_REQUEST:
		{
			responseObj=new GetRankRequest();
			responseObj.read(buf);
		}
 		break;
		case MsgNumber.GET_RANK_RESPONSE:
		{
			responseObj=new GetRankResponse();
			responseObj.read(buf);
		}
 		break;
		case MsgNumber.MSG_REQUEST:
		{
			responseObj=new MsgRequest();
			responseObj.read(buf);
		}
 		break;
		case MsgNumber.MSG_RESPONSE:
		{
			responseObj=new MsgResponse();
			responseObj.read(buf);
		}
 		break;
		case MsgNumber.DISMISS_REQUEST:
		{
			responseObj=new DismissRequest();
			responseObj.read(buf);
		}
 		break;
		case MsgNumber.DISMISS_RESPONSE:
		{
			responseObj=new DismissResponse();
			responseObj.read(buf);
		}
 		break;
		case MsgNumber.DISMISS_SEL_REQUEST:
		{
			responseObj=new DismissSelRequest();
			responseObj.read(buf);
		}
 		break;
		case MsgNumber.PLAY_REQUEST:
		{
			responseObj=new PlayRequest();
			responseObj.read(buf);
		}
 		break;
		case MsgNumber.PLAY_RESPONSE:
		{
			responseObj=new PlayResponse();
			responseObj.read(buf);
		}
 		break;
		case MsgNumber.GET_ROLE_INFO_REQUEST:
		{
			responseObj=new GetRoleInfoRequest();
			responseObj.read(buf);
		}
 		break;
		case MsgNumber.PLAY_EFFECT_REQUEST:
		{
			responseObj=new PlayEffectRequest();
			responseObj.read(buf);
		}
 		break;
		case MsgNumber.PLAY_EFFECT_RESPONSE:
		{
			responseObj=new PlayEffectResponse();
			responseObj.read(buf);
		}
 		break;
		case MsgNumber.ACK_RESPONSE:
		{
			responseObj=new AckResponse();
			responseObj.read(buf);
		}
 		break;
		case MsgNumber.FLOWS_ACK_REQUEST:
		{
			responseObj=new FlowsAckRequest();
			responseObj.read(buf);
		}
 		break;
		case MsgNumber.BIND_USER_REQUEST:
		{
			responseObj=new BindUserRequest();
			responseObj.read(buf);
		}
 		break;
		case MsgNumber.BIND_USER_RESPONSE:
		{
			responseObj=new BindUserResponse();
			responseObj.read(buf);
		}
 		break;
		case MsgNumber.BIND_MY_REQUEST:
		{
			responseObj=new BindMyRequest();
			responseObj.read(buf);
		}
 		break;
		case MsgNumber.BIND_MY_RESPONSE:
		{
			responseObj=new BindMyResponse();
			responseObj.read(buf);
		}
 		break;
		case MsgNumber.FLOWS_NOTIFY:
		{
			responseObj=new FlowsNotify();
			responseObj.read(buf);
		}
 		break;
		case MsgNumber.ROOM_INFO_NOTIFY:
		{
			responseObj=new RoomInfoNotify();
			responseObj.read(buf);
		}
 		break;
		case MsgNumber.FLUSH_ROOM_NOTIFY:
		{
			responseObj=new FlushRoomNotify();
			responseObj.read(buf);
		}
 		break;
		case MsgNumber.LEAVE_ROOM_NOTIFY:
		{
			responseObj=new LeaveRoomNotify();
			responseObj.read(buf);
		}
 		break;
		case MsgNumber.ROOM_INFO_FLUSH_NOTIFY:
		{
			responseObj=new RoomInfoFlushNotify();
			responseObj.read(buf);
		}
 		break;
		case MsgNumber.GAME_FINISHED_NOTIFY:
		{
			responseObj=new GameFinishedNotify();
			responseObj.read(buf);
		}
 		break;
		case MsgNumber.OFF_LINE_NOTIFY:
		{
			responseObj=new OffLineNotify();
			responseObj.read(buf);
		}
 		break;
		case MsgNumber.ROOM_PLAYER_CARDS_NOTIFY:
		{
			responseObj=new RoomPlayerCardsNotify();
			responseObj.read(buf);
		}
 		break;
		case MsgNumber.YUYIN_NOTIFY:
		{
			responseObj=new YuYinNotify();
			responseObj.read(buf);
		}
 		break;
		case MsgNumber.DISMISS_NOTIFY:
		{
			responseObj=new DismissNotify();
			responseObj.read(buf);
		}
 		break;
		case MsgNumber.GONGGAO_NOTIFY:
		{
			responseObj=new GongGaoNotify();
			responseObj.read(buf);
		}
 		break;
		case MsgNumber.ROLEINFO_NOTIFY:
		{
			responseObj=new RoleInfoNotify();
			responseObj.read(buf);
		}
 		break;
		case MsgNumber.PLAY_BACK_FINISH_INFO_NOTIFY:
		{
			responseObj=new PlayBackFinishInfoNotify();
			responseObj.read(buf);
		}
 		break;
		case MsgNumber.INDEX_HAND_REQUEST:
		{
			responseObj=new IndexHandRequest();
			responseObj.read(buf);
		}
 		break;
		case MsgNumber.SERVER_HAND_PAY_REQUEST:
		{
			responseObj=new ServerHandPayRequest();
			responseObj.read(buf);
		}
 		break;
		case MsgNumber.SERVER_HAND_PAY_RESPONSE:
		{
			responseObj=new ServerHandPayResponse();
			responseObj.read(buf);
		}
 		break;
		case MsgNumber.HEART_SERVER_TO_CLIENT_REQUEST:
		{
			responseObj=new HeartServerToClientRequest();
			responseObj.read(buf);
		}
 		break;
		case MsgNumber.HEART_SERVER_TO_CLIENT_RESPONSE:
		{
			responseObj=new HeartServerToClientResponse();
			responseObj.read(buf);
		}
 		break;
		case MsgNumber.HEART_CLIENT_TO_SERVER_REQUEST:
		{
			responseObj=new HeartClientToServerRequest();
			responseObj.read(buf);
		}
 		break;
		case MsgNumber.HEART_CLIENT_TO_SERVER_RESPONSE:
		{
			responseObj=new HeartClientToServerResponse();
			responseObj.read(buf);
		}
 		break;
		case MsgNumber.USER_SESSION_CLOSED:
		{
			responseObj=new UserSessionClosed();
			responseObj.read(buf);
		}
 		break;
		default:
		break;
	}
buf=null;
return responseObj;
}
}
module.exports = MessageFactory;
