<template>
  <div class="work-tree-data-box"
       v-loading="loading">
    <div class="flex-1 scroll-data">
      <template v-if="!propData.canEditConData">
        <no-data-view :notice-msg="'此产品类型分级不可添加内容'"></no-data-view>
      </template>
      <template v-else-if="!propData.conData">
        <no-data-view :notice-msg="'此产品类型分级可以添加内容'">
        </no-data-view>
        <div class="text-center mar-t-24">
          <el-button @click="setMenuInfo">添加内容</el-button>
        </div>
      </template>
      <div v-show="propData.canEditConData && propData.conData">
        <div class="work-data-title flex-x">
          <div class="flex-1 mar-r-24">{{propData.name}}</div>
          <el-button @click="showDialog('cloneMenu')">复制其他产品类型</el-button>
          <div class="flex-x mar-l-10"
               v-if="propData.conData == 1">

            <el-button class=""
                       type="primary"
                       :loading="btnLoading"
                       @click="submit">保存</el-button>
            <el-button type="danger"
                       :loading="btnLoading"
                       @click="deletInfo">删除</el-button>
          </div>
        </div>

        <form-builder ref="form"
                      :fields="fields"
                      :value="productMenuValue"
                      mode="product_menu"
                      @update="update">
          <template v-if="haveAttribute">
            <div class="normal-title-2">
              <div>选择产品类型显示字段</div>
              <el-tooltip class="item"
                          effect="dark"
                          content="类型字段在系统管理中配置"
                          placement="bottom">
                <i class="iconfont icon-help color-999 mar-l-8 cur-point"></i>
              </el-tooltip>
            </div>

            <div class="pad-l-10 mar-b-12">
              <div class="font-12 color-999 mar-b-10">
                *被隐藏的字段，将不会出现在这个类型信息中（系统字段不可隐藏）
              </div>
              <el-checkbox-group v-model="fieldIds">
                <template v-for="item in fields">
                  <el-checkbox v-if="item.isSystem != 1"
                               :label="item.id"
                               :key="item.id">{{ item.displayName }}</el-checkbox>
                </template>
              </el-checkbox-group>
            </div>
          </template>
          <template slot="product_menu_part">
            <div class="normal-title-2 ">
              <div class="flex-1">关联备件</div>
              <el-button @click="showDialog('linkPart')">关联备件</el-button>
            </div>

            <mini-table :id="propData.id"
                        class="mar-b-20"
                        data-type="part"
                        page-type="edit"
                        v-if="flashPartType" />
          </template>
          <template slot="product_menu_wiki">
            <div class="normal-title-2">
              <div class="flex-1">关联知识库</div>
              <el-button @click="showDialog('linkWiki')">关联知识库</el-button>
            </div>
            <mini-table :id="propData.id"
                        class="mar-b-20"
                        data-type="wiki"
                        page-type="edit"
                        v-if="flashProductType" />
          </template>

          <template slot="productPic"
                    slot-scope="{ field }">
            <form-item class="upload-img"
                       :class="{'hide_box':productMenuValue.productPic.length>=5}"
                       :label="field.displayName">
              <el-upload action="string"
                         list-type="picture-card"
                         :on-preview="handlePictureCardPreview"
                         :before-upload="onBeforeUploadImage"
                         :http-request="UploadImagePic"
                         :file-list="productPicList"
                         :on-exceed="onExceedPic"
                         :on-remove="onRemovePic"
                         multiple
                         :limit="5">
                <i class="el-icon-plus"></i>
              </el-upload>
              <div class="font-12 color-999 mar-t-10">
                最多上传5张图片，建议比例1:1
              </div>
            </form-item>
          </template>

          <template slot="thumbnail"
                    slot-scope="{ field }">
            <form-item 
              :class="['upload-img',productMenuValue.thumbnail.length>=1? 'hide_box': '']"
              :label="field.displayName">
              <el-upload action="string"
                         list-type="picture-card"
                         :on-preview="handlePictureCardPreview"
                         :before-upload="onBeforeUploadImage"
                         :http-request="UploadImageThu"
                         :file-list="thumbnailList"
                         :on-exceed="onExceedThu"
                         :on-remove="onRemoveThu"
                         :limit="1">
                <i class="el-icon-plus"></i>
              </el-upload>
              <div class="font-12 color-999 mar-t-10">
                最多上传1张图片，建议比例1:1
              </div>
            </form-item>
          </template>

          <!-- <el-form ref="form" :model="form" label-width="110px">

        <el-form-item label="产品简介">
          <el-input type="textarea" v-model="form.desc"></el-input>
        </el-form-item>
        <el-form-item label="产品图片">
          <el-radio-group v-model="form.resource">
            <el-upload
              action="string"
              list-type="picture-card"
              :on-preview="handlePictureCardPreview"
              :before-upload="onBeforeUploadImage"
              :http-request="UploadImage"
            >
              <i class="el-icon-plus"></i>
            </el-upload>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="产品使用说明">
          <el-upload
            class="upload-demo"
            action="string"
            :on-preview="handlePreview"
            :http-request="UploadImage"
            :before-upload="onBeforeUploadVideo"
            :file-list="fileList"
            name="filename"
            multiple
          >
            <el-button size="small" type="primary">点击上传</el-button>
            <div slot="tip" class="el-upload__tip">
              只能上传mp4文件，且不超过10mb
            </div>
          </el-upload>
        </el-form-item>
        <el-form-item label="产品视频">
          <el-upload
            class="upload-demo"
            action="string"
            :on-preview="handlePreview"
            :http-request="UploadImage"
            :before-upload="onBeforeUploadVideo"
            :file-list="fileList"
            name="filename"
            multiple
          >
            <el-button size="small" type="primary">点击上传</el-button>
            <div slot="tip" class="el-upload__tip">
              只能上传mp4文件，且不超过10mb
            </div>
          </el-upload>
        </el-form-item>
    </el-form> -->
        </form-builder>
      </div>
    </div>
  </div>
