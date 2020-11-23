<template>
  <div class="work-tree-data-box">
    <div class="flex-1 scroll-data">
      <template v-if="!propData.canEditConData">
        <no-data-view
          :notice-msg="'非空目录不可以建目录详细信息'"
        ></no-data-view>
      </template>
      <template v-else-if="!propData.conData">
        <no-data-view :notice-msg="'空目录下可以建目录详细信息'">
        </no-data-view>
        <div class="text-center mar-t-24">
          <el-button @click="setMenuInfo">新建目录信息</el-button>
        </div>
      </template>
      <template v-else>
        <div class="normal-title-1">
          <div class="flex-1">编辑目录详细信息</div>
          <el-button @click="showDialog('cloneMenu')"
          >克隆其他产品目录</el-button
          >
        </div>

        <form-builder
          ref="form"
          :fields="fields"
          :value="productMenuValue"
          mode="product_menu"
          @update="update"
        >
          <div class="normal-title-2">
            <div>选择目录显示字段</div>
            <el-tooltip
              class="item"
              effect="dark"
              content="目录字段在系统管理中配置"
              placement="bottom"
            >
              <i class="iconfont icon-help color-999 mar-l-8 cur-point"></i>
            </el-tooltip>
          </div>

          <div class="pad-l-10 mar-b-30">
            <div class="font-12 color-999 mar-b-10">
              *被隐藏的字段，将不会出现在这个目录信息中（系统字段不可隐藏）
            </div>
            <el-checkbox-group v-model="fieldIds">
              <template v-for="item in fields">
                <el-checkbox
                  v-if="item.isSystem != 1"
                  :label="item.id"
                  :key="item.id"
                >{{ item.displayName }}</el-checkbox
                >
              </template>
            </el-checkbox-group>
          </div>
          <template slot="product_menu_part">
            <div class="normal-title-2">
              <div class="flex-1">关联备件</div>
              <el-button @click="showDialog('linkPart')">关联备件</el-button>
            </div>

            <mini-table
              :id="propData.id"
              data-type="part"
              page-type="edit"
              v-if="flashPartType"
            />
          </template>
          <template slot="product_menu_wiki">
            <div class="normal-title-2">
              <div class="flex-1">关联知识库</div>
              <el-button @click="showDialog('linkWiki')">关联知识库</el-button>
            </div>
            <mini-table
              :id="propData.id"
              data-type="wiki"
              page-type="edit"
              v-if="flashProductType"
            />
          </template>

          <template slot="productPic" slot-scope="{ field }">
            <form-item :label="field.displayName">
              <el-upload
                action="string"
                list-type="picture-card"
                :on-preview="handlePictureCardPreview"
                :before-upload="onBeforeUploadImage"
                :http-request="UploadImage"
                :file-list="productMenuValue.productPic"
              >
                <i class="el-icon-plus"></i>
              </el-upload>
            </form-item>
          </template>
          <!-- <el-form ref="form" :model="form" label-width="110px">
        <div class="normal-title-2-inside">
          <div>选择目录显示字段</div>
        </div>

        <el-form-item label-width="20px">
          <el-checkbox-group v-model="form.type">
            <el-checkbox label="美食/餐厅线上活动" name="type"></el-checkbox>
            <el-checkbox label="地推活动" name="type"></el-checkbox>
            <el-checkbox label="线下主题活动" name="type"></el-checkbox>
            <el-checkbox label="单纯品牌曝光" name="type"></el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <div class="normal-title-2-inside">
          <div>添加目录信息</div>
        </div>

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
      </template>
    </div>
    <div class="bottom-btns" v-if="propData.conData == 1">
      <el-button type="danger" @click="deletInfo">删除</el-button>
      <el-button class="mar-l-8" type="primary" @click="submit">保存</el-button>
    </div>
  </div>
</template>
<script>
import _ from 'lodash';
import MiniTable from './compoment/MiniTable';
import Uploader from 'packages/BaseUpload/uploader';
import NoDataView from '@src/component/common/NoDataViewNew';
import fields from './fiedls';

