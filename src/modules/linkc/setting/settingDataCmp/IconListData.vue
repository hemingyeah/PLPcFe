<template>
  <div class="setting-data-cmp-box">
    <div class="font-16 font-w-500 mar-b-20">快捷入口</div>
    <div>选择图标</div>
    <div class="flex-x now-icon">
      <img class="now-icon-img" :src="imgObj[`img_${dataInfo.iconType}`]" />
    </div>
    <div class="flex-x mar-b-35">
      <div
        :class="['img-page', 'mar-r-12', imgListIndex>0?'img-page-can-click':'']"
        @click="changeImgPage(-1)"
      >
        <i class="iconfont icon-left-circle-fill"></i>
      </div>
      <div class="flex-x flex-1">
        <div
          :class="['img-list-item', item ==`img_${dataInfo.iconType}` ? 'img-list-item-check' : '']"
          v-for="(item, index) in imgList[imgListIndex]"
          :key="index"
          @click="choseNowIcon(item)"
        >
          <img class="img-list-item-img" :src="imgObj[item]" />
        </div>
      </div>
      <div
        :class="['img-page','mar-l-12', imgListIndex<imgList.length-1 && imgList.length>1?'img-page-can-click':'']"
        @click="changeImgPage(1)"
      >
        <i class="iconfont icon-right-circle-fill"></i>
      </div>
    </div>
    <el-form ref="ruleForm" :model="dataInfo" :rules="rules" status-icon>
      <div class="form-label">
        入口名称
        <span>最多4个字符</span>
      </div>
      <el-form-item prop="name">
        <el-input v-model="dataInfo.name" placeholder="请输入"></el-input>
      </el-form-item>
      <div class="form-label">关联事件模板</div>
      <el-form-item prop="eventTempId">
        <el-select style="width:100%" v-model="dataInfo.eventTempId" placeholder="请选择">
          <el-option
            :label="item.name"
            v-for="(item, index) in eventList"
            :key="index"
            :value="item.id"
          ></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <div class="flex-x">
      <el-button @click="resetData">重置</el-button>
      <el-button type="primary" @click="saveData">保存</el-button>
      <el-button type="danger" @click="deleteData">删除</el-button>
    </div>
  </div>
</template>
<script>
import draggable from "vuedraggable";
import _ from "lodash";

