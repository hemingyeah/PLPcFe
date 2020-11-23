<template>
  <div class="cascader-setting-option" :class="{'cascader-setting-option-default': option.isDefault, 'cascader-setting-option-active': active}" :data-option-id="option.id">
    <div class="cascader-setting-left">
      <button type="button" class="btn-text handle" v-show="option.deep == 1"> <i class="iconfont icon-tuozhuaipaixu"></i></button>
      <input type="text" :value="option.value" @input="input" @click="choose" maxlength="30" @blur="validate">
    </div>
    <div class="cascader-setting-right">
      <button type="button" class="cascader-setting-option-default-btn btn-text" tabindex="-1" title="默认选项" @click="changeDefault">
        <i class="iconfont icon-check-fill"></i>
      </button>
      <button type="button" class="cascader-setting-option-remove-btn" tabindex="-1" title="删除选项" @click="remove" >
        <i class="iconfont icon-minus-fill"></i>
      </button>
    </div>
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
      deepZhChar: ['一', '二', '三', '四','五']
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
  padding: 3px 0;
  display: flex;
  .cascader-setting-left{
    display: flex;
    justify-content: flex-start;
  }
  .cascader-setting-right{
    display: flex;
    justify-content: flex-start;
    width: 58px;
    margin-left: 8px;
  }
  input[type='text']{
    width: 100%;
    margin: 0;
    // padding: 0 50px 0px 8px;
    line-height: 24px;
    border: none;
    outline: none;
    border: 1px solid transparent;
    font-size: 14px;
    background-color: transparent;
    border-radius: 4px;
    // border: 1px solid #e0e1e2 ;

    &:hover,
    &:focus{
      border-color:  $color-primary;
    }
  }

  &:hover{
    .cascader-setting-option-remove-btn,
    .cascader-setting-option-default-btn {
      display: block;
    }
  }
  .btn-text{
    padding: 0 3px 0 0;
    .icon-tuozhuaipaixu{
      font-size: 12px;
    }
  } 
}

.cascader-setting-option-remove-btn,
.cascader-setting-option-default-btn{
    // position: absolute;
    width: 20px;
    height: 32px;
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
  color: $color-danger;
  right: 0;
  top: 5px;
}

.cascader-setting-option-default-btn{
  color: $text-color-secondary;
  right: 21px;
  top: 5px;
}

.cascader-setting-option-default{
  .cascader-setting-option-default-btn{
    display: block !important;
    color: $color-primary;
  }
}

.cascader-setting-option-active{
 input[type='text']{
   background-color: #F5F7FA;
 } 
}
</style>
