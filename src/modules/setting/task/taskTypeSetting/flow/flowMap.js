const FLOW_MAP = {
    create: {
        name: '新建工单',
        desc: '工单管理员新建工单，状态为【待指派】',
        icon: 'icon-xinjian',
        isSystem: true,
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

export default FLOW_MAP;