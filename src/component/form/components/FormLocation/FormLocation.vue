<template>
  <div class="form-location">
    <input :id="`form_${field.fieldName}`" type="number" @input="input" :value="value" :placeholder="placeholder" autocomplete="off">
  </div>
</template>

<script>
export default {
  name: 'form-location',
  props: {
    value: String,
  },
  methods: {
    input(event){
      let oldValue = null;
      let newValue = event.target.value;
      if (newValue === '') {
        this.$nextTick(() => {
          event.target.value = '';
        });
      }
      this.$emit('update', {newValue, oldValue, field: this.field});
      this.$emit('input', newValue);
    }
  }
}
</script>

<style lang="scss">
.form-location{
  width: 100%;
    input{
      width: 100%;
  }
}
</style>