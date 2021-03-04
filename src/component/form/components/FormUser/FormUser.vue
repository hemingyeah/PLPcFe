<template>
  <div class="form-user">
    <input 
      :id="`form_${field.fieldName}`" 
      :value="displayName"
      :placeholder="placeholder"
      readonly 
      @click="choose"
    >
    <button type="button" class="btn-text form-user-clear" @click="clear" v-if="!isEmpty">
      <i class="iconfont icon-fe-close"></i>
    </button>
  </div>
</template>

<script>
import FormMixin from '@src/component/form/mixin/form';

export default {
  name: 'form-user',
  mixins: [FormMixin],
  props: {
    placeholder: {
      type: String,
      default: ''
    },
    /* 是否只显示 自己所在团队 人员  */
    seeAllOrg: {
      type: Boolean,
      default: false
    },
    value: [Object, Array],
    /* 是否是 多选 */
    multiple: {
      type: Boolean,
      default: false
    },
    /* 选人 配置项 */
    max: [String, Number],
    /* 是否显示离职人员 */
    showDeleteUser: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    /** 
    * @description 多选
    * 1.multiple
    * 2.或 人员字段设置可多选
    */
    _multiple() {
      let { isMultiple } = this.field.setting || {};
      return this.multiple || isMultiple == 1;
    },
    displayName(){
      // 多选
      if(Array.isArray(this.value)) {
        return this.value.map(i => i.displayName || i.name).join(',');
      }
      
      let user = this.value || {};
      return user.displayName || user.name;
    },
    // 根据userId判断是否为空
    isEmpty(){
      // 多选
      if(Array.isArray(this.value)) {
        return this.value.length <= 0;
      }

      let value = this.value || {};
      return !value.userId;
    },
    /** 
    * @description 显示离职人员
    * 1.通过prop showDeleteUser
    * 2.或 人员字段设置可显示离职人员
    */
    seeDeleteUser() {
      let { showDeleteUser } = this.field.setting || {};
      return this.showDeleteUser || showDeleteUser == 1;
    }
  },
  methods: {
    choose(){
      let max = 1;
      if(this._multiple) max = null == this.max ? -1 : parseInt(this.max)
      
      let options = {
        title: `请选择${this.field.displayName}`,
        seeAllOrg: this.seeAllOrg,
        selected: this._multiple ? this.value : null,
        showDeleteUser: this.seeDeleteUser,
        max
      };
      return this.$fast.contact.choose('dept', options).then(result => {
        if(result.status == 0){
          let oldValue = null;
          let data = result.data || {};
          let users = data.users || [];
          let newValue = this._multiple ? users : users[0];

          this.$emit('update', {newValue, oldValue, field: this.field});
          this.$emit('input', newValue);

          this.$el.dispatchEvent(new CustomEvent('form.validate', {bubbles: true}));
        }
      })
        .catch(err => console.error(err))
    },
    clear(){
      let value = this._multiple ? [] : {};
      this.$emit('update', {newValue: value, field: this.field});
      this.$emit('input', value);
    }
  },
}
</script>

<style lang="scss">
.form-user{
  width: 100%;
  position: relative;
  
  input{
    padding-right: 32px;
    width: 100%;
    cursor: pointer;
  }
  
  &:hover .form-user-clear{
    display: block;
  }
}

.form-user-clear{
  position: absolute;
  top: 0;
  right: 0;
  width: 32px;
  height: 32px;
  padding: 0;
  margin: 0;
  color: #c0c4cc;
  
  display: none;
  
  i{
    font-size: 14px;
  }
  
  &:hover{
    color: #ed3f14;
  }
}
</style>
