<template>
  <div class="form-user">
    <input 
      :id="`form_${field.fieldName}`" 
      :value="displayName"
      :placeholder="placeholder"
      readonly 
      @click="choose" >
    <!-- @keydown.enter.prevent="choose" -->
    <button type="button" class="btn-text form-user-clear" @click="clear" v-if="!isEmpty">
      <i class="iconfont icon-guanbi-fill"></i>
    </button>
  </div>
</template>

<script>
import FormMixin from '../FormMixin';

export default {
  name: 'form-user',
  mixins: [FormMixin],
  props: {
    field: {
      type: Object,
      default: () => ({})
    },
    placeholder: {
      type: String,
      default: ''
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
    clear(){
      this.$emit('input', {newValue: {}, field: this.field});
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
    //background-color: #f6f9f7;
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
