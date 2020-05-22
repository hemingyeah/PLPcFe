<template>
  <div>
    <h2>消息模板</h2>
    <div>
      <!-- 表格 start -->
      <el-table class="mar-b-10" :data="tableData" stripe style="width: 100%">
        <el-table-column prop="remindType" label="模板类型" width="180"></el-table-column>
        <el-table-column prop="name" :show-overflow-tooltip="true" label="模板名称" width="180"></el-table-column>
        <el-table-column prop="first" :show-overflow-tooltip="true" label="模板内容" width="450"></el-table-column>
        <el-table-column label="操作" width="80">
          <template slot-scope="scope">
            <a class="color-g can-point" @click="showAlterTemp(scope)">配置</a>
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
    <base-modal :show.sync="visible" title="编辑消息模板" class="form-address-modal" @cancel="cancelTemp">
      <!-- 编辑表单 start -->
      <div class="set-box">
        <div class="flex-x template-des al-c mar-b-10">
          <p>模板名称：{{form.name}}</p>
          <p class="mar-l-15">模板类型：{{form.remindType}}</p>
        </div>
        <div class="flex-x">
          <div class="form-box">
            <div class="flex-x mar-b-10">
              <p>标题：</p>
              <p>{{form.name}}</p>
            </div>
            <div class="flex-x">
              <p>模板：</p>
              <div class="form-con flex-1">
                <el-input
                  class="mar-b-10"
                  type="textarea"
                  :autosize="{ minRows: 2, maxRows: 4}"
                  v-model="form.first"
                  maxlength="120"
                  resize="none"
                ></el-input>
                <el-input
                  class="mar-b-10"
                  v-for="(item, index) in form.modelMap"
                  :key="index"
                  v-model="item.name+'：'+item.value"
                  disabled
                ></el-input>
                <el-input
                  type="textarea"
                  :autosize="{ minRows: 2, maxRows: 4}"
                  v-model="form.remark"
                  resize="none"
                  maxlength="300"
                ></el-input>
              </div>
            </div>
          </div>
          <div class="flex-x mar-l-15">
            <p>样例</p>
            <div class="result-show mar-l-15">
              <img src="@src/assets/img/wx/temp.png" alt />
            </div>
          </div>
        </div>
        <!-- 编辑表单 end -->
      </div>

      <div class="flex-x foot-btn" slot="footer">
        <base-button type="ghost" plain @event="cancelTemp">关闭</base-button>
        <base-button type="primary" class="mar-l-15" plain @event="saveTemp">保存</base-button>
      </div>
    </base-modal>
    <!-- 编辑框 end-->
  </div>
</template>
<script>
import Page from "@model/Page";
import _ from "lodash";
import {
  getToastTemplateList,
  setToastTemplateList
} from "@src/api/doMyself.js";
export default {
  name: "toast-template",
  data() {
    return {
      type: 1, // 页面状态 0 列表形态 1 编辑形态
      visible: false, // 编辑页面弹窗
      page: new Page(),
      tableData: [],
      form: {},
      nowAlerTemp: -1
    };
  },
  methods: {
    getTemp() {
      // 获取模板列表
      getToastTemplateList().then(res => {
        res.list.map(item => {
          item.modelMap = JSON.parse(item.modelMap);
          return item;
        });
        this.tableData = res.list;
      });
    },
    showAlterTemp(item) {
      if (this.visible) {
        return;
      }
      this.nowAlerTemp = item.$index;

      this.form = _.cloneDeep(this.tableData[item.$index]);
      this.visible = true;
    },
    saveTemp() {
      if (!this.visible) {
        return;
      }
      if (this.form.first === "" || this.form.remark === "") {
        return;
      }
      let { first, remark, id } = { ...this.form };
      this.$emit("pageLoading", true);
      // 编辑模板
      setToastTemplateList({
        id,
        first,
        remark
      }).then(res => {
        this.$emit("pageLoading", false);
        this.visible = false;
        this.getTemp();
      });
    },
    cancelTemp() {
      this.visible = false;
    }
  },
  created() {
    this.getTemp();
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
  }
  .result-show {
    width: 212px;
    height: 307px;
    position: relative;
    img {
      width: 100%;
      height: 100%;
    }
  }
}
.foot-btn {
  justify-content: flex-end;
}
.can-point {
  cursor: pointer;
}
.el-input {
  .el-input__inner {
    padding-left: 15px;
  }
}
</style>