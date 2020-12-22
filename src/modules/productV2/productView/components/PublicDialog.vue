<template>
  <base-modal
    :title="pageObj[dialogType] && pageObj[dialogType].title"
    :show.sync="visible"
    width="400px"
    class="base-import-modal"
  >
    <div class="form-view-row" style="padding: 0">
      <label style="line-height: 32px">{{
        pageObj[dialogType] && pageObj[dialogType].lable
      }}</label>
      <div class="form-view-row-content flex-x">
        <el-select
          class="flex-1 pos-r"
          popper-class="max-w-488"
          v-model="nowChooseArr"
          filterable
          remote
          collapse-tags
          clearable
          placeholder="请输入关键词"
          :remote-method="lenovoselectSearchData"
          :loading="selectLoading"
        >
          <el-option
            v-for="item in pageObj[dialogType] && pageObj[dialogType].options"
            :key="item.id"
            :label="dialogType == 'linkQrcode' ? item.qrcodeId : item.pathName"
            :value="dialogType == 'linkQrcode' ? item.qrcodeId : item.id"
          >
            <div class="flex-x overHideCon-1">
              <template v-if="dialogType == 'linkQrcode'"
              ><div>{{ item.qrcodeId }}</div></template
              >
              <template v-else
              ><div>{{ item.pathName }}</div></template
              >
            </div>
          </el-option>
        </el-select>
      </div>
    </div>

    <div class="dialog-footer" style="margin-top: 15px;">
      <el-button @click="visible = false">取 消</el-button>
      <el-button type="primary" @click="bind" :loading="pending"
      >关联</el-button
      >
    </div>
  </base-modal>
</template>

<script>
import {
  searchQrcode,
  searchAllcatalog,
} from "@src/api/ProductV2Api";
import _ from "lodash";

export default {
  name: "public-dialog",
  props: {
    productId: {
      type: String,
      default: "",
    },
    dialogType: {
      type: String,
      default: "linkQrcode",
    },
  },
  watch: {
    visible(newVal, oldVal) {
      if (!newVal) {
        this.nowChooseArr = "";
        this.pending = false;
      }
    },
  },
  data() {
    return {
      visible: false,
      pending: false,
      selectLoading: false,
      nowChooseArr: "",
      pageObj: {
        linkQrcode: {
          title: "关联二维码",
          lable: "二维码编号",
          http: searchQrcode,

          options: [],
        },
        linkCatalog: {
          title: "关联产品类型",
          lable: "产品类型",
          http: searchAllcatalog,

          options: [],
        },
      },
    };
  },
  methods: {
    open() {
      this.visible = true;
    },
    close() {
      this.visible = false;
    },
    bind() {
      if (!this.nowChooseArr) return this.$message.error("选择内容不能为空");

      this.pending = true;
      if (this.dialogType == "linkQrcode") {
        this.$emit("dialogBind", { qrcodeId: this.nowChooseArr });
      } else {
        this.$emit("dialogBind", { catalogId: this.nowChooseArr });
      }
    },
    reset() {
      this.visible = false;
      this.nowChooseArr = "";
    },
    changeLoading(e) {
      this.pending = e;
    },

    lenovoselectSearchData: _.debounce(function(e) {
      this.selectLoading = true;
      this.pageObj[this.dialogType]
        .http({
          keyWord: e,
          pageSize: 50,
          pageNum: 1,
        })
        .then((res) => {
          if (!res) {
            return;
          }
          this.pageObj[this.dialogType].options = res.result.list || [];
        })
        .catch((err) => {})
        .finally(() => {
          this.selectLoading = false;
        });
    }, 800),
  },
};
</script>

<style lang="scss">
.el-dialog__body {
  border-top: 1px solid rgba(0, 0, 0, 0.09);
  border-bottom: 1px solid rgba(0, 0, 0, 0.09);
  padding: 0;
}

.el-select-dropdown__item {
  height: auto;
}
.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>
