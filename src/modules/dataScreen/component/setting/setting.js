import {settingMap, timeRange} from './config';

function getBaseGroup() {
  return {
    'leftTop': {
      label: '左侧顶部数据展示',
      limit: null,
      items: [],
      key: 'leftTop',
    },
    'rightTop': {
      label: '右侧顶部数据展示',
      limit: null,
      items: [],
      key: 'rightTop',
    },
    'rightHistogram': {
      label: '右侧报表展示',
      limit: 2,
      items: [],
      key: 'rightHistogram',
      mark: '注：最多可选择2个报表展示',
    },
    'rightPieChart': {
      label: '右侧饼状图展示',
      limit: 2,
      items: [],
      key: 'rightPieChart',
      mark: '注：最多可选择2个饼状图展示',
    }
  }
}

    
/**
 * 根据参数进行分组
 * @params {Object} setting 当前的设置信息
 * @params {Object} 
 */
export function getSettingGroup(setting) {
  let group = getBaseGroup();
  // 去settingMap中对比数据
  for (let config in settingMap) {
    let item = settingMap[config] || {};
    // 是否开启配置项
    let value = setting[config] || false;
    let {belong, label} = item;

    let newItem = {
      key: config,
      name: config,
      value,
      belong,
      label
    }

    belong && group[belong].items.push(newItem);
  }

  return group;
}
