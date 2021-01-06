<template>
  <div class="form-view-row">
    <label>{{field.displayName}}</label>
    <div class="form-view-row-content base-file__preview" >
      <base-file-item v-for="(a, index) in value" :key="index" :file="a" readonly/>
    </div>
  </div>
</template>

<script>
import { Watch } from "vue-property-decorator"
export default {
  name: "form-attachment-view",
  props: {
    field: {
      type: Object,
      default: () => ({})
    },
    value: {
      type: Array,
      default: () => []
    }
  },
  watch:{
    value(newV, oldV){
      console.log(newV, 12312312)
    }
  }
}
</script>
