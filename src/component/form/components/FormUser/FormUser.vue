<template>
  <div class="form-user">
    <input :id="`form_${field.fieldName}`" readonly @click="choose" :value="displayName">
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
          this.$emit('input', {newValue: result.data, oldValue, field: this.field});
        }
      })
      .catch(err => console.error(err))
    }
  }
}
</script>

<style lang="scss">
.form-user{
  width: 100%;

  input{
    width: 100%;
    cursor: pointer;
  }
}
</style>
