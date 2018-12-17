<template>
  <div class="form-radio">
    <el-radio @input="input" :value="value" :label="option.value" v-for="(option, index) in options" :key="index">
      {{option.label}}
    </el-radio>
  </div>
</template>

<script>
import FormMixin from '../FormMixin';

export default {
  name: 'form-number',
  mixins: [FormMixin],
  props: {
    field: {
      type: Object,
      default: () => ({})
    },
    value: String
  },
  computed: {
    options(){
      let setting = this.field.setting || {};
      let dataSource = setting.dataSource || [];

      dataSource = dataSource.map(d => {
        return {
          label: d.label,
          value: d.value
        }
      });

      return this.source || dataSource || [];
    }
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
      this.$emit('input', {newValue, oldValue, field: this.field});
    },
  },
}
</script>

<style lang="scss">
.form-number{
  width: 100%;
   input{
     width: 100%;
   }
}
</style>
