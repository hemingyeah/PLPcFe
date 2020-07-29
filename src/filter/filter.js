import TaskStateEnum from '../model/enum/TaskStateEnum';
import EventStateEnum from '../model/enum/EventStateEnum';

export default {
    //格式化地址显示
    "prettyAddress": function(value = {}) {
        let province = value.adProvince || value.province || '';
        let city = value.adCity || value.city || '';
        let dist = value.adDist || value.dist || '';
        let address = value.adAddress || value.address || '';

        return province + city + dist + address;
    },

    //事件状态名称
    "eventStateName": function(value) {
        return EventStateEnum.getName(value) || '';
    },

    //工单状态名称
    "taskStateName": function(value) {
        return TaskStateEnum.getName(value) || '';
    },

    //过滤特殊字符
    "escape": function(value) {
        return value.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    },

    //格式化时间, 毫秒数转字符串
    "fmt": function(value) {
        if (!value || isNaN(value)) return value;

        let date = new Date(value);

        var year = date.getFullYear();

        var month = date.getMonth() + 1;
        if (month < 10) month = "0" + month;

        var day = date.getDate();
        if (day < 10) day = "0" + day;

        var hour = date.getHours();
        if (hour < 10) hour = "0" + hour;

        var minute = date.getMinutes();
        if (minute < 10) minute = "0" + minute;

        var second = date.getSeconds();
        if (second < 10) second = "0" + second;

        return year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
    },

    //时间截取前16位，不保留秒
    "fmt_16": function(value) {
        let reg = /^[1-9]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])\s{1}(20|21|22|23|[0-1]\d):[0-5]\d:[0-5]\d$/;

        return reg.test(value) ? value.slice(0, -3) : value;
    },

    "fmt_16_10": function(value) {
        value = value || '';
        if (value) value = value.replace(' 00:00', '')
        return value;
    },

    //保留两位小数
    "fixed_2": function(value) {
        //不是数字 或 是NaN 或 是无穷，直接返回原值
        if (typeof value != 'number' || isNaN(value) || !isFinite(value)) return value;

        let integer = value >> 0; //取整
        return integer === value ? value + '.00' : value.toFixed(2);
    },

    toPercent(value) {
        if (typeof value != 'string' && typeof value != 'number') return '--';
        if (isNaN(value) || value == 0) return '--';

        return (value * 100).toFixed(2) + '%';
    },
    convertZero(value) {
        if (typeof value != 'string' && typeof value != 'number') return '--';
        if (isNaN(value) || value == 0) return '--';

        return value;
    },

    prettyArray(value) {
        return Array.isArray(value) ? value.join('，') : value
    }
}