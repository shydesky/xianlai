/**
 * Created by yungu on 16/11/5.
 */



var FlowDefine={

    WAIT_NO:0,
    START_NO:1,//开始
    WAIT_PUT_CARD_NO:2,//等待出牌
    PUT_CARD_NO:3,//出牌
    PENG_NO:4,//碰
    CHI_NO:5,//吃
    HU_NO:6,//胡
    PUT_CARD_TIMEOUT_NO:7,//出牌超时
    SELECTD_TIMEOUT_NO:8,//碰或者吃或者胡超时
    NO_ACTION_NO:9,//无动作
    CANCLE_SELECTED_NO:10,//取消动作
    TAKE_IN_AND_TOUCH:11,//收摸流程
    TOUCH_CARD:12,//摸流程
    FORCE_ACTION_AFTER_OPER:13,//操作取消后是否有强制动作
    START_AFTER_NO:14,//操作取消后是否有强制动作
    TOUCH_21_CARD_NO:15,//发21张牌流程
    START_AFTER_NO2:16,//黑摆 3拢4坎 未胡后处理
};


module.exports = FlowDefine;