<!--
  Author: sixgod 
  选择统计方式
-->
<template>
  <el-dialog width="700px"  :close-on-click-modal="false" :visible.sync="dialogVisible">
    <div class="dialog-title" slot="title">重复统计</div>
    有{{data.length}}条已经统计过，是否继续统计？
    <el-table class="table-body" :data="data">
      <el-table-column 
      v-if="this.type == 'team'"
      prop="teamName"
      label="所属部门">
      </el-table-column>
      <el-table-column
        prop="taskNo"
        label="工单编号">
        <template slot-scope="scope">
          <a href="javascript:;" @click="showTaskView(scope.row)">{{scope.row.taskNo}}</a>
        </template>
      </el-table-column>
      <el-table-column
        prop="customer.name"
        label="客户">
      </el-table-column>
      <el-table-column
        prop="executor.displayName"
        label="负责人">
      </el-table-column>
    </el-table>
    <span slot="footer" class="dialog-footer">
      <el-button @click="confirm('cancel')">取 消</el-button>
      <el-button type="primary" :disabled="pending" @click="confirm('screen')">去掉重复数据并继续</el-button>
      <el-button type="primary" :disabled="pending" @click="confirm('continuation')">包含重复数据并继续</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  data(){
    return {
       dialogVisible: false,
       pending: false,
       data: [],
       type: 'person'
    }
  },
  methods: {
    open(data){
      let list = [];
      if(data.tags) {
        this.type = 'team';
        for(let tag of data.tags) {
          if(!data[tag.id]) continue;
          for(let item of data[tag.id]) {
            item.teamName = tag.tagName;
            list.push(item);
          }
        }
      }else {
        this.type = 'person';
        list = data;
      }
      this.data = list;
      this.dialogVisible = true;
    },
    close(){
      this.dialogVisible = false;
    },
    finished() {
      this.pending = false;
    },
    showTaskView(row){
      //查看工单详情
      this.$platform.openTab({
        id:'taskView_' + row.id,
        title: `工单${row.taskNo}`,
        url: `/task/view/${row.id}`
      })
    },
    confirm(type){
      //点击取消对话框隐藏 否则通知副组件进行下一步操作
      if(type === 'cancel') {
        this.dialogVisible = false;
      }else {
        this.pending = true;
      }
      this.$emit('confirm',type)
    }
  }
}

</script>
<style lang='scss' scoped>
.table-body {
  max-height: 450px;
  overflow: auto;
}
</style>