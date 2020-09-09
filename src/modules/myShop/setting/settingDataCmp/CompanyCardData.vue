<template>
  <div class="setting-data-cmp-box">
    <div class="form-info">
      <div class="flex-x al-start mar-b-18">
        <div class="mar-r-20">logo</div>
        <el-upload
          class="avatar-uploader"
          action="https://jsonplaceholder.typicode.com/posts/"
          :show-file-list="false"
          :on-success="handleAvatarSuccess"
          :before-upload="beforeAvatarUpload"
        >
          <div
            v-if="dataInfo.imageUrl"
            @mouseover="changeImgCover(true)"
            @mouseleave="changeImgCover(false)"
          >
            <img :src="dataInfo.imageUrl" class="avatar" />
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
          <span>最多10个汉字</span>
        </div>
        <el-form-item prop="name">
          <el-input v-model="dataInfo.name"></el-input>
        </el-form-item>
        <div class="form-label">联系电话</div>
        <el-form-item prop="phone">
          <el-input v-model="dataInfo.phone"></el-input>
        </el-form-item>
        <div class="form-label">企业地址</div>
        <el-form-item>
          <el-input type="textarea" v-model="dataInfo.address"></el-input>
        </el-form-item>
      </el-form>

      <div class="flex-x">
        <el-button>重置</el-button>
        <el-button type="primary" @click="saveData">发布</el-button>
      </div>
    </div>
  </div>
</template>
<script>
import _ from "lodash";
import userImg from "@src/assets/img/myShop/logo.png";
let reg_phone = /^(((0\d{2,3}-){0,1}\d{7,8})|(1[345678]\d{9}))$/;

export default {
  name: "company-card-data",
  props: ["infoData"],
  inject: ["cancelInfoData"],
  data() {
    let validatePhone = (rule, value, callback) => {
      if (value !== "" && !reg_phone.test(value)) {
        callback(new Error("请输入正确的电话"));
      }
      callback();
    };
    return {
      userImg,
      dataInfo: {
        name: "",
        phone: "",
        address: "",
        imageUrl: userImg,
      },
      dataInforReturn: {
        name: "",
        phone: "",
        address: "",
        imageUrl: userImg,
      },
      rules: {
        name: [{ max: 10, message: "最多10个字符", trigger: "blur" }],
        phone: [
          {
            validator: validatePhone,
            message: "请输入正确的电话",
            trigger: "blur",
          },
        ],
      },

      imgCover: false,
    };
  },
  watch: {
    // dataInforReturn: {
    //   deep: true,
    //   handler(value) {
    //   },
    // },
  },
  activated() {
    this.dataInfo = _.cloneDeep(this.infoData);
    this.dataInforReturn = _.cloneDeep(this.infoData);
  },
  methods: {
    handleAvatarSuccess(res, file) {
      this.dataInfo.imageUrl = URL.createObjectURL(file.raw);
    },
    beforeAvatarUpload(file) {
      const isJPG = file.type === "image/jpeg" || file.type === "image/png";
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPG) {
        this.$message.error("上传头像图片只能是 JPG/PNG 格式!");
      }
      if (!isLt2M) {
        this.$message.error("上传头像图片大小不能超过 2MB!");
      }
      return isJPG && isLt2M;
    },
    changeImgCover(e) {
      this.imgCover = e;
    },
    saveData() {
      this.dataInforReturn = _.cloneDeep(this.dataInfo);
      this.$emit("changeInfoData", this.dataInforReturn);
      this.cancelInfoData();
    },
    clear() {
      this.dataInfo.imageUrl = "";
    },
  },
};
</script>
<style lang="scss" scoped>
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