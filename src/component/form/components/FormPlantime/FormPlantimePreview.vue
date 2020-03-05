<template>
  <div class="form-preview-group">
    <label>{{field.displayName}} <span class="form-preview-notNull" v-if="field.isNull == 0">*</span></label>
    <div class="form-preview-mock">
      <p class="form-preview-control form-preview-withIcon">
        {{field.placeHolder}}
        <i :class="`iconfont icon-fd-${type}`"></i>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'form-plantime-preview',
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
  data() {
    return {
      type: this.getType(this.field.setting.dateType)
    }
  },
  watch: {
    'field.setting.dateType': {
      handler(newValue, oldValue) {
        this.type = this.getType(newValue);
      },
      deep: true,
      immediate: true
    }  
  },
  methods: {
    getType(type) {
      return type === 'date' ? 'date' : 'datetime';
    }
  }
}
</script>

