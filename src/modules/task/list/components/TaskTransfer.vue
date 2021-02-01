<template>
  <base-modal
    title="工单转派办理"
    :show.sync="sendMessageDialog"
    width="600px"
    class="send-message-to-customer-dialog"
  >
    <div class="dialog-body">
      <div class="dialog-body-content">
        工单转派适用于批量修改负责人和协同人等工作交接场景
        <el-tooltip
          content="只能处理已指派、已接受、进行中及工单池中，目前没有处于暂停或审批状态的工单"
          placement="top"
        >
          <i class="iconfont icon-question task-icon"></i> </el-tooltip
        ><br />
        请选择新工单负责人或协同人，字段为空时信息将不会修改
        <p @click="checkDept(0)">
          {{ displayName || "请选择新工单负责人，不选择时将不会修改" }}
        </p>
        <p @click="checkDept(1)">
          {{ displayNames || "请选择新工单协同人，不选择时将不会修改" }}
        </p>
      </div>
    </div>
    <div class="dialog-footer" slot="footer">
      <el-button @click="sendMessageDialog = false">取 消</el-button>
      <el-button type="primary" @click="onSubmit">确 定</el-button>
    </div>
  </base-modal>
</template>

<script>
/* Api */
import * as TaskApi from "@src/api/TaskApi.ts";
export default {
  name: "task-transfer",
  inject: ["initData"],
  props: {
    taskIdList: {
      type: Array, //ids
      default: [],
    },
  },
  data: () => {
    return {
      sendMessageDialog: false,
      synergies: [],
      executorId: "",
      displayNames: "", // 协同人
      displayName: "", // 负责人
    };
  },
  methods: {
    /**
     * @description 工单转派提交
     */
    async onSubmit() {
      const { taskIdList, synergies, executorId, $platform } = this;
      const fromId = window.frameElement.getAttribute("id");
      const params = {
        taskIdList,
        synergies,
        executorId,
      };
      if (!executorId) {
        $platform.alert("请选择新负责人");
        return;
      }
      const { status, message, data, succ } = await TaskApi.redeployBatch(
        params
      );
      if (status === 0) {
        $platform.alert("工单转派成功");
      } else if (status === 1) {
        let msg = message;
        if (data) {
          msg += "： ";
          data.fail.forEach((item, index) => {
            msg += item.taskNo;
            if (index !== data.fail.length - 1) {
              msg += ",";
            }
          });
          msg += "。成功分配" + data.succ.length + "个";
        }
        $platform.alert(msg);
      }
      window.__exports__refresh = "";
      this.sendMessageDialog = false;
      $platform.refreshTab(fromId);
    },
    /**
     * @description 选择负责人和协同人
     */
    checkDept(type = 0) {
      // 判断是否是团队
      const { allotByTag } = this.initData.taskConfig;
      // type 1协同人 0 负责人
      const name = allotByTag && !type ? "team" : "dept";
      const option = type ? {} : { max: 1 };
      this.$fast.contact.choose(name, option).then(({ data, status }) => {
        if (!status) {
          const { userId, displayName } = data.users[0];
          if (type) {
            this.synergies = data.users;
            this.displayNames = data.users
              .map((item) => {
                return item.displayName;
              })
              .join(",");
          } else {
            this.executorId = userId;
            this.displayName = displayName;
          }
        }
      });
    },
    openSendMessageDialog() {
      this.sendMessageDialog = true;
    },
  },
};
</script>

<style lang="scss" scoped>
.send-message-to-customer-dialog {
  padding: 0 10px;
  .dialog-body {
    padding: 15px;
    padding-bottom: 30px;
    margin: 10px auto;
    width: 96%;
    &-content {
      font-size: 12px;
      background-color: #d9edf7;
      padding: 10px 25px;
      > p {
        height: 30px;
        color: #999;
        line-height: 30px;
        border: 1px solid #e0e1e2;
        background-color: #fff;
        padding-left: 10px;
        margin-top: 10px;
        margin-bottom: 0;
      }
    }
  }
  .dialog-footer {
    display: flex;
    justify-content: flex-end;
  }
}
</style>
