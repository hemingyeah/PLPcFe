<template>
  <div class="form-textarea">
    <textarea :id="`form_${field.fieldName}`" @input="input" :value="value" rows="3" :placeholder="placeholder" :disabled="disabled" maxlength="2000" autocomplete="off"></textarea>
    <span class="form-textarea-summary" :style="{right: `${offsetRight}px`}">{{summary}}</span>
  </div>
</template>

<script>
import {getScrollBarWidth} from '@src/util/dom';
import FormMixin from '@src/component/form/mixin/form';

export default {
  name: 'form-textarea',
  mixins: [FormMixin],
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  computed: {
    summary(){
      let length = this.value ? this.value.length : 0;
      return `${length}/2000`
    },
    offsetRight(){
      return getScrollBarWidth() + 4;
    }
  }
}
</script>

<style lang="scss">
.form-textarea{
  width: 100%;
  position: relative;

  textarea{
    width: 100%;
    padding: 3px 10px 16px 10px;
    &:disabled{
      -webkit-text-fill-color: #b2b2b2;
    }
  }
}

.form-textarea-summary{
  position: absolute;
  font-size: 12px;
  line-height: 12px;
  bottom: 2px;
  color: #9a9a9a;
  background-color: #fff;
  z-index: 1;
}
</style>