import img_1 from "@src/assets/img/myShop/icon1.png";
import img_2 from "@src/assets/img/myShop/icon2.png";
import img_3 from "@src/assets/img/myShop/icon3.png";
import img_4 from "@src/assets/img/myShop/icon4.png";
import img_5 from "@src/assets/img/myShop/icon5.png";
import img_6 from "@src/assets/img/myShop/icon6.png";
import img_7 from "@src/assets/img/myShop/icon7.png";
import img_8 from "@src/assets/img/myShop/icon8.png";
import img_9 from "@src/assets/img/myShop/icon9.png";
import img_10 from "@src/assets/img/myShop/icon10.png";
import img_11 from "@src/assets/img/myShop/icon11.png";
import img_12 from "@src/assets/img/myShop/icon12.png";
import img_13 from "@src/assets/img/myShop/icon13.png";
import img_14 from "@src/assets/img/myShop/icon14.png";
import img_15 from "@src/assets/img/myShop/icon15.png";
import img_16 from "@src/assets/img/myShop/icon16.png";
export default {
  name: "icon-list-data",
  props: ["infoData", "cmpId", "iconSetId", "eventList"],
  components: {
    draggable,
  },
  inject: ["cancelInfoData", "changeFullscreenLoading"],
  data() {
    return {
      dataInfo: {
        name: "",
        type: "",
        iconType: "",
      },
      dataInforReturn: {
        name: "",
        type: "",
        iconType: "",
      },
      rules: {
        name: [
          { required: true, message: "请输入名称", trigger: "blur" },
          { max: 4, message: "最多4个字符", trigger: "blur" },
        ],
        eventTempId: [
          { required: true, message: "请选择模板", trigger: "blur" },
        ],
      },
      imgObj: {
        img_1,
        img_2,
        img_3,
        img_4,
        img_5,
        img_6,
        img_7,
        img_8,
        img_9,
        img_10,
        img_11,
        img_12,
        img_13,
        img_14,
        img_15,
        img_16,
      },
      imgList: [
        ["img_1", "img_2", "img_3", "img_4", "img_5"],
        ["img_6", "img_7", "img_8", "img_9", "img_10"],
        ["img_11", "img_12", "img_13", "img_14", "img_15"],
        ["img_16"],
      ],
      imgListIndex: 0,
    };
  },
  watch: {
    iconSetId(value) {
      this.$refs["ruleForm"].clearValidate();
      this.resetImgList(value);
    },
  },
  activated() {
    this.dataInfo = _.cloneDeep(this.findIconItem(this.iconSetId).item);
    this.dataInforReturn = _.cloneDeep(this.findIconItem(this.iconSetId).item);
    this.$nextTick(() => {
      this.resetImgList(this.iconSetId);
    });
  },
  methods: {
    saveData() {
      this.$refs["ruleForm"].validate((valid) => {
        if (valid) {
          for (var i = 0; i < this.infoData.length; i++) {
            if (
              this.dataInfo.name == this.infoData[i].name &&
              this.iconSetId != this.infoData[i].id
            ) {
              break;
            }
          }
          if (i < this.infoData.length) {
            this.$confirm("已经存在相同名称", "提示", {
              confirmButtonText: "确定",
              type: "warning",
            })
              .then(() => {})
              .catch(() => {});
            return;
          }
          this.saveDataPass();
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    saveDataPass() {
      // this.changeFullscreenLoading(true);
      this.dataInforReturn = _.cloneDeep(this.dataInfo);
      let indexs = this.findIconItem(this.iconSetId).index;
      let cmpId = _.cloneDeep(this.cmpId);
      this.$emit("saveIconItem", {
        id: cmpId,
        ids: this.iconSetId,
        indexs,
        item: _.cloneDeep(this.dataInforReturn),
      });
      this.cancelInfoData();
      // setTimeout(() => {
      //   this.changeFullscreenLoading(false);
      // }, 1000);
    },
    async deleteData() {
      this.$confirm("确定删除当前选择项吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "error",
      }).then(() => {
        this.dataInforReturn = _.cloneDeep(this.dataInfo);
        let indexs = this.findIconItem(this.iconSetId).index;
        let cmpId = _.cloneDeep(this.cmpId);
        this.$emit("deleteIconItem", {
          id: cmpId,
          ids: this.iconSetId,
          indexs,
        });
      });
    },
    resetData() {
      this.$refs["ruleForm"].clearValidate();
      this.$set(this, "dataInfo", _.cloneDeep(this.dataInforReturn));
    },
    findIconItem(id) {
      let res;
      let arr = _.cloneDeep(this.infoData);
      if (id < 0) {
        return false;
      }
      try {
        for (let index = 0; index < arr.length; index++) {
          const item = arr[index];
          if (item.id == id) {
            res = { item, index };
            break;
          }
        }
      } catch (error) {}

      return res;
    },
    choseNowIcon(e) {
      this.dataInfo.iconType = e.replace("img_", "");
    },
    changeImgPage(e) {
      let imgListIndex = _.cloneDeep(this.imgListIndex);
      if (e > 0) {
        this.imgListIndex =
          imgListIndex + e > this.imgList.length - 1
            ? this.imgList.length - 1
            : imgListIndex + e;
      } else {
        this.imgListIndex = imgListIndex + e < 0 ? 0 : imgListIndex + e;
      }
    },
    findNowIcon(e) {
      if (!e) return;
      let res_;
      for (let i = 0; i < this.imgList.length; i++) {
        const i_ = this.imgList[i];
        for (let j = 0; j < i_.length; j++) {
          const j_ = i_[j];
          if (`img_${e}` == j_) {
            res_ = { index: i, indexs: j };
            break;
          }
        }
      }
      return res_;
    },
    resetImgList(value) {
      let item = this.findIconItem(value).item;
      this.$set(this, "dataInfo", item);
      this.dataInforReturn = _.cloneDeep(item);
      let icon_ = this.findNowIcon(item.iconType);
      this.imgListIndex = icon_.index;
    },
  },
};
</script>
<style lang="scss" scoped>
.setting-data-cmp-box {
  width: 100%;
  padding: 16px 12px;
  background: #fff;
  .form-label {
    margin-bottom: 8px;
    span {
      font-size: 12px;
      color: #999;
      margin-left: 8px;
    }
  }
  .now-icon {
    justify-content: center;
    margin: 12px 0 18px 0;
    .now-icon-img {
      width: 96px;
      height: 72px;
      border-radius: 38px;
      overflow: hidden;
    }
  }
  .img-page {
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    color: #b9bfbd;
    cursor: pointer;
    .iconfont {
      font-size: 20px;
    }
  }
  .img-page-can-click {
    color: $color-primary;
  }
  .img-list-item {
    width: 20%;
    box-sizing: border-box;
    height: 40px;
    display: flex;
    justify-content: center;
    box-sizing: border-box;
    align-items: center;
    .img-list-item-img {
      width: 31px;
      height: 23px;
    }
  }
  .img-list-item-check {
    border: 1px solid $color-primary;
  }
}
</style>