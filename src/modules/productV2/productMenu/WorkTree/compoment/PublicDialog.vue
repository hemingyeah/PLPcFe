<!--  -->
<template>
  <div>
    <!--  -->

    <base-modal :title="dialogData[dialogType].title" :show.sync="visible" width="500px" class="batch-editing-customer-dialog">
      <div class="add-menu-dialog-box">
        <template
          v-if="
            dialogType == 'addMenu' ||
              dialogType == 'addMenuChild' ||
              dialogType == 'renameMenuChild'
          "
        >
          <el-form
            :model="ruleForm"
            :rules="rules"
            ref="ruleForm"
            label-width="100px"
            class="demo-ruleForm"
            label-position="right"
            status-icon
          >
            <el-form-item label="类型名称" prop="name">
            <el-input v-model="ruleForm.name" maxlength="30"></el-input> </el-form-item
          ></el-form>
        </template>
        <template v-else>
          <div class="flex-x copy-el-form-item">
            <div class="lable-100">
              {{
                dialogType == 'linkPart'
                  ? '备件'
                  : dialogType == 'linkWiki'
                    ? '知识库'
                    : '类型'
              }}：
            </div>
            <el-select
              class="flex-1 pos-r"
              popper-class="max-w-488"
              v-model="nowChooseArr"
              multiple
              :multiple-limit="dialogType == 'cloneMenu' ? 1 : 0"
              filterable
              remote
              collapse-tags
              clearable
              placeholder="请输入关键词"
              :remote-method="lenovoselectSearchData"
              :loading="selectLoading"
            >
              <el-option
                v-for="item in (dialogData[dialogType] && dialogData[dialogType].options)"
                :key="item.id"
                :label="dialogType == 'linkWiki' ? item.title : dialogType== 'cloneMenu'? item.pathName : item.name"
                :value="item.id"
              >
                <div class="flex-x overHideCon-1">
                  <template v-if="dialogType == 'linkPart'">
                    <div>{{ item.name }}</div>
                  </template>
                  <template v-if="dialogType == 'linkWiki'">
                    <div>{{ item.title }}</div>
                  </template>
                  <template v-if="dialogType == 'cloneMenu'">
                    <div>{{ item.pathName }}</div>
                  </template>
                </div>
              </el-option>
            </el-select>
            <!-- <com-lenovoselect
              :search-data="lenovoselectSearchData"
              :default-item="false"
              ref="comLenovoselect"
              :choose-show-key="dialogType == 'linkPart' ? 'name' : 'title'"
              list-key="id"
              :com-ruturn-data="nowChooseArr"
              @dataUpdate="dataUpdate()('nowChooseArr')"
            >
              <template
                slot="select"
                slot-scope="slotProps"
                v-if="slotProps.slotData"
              >
                <div
                  v-for="(item, index) in slotProps.slotData.list"
                  :key="index"
                  class="flex-x"
                  :class="
                    slotProps.slotNowDataIndex[item.id] > -1
                      ? 'checked-item'
                      : ''
                  "
                  @click.prevent="slotClick(item, 'comLenovoselect')"
                >
                  <div>{{ item.name }}</div>
                </div>
              </template>
            </com-lenovoselect> -->
          </div>
        </template>
        <template v-if="dialogType == 'linkWiki'"> </template>
      </div>
      <div slot="footer">
        <el-button @click="visible = false">取 消</el-button>
        <el-button type="primary" :loading="btnLoading" @click="confirm"
        >确认</el-button
        >
      </div>
    </base-modal>
  <!--  -->
  </div>
</template>

