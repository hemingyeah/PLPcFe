<template>
  <div class="setting-data-cmp-box">
    <div class="form-info">
      <div class="flex-x al-start mar-b-18">
        <div class="mar-r-20">logo</div>
        <el-upload
          class="avatar-uploader"
          ref="upload"
          action="string"
          :show-file-list="false"
          :before-upload="onBeforeUploadImage"
          :http-request="UploadImage"
          :on-change="fileChange"
        >
          <div
            v-if="dataInfo.logoUrl"
            @mouseover="changeImgCover(true)"
            @mouseleave="changeImgCover(false)"
          >
            <img :src="dataInfo.logoUrl" class="avatar" />
            <div class="img-cover" v-show="imgCover" @click.stop>
              <i @click.stop="clear()" class="iconfont icon-shanchu"></i>
            </div>
          </div>
          <i v-else class="el-icon-plus avatar-uploader-icon"></i>
        </el-upload>
      </div>
      <el-form ref="ruleForm" :model="dataInfo" :rules="rules">
        <div class="form-label">
          门户名称
          <span>最多50个字符</span>
        </div>
        <el-form-item prop="name">
          <el-input v-model="dataInfo.name" :autofocus="false" placeholder="请输入" maxlength="50"></el-input>
        </el-form-item>
        <div class="form-label">联系电话</div>
        <el-form-item prop="mobile">
          <el-input v-model="dataInfo.mobile" :autofocus="false" placeholder="请输入"></el-input>
        </el-form-item>
        <div class="form-label">企业地址</div>
        <el-form-item>
          <el-input
            type="textarea"
            rows="4"
            v-model="dataInfo.address"
            placeholder="请输入"
            maxlength="1000"
          ></el-input>
        </el-form-item>
      </el-form>

      <div class="flex-x">
        <el-button type="button" @click="resetData">重置</el-button>
        <el-button type="primary" @click="saveData">保存</el-button>
      </div>
    </div>
  </div>
</template>
<script>
import _ from "lodash";
import Uploader from "../../../../../packages/BaseUpload/uploader";
import userImg from "@src/assets/img/myShop/logo.png";
let reg_phone = /^(((0\d{2,3}-){0,1}\d{7,8})|(1[345678]\d{9}))$/;

export default {
  name: "company-card-data",
  props: ["infoData"],
  inject: ["cancelInfoData", "changeFullscreenLoading"],
  data() {
    let validatePhone = (rule, value, callback) => {
      if (value !== "" && !reg_phone.test(value)) {
        callback(new Error("请输入正确的电话"));
      }
      callback();
    };
    return {
      userImg,
      fileArr: [],
      dataInfo: {
        name: "",
        mobile: "",
        address: "",
        logoUrl: userImg,
      },
      dataInforReturn: {
        name: "",
        mobile: "",
        address: "",
        logoUrl: userImg,
      },
      rules: {
        name: [
          { required: true, message: "请输入门户名称", trigger: "blur" },
          { max: 50, message: "最多50个字符", trigger: "change" },
        ],
        mobile: [
          { required: true, message: "请输入电话", trigger: "blur" },
          {
            validator: validatePhone,
            message: "请输入正确的电话",
            trigger: "change",
          },
        ],
      },

      imgCover: false,
    };
  },
  activated() {
    this.$set(this, "dataInfo", _.cloneDeep(this.infoData));
    this.$set(this, "dataInforReturn", _.cloneDeep(this.infoData));
    this.$nextTick(() => {
      this.$refs["ruleForm"].clearValidate();
    });
  },
  methods: {
    onBeforeUploadImage(file) {
      console.log(file.raw, "file");
      const isJPG = file.type === "image/jpeg" || file.type === "image/png";
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPG) {
        this.$message.error("上传头像图片只能是 JPG/PNG 格式!");
      }
      if (!isLt2M) {
        this.$message.error("上传头像图片大小不能超过 2MB!");
      }
      this.fileArr.push(file.raw);
      return isJPG && isLt2M;
    },
    UploadImage(param) {
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
            id: file.id,
            filename: file.fileName,
            //如果后端返回url,必须使用。如果后端不返回，需要拼接
            url: file.ossUrl || file.url || `/files/get?fileId=${file.id}`,
            fileSize: file.fileSizeStr,
          };
          this.dataInfo.logoUrl = item.url;
          console.log(item, "uploadImg");
        })
        .catch((err) => {
          console.warn(err);
        })
        .finally(() => {});
    },
    fileChange(file) {
      return;
      this.$refs.upload.clearFiles(); //清除文件对象
      this.logo = file.raw; // 取出上传文件的对象，在其它地方也可以使用
      this.fileList = [{ name: file.name, url: file.url }]; // 重新手动赋值filstList， 免得自定义上传成功了, 而fileList并没有动态改变， 这样每次都是上传一个对象
    },
    changeImgCover(e) {
      this.imgCover = e;
    },
    saveData() {
      this.dataInforReturn = _.cloneDeep(this.dataInfo);
      this.$emit("changeInfoData", {
        item: this.dataInforReturn,
      });
      this.cancelInfoData();
      // this.changeFullscreenLoading(true);
      // setTimeout(() => {
      //   this.changeFullscreenLoading(false);
      // }, 1000);
    },
    resetData() {
      this.$refs["ruleForm"].clearValidate();
      this.dataInfo = _.cloneDeep(this.dataInforReturn);
    },
    clear() {
      this.dataInfo.logoUrl = "";
      this.imgCover = false;
    },
  },
};
</script>
<style lang="scss">
.setting-data-cmp-box {
  width: 100%;
  .form-info {
    padding: 12px;
  }
  .form-label {
    margin-bottom: 8px;
    span {
      font-size: 12px;
      color: #999;
      margin-left: 8px;
    }
  }
  .img-cover {
    position: absolute;
    z-index: 99;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    top: 0;
    left: 0;
    background: rgba($color: #000000, $alpha: 0.5);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    .iconfont {
      font-size: 30px;
    }
  }
}
</style>
<style lang="scss">
// upload start
.el-upload--picture-card {
  width: 96px;
  height: 96px;
  line-height: 106px;
  border-radius: 50%;
}

.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  width: 96px;
  height: 96px;
  line-height: 96px;
  border-radius: 50%;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: $color-primary;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 96px;
  height: 96px;
  line-height: 96px;
  border-radius: 50%;
  text-align: center;
}
.avatar {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  display: block;
}
// upload end
</style>