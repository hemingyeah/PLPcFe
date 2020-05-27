<template>
  <el-date-picker
    :value="value"
    @input="choose"
    type="daterange"
    align="right"
    unlink-panels
    range-separator="-"
    start-placeholder="开始日期"
    end-placeholder="结束日期"
    :default-time="field.defaultTime?field.defaultTime:false"
    :picker-options="pickerOptions.shortcuts? pickerOptions : datePickerOptions"
  ></el-date-picker>
</template>

<script>
import FormMixin from "@src/component/form/mixin/form";

export default {
  name: "date-search",
  mixins: [FormMixin],
  props: {
    value: {
      type: Array,
      default: () => []
    },
    pickerOptions: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      datePickerOptions: {
        shortcuts: [
          {
            text: "最近一周",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit("pick", [start, end]);
            }
          },
          {
            text: "最近一个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit("pick", [start, end]);
            }
          },
          {
            text: "最近三个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit("pick", [start, end]);
            }
          }
        ]
      }
    };
  },
  methods: {
    choose(newValue) {
      let oldValue = null;
      // this.$emit('input', newValue);
      this.$emit("update", { newValue, oldValue, field: this.field });
    }
  }
};
</script>

<style lang="scss">
.el-date-editor {
  width: 100% !important;
}
</style>
