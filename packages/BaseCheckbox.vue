<template>
  <label class="base-checkbox">
    <input type="checkbox" :checked="value" @change="update">
    <span class="base-checkbox-input"></span>
    <span><slot></slot></span>
  </label>
</template>

<script>
export default {
  name: 'base-checkbox',
  props: ['value'],
  methods: {
    update(event){
      this.$emit('input', event.target.checked);
    }
  }
}
</script>

<style lang="scss">
.base-checkbox{
  font-size: 14px;
  font-weight: 400;
  user-select: none;

  input[type='checkbox']{
    display: none;
  }

  span{
    display: inline-block;
    vertical-align: middle;
    cursor: pointer;
  }

  .base-checkbox-input{
    margin: 0;
    width: 16px;
    height: 16px;
    border-radius: 2px;

    position: relative;
    border: 1px solid #ccc;
    background-color: #fff;
    font-size: 12px;
    transition: border-color ease .15s,
                background-color ease .15s;

    &:after{
      content: "";
      box-sizing: content-box;
      position: absolute;
      border: 1px solid #fff;
      border-left: 0;
      border-top: 0;
      height: 8px;
      width: 4px;
      left: 4px;
      top: 1px;
      transform: rotate(45deg) scaleY(0);
      transform-origin: center; 
    }
  }

  input[type='checkbox']:checked ~ span.base-checkbox-input{
    background-color: #55B7B4;
    border-color: #55B7B4;

    &:after{
      transform: rotate(45deg) scaleY(1);
    }
  }

  input[type='checkbox']:disabled ~ span.base-checkbox-input{
    opacity: 0.5;
  }
}
</style>