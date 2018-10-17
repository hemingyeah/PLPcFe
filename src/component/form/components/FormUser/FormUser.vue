<template>
  <div class="form-user">
    <input :id="`form_${field.fieldName}`" readonly @click="choose" :value="displayName">
    <button type="button" class="btn-text form-user-clear" @click="clear" v-if="!isEmpty">
      <i class="iconfont icon-guanbi-fill"></i>
    </button>
  </div>
</template>

<script>
export default {
  name: 'form-user',
  props: {
    field: {
      type: Object,
      default: () => ({})
    },
    value: Object
  },
  computed: {
    displayName(){
      let user = this.value || {};
      return user.displayName
    },
    isEmpty(){//根据userId判断是否为空
      let value = this.value || {};
      return !value.userId;
    }
  },
  methods: {
    choose(){
      let options = {
        title: `请选择${this.field.displayName}`,
        max: 1
      };
      return this.$fast.contact.choose('dept', options).then(result => {
        if(result.status == 0){
          let oldValue = null;
          let data = result.data || {};
          let users = data.users || [];
          this.$emit('input', {newValue: users[0], oldValue, field: this.field});
          this.$el.dispatchEvent(new CustomEvent('form.validate', {bubbles: true}));
        }
      })
      .catch(err => console.error(err))
    },
    getValue(){
      return this.value;
    },
    clear(){
      this.$emit('input', {newValue: {}, field: this.field});
    }
  },
  mounted(){
    //触发注册事件，用于注册字段到外层formitem组件，和formbuilder组件
    let params = {value: this.getValue, fieldName: this.field.fieldName};
    let event = new CustomEvent('form.add.field', {detail: params, bubbles: true});
    this.$nextTick(() => this.$el.dispatchEvent(event));
  },
  destroyed(){
    //注册解绑事件，用于解绑组件
    let params = {fieldName: this.field.fieldName}
    let event = new CustomEvent('form.remove.field', {detail: params, bubbles: true});
    this.$el.dispatchEvent(event)
  }
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
    background-color: #f6f9f7;
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
  color: #9a9a9a;

  &:hover{
    color: #ed3f14;
  }
}
</style>
