<template>
  <div>
    <h2>消息模板</h2>
    <div>
      <!-- 表格 start -->
      <el-table class="mar-b-10" :data="tableData" stripe style="width: 100%">
        <el-table-column prop="date" label="模板类型" width="180"></el-table-column>
        <el-table-column prop="name" label="模板名称" width="180"></el-table-column>
        <el-table-column prop="address" label="模板内容"></el-table-column>
        <el-table-column label="操作" width="80">
          <template slot-scope="scope" >
            <a class="color-g" @click="visible=true">配置</a>
          </template>
        </el-table-column>
      </el-table>
      <!-- 表格 end -->
      <!-- start 表格底部 -->
      <div class="table-footer">
        <div class="list-info">
          共
          <span class="level-padding">{{ page.total || 0 }}</span>记录
        </div>
        <el-pagination
          class="product-template-table-pagination"
          background
          :page-sizes="[10, 20, 50]"
          :page-size="page.pageSize"
          :current-page="page.pageNum"
          layout="prev, pager, next, sizes, jumper"
          :total="page.total"
        ></el-pagination>
        <!-- end 表格底部 -->
      </div>
    </div>

    <!-- 编辑框 start-->
    <base-modal :show.sync="visible" title="编辑消息模板" class="form-address-modal">
      <!-- 编辑表单 start -->
      <div class="set-box">
        <div class="flex-x template-des al-c mar-b-10">
          <p>模板名称：名称</p>
          <p class="mar-l-15">模板类型：类型</p>
        </div>
        <div class="flex-x">
          <div class="form-box">
            <div class="flex-x mar-b-10">
              <p>标题：</p>
              <p>标题</p>
            </div>
            <div class="flex-x">
              <p>模板：</p>
              <div class="form-con flex-1">
                <el-input
                  class="mar-b-10"
                  type="textarea"
                  :autosize="{ minRows: 2, maxRows: 4}"
                  v-model="form.con"
                  resize="none"
                ></el-input>
                <el-input class="mar-b-10" v-model="form.person" disabled ></el-input>
                <el-input class="mar-b-10" v-model="form.phone" disabled ></el-input>
                <el-input v-model="form.bottomCon" ></el-input>
              </div>
            </div>
          </div>
          <div class="flex-x mar-l-15">
            <p>样例</p>
            <div class="result-show mar-l-15"></div>
          </div>
        </div>
        <!-- 编辑表单 end -->
      </div>

      <div class="flex-x foot-btn" slot="footer">
        <base-button type="ghost" plain>关闭</base-button>
        <base-button type="primary" class="mar-l-15" plain>保存</base-button>
      </div>
    </base-modal>
    <!-- 编辑框 end-->
  </div>
</template>
<script>
import Page from "@model/Page";
export default {
  name: "toast-template",
  data() {
    return {
      type: 1, // 页面状态 0 列表形态 1 编辑形态
      visible: true, // 编辑页面弹窗
      page: new Page(),
      tableData: [
        {
          date: "2016-05-02",
          name: "王小虎",
          address: "上海市普陀区金沙江路 1518 弄"
        },
        {
          date: "2016-05-04",
          name: "王小虎",
          address: "上海市普陀区金沙江路 1517 弄"
        },
        {
          date: "2016-05-01",
          name: "王小虎",
          address: "上海市普陀区金沙江路 1519 弄"
        },
        {
          date: "2016-05-03",
          name: "王小虎",
          address: "上海市普陀区金沙江路 1516 弄"
        }
      ],
      form: {}
    };
  }
};
</script>
<style lang="scss" scoped>
.template-des {
  p {
    font-size: 14px;
  }
}

.set-box {
  padding: 20px 15px;
  border-bottom: 1px solid #e9ecef;
  p {
    font-size: 14px;
  }
  .form-box {
    width: 50%;

    .form-con {
    }
  }
  .result-show {
    width: 212px;
    height: 307px;
    background: red;
  }
}
.foot-btn {
  justify-content: flex-end;
}
.el-input {
  .el-input__inner {
    padding-left: 15px;
  }
}
</style>