<template>
  <div>
    <div>{{field.displayName}}</div>
    <div>
      <select @change="input" :multiple="isMulti">
        <option :value="option" v-for="option in field.setting.dataSource">{{option}}</option>
      </select>
    </div>
  </div>
</template>

<script>
export default {
  name: 'form-select-build',
  props: {
    field: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    isMulti(){
      let setting = this.field.setting || {}
      return setting.isMulti;
    }
  },
  methods: {
    input(event){
      let oldValue = null;
      let newValue = null;

      if(!this.isMulti){
        newValue = event.target.value;
      }else{
        newValue = [];
        let options = event.target.options;
        for(let i = 0; i < options.length; i++){
          let option = options[i];
          if(option.selected) newValue.push(option.value)
        }
      }
  
      this.$emit('input', {newValue, oldValue})
    }
  }
}
</script>