<script>
import {
  getPageCloneData,
  getPagePart,
  getPageWiki,
} from "@src/api/ProductV2Api";
import _ from "lodash";
import { log } from "mathjs";
export default {
  name: "public-dialog",
  props: {
    visibleProp: {
      type: Boolean,
    },
    dialogType: {
      type: String,
      default: "addMenu",
    },
    initData: {
      type: Object,
    },
  },
  data() {
    return {
      dialogData: {
        addMenu: {
          title: "添加产品类型",
        },
        addMenuChild: {
          title: "添加产品类型",
        },
        cloneMenu: {
          title: "选择需要复制的产品类型",
          http: getPageCloneData,
          options: [],
        },
        renameMenuChild: {
          title: "重命名",
        },
        linkPart: {
          title: "关联备件",
          http: getPagePart,
          options: [],
        },
        linkWiki: {
          title: "关联知识库",
          http: getPageWiki,
          options: [],
        },
      },
      nowChooseArr: [],
      selectedSparepart: [],
      ruleForm: {
        name: "",
      },
      rules: {
        name: [
          { required: true, message: "请输入类型名称", trigger: "blur" },
          { min: 1, max: 30, message: "最多30个字符", trigger: "change" },
        ],
      },
      selectLoading: false,
      btnLoading: false,
    };
  },
  computed: {
    visible: {
      get() {
        return this.visibleProp;
      },
      set(val) {
        this.$emit("changeVisibleProp", val);
      },
    },
  },
  watch: {
    visible(newVal, oldVal) {
      if (newVal == false) {
        if (
          this.dialogType == "addMenu"
          || this.dialogType == "renameMenuChild"
          || this.dialogType == "addMenuChild"
        )
          this.$refs["ruleForm"].resetFields();
        this.nowChooseArr = [];
        this.btnLoading = false;
      }
    },
    initData(newVal, oldVal) {
      if (this.dialogType == "renameMenuChild")
        this.$set(this.ruleForm, "name", newVal.name);
    },
  },
  methods: {
    confirm() {
      if (
        this.dialogType == "addMenu"
        || this.dialogType == "addMenuChild"
        || this.dialogType == "renameMenuChild"
      ) {
        this.$refs["ruleForm"].validate((valid) => {
          if (valid) this.$emit("confirm", { catalogName: this.ruleForm.name });
        });
      } else if (
        this.dialogType == "linkPart"
        || this.dialogType == "linkWiki"
        || this.dialogType == "cloneMenu"
      ) {
        if(!this.nowChooseArr.length){
          return this.$message.error("选择内容不能为空");
        }
        this.$emit("confirm", { nowChooseArr: this.nowChooseArr });
      }
    },
    dataUpdate(e, key) {
      this[key] = e;
    },
    calculateClass(e, t) {
      let str = "";
      if (e.slotNowData) {
        for (let index = 0; index < e.slotNowData.length; index++) {
          const element = e.slotNowData[index];
          if (element.orderId === t.orderId) {
            str = "checked-item";
          }
        }
      }
      return str;
    },
    slotClick(e, ref) {
      this.$refs[ref].chooseItem(e);
    },
    lenovoselectSearchData: _.debounce(function(e, type) {
      if(!type && !e){
        return
      }
      this.selectLoading = true;
      this.dialogData[this.dialogType]
        .http({
          keyWord: e,
          pageSize: 50,
          pageNum: 1,
          ...this.dialogType == "cloneMenu" ? {catalogId:this.initData.id} : {}
        })
        .then((res) => {
          if (!res) {
            return;
          }
          this.dialogData[this.dialogType].options = res.result.list || [];
        })
        .catch((err) => {})
        .finally(() => {
          this.selectLoading = false;
        });
    }, 800),
    /**
     * @description 搜索备件
     */
    searchPart(params) {
      // params has three properties include keyword、pageSize、pageNum.
      const pms = params || {};
      pms.repertoryId = this.repertoryId || "";
      pms.with_OOS = false;
      pms.keyWord = pms.keyword;
      return this.$http
        .get("/task/spare/list", pms)
        .then((res) => {
          if (!res || !res.list) return;
          res.list = res.list.map((template) =>
            Object.freeze({
              label: template.name,
              value: template.id,
              ...template,
            })
          );
          return res;
        })
        .catch((e) => console.error(e));
    },
    /**
     * @description 选择备件
     */
    updatePart(value) {
      let newValue = value[0];

      for (let key in this.sparepart) {
        if (key == "salePrice") {
          this.sparepart.salePrice = newValue.salePrice.toFixed(2);
        } else if (key == "number") {
          this.sparepart.number = newValue.availableNum > 1 ? 1 : newValue.availableNum;
        } else {
          this.sparepart[key] = newValue[key];
        }
      }
    },
    changeBtnLoading(e){
      this.btnLoading = e
    }
  },
};
</script>
<style lang="scss" scoped>
.add-menu-dialog-box {
  padding: 12px 12px 0 0;
}
.lable-100 {
  width: 70px;
}
.copy-el-form-item {
  margin-bottom: 18px;
}
.checked-item {
  background: $color-primary;
}
</style>
<style lang="scss">
.el-dialog__body {
  border-top: 1px solid rgba(0, 0, 0, 0.09);
  border-bottom: 1px solid rgba(0, 0, 0, 0.09);
  padding: 0;
}

.el-select__input{
  margin-left: 12px;
}

.el-select-dropdown__item {
  height: auto;
}

.el-select__tags-text{
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
  white-space: normal;
  word-wrap: break-word;
  word-break: break-all;
}
.el-select .el-tag{
position: relative;
padding-right: 6px;
}
.el-select .el-tag__close.el-icon-close {
  position: absolute;
  right: 1px;
  top: 0;
  bottom: 0;
  margin: auto;
}
.batch-editing-customer-dialog {

    .base-modal-body {
      padding: 10px 30px 0;
    }

    .form-name, .form-item label {
      width: 70px;
      padding: 0;
      line-height: 32px;
    }

    .el-select {
      width: 100%;
    }

    .item {
      display: flex;
      justify-content: space-between;
      line-height: 32px;
      div {
        flex-grow: 1;
        .el-select {
          width: 100%;
        }
      }
    }

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
    }

  }
</style>

<style lang="scss">
.el-select-dropdown__empty {
  display: block !important;
}
</style>
