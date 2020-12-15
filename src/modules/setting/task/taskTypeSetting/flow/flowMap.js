import _ from "lodash";

const FLOW_MAP = {
    create: {
        name: '新建工单',
        desc: '工单管理员新建工单，状态为【待指派】',
        icon: 'icon-xinjian',
        isSystem: true,
        planRemindSetting: {},
        overTimeSetting: {}

    },
    allot: {
        name: '指派工单',
        desc: '工单管理员指派工单，状态为【已指派】 ',
        icon: 'icon-zhipai',
        isSystem: true
    },
    accept: {
        name: '接受工单',
        desc: '工单负责人接受指派的工单，状态为【已接受】	',
        icon: 'icon-jieshou',
        isSystem: true
    },
    start: {
        name: '开始工单',
        desc: '工单负责人开始处理工单，状态为【进行中】	',
        icon: 'icon-kaishi',
        isSystem: false
    },
    finish: {
        name: '完成工单',
        desc: '工单负责人分完成工单，状态为【已完成】	',
        icon: 'icon-wancheng',
        isSystem: true
    },
    cost: {
        name: '结算工单',
        desc: '结算人员审核并确认工单，状态为【已结算】 ',
        icon: 'icon-jiesuan',
        isSystem: false
    },
    review: {
        name: '回访工单',
        desc: '回访人员记录工单回访信息，状态为【已回访】	',
        icon: 'icon-huifang',
        isSystem: false
    },
    close: {
        name: '关闭工单',
        desc: '工单闭环，状态为【已关闭】',
        icon: 'icon-jieshu',
        isSystem: true
    },
}

// todo_zr: 相关审批设置还没有定义
// 初始化流程设置的配置
let defaultFlowSetting = {
    isOpen: false, // 是否启用

    overTime: '', // 超时提醒时间
    overTimeRemindType: '', // 超时提醒类型
    overTimeSetting: { // 超时提醒设置
        state: false,
        isAhead: 1,
        hours: '' // 超时提醒小时
    },

    autoReview: false, // 自动回访开关
    delayBack: false,  // 短信延迟发送开关
    delayBackMin: '', // 延迟发送时间

    autoClose: false, // 工单自动关闭开关
    closeView: false, // 关闭工单查看权限开关
    closeNoViewAuth: [], // 工单关闭后不允许查看权限
}

for (const key in FLOW_MAP) {
    FLOW_MAP[key] = {
        ...FLOW_MAP[key],
        ..._.cloneDeep(defaultFlowSetting)
    }
}

export default FLOW_MAP;