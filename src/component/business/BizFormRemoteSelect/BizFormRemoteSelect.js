/* mixin */
import FormMixin from '@src/component/form/mixin/form';

const BizFormRemoteSelect = {
  name: 'biz-form-remote-select',
  mixins: [ FormMixin ],
  props: {
    choose: {
      type: Function,
      default: () => ({})
    },
    placeholder: {
      type: String,
      default: undefined
    },
    remoteMethod: {
      type: Function,
      default: () => ({})
    },
    slots: {
      type: Object,
      default: () => ({})
    },
    value: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    input(value) {
      this.$emit('input', value)
    }
  },
  render(h) {
    return (
      <base-select
        onInput={ this.choose }
        placeholder={ this.placeholder }
        remoteMethod={ this.remoteMethod }
        value={ this.value }
        scopedSlots={ this.slots }
      >
      </base-select>
    )
  }
}

export default BizFormRemoteSelect;