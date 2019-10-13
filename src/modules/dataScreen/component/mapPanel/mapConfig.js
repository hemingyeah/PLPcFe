const area = {
  110000: {name: '北京市', bg: '#206A3C'},
  120000: {name: '天津市', bg: '#206A3C'},
  130000: {name: '河北省', bg: '#206A3C'},
  140000: {name: '山西省', bg: '#206A3C'},
  150000: {name: '内蒙古自治区', bg: '#4C8E41'},
  210000: {name: '辽宁省', bg: '#206A3C'},
  220000: {name: '吉林省', bg: '#105855'},
  230000: {name: '黑龙江省', bg: '#105855'},
  310000: {name: '上海市', bg: '#206A3C'},
  320000: {name: '江苏省', bg: '#206A3C'},
  330000: {name: '浙江省', bg: '#488AA3'},
  340000: {name: '安徽省', bg: '#488AA3'},
  350000: {name: '福建省', bg: '#488AA3'},
  360000: {name: '江西省', bg: '#488AA3'},
  370000: {name: '山东省', bg: '#206A3C'},
  410000: {name: '河南省', bg: '#206A3C'},
  420000: {name: '湖北省', bg: '#477E32'},
  430000: {name: '湖南省', bg: '#477E32'},
  440000: {name: '广东省', bg: '#477E32'},
  450000: {name: '广西壮族自治区', bg: '#477E32'},
  460000: {name: '海南省', bg: '#477E32'},
  500000: {name: '重庆市', bg: '#477E32'},
  510000: {name: '四川省', bg: '#477E32'},
  520000: {name: '贵州省', bg: '#477E32'},
  530000: {name: '云南省', bg: '#477E32'},
  540000: {name: '西藏自治区', bg: '#1D5D31'},
  610000: {name: '陕西省', bg: '#206A3C'},
  620000: {name: '甘肃省', bg: '#0B4A48'},
  630000: {name: '青海省', bg: '#0B4A48'},
  640000: {name: '宁夏回族自治区', bg: '#0B4A48'},
  650000: {name: '新疆维吾尔自治区', bg: '#0B4A48'},
  710000: {name: '台湾省', bg: '#488AA3'},
  810000: {name: '香港特别行政区', bg: '#477E32'},
  820000: {name: '澳门特别行政区', bg: '#477E32'},
};

const mapProvinceColorEnum = ['#4C8C3F', '#216C3E', '#0C4947', '#1D5D31', '#477E31', '#488AA3', '#0C1B18', '#0C1916', '#1E5B55', '#0D1E1B', ]

const staffPieColors = [
  '#05FFFF', '#11C4FF', '#14FC0F', '#FF950B', '#4B6DFF', '#EB6100', '#67D39B', '#FDF98E', '#D029EB'
]

export function getAreaList () {
  return area;
}

export function getMapProvinceColorEnum() {
  return mapProvinceColorEnum;
}


export const commonPieConfig = {
  type: 'pie',
  radius: ['22%', '37%'],
  // radius: [15, '65%'],
  center: ['45%', '47%'],
  // roseType: 'radius'
}


/**
 * @param {Number} 地图层级
 * @param {Number} 地图等级
 */
export function getCustomerUiWidth(level, number) {

  number = number || 0;

  if (level === 0) {
    let z = String(Math.floor(number)).length - 1;
    // eslint-disable-next-line default-case
    switch (z) {
    case 0: return 2;
    case 1: return 4;
    case 2: return 6;
    case 3: return 10;
    case 4: return 12;
    }
    return 14;
  }

  if (level === 1) {
    if (number <= 50) return 2;
    if (number <= 200) return 4;
    if (number <= 800) return 6;
    if (number <= 3200) return 10;
    if (number <= 12800) return 12;
    return 14;
  }

  if (level === 2) {
    if (number <= 50) return 2;
    if (number <= 200) return 4;
    if (number <= 800) return 6;
    if (number <= 3200) return 10;
    if (number <= 12800) return 12;
    return;
  }

  return 0;
}

/**
 * 获取人员饼图配置
 * @param {String} key 
 * @param {Number} idx 
 */
export function getStaffPieItemConfig(key, idx = 0) {
  let colorEnum = staffPieColors;
  let enumLength = colorEnum.length;

  let color = colorEnum[idx % enumLength];
  let label = key;

  return { label, color };
}

/**
 * 获取人员信息对应的动画名称
 * @param {String} color 颜色名称
 */
export function getStaffUIClass(color) {
  if (!color) return '';
  let colorStr = color.split('#')[1];
  if (!colorStr) return '';

  let prefix = 'ds-staff-'

  return `${prefix}${colorStr}`;
}

