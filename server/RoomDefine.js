/**
 * Created by yungu on 16/11/7.
 */

var RoomDefine={


    PLAYER_TYPE:0,
    ZHUANGJIA_TYPE:1,
    XIANJIA_TYPE:2,

//比 偎 提 跑 是强制动作
    ACTION_FAPAI:0,//发牌
    ACTION_TI:1,//1:提
    ACTION_PAO:2,//2:跑
    ACTION_KECHI:3,//3:可吃
    ACTION_CHI:4,//4:吃
    ACTION_KEHU:5,//5:可胡
    ACTION_HU:6,//6:胡
    ACTION_KEPENG:7,//7:可碰
    ACTION_PENG:8,//8:碰
    ACTION_WAIT_PUT:9,//9:等待出牌
    ACTION_PUT:10,//10:出牌
    ACTION_HIDE_BUTTON:11,// 11:隐藏选择按钮
    ACTION_CANCLE_TIMEOUT:12,// 12:取消超时等待
    ACTION_WEI:13,// 13:偎
    ACTION_TOUCH:14,// 14:摸
    ACTION_TAKE_IN:15,  //收
    ACTION_GET:16,  //补
    ACTION_TI2:17,//1:通过偎转提
    ACTION_PAO2:18,//1:通过碰转跑
    ACTION_HUANGZHUANG:19,//黄庄
    ACTION_KEHU2:20,//5:可胡2
    ACTION_NO:21,//无动作
    ACTION_CARD_MOVE_TO_CARDS1:22,//移动到玩家手里
    ACTION_TOUCH_CARD2:23,//
    ACTION_TAKE_IN2:24,
    ACTION_KE_BAOPAI:25,//有爆牌
    ACTION_BAOPAI:26,//爆牌

    POS_3_PLAYER:3,
    POS_4_PLAYER:4,

    ROOM_WAIT_START_STATE:-1,
    ROOM_ACTION_STATE:0,
    ROOM_WAIT_PUT_CARD_STATE:1,
    ROOM_WAIT_SELECTED_STATE:2,
    ROOM_WAIT_GOON_STATE:3,
    ROOM_WAIT_ACK_STATE:4,
    ROOM_DISMISS_STATE:5,


    //0:put,1:touch
    ROOM_PUT_CARD_TYPE:0,
    ROOM_TOUCH_CARD_TYPE:1,

    CAN_HU_COUNT:10,//10胡起胡
    NO_WAIT_TIMEOUT:1,//1:无时间限制,0:有时间限制



    //1:剥皮,2:红胡147,3:郴州字牌
    ROOM_TYPE_BOPI:1,
    ROOM_TYPE_HONGHU_147:2,
    ROOM_TYPE_BINZHOU:3,
    ROOM_TYPE_LUZHOUDAER:4,

    CHECK_GOLD:0,//0:不扣除元宝,1:扣除元宝


    isTest:0,
    isTest2:0,

};



module.exports = RoomDefine;