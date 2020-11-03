<template>
  <div class="form-info">
    <div class="form-item__text form-ql-editor ql-container">
      <div class="ql-editor" v-html="field.placeHolder" @click.prevent.stop='previewImage'></div>
    </div>
  </div>
</template>

<script>
// TODO: 识别更多类型的文件
import platform from '@src/platform/index';

import FormMixin from '@src/component/form/mixin/form';

export default {
  name: 'form-info',
  mixins: [FormMixin],
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  methods:{
    //TODO :预览图片
    previewImage(event){
      let element = event.currentTarget.querySelector('img');
      if( !element) return;

      let list = event.target.closest('.ql-editor');
      let images = Array.prototype.slice.call(list.querySelectorAll('img'));

      let currIndex = 0;
      let urls = images.map((item, index) => {
        if(item == element) currIndex = index;
        console.log(item.getAttribute('src'))
        return item.getAttribute('src');
      });

      platform.imagePreview({
        imageDom: list,
        currIndex,
        urls
      });
    
    }
  }
}
</script>

<style lang="scss">
@import './FormInfo.scss';
.form-info {
  width: 100%;
  // 13 取自 (.form-item-control .err-msg-wrap) min-height(10px) + padding-bottom(3px)
  // 10 取自 (.form-item label) padding-left: 10px
  padding: 0 0 13px 10px;
  .form-item__text {
    width: 100%;
    word-break: break-all;
    background-color: #FAFAFA;
    padding: 3px 5px;
  }
}
</style>
