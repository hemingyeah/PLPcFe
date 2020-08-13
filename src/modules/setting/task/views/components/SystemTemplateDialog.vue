<template>
  <base-modal
      :title="clickType == 'report' ? '设置服务报告' : '设置打印模板'" width="700px" class="form-select-setting-modal"
      @cancel="cancel"
      :show.sync="isShow" :mask-closeable="false">
    <div class="scroll-content">
      <div class="row" v-for="item in 10">
        <p class="title">公司信息</p>
        <div class="section-line">
          <el-checkbox-group v-model="checkList" class="checkbox-group">
            <div class="checkbox-item">
              <el-checkbox label="名称"></el-checkbox>
            </div>
            <div class="checkbox-item">
              <el-checkbox label="电话"></el-checkbox>
            </div>
            <div class="checkbox-item">
              <el-checkbox label="邮箱"></el-checkbox>
            </div>
            <div class="checkbox-item">
              <el-checkbox label="地址"></el-checkbox>
            </div>
            <div class="checkbox-item">
              <el-checkbox label="自助门户"></el-checkbox>
            </div>
          </el-checkbox-group>
        </div>
      </div>
    </div>
    <template slot="footer">
      <button type="button" class="btn btn-primary" @click="submit">保存</button>
    </template>
  </base-modal>
</template>

<script>
import {getTaskTemplateFields,getFields, taskSettingSave,getTaskCardDetailList} from '@src/api/TaskApi';
export default {
  name: "system-template-dialog",
  props: {
    isShowSystemModal: {
      type: Boolean,
      default: false,
    },
    clickType : {
      type : String,
      default: ""
    }
  },
  data() {
    return {
      checkList : ["名称"],
      isShow : false,
      //TODO: id后期需要动态获取
      id : 1,
      taskList : [],
      receiptList : [],
      cardDetailList : []
    }
  },
  created() {

  },
  methods : {
    async getTemplateInfo() {
      //创建工单组件
      let firstFields = await getFields({ tableName: 'task', typeId:this.id});
      console.log(fields);
      this.taskList = firstFields;
      //回执组件
      let secondFields = await getFields({ tableName: 'task_receipt', typeId:this.id});
      let msg = [];
      msg = secondFields.filter(item => {
        return item.enabled == 1
      });
      this.receiptList = msg;
      let thirdFields = await getTaskCardDetailList({typeId:this.id});
      this.cardDetailList = thirdFields;
    },
    async submit() {
      console.log("保存系统模板配置");
    },
    cancel(res) {
      console.log("cancal")
      this.$emit("hideModal",{templateType : "system",})
    }
  },
  watch : {
    clickType(newVal,oldVal) {
      this.getTemplateInfo();
      if(newVal == "report") {
        console.log("访问报告方面的接口")
        // getFields
        // getFields
      }else if(newVal == "print"){
        console.log("访问打印方面的接口")
      }
    },
    isShowSystemModal(newVal,oldVal) {
      this.isShow = newVal;
    }
  }
}
</script>

<style scoped>
  .title{
    font-size: 12px;
    color: #333333;
    text-indent: 10px;
  }

  .checkbox-group{
    width: 90%;
    margin: 0 auto 1rem;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
  }

  .checkbox-item{
    width: 33%;
  }

  .scroll-content{
    padding: 10px 0px;
    max-height: 500px;
    overflow-y: auto;
  }

</style>