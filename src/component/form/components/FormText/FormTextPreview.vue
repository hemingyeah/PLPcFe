<template>
  <div class="form-preview-group" @click="choose">
    <label>{{field.displayName}} <span class="form-preview-notNull" v-if="field.isNull == 0">*</span></label>
    <div class="form-preview-mock">
      <p class="form-preview-control" :class="{'form-preview-withIcon': isCode}">
        {{field.placeHolder}}
        <i class="iconfont icon-scan" v-if="isCode"></i>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'form-text-preview',
  props: {
    field: {
      type: Object,
      default: () => ({})
    },
    setting: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    isCode(){//是否为扫码类型
      return this.field.formType == 'code';
    }
  },
  methods: {
    choose(){
      this.$emit('chooseField', this.field)
    }
  }
}
</script>