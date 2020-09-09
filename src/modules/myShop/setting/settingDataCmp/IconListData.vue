<template>
  <div class="setting-data-cmp-box">
    <div class="font-16 font-w-500 mar-b-20">快捷入口</div>
    <div>选择图标</div>
    <div class="flex-x now-icon">
      <img class="now-icon-img" :src="imgObj[dataInfo.icon]" />
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
          :class="['img-list-item', item == dataInfo.icon?'img-list-item-check':'']"
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
    <el-form ref="ruleForm" :model="dataInfo" :rules="rules">
      <div class="form-label">
        入口名称
        <span>最多4个字符</span>
      </div>
      <el-form-item prop="name">
        <el-input v-model="dataInfo.name" placeholder="请输入"></el-input>
      </el-form-item>
      <div class="form-label">关联事件模板</div>
      <el-form-item>
        <el-select style="width:100%" v-model="dataInfo.type" placeholder="请选择">
          <el-option label="区域一" value="shanghai"></el-option>
          <el-option label="区域二" value="beijing"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <div class="flex-x">
      <el-button @click="resetData">重置</el-button>
      <el-button type="primary" @click="saveData">发布</el-button>
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
  props: ["infoData", "cmpId", "iconSetId"],
  components: {
    draggable,
  },
  data() {
    return {
      dataInfo: {
        name: "",
        type: "",
        icon: "",
      },
      dataInforReturn: {
        name: "",
        type: "",
        icon: "",
      },
      rules: {
        name: [{ max: 4, message: "最多4个字符", trigger: "blur" }],
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
      let item = this.findIconItem(value).item;
      this.$set(this, "dataInfo", item);
      this.dataInforReturn = item;
      let icon_ = this.findNowIcon(item.icon);
      this.imgListIndex = icon_.index;
    },
  },
  activated() {
    this.dataInfo = _.cloneDeep(this.findIconItem(this.iconSetId).item);
    this.dataInforReturn = _.cloneDeep(this.findIconItem(this.iconSetId).item);
  },
  methods: {
    saveData() {
      this.$refs["ruleForm"].validate((valid) => {
        if (valid) {
          alert("submit!");

          this.dataInforReturn = _.cloneDeep(this.dataInfo);
          let indexs = this.findIconItem(this.iconSetId).index;
          let cmpId = _.cloneDeep(this.cmpId);
          this.$emit("saveIconItem", {
            id: cmpId,
            ids: this.iconSetId,
            indexs,
            item: this.dataInforReturn,
          });
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    async desertWx() {
      try {
        const res_ = await this.$platform.confirm(
          `您将要解除${this.wxInfo.nickName}公众号的绑定，请确认。`
        );
        if (!res_) return;
        cancleAuthorizer()
          .then((res) => {
            this.pageLoading(false);
            this.getWxInfo();
            Message.success({
              message: "成功解除绑定",
              type: "success",
            });
          })
          .catch((err) => {
            this.$platform.alert(err);
          });

        // this.$eventBus.$emit("customer_info_record.update_record_list");
      } catch (e) {
        console.error(e, "err");
      }
    },
    async deleteData() {
      const res_ = await this.$platform.confirm("确定删除当前选择项吗？");
      if (!res_) return;
      this.dataInforReturn = _.cloneDeep(this.dataInfo);
      let indexs = this.findIconItem(this.iconSetId).index;
      let cmpId = _.cloneDeep(this.cmpId);
      this.$emit("deleteIconItem", {
        id: cmpId,
        ids: this.iconSetId,
        indexs,
      });
    },
    resetData() {
      this.dataInfo = _.cloneDeep(this.dataInforReturn);
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
      this.dataInfo.icon = e;
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
          if (e == j_) {
            res_ = { index: i, indexs: j };
            break;
          }
        }
      }
      return res_;
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