/** 各入口文件应该引入该文件替代手动引入 */
import '@src/assets/scss/index.scss';
import '@src/common/polyfill';
import '@src/modules/linkc/assets/public.scss';

import Vue from 'vue';

import directive from '@src/directive';
import component from '@src/component';
import filter from '@src/filter';
import BaseGallery from 'packages/BaseGallery';

import appConfig from 'app.config';
import platform from '@src/platform';

Vue.use(directive);
Vue.use(filter);
Vue.use(component);

import 'quill/dist/quill.core.css';
import 'quill/dist/quill.snow.css';
import 'quill/dist/quill.bubble.css';

import previeVideoCompoment from '@src/component/compomentV2/PreviewVideo/index.vue';

function previewImg(url) {
  if (!url) return;
  if (url.target && url.target.nodeName == 'IMG')
    return BaseGallery.preview(url.target);
  let imgDom = document.createElement('img');
  imgDom.src = url;
  BaseGallery.preview(imgDom);
}

function previewVideo(url) {
  let PrevieVideoCompoments = Vue.extend(previeVideoCompoment);

  let divDom = document.createElement('div');
  divDom.id = 'normal-preview-video';
  divDom.ref = 'previeVideoCompoment';
  if (!document.getElementById('normal-preview-video')) {
    this.$el.appendChild(divDom);
  }

  // }
  new PrevieVideoCompoments({
    data() {
      return {};
    },
    propsData: {
      url,
    },
    methods: {},
  }).$mount('#normal-preview-video');
}

function getUrlObj(window_) {
  let params = window_.location.href.split('?')[1];
  let obj = {};
  try {
    if (params) {
      params.split('&').forEach((item) => {
        let item_ = item.split('=');
        obj[item_[0]] = item_[1];
      });
    }
  } catch (error) {
    console.warn(error);
  }
  return obj;
}

import domGuide from '@src/common/Guide'



Vue.prototype.$appConfig = appConfig;
Vue.prototype.$platform = platform;
Vue.prototype.$previewImg = previewImg;
Vue.prototype.$previewVideo = previewVideo;
Vue.prototype.$getUrlObj = getUrlObj;
Vue.prototype.$Guide = domGuide;
export default Vue;
