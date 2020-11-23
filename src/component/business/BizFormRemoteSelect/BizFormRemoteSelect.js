import './BizFormRemoteSelect.scss'
/* mixin */
import FormMixin from '@src/component/form/mixin/form';

const BizFormRemoteSelect = {
  name: 'biz-form-remote-select',
  mixins: [ FormMixin ],
  props: {
    cleared: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      default: undefined
    },
    remoteMethod: {
      type: Function,
      default: () => ({})
    },
    valueKey: {
      type: String,
      default: 'value'
    },
    value: {
      type: Array,
      default: () => []
    },
    disabled: {
      type: Boolean,
      default: false
    },
    multiple: {
      type: Boolean,
      default: false
    },
    inputDisabled: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    clear() {
      this.$emit('input', []);
    },
    input(value) {
      this.$emit('input', value);
    }
  },
  render(h) {
    // 清除按钮
    let clearButton = (
      <div class="biz-form-remote-select-clear" onClick={event => this.clear(event)} >
        <i class="el-icon-error" style="color:rgba(211, 214, 217, 0.69);"></i>
      </div>
    )

    return (
      <div class="biz-form-remote-select">
        <base-select
          value-key={ this.valueKey }
          onInput={ this.input }
          placeholder={ this.placeholder }
          remoteMethod={ this.remoteMethod }
          value={ this.value }
          scopedSlots={ this.$scopedSlots }
          multiple={ this.multiple }
          disabled={ this.disabled }
        >
        </base-select>
        { this.cleared && this.value.length > 0 && clearButton }
      </div>
    )

  }
}

export default BizFormRemoteSelect;