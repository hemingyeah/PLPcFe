/** 各入口文件应该引入该文件替代手动引入 */
import '@src/assets/scss/index.scss'
import '@src/common/polyfill';

import Vue from 'vue';

import directive from '@src/directive';
import component from '@src/component';
import filter from '@src/filter';
import BaseGallery from 'packages/BaseGallery'

import appConfig from 'app.config';
import platform from '@src/platform';

Vue.use(directive);
Vue.use(filter);
Vue.use(component);

import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

import previeVideoCompoment from '@src/component/compomentV2/PreviewVideo/index.vue'

function previewImg(url) {
  if (!url) return
  if (url.target && url.target.nodeName == 'IMG') return BaseGallery.preview(url.target)
  let imgDom = document.createElement('img')
  imgDom.src = url
  BaseGallery.preview(imgDom)
}

function previewVideo(url) {
  let previeVideoCompoments = Vue.extend(previeVideoCompoment);

  let divDom = document.createElement('div');
  divDom.id = 'normal-preview-video';
  divDom.ref = 'previeVideoCompoment';
  if (!document.getElementById('normal-preview-video')) {
    this.$el.appendChild(divDom);
  }


  // }
  new previeVideoCompoments({
    data() {
      return {};
    },
    propsData: {
      url
    },
    methods: {},
  }).$mount('#normal-preview-video');

}

Vue.prototype.$appConfig = appConfig;
Vue.prototype.$platform = platform;
Vue.prototype.$previewImg = previewImg;
Vue.prototype.$previewVideo = previewVideo;

export default Vue;