</template>
<script>
import _ from "lodash";
import MiniTable from "@src/modules/productV2/productMenu/WorkTree/compoment/MiniTable.vue";
import Uploader from "packages/BaseUpload/uploader";
import NoDataView from "@src/component/common/NoDataViewNew";
import fields from "./fiedls";

import * as FormUtil from "@src/component/form/util"

import {
  getProductMenuField,
  getPageInfo,
  setPageInfo,
  clearCatalogData,
} from "@src/api/ProductV2Api";
import { warn } from "vue-class-component/lib/util";
import { log } from "mathjs";

const urlKey = {
  catalogName: "catalog_name",
  productDesc: "product_desc",
  productVideo: "product_video",
  productPic: "product_pic",
  productExplain: "product_explain",
};
let fieldIds_ = [];
export default {
  name: "work-tree-data",
  props: {
    propData: {
      type: Object,
      default: () => ({}),
    },
  },
  inject: ["rootDataChange", "changeTreeDetail"],
  data () {
    return {
      form: {
        name: "",
        resource: "",
        desc: "",
      },
      fileList: [],
      fields: [],
      productMenuValue: this.initProductMenuValue(),

      flashPartType: false,
      flashProductType: false,
      fieldIds: [],
      btnLoading: false,
      productPicList: [],
      thumbnailList: [],
      loading: false,
      haveAttribute: false
    };
  },
  components: {
    MiniTable,
    NoDataView,
  },
  watch: {
    propData (newVal, oldVal) {
      this.$set(
        this.productMenuValue,
        "catalogName",
        _.cloneDeep(newVal.name)
      );
      if (newVal.canEditConData && newVal.conData) {
        this.reflashPage(newVal.id);
      }
    },
    fieldIds (newVal, oldVal) {
      this.fields.map((item) => {
        if (newVal.indexOf(item.id) > -1 || item.isSystem == 1) item["hideform"] = false;
        else item["hideform"] = true;
        return item;
      });
    },
  },
  mounted () {
    getProductMenuField()
      .then((res) => {
        const { code, result, message } = res;
        this.haveAttribute = false;
        if (code == 0) {
          const fields = result || [];
          let arr = [];
          const sortedFields = fields
            .sort((a, b) => a.orderId - b.orderId)
            .map((item) => {
              if (item.isSystem != 1) this.haveAttribute = true;
              if (item.fieldName == "catalogName") item["maxlength"] = 30;
              if (item.fieldName == "catalogNum") item["disabled"] = true;
              if (item.fieldName == "productVideo") item["limit"] = 1;
              return item;
            });

          fieldIds_ = sortedFields.filter(item => item.isSystem != 1).map((item) => {
            return item.id;
          });
          this.fields = sortedFields;
        } else {
          this.$notify.error({
            title: "网络错误",
            message,
            duration: 2000,
          });
        }
      })
      .catch((error) => { });
  },
  methods: {
    initProductMenuValue () {
      return {
        catalogName: this.propData.name,
        productDesc: "",
        productVideo: [],
        productPic: [],
        productExplain: [],
        thumbnail: []
      };
    },
    onExceedPic () {
      this.$message.error("最多上传5张图片!");
    },
    onExceedThu () {
      this.$message.error("最多上传1张图片!");
    },
    handlePictureCardPreview (file) {
      this.$previewImg(file.url);
    },
    handlePreview (file) {
      if (!file.url) return;
      this.$previewVideo(file.url);
    },
    onBeforeUploadImage (file) {
      const isJPG = file.type === "image/jpeg" || file.type === "image/png";
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPG) {
        this.$message.error("上传图片只能是 JPG/PNG 格式!");
      }
      if (!isLt2M) {
        this.$message.error("上传图片大小不能超过 2MB!");
      }
      // this.fileList.push(file);
      return isJPG && isLt2M;
    },
    onBeforeUploadVideo (file) {
      const isMP4 = file.type === "video/mp4";
      const isLt10M = file.size / 1024 / 1024 < 10;

      if (!isMP4) {
        this.$message.error("上传视频只能是 MP4 格式!");
      }
      if (!isLt10M) {
        this.$message.error("上传视频大小不能超过 10MB!");
      }
      // this.fileList.push(file);
      return isMP4 && isLt10M;
    },
    onRemovePic (o, a) {
      this.$set(this.productMenuValue, "productPic", this.productMenuValue.productPic.filter(item => item.uid != o.uid));
    },
    onRemoveThu (o, a) {
      this.$set(this.productMenuValue, "thumbnail", this.productMenuValue.thumbnail.filter(item => item.uid != o.uid));
    },
    UploadImagePic (param) {
      Uploader.upload(param.file, "/files/upload")
        .then((result) => {
          if (result.status != 0) {
            this.$message({
              message: `${result.message}`,
              duration: 1500,
              type: "error",
            });
            return;
          }

          let file = result.data;
          console.log(param, "param");
          let item = {
            uid: param.file.uid,
            id: file.id,
            filename: file.fileName,
            // 如果后端返回url,必须使用。如果后端不返回，需要拼接
            url: file.ossUrl || file.url || `/files/get?fileId=${file.id}`,
            fileSize: file.fileSizeStr,
          };
          // param.file['ossUrl'] = item.url;
          this.$set(this.productMenuValue, "productPic", [
            ...this.productMenuValue.productPic,
            item,
          ]);
        })
        .catch((err) => {
          console.warn(err);
        })
        .finally(() => { });
    },
    UploadImageThu (param) {
      Uploader.upload(param.file, "/files/upload")
        .then((result) => {
          if (result.status != 0) {
            this.$message({
              message: `${result.message}`,
              duration: 1500,
              type: "error",
            });
            return;
          }

          let file = result.data;
          let item = {
            uid: param.file.uid,
            id: file.id,
            filename: file.fileName,
            // 如果后端返回url,必须使用。如果后端不返回，需要拼接
            url: file.ossUrl || file.url || `/files/get?fileId=${file.id}`,
            fileSize: file.fileSizeStr,
          };
          // param.file['ossUrl'] = item.url;
          this.$set(this.productMenuValue, "thumbnail", [
            ...this.productMenuValue.productPic,
            item,
          ]);
        })
        .catch((err) => {
          console.warn(err);
        })
        .finally(() => { });
    },
    showDialog (e) {
      if (this.$parent.changeDialog) {
        this.$parent.changeDialog(e);
      } else if (this.$parent.$parent.changeDialog) {
        this.$parent.$parent.changeDialog(e);
      }
    },
    update ({ field, newValue, oldValue }) {
      let { fieldName, displayName } = field;
      if (this.$appConfig.debug) {
        console.info(
          `[FormBuilder] ${displayName}(${fieldName}) : ${JSON.stringify(
            newValue
          )}`
        );
      }
      let value = this.productMenuValue;

      this.$set(value, fieldName, newValue);
      this.$emit("input", value);
    },
    setMenuInfo () {
      this.rootDataChange("nowEditMenu", { ...this.propData, conData: 1 });
      this.$set(this, "fieldIds", _.cloneDeep(fieldIds_))
    },
    resetForm () {
      // 清空校验结果
      setTimeout(() => {
        try {
          this.$refs.form.$children.map((child) => {
            if (child.$el.className == "form-item err") {
              child.$el.dispatchEvent(
                new CustomEvent("form.clear.validate", { bubbles: false })
              );
            }
          });
        } catch (error) { }
      }, 0);
    },
    async submit () {
      const validateRes = await this.$refs.form.validate();
      if (!validateRes) return;
      this.rootDataChange("fullscreenLoading", true);
      let url_data = this.transferData();
      this.btnLoading = true;
      setPageInfo(url_data)
        .then((res) => {
          if (res.code != 0) {
            this.$notify.error({
              title: "网络错误",
              message: res.message,
              duration: 2000,
            });
          } else {
            this.$message({
              message: "保存成功",
              type: "success",
            });
            this.changeTreeDetail("conData", 1);
            try {
              let fromId = window.frameElement.getAttribute("fromid")
              this.$platform.refreshTab(fromId)
            } catch (error) {
              console.warn(error, "error try catch");
            }
            window.parent.flashSomePage({
              type: "M_PRODUCT_CATALOG",
            });
          }
        })
        .finally(() => {
          this.rootDataChange("fullscreenLoading", false);
          this.btnLoading = false;
        });
    },
    transferData (data) {
      // 仅用于向接口传参转换数据
      let obj = {};
      let tran_data = _.cloneDeep(this.productMenuValue);
      obj["attribute"] = {};
      this.fields.forEach(item => {
        let key = item.fieldName;
        if (item.isSystem) {
          obj[key] = tran_data[key]
        } else {
          obj["attribute"][key] = tran_data[key]
        }
      })
      obj["id"] = this.propData.id;
      obj["fieldIds"] = fieldIds_.filter(item => !this.fieldIds.some(ele => ele == item));
      return obj;
    },
    reflashPage (id) {
      this.resetForm();
      this.loading = true;
      getPageInfo({
        id,
      }).then((res) => {
        if (res.code == 0) {
          res.result.catalogInfo.productVideo = res.result.catalogInfo.productVideo || [];
          res.result.catalogInfo.productPic = res.result.catalogInfo.productPic || [];
          this.thumbnailList = res.result.catalogInfo.thumbnail || [];
          this.productPicList = res.result.catalogInfo.productPic || [];
          res.result.catalogInfo.productExplain = res.result.catalogInfo.productExplain || [];
          res.result.catalogInfo.thumbnail = res.result.catalogInfo.thumbnail || [];
          res.result.catalogInfo = { ...res.result.catalogInfo, ...res.result.catalogInfo.attribute }
          // let form = util.packToForm(this.fields, {}, this.initData.customerAddress);
          this.form = FormUtil.initialize(this.fields, res.result.catalogInfo);
          this.$set(this, "productMenuValue", res.result.catalogInfo);

          if (res.result.selectField) {

            this.$set(this, "fieldIds", fieldIds_.filter(item => !res.result.selectField.some(ele => ele == item)));
          }
        } else {
          this.$notify.error({
            title: "网络错误",
            message: res.message,
            duration: 2000,
          });
        }
      }).finally(() => {
        this.loading = false;
      });
      this.$set(this, "flashPartType", false);
      this.$set(this, "flashProductType", false);
      this.$nextTick(() => {
        this.$set(this, "flashPartType", true);
        this.$set(this, "flashProductType", true);
      });
    },
    deletInfo () {
      this.$confirm("此操作将删除该类型所编辑的内容?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.btnLoading = true;
          clearCatalogData({
            catalogId: this.propData.id,
          })
            .then((res) => {
              if (res.code == 0) {
                this.rootDataChange("nowEditMenu", {
                  ...this.propData,
                  conData: 0,
                });
                this.changeTreeDetail("conData", 0);
                this.$message({
                  message: "删除成功",
                  type: "success",
                });
                window.parent.flashSomePage({
                  type: "M_PRODUCT_CATALOG",
                });
              } else {
                this.$notify.error({
                  title: "网络错误",
                  message: res.message,
                  duration: 2000,
                });
              }
            })
            .finally(() => {
              this.btnLoading = false;
            });
        })
        .catch(() => { });
    },
    reflashTable (type) {
      if (type == "part") {
        this.$refs.form.$slots.product_menu_part[2].child.reflash();
        // this.$set(this, 'flashPartType', false);
        // this.$nextTick(() => {
        //   this.$set(this, 'flashPartType', true);
        // });
      } else {
        this.$refs.form.$slots.product_menu_wiki[2].child.reflash();
        // this.$set(this, 'flashProductType', false);
        // this.$nextTick(() => {
        //   this.$set(this, 'flashProductType', true);
        // });
      }
    },
  },
};
</script>
<style lang="scss" scoped>
@mixin title-class {
  height: 48px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  font-weight: 600;
}
.work-tree-data-box {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
  min-width: 630px;
  .scroll-data {
    overflow-y: scroll;
  }
  .work-data-title{
    padding: 12px;
    font-size: 16px;
    font-weight: 600;
    border-bottom: 1px solid $color-border-l1;
    position: -webkit-sticky;
    position: sticky;
    top: 0;
    z-index: 99;
    background: #fff;
  }
  .normal-title-1 {
    @include title-class();
    padding: 0 10px;
    font-size: 16px;
    border-bottom: 1px solid $color-border-l1;
    position: -webkit-sticky;
    position: sticky;
    top: 0;
    z-index: 99;
    background: #fff;
  }
  .normal-title-2 {
    @include title-class();
    padding: 0;
    font-weight: 400;
  }
  .normal-title-2-inside {
    @include title-class();
    padding: 0 10px;
  }
  .normal-title-2-bord-bottom {
    @include title-class();
    border-bottom: 1px solid $color-border-l1;
    margin-bottom: 24px;
  }
}
// .bottom-btns {
//   height: 64px;
//   display: flex;
//   align-items: center;
//   justify-content: flex-end;
//   padding: 0 16px;
//   border-top: 1px solid $color-border-l1;
// }
</style>
<style lang="scss">
.el-form-item__label {
  display: block;
  width: 110px;
  padding: 4px 0 0 10px;
  line-height: 24px;
  margin: 0;
  flex-shrink: 0;
  text-align: start;
}
.upload-img {
  margin-bottom: 12px;
  .el-upload-list__item label {
    padding: 0;
  }
  .el-upload--picture-card {
    width: 96px;
    height: 96px;
    line-height: 96px;
    &:hover {
      border-color: $color-primary;
    }
  }
  .el-upload-list__item {
    width: 96px;
    height: 96px;
  }
}
.el-checkbox {
  margin-bottom: 15px;
}

.form-item label {
  padding: 4px 0 0 0;
}

.table-footer {
  padding: 0;
}

.hide_box .el-upload--picture-card {
  display: none;
}
</style>
