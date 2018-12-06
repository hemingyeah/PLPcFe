<script>
  export default {
    name: "base-button",
    props: {
      type: {
        type: String,
        default: 'primary', // primary、plain、only-text
      },
      icon: {
        type: String,
        default: ''
      },
      disabled: {
        type: Boolean,
        default: false
      },
    },
    data() {
      return {}
    },
    methods: {
      buildTextButton() {
        const icon = this.icon;
        return (
          <span class="text-button" onClick={(e) => this.$emit('event', e)}>
            {icon && <i class={'iconfont ' + icon}></i>}
            {this.$slots.default}
          </span>
        )
      },
      buildBaseButton() {
        const icon = this.icon;
        const type = this.type;
        const disabled = this.disabled ? 'disabled' : '';
        return (
          <button class={{
            'base-button': true,
            'plain-button': type === 'plain',
            'base-button-disabled': disabled && type === 'primary',
            'plain-button-disabled': disabled && type === 'plain',
          }} type="button" onClick={(e) => this.$emit('event', e)}>
            {icon && <i class={'iconfont ' + icon}></i>}
            {this.$slots.default}
          </button>

        )
      },
    },
    render(r) {

      if (this.type === 'only-text') return this.buildTextButton();

      return this.buildBaseButton();
    }
  }
</script>

<style lang="scss">

  $color-primary-light-1: mix(#fff, $color-primary, 10%) !default;
  $color-primary-light-9: mix(#fff, $color-primary, 90%) !default;
  $color-primary-disabled: rgba($color-primary, .3) !default;
  $color-primary-light-9-disabled: rgba($color-primary, .2) !default;
  $text-color-primary-disabled: rgba($text-color-primary, .2) !default;
  // 主要按钮
  .base-button {
    padding: 7px 15px;
    background: $color-primary;
    color: #fff;
    font-size: 14px;
    border: none;
    border-radius: 2px;
    outline: none;
    .iconfont {
      font-size: 12px;
      margin-right: 3px;
    }
    &:hover {
      background: $color-primary-light-1;
      color: #fff;
    }
  }

  .base-button-disabled {
    background: $color-primary-disabled;
    &:hover {
      background: $color-primary-disabled;
      cursor: not-allowed;
    }

  }

  // 次要按钮
  .plain-button {
    background: $color-primary-light-9;
    color: $text-color-primary;
    &:hover {
      background: $color-primary;
    }
  }

  .plain-button-disabled {
    background: $color-primary-light-9-disabled;
    color: #fff;
    &:hover {
      background: $color-primary-light-9-disabled;
      cursor: not-allowed;
      color: $text-color-primary-disabled;
    }
  }

  // 文字按钮
  .text-button {
    display: inline-block;
    padding: 7px 15px;
    color: $text-color-primary;
    .iconfont {
      font-size: 12px;
      margin-right: 3px;
    }
    &:hover {
      cursor: pointer;
      color: $color-primary;
    }
  }

</style>