<template>
  <div>
    <input readonly @click="choose" :value="displayName">
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
    value: [Object, Array]
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
      return this.$fast.contact.choose('dept', options).then(users => {
        let oldValue = null;
        this.$emit('input', {newValue: users, oldValue, field: this.field});
      })
      .catch(err => console.error(err))
    }
  }
}
</script>