import {
  getProductMenuField,
  getPageInfo,
  setPageInfo,
  clearCatalogData,
} from '@src/api/ProductV2Api';

const urlKey = {
  catalogName: 'catalog_name',
  productDesc: 'product_desc',
  productVideo: 'product_video',
  productPic: 'product_pic',
  productExplain: 'product_explain',
};
export default {
  name: 'work-tree-data',
  props: {
    propData: {
      type: Object,
      default: () => {
        {
        }
      },
    },
  },
  inject: ['rootDataChange', 'changeTreeDetail'],
  data() {
    return {
      form: {
        name: '',
        resource: '',
        desc: '',
      },
      fileList: [],
      fields: [],
      productMenuValue: this.initProductMenuValue(),
      flashPartType: false,
      flashProductType: false,
      fieldIds: [],
    };
  },
  components: {
    MiniTable,
    NoDataView,
  },
  watch: {
    propData(newVal, oldVal) {
      this.$set(
        this.productMenuValue,
        'catalog_name',
        _.cloneDeep(newVal.name)
      );
      if (newVal.canEditConData && newVal.conData) {
        this.reflashPage(newVal.id);
      }
    },
  },
  mounted() {
    getProductMenuField()
      .then((res) => {
        const { code, result, message } = res;
        if (code == 0) {
          const fields = result || [];
          const sortedFields = fields.sort((a, b) => a.orderId - b.orderId);
          this.fields = sortedFields;
        } else {
          this.$notify.error({
            title: '网络错误',
            message,
            duration: 2000,
          });
        }
      })
      .catch((error) => {});
  },
  methods: {
    initProductMenuValue() {
      return {
        catalog_name: this.propData.name,
        product_desc: '',
        product_video: [],
        product_pic: [],
        product_explain: [],
      };
    },
    handlePictureCardPreview(file) {
      this.$previewImg(file.url);
    },
    handlePreview(file) {
      console.log(file, 'file');
      if (!file.url) return;
      this.$previewVideo(file.url);
    },
    onBeforeUploadImage(file) {
      // console.log(file.raw, "file");
      const isJPG = file.type === 'image/jpeg' || file.type === 'image/png';
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG/PNG 格式!');
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!');
      }
      // this.fileList.push(file);
      return isJPG && isLt2M;
    },
    onBeforeUploadVideo(file) {
      console.log(file, 'file');
      const isMP4 = file.type === 'video/mp4';
      const isLt10M = file.size / 1024 / 1024 < 10;

      if (!isMP4) {
        this.$message.error('上传视频只能是 MP4 格式!');
      }
      if (!isLt10M) {
        this.$message.error('上传视频大小不能超过 10MB!');
      }
      // this.fileList.push(file);
      return isMP4 && isLt10M;
    },
    UploadImage(param) {
      console.log(param, 'param');
      Uploader.upload(param.file, '/files/upload')
        .then((result) => {
          if (result.status != 0) {
            this.$message({
              message: `${result.message}`,
              duration: 1500,
              type: 'error',
            });
            return;
          }

          let file = result.data;
          let item = {
            id: file.id,
            name: file.fileName,
            // 如果后端返回url,必须使用。如果后端不返回，需要拼接
            url: file.ossUrl || file.url || `/files/get?fileId=${file.id}`,
            fileSize: file.fileSizeStr,
          };
          param.file['ossUrl'] = item.url;
          this.$set(this, 'productMenuValue.product_pic', [
            ...this.productMenuValue.product_pic,
            item,
          ]);
          // console.log(item, "uploadImg");
        })
        .catch((err) => {
          console.warn(err);
        })
        .finally(() => {});
    },
    showDialog(e) {
      console.log(this.productMenuValue, 'productMenuValue');
      if (this.$parent.changeDialog) {
        this.$parent.changeDialog(e);
      } else if (this.$parent.$parent.changeDialog) {
        this.$parent.$parent.changeDialog(e);
      }
    },
    update({ field, newValue, oldValue }) {
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
      this.$emit('input', value);
    },
    setMenuInfo() {
      this.rootDataChange('nowEditMenu', { ...this.propData, conData: 1 });
      this.changeTreeDetail('conData', 1);
    },
    resetForm() {
      // 清空校验结果
      setTimeout(() => {
        try {
          this.$refs.form.$children.map((child) => {
            if (child.$el.className == 'form-item err') {
              child.$el.dispatchEvent(
                new CustomEvent('form.clear.validate', { bubbles: false })
              );
            }
          });
        } catch (error) {}
      }, 0);
    },
    async submit() {
      const validateRes = await this.$refs.form.validate();
      if (!validateRes) return;
      this.rootDataChange('fullscreenLoading', true);
      let url_data = this.transferData();
      setPageInfo(url_data)
        .then((res) => {
          if (res.code != 0) {
            this.$notify.error({
              title: '网络错误',
              message: res.message,
              duration: 2000,
            });
          } else {
            this.$message({
              message: '保存成功',
              type: 'success',
            });
            window.parent.flashSomePage({
              type: 'productV2_catalog_list',
            });
          }
        })
        .finally(() => {
          this.rootDataChange('fullscreenLoading', false);
        });
    },
    transferData(data) {
      // 仅用于向接口传参转换数据
      let obj = {};
      let tran_data = _.cloneDeep(this.productMenuValue);
      for (let key in urlKey) {
        obj[key] = tran_data[key];
        delete tran_data[key];
      }
      obj['attribute'] = tran_data;
      obj['id'] = this.propData.id;
      obj['fieldIds'] = this.fieldIds;
      return obj;
    },
    reflashPage(id) {
      this.resetForm();
      getPageInfo({
        id,
      }).then((res) => {
        if (res.code == 0) {
          if (res.result.fieldIds) {
            this.fieldIds = res.result.fieldIds;
          }
          res.result.productVideo = res.result.productVideo || [];
          res.result.productPic = res.result.productPic || [];
          res.result.productExplain = res.result.productExplain || [];
          this.$set(this, 'productMenuValue', res.result);
        } else {
          this.$notify.error({
            title: '网络错误',
            message: res.message,
            duration: 2000,
          });
        }
      });
      this.$set(this, 'flashPartType', false);
      this.$set(this, 'flashProductType', false);
      this.$nextTick(() => {
        this.$set(this, 'flashPartType', true);
        this.$set(this, 'flashProductType', true);
      });
    },
    deletInfo() {
      this.$confirm('此操作将删除该目录所编辑的内容?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          clearCatalogData({
            catalogId: this.propData.id,
          }).then((res) => {
            if (res.code == 0) {
              this.rootDataChange('nowEditMenu', {
                ...this.propData,
                conData: 0,
              });
              this.changeTreeDetail('conData', 0);
              this.$message({
                message: '删除成功',
                type: 'success',
              });
              window.parent.flashSomePage({
                type: 'productV2_catalog_list',
              });
            } else {
              this.$notify.error({
                title: '网络错误',
                message: res.message,
                duration: 2000,
              });
            }
          });
        })
        .catch(() => {});
    },
    reflashTable(type) {
      if (type == 'part') {
        this.$set(this, 'flashPartType', false);
        this.$nextTick(() => {
          this.$set(this, 'flashPartType', true);
        });
      } else {
        this.$set(this, 'flashProductType', false);
        this.$nextTick(() => {
          this.$set(this, 'flashProductType', true);
        });
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
  border-left: 1px solid $color-border-l1;
  background: #fff;
  min-width: 630px;
  .scroll-data {
    overflow-y: scroll;
  }
  .normal-title-1 {
    @include title-class();
    font-size: 16px;
    border-bottom: 1px solid $color-border-l1;
  }
  .normal-title-2 {
    @include title-class();
    padding: 0 10px;
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
.bottom-btns {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 16px;
  border-top: 1px solid $color-border-l1;
}
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
.el-checkbox {
  margin-bottom: 15px;
}
</style>
