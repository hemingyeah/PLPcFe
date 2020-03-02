<template>
  <div class="cascader-setting-option" :class="{'cascader-setting-option-default': option.isDefault, 'cascader-setting-option-active': active}" :data-option-id="option.id">
    <input type="text" :value="option.value" @input="input" @click="choose" maxlength="30" @blur="validate">
    <button type="button" class="cascader-setting-option-default-btn" tabindex="-1" title="默认选项"
            @click="changeDefault">
      <i class="iconfont icon-check-fill"></i>
    </button>
    <button type="button" class="cascader-setting-option-remove-btn" tabindex="-1" title="删除选项"
            @click="remove" v-if="allowRemove">
      <i class="iconfont icon-minus-fill"></i>
    </button>
  </div>
</template>

<script>
export default {
  name: 'cascader-setting-option',
  props: {
    option: {
      type: Object
    },
    allowRemove: {
      type: Boolean,
      default: true
    },
    active: {
      type: Boolean,
      default: false
    }
  },
  data(){
    return {
      deepZhChar: ['一', '二', '三', '四']
    }
  },
  methods: {
    validate(event){
      let le = event.target;
      let value = event.target.value;
      if(!value){
        let option = this.option;
        let parent = option.parent();
        let index = parent.children.indexOf(option);

        value = `${this.deepZhChar[option.deep - 1]}级选项 ${index + 1}`
        this.$emit('input', value);
      }
    },
    input(event){
      let value = event.target.value;

      // 过滤
      if(value.indexOf('/') >= 0){
        value = value.replace(/\//g, '');
        event.target.value = value;
      }

      // 长度限制在30字以内
      if(value.length > 30) {
        value = value.substring(0, 30)
        event.target.value = value;
      }

      this.$emit('input', value);
    },
    choose(){
      this.$emit('choose', this.option)
    },
    remove(){
      this.$emit('remove', this.option)
    },
    changeDefault(){
      this.$emit('change-default', this.option);
    }
  }
}
</script>

<style lang="scss">
.cascader-setting-option{
  position: relative;
  padding: 5px 0;
  background-color: #fff;

  input[type='text']{
    width: 100%;
    margin: 0;
    padding: 0 50px 0 0;
    line-height: 24px;
    border: none;
    outline: none;
    border-bottom: 1px solid transparent;
    font-size: 14px;
    background-color: transparent;

    &:hover,
    &:focus{
      border-bottom-color: #9a9a9a;
    }
  }

  &:hover{
    .cascader-setting-option-remove-btn,
    .cascader-setting-option-default-btn {
      display: block;
    }
  }
}

.cascader-setting-option-remove-btn,
.cascader-setting-option-default-btn{
    position: absolute;
    width: 20px;
    height: 24px;
    text-align: center;
    padding: 0;
    margin: 0;
    border: none;
    background-color: transparent;
    outline: none; 
    cursor: pointer;

    display: none;
  }

.cascader-setting-option-remove-btn{
  color: #e84040;
  right: 0;
  top: 5px;
}

.cascader-setting-option-default-btn{
  color: #159E7E;
  right: 21px;
  top: 5px;
}

.cascader-setting-option-default{
  .cascader-setting-option-default-btn{
    display: block !important;
  }
}

.cascader-setting-option-active{
 input[type='text']{
   background-color: #eee;
 } 
}
</style>
