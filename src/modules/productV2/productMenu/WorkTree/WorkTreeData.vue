<template>
  <div class="work-tree-data-box">
    <div class="normal-title-1">
      <div class="flex-1">编辑目录详细信息</div>
      <el-button>克隆其他产品目录</el-button>
    </div>
    <el-form ref="form" :model="form" label-width="100px">
      <div class="normal-title-2">
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

      <div class="normal-title-2-bord-bottom">
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
    </el-form>
    <div class="normal-title-2-bord-bottom">
      <div class="flex-1">关联备件</div>
      <el-button @click="showDialog('linkPart')">关联备件</el-button>
    </div>
    <el-table :data="tableData" stripe style="width: 100%">
      <el-table-column prop="date" label="日期" width="180"> </el-table-column>
      <el-table-column prop="name" label="姓名" width="180"> </el-table-column>
      <el-table-column prop="address" label="地址"> </el-table-column>
    </el-table>
    <div class="normal-title-2-bord-bottom">
      <div class="flex-1">关联知识库</div>
      <el-button @click="showDialog('linkWiki')">关联知识库</el-button>
    </div>
    <el-table :data="tableData" stripe style="width: 100%">
      <el-table-column prop="date" label="日期" width="180"> </el-table-column>
      <el-table-column prop="name" label="姓名" width="180"> </el-table-column>
      <el-table-column prop="address" label="地址"> </el-table-column>
    </el-table>
  </div>
</template>
<script>
import Uploader from 'packages/BaseUpload/uploader';
export default {
  name: 'work-tree-data',
  data() {
    return {
      form: {
        name: '',
        resource: '',
        desc: '',
      },
      fileList: [
        {
          fileSize: '2.66MB',
          name: 'guide-2-薄德忠-2020-11-14.mp4',
          id: '24c805ab-92a3-4a1e-a11c-981ff84c7624',
          url:
            'https://she-dev.oss-cn-hangzhou.aliyuncs.com/acs/newfiles/7416b42a-25cc-11e7',
        },
      ],
      tableData: [
        {
          date: '2016-05-02',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1518 弄',
        },
        {
          date: '2016-05-04',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1517 弄',
        },
        {
          date: '2016-05-01',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1519 弄',
        },
        {
          date: '2016-05-03',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1516 弄',
        },
      ],
    };
  },
  methods: {
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
          this.fileList.push(item);
          // console.log(item, "uploadImg");
        })
        .catch((err) => {
          console.warn(err);
        })
        .finally(() => {});
    },
    showDialog(e) {
      if (this.$parent.changeDialog) {
        this.$parent.changeDialog(e);
      } else if (this.$parent.$parent.changeDialog) {
        this.$parent.$parent.changeDialog(e);
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
  overflow-y: scroll;
  border-left: 1px solid $color-border-l1;
  background: #fff;
  min-width: 630px;
  .normal-title-1 {
    @include title-class();
    font-size: 16px;
    border-bottom: 1px solid $color-border-l1;
  }
  .normal-title-2 {
    @include title-class();
  }
  .normal-title-2-bord-bottom {
    @include title-class();
    border-bottom: 1px solid $color-border-l1;
    margin-bottom: 24px;
  }
}
</style>
<style lang="scss">
.el-form-item__label {
  text-align: start;
  padding: 0;
  padding-left: 20px;
}
</style>
