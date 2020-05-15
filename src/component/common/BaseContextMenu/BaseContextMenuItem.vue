<template>
  <div class="base-context-menu-item" @click="handler">
    <slot name="icon">
      <span class="base-context-menu-indent"></span>
    </slot>
    <span class="base-context-menu-text"><slot></slot></span>
  </div>
</template>

<script>
export default {
  name: 'base-context-menu-item',
  props: {
    command: {
      type: String,
      required: true
    }
  },
  methods: {
    handler(event){
      this.$parent.exec(this.command)
    }
  }
}
</script>

<style lang="scss">
.base-context-menu-item{
  line-height: 24px;
  padding: 4px 10px;
  cursor: pointer;
  color: $text-color-regular;
  font-size: 14px;
  width: 150px;
  height: 32px;

  display: flex;
  flex-flow: row nowrap;
  align-items: center;

  transition: background-color ease .3s,
              color ease .3s;

  &:hover{
    color: $color-primary;
    background-color: $color-primary-hover;
  }

  .base-context-menu-indent{
    display: block;
    width: 24px;
    height: 24px;
  }
  .base-context-menu-text{
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
}
</style>

