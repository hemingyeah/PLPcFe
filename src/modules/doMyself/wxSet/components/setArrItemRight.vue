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
      @change="changeSelect"
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
      @change="changeRadius"
    ></el-switch>
  </div>
</template>
<script>
let typesSelect = {
  0: "eventAllotEventTypeList", // 事件分配通知的事件类型应用范围
  1: "eventFinishEventTypeList", // 事件完成通知的事件类型应用范围
  2: "taskResponseTaskTypeList", // 工单响应通知的工单类型应用范围
  3: "taskFinishTaskTypeList", // 工单完成通知的工单类型应用范围
  4: "taskPlanTimeTaskTypeList" // 工单计划时间提醒的工单类型应用范围
};
let typesRadius = {
  0: "smsEventAllot", // 事件分配通知
  1: "smsEventFinish", // 事件完成通知
  2: "smsTaskResponse", // 工单响应通知
  3: "smsTaskFinish", // 工单完成通知
  4: "taskPlanTimeRemind" // 工单计划时间提醒客户
};
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
    changeSelect(e) {
      this.$emit("pageLoading", true);
      this.$http
        .post(
          "/outside/weixin/setting/changeTypes",
          {
            typeIds: e.length > 0 ? [...e].join(",") : "",
            name: typesSelect[this.itemIndex]
          },
          false
        )
        .then(res => {
          this.$emit("pageLoading", false);
        })
        .catch(err => {});
    },
    changeRadius(e) {
      this.$emit("pageLoading", true);
      this.itemData.radius = !e;
      this.$http
        .post(
          "/outside/weixin/setting/wxMessage/save",
          {
            message: typesRadius[this.itemIndex],
            state: e
          },
          false
        )
        .then(res => {
          this.$emit("pageLoading", false);
          this.itemData.radius = e;
        });
    }
  }
};
</script>