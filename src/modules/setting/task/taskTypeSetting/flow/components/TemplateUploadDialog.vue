<template>
  <base-modal
    width="448px"
    :title="`自定义${typeName}模板`"
    @cancel="close"
    :show.sync="isShow"
    :mask-closeable="false">
    <div class="template-upload-modal">
      <p class="template-upload-help-info">
        使用前，请先阅读
        <a target="_blank" href="https://www.yuque.com/shb/help/custom_report">使用说明</a>
      </p>
      <div class="template-upload-content">
        <el-steps direction="vertical">
          <el-step status="process">
            <el-row type="flex" justify="space-between" slot="description">
              <p>下载此工单类型的标识对应表</p>
              <div>
                <a :href="templateUrl">下载</a>
              </div>
            </el-row>
          </el-step>
          <el-step status="process">
            <template slot="description">
              <p>上传{{typeName}}模板</p>
              <el-upload
                ref="upload"
                class="upload-template"
                accept=".xlsx,.xls"
                action=""
                :file-list="fileList"
                :on-remove="removeFile"
                :before-upload="beforeUpload">
                <el-button size="small" type="primary" :disabled="pending">点击上传</el-button>
                <div slot="tip" class="template-upload-tip">*仅支持[xlsx]格式的文件</div>
              </el-upload>
            </template>
          </el-step>
        </el-steps>
      </div>
    </div>
        
    <template slot="footer">
      <el-button @click="close">取消</el-button>
      <el-button type="primary" :disabled="pending" :loading="pending" @click="submit">确定</el-button>
    </template>
  </base-modal>
</template>

<script>
// api
import * as TaskApi from '@src/api/TaskApi.ts';
// util
import Uploader from '@src/util/uploader';
import Platform from '@src/platform';

export default {
  name: 'template-upload-dialog',
  inject: ['taskFlowData'],
  props: {
    visiable: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: ''
    },
    taskTypeId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      pending: false,
      isShow: false,

      templates: [],
      fileResult: {},
    }
  },
  computed: {
    typeName() {
      return this.type === 'reportSetting' ? '服务报告' : '打印';
    },
    templateUrl() {
      return `/setting/taskType/getTemplateDic?typeId=${this.taskTypeId}`;
    },
    fileList() {
      return this.templates.map(item => {
        return {
          name: item.filename || item.name || item.fileName,
          url: item.url
        }
      })
    }
  },
  watch: {
    visiable(val) {
      this.isShow = val;
      this.templates = this.taskFlowData.taskTypeConfig[this.type].templates || [];
    }
  }, 
  methods: {
    close() {
      this.$emit('update:visiable', false);
    },
    removeFile() {
      this.fileResult = {};
      this.templates = []
    },
    /**
         * 文件上传
         */
    beforeUpload(file) {
      const isLt1M = file.size / 1024 / 1024 < 1;

      if (!isLt1M) {
        this.$message.error('不支持大于1M的模板');
        return false;
      }

      Uploader.upload(file, '/files/upload').then((result) => {
        if (result.status != 0) {
          this.$message({
            message: `${result.message}`,
            duration: 1500,
            type: 'error',
          });

          return false;
        }

        this.fileResult = result.data;
        this.templates = [result.data];
      }).catch(err => {
        console.error(err);
      })
            

      return false;
    },
    /**
         * 保存模板
         */
    async submit(){
      let params = {
        typeId: this.taskTypeId,
        templates: this.templates.map(item => {
          return {
            id: item.id,
            filename: item.filename || item.fileName,
            url: item.url || item.ossUrl,
            fileSize: item.fileSize || item.fileSizeStr
          }
        })
      };
            
      let fetchFn = this.type === 'reportSetting' ? TaskApi.saveReportTemplate : TaskApi.savePrintTemplate;
      try {
        this.pending = true;
        let res = await fetchFn(params);
        if(res.status === 0) {
          this.taskFlowData.taskTypeConfig[this.type].templates = this.templates;
          this.$notify.success('设置成功');
          this.close();
        }
      } catch (err) {
        console.error(err);
      } finally{
        this.pending = false;
      }
            
    }
  }
}
</script>
<style lang="scss" scoped>
.template-upload-modal{
    min-height: 240px;
    padding:  20px 60px 20px 20px;
    font-size: 14px;
    .template-upload-help-info{
        color: #666666;
    }

    .template-upload-content{
        color: #000000;
        p, a{
            margin-bottom: 12px;
            font-size: 14px;
        }
        .template-upload-tip{
            margin-top: 8px;
            font-size: 12px;
            color: #999999;
        }
        .upload-template{
            width: 334px;
        }
    }

    a{
        color: $color-primary;
        &:hover{
            text-decoration: underline;
        }
    }
}

/** element-ui style */
/deep/.el-step__description{
    padding-right: 0;
}

</style>
