<template>
  <div class="set-arr-item-right">
    <p>应用范围：</p>
    <el-select
      class="flex-1 mar-r-15"
      v-model="itemData.select"
      multiple
      collapse-tags
      :disabled="disabled"
      style="margin-left: 20px;"
      :placeholder="itemData.pleasHolder"
      @change="change"
    >
      <el-option
        v-for="item in itemData.options"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      ></el-option>
    </el-select>
    <el-switch
      v-model="itemData.radius"
      :active-text="itemData.radius?'开启':'关闭'"
      active-color="#55b7b4"
      inactive-color="#B8BEBC"
      :active-value="true"
      :inactive-value="false"
    ></el-switch>
  </div>
</template>
<script>
export default {
  name: "set-arr-item-right",
  props: {
    itemData: {
      type: Object,
      default: () => {}
    },
    disabled: {
      type: Boolean,
      default: () => false
    },
    itemIndex: {
      type: Number,
      default: () => 0
    }
  },
  data() {
    return {};
  },
  methods: {
    change(e) {
      console.log(e);
    }
  }
};
</script>