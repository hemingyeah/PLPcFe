<template>
  <div class="form-setting-panel form-ql-editor">
    <div class="form-setting-group">
      <h4 class="form-item-title">{{ setting.name }}</h4>
      <!-- 富文本编辑器 -->
      <base-editor :placeholder="placeHolder"  v-model="field.placeHolder" @input="getInput" ref="editor" :toolbarOptions="toolbarOptions"></base-editor>
    </div>
    <div class="form-setting-group">
      <p class="form-item-text-msg">您可以在表单中放置一段内容说明来引导用户进行内容填写，效果图示：</p>
      <img class="form-item-msg-img" src="@src/assets/img/info.jpg"/>
    </div>
  </div>
</template>

<script>
import SettingMixin from '@src/component/form/mixin/setting';
import { settingProps } from '@src/component/form/components/props';
import { toolbarOptions } from './editorOption';
import {INFO_FIELD_LENGTH_MAX} from '../../config';
import {PLACE_HOLDER} from './config';

export default {
  name: 'form-info-setting',
  mixins: [SettingMixin],
  props: {
    ...settingProps,
    placeHolder: {
      type: String,
      default: PLACE_HOLDER
    },
    maxLength: {
      type: Number,
      default: INFO_FIELD_LENGTH_MAX
    }
  },
  computed:{
    toolbarOptions(){
      return toolbarOptions
    }
  },
  methods: {
    // 获取带格式的文章内容
    getInput (html) {
      this.update(html,'placeHolder');
    },

    updateForDom (event) {
      let el = event.target;
      let prop = el.dataset.prop;
      let value = el.value;
            
      this.update(value, prop);
    },
    update (value, prop) {
      this.$emit('input', { value, prop })
    }
  }
}
</script>
<style lang="scss">
@import './FormInfo.scss';
.form-ql-editor{
  .form-item-text-msg{
    color: #666666;
    font-size: 12px;
    line-height: 17px;
    margin-block-start: 0em;
    margin-block-end: 0em;
  }
  .form-item-msg-img{
    width: 100%;
  }

}
</style>

