<template>
  <div class="form-textarea">
    <textarea :id="`form_${field.fieldName}`" @input="input" :value="value" rows="3" :placeholder="placeholder" maxlength="500" autocomplete="off"></textarea>
    <span class="form-textarea-summary" :style="{right: `${offsetRight}px`}">{{summary}}</span>
  </div>
</template>

<script>
import {scrollBarWidth} from '@src/util/dom';
import FormMixin from '../FormMixin';

export default {
  name: 'form-textarea',
  mixins: [FormMixin],
  props: {
    field: {
      type: Object,
      default: () => ({})
    },
    placeholder: {
      type: String,
      default: ''
    },
    value: {
      type: String,
      default: ''
    }
  },
  computed: {
    summary(){
      let length = this.value ? this.value.length : 0;
      return `${length}/500`
    },
    offsetRight(){
      return scrollBarWidth() + 4;
    }
  },
}
</script>

<style lang="scss">
.form-textarea{
  width: 100%;
  position: relative;

  textarea{
    width: 100%;
    padding: 3px 10px 16px 10px;
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

