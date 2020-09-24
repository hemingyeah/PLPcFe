<template>
  <div class="setting-show-cmp-box">
    <draggable class="icon-list-box flex-x flex-w al-start" v-model="dataInfo">
      <div
        :class="['can-move', 'icon-list-item', nowId==item.id?'icon-list-item-check':'']"
        v-for="(item, index) in dataInfo"
        :key="index"
        draggable="true"
        @click="changeThis(item)"
      >
        <img :src="imgObj[`img_${item.iconType}`]" class="icon-list-item-img" />
        <div class="overHideCon-1 font-10">{{item.name}}</div>
      </div>

      <div class="can-move icon-list-item" v-if="dataInfo.length < 8" @click="add_dataList">
        <div class="icon-list-item-add">
          <i class="iconfont icon-plus-circle-fill"></i>
        </div>
        <div class="overHideCon-1 font-10">新增入口</div>
      </div>
    </draggable>
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
  name: "icon-list",
  props: ["infoData", "cmpId", "nowSettingDataId", "eventList"],
  components: {
    draggable,
  },
  inject: ["cancelInfoData"],
  data() {
    return {
      dataInfo: this.infoData || [],
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
      nowId: "",
    };
  },
  watch: {
    infoData: {
      deep: true,
      handler(value) {
        console.log(value, "3333");
        this.dataInfo = value;
      },
    },
    nowSettingDataId(value) {
      if (value == -1 || value != this.cmpId) {
        this.$set(this, "nowId", "");
      }
    },
  },
  methods: {
    add_dataList() {
      let id_ = new Date().getTime();
      let item = {
        iconType: "1",
        name: "快捷入口",
        type: "",
        id: id_,
        cmpId: this.cmpId,
        eventTempId: this.eventList.length > 0 ? this.eventList[0].id : "",
      };
      this.$emit("pushIcon", { id: this.cmpId, item });

      this.changeThis(item);
    },
    changeThis(item) {
      if (this.nowId == item.id) {
        // this.nowId = "";
        this.cancelInfoData();
        return;
      }
      this.nowId = item.id;
      this.$emit("changeThis", { id: this.cmpId, item });
    },
  },
};
</script>
<style lang="scss" scoped>
.setting-show-cmp-box {
  width: 100%;
  .icon-list-box {
    padding: 32px 9.5px 13px;
    .icon-list-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 19px;
      width: 25%;
      box-sizing: border-box;
      min-height: 35px;
      .icon-list-item-img {
        margin-bottom: 6px;
        width: 38px;
        height: 29px;
      }
    }
    .icon-list-item-check {
      outline: 1px dashed $color-primary;
    }
    .icon-list-item-add {
      margin-bottom: 6px;
      width: 38px;
      height: 28px;
      background: #ccc;
      border-radius: 13px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
    }
  }
}
</style>