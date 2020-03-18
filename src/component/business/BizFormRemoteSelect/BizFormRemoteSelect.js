/* mixin */
import FormMixin from '@src/component/form/mixin/form';

const BizFormRemoteSelect = {
  name: 'biz-form-remote-select',
  mixins: [ FormMixin ],
  props: {
    placeholder: {
      type: String,
      default: undefined
    },
    remoteMethod: {
      type: Function,
      default: () => ({})
    },
    value: {
      type: Array,
      default: () => []
    },
    multiple: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    input(value) {
      this.$emit('input', value);
    }
  },
  render(h) {
    return (
      <base-select
        onInput={ this.input }
        placeholder={ this.placeholder }
        remoteMethod={ this.remoteMethod }
        value={ this.value }
        scopedSlots={ this.$scopedSlots }
        multiple={ this.multiple }
        disabled={ this.disabled }
      >
      </base-select>
    )
  }
}

export default BizFormRemoteSelect;