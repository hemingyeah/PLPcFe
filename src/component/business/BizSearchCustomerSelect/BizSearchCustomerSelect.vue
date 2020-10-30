<template>
  <biz-form-remote-select
    :placeholder="placeholder"
    :remote-method="remoteMethod"
    :value="selectValue"
    @input="updateSelectValue"
  >
    <div class="customer-template-option" slot="option" slot-scope="{ option }">
      <h3>{{ option.name }}</h3>
      <p class="customer-template-option-content">
        <span class="customer-template-option-content-text">
          <label>电话：</label>
          <span>{{ option.lmPhone || '' }}</span>
        </span>
        <span class="customer-template-option-content-text">
          <label>编号：</label>
          <span>{{ option.serialNumber }}</span>
        </span>
      </p>
    </div>
  </biz-form-remote-select>
</template>

<script>
export default {
  name: 'biz-search-customer-select',
  props: {
    placeholder: {
      type: String,
      default: '请选择客户'
    },
    remoteMethod: {
      type: Function,
    },
    value: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      selectValue: this.value.slice(),
    }
  },
  watch: {
    'value'(newValue) {
      this.selectValue = newValue.slice();
    }
  },
  methods: {
    updateSelectValue(value) {
      this.$emit('input', value);
    }
  }
}
</script>

<style lang="scss">
.customer-template-option-content {
  &-text {
    display: flex;

    label {
      padding-top: 0;
    }

    span {
      line-height: 24px;
    }

  }
}
</style>