import dom from './dom';
import Vue from 'vue'
import CascaderSetting from './CascaderSetting.vue';

const SettingComponent = Vue.extend(CascaderSetting);

function setting(data = [], maxDeep = 2, defaultValue = [], options = {}){
  let instance = new SettingComponent({
    propsData: {
      show: false,
      data,
      defaultValue
    },
    data: {
      maxDeep
    }
  });

  instance.$on('update:show', value => instance.show = value)
  instance.$on('destroy', () => {
    setTimeout(() => destory(instance), 1500);
  })

  let mount = document.createElement('div')
  let body = document.body;
  let scrollBarWidth = dom.scrollBarWidth();

  // 缓存原来样式
  let paddingRight = body.style.paddingRight;
  let overflow = body.style.overflow;

  let isScroll = body.style.overflow != 'hidden' && document.documentElement.offsetHeight > document.documentElement.clientHeight;

  document.body.appendChild(mount);

  return new Promise((resolve, reject) => {
    // body有滚动条，则设置右边距
    if(isScroll){
      body.style.overflow = 'hidden';
      body.style.paddingRight = `${scrollBarWidth}px`;
    }

    instance.$on('input', event => {
      resolve({status: 0, data: event});
    })

    instance.$on('cancel', () => {
      resolve({status: 1, message: 'cancel'});
    })

    instance.$on('close', () => {
      if(isScroll){
        body.style.overflow = overflow;
        body.style.paddingRight = paddingRight;
      }
    })

    instance.$mount(mount);
    instance.show = true;
  })
    .then(data => {
      let callback = options.callback;
      callback && typeof callback == 'function' && callback(data);
      return data;
    })
}

function destory(instance){
  let el = instance.$el;
  let parent = el.parentNode;

  instance.$destroy(true);
  parent.removeChild(el); 
}

export default {
  setting
}