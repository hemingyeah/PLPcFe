<template>
  <base-modal title="位置详情" :show.sync="visible" width="600px">
    <div class="base-modal-content">
      <ul class="process-wrapper" v-if="locationData.length > 0">
        <li class="process-item" v-for="(item, index) in locationData" :key="item.id">
          <div class="process-info" v-if="index < locationData.length - 1">
            <p class="process-info-text" v-if="locationData[index+1].usedTime != null">{{ locationData[index+1].usedTime }}h</p>
            <p class="process-info-text" v-if="config.distanceStatis && locationData[index+1].distance != null">{{ locationData[index+1].distance }}km</p>
          </div>
          <div class="process-body">
            <h4 class="process-title">{{ getTypeText(item.type) }}</h4>
            <p class="process-body-text">{{ item.operateTime }}</p>
            <p class="process-body-text" v-if="config.autoLocation">{{ item.address }}</p>
          </div>
        </li>
      </ul>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="visible = false">关 闭</el-button>
    </div>
  </base-modal>
</template>

<script>
/* api */
import * as TaskApi from '@src/api/TaskApi.ts';

export default {
  name: 'hours-record-location-dialog',
  props: {
    config: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      pending: false,
      visible: false,
      locationData: []
    }
  },
  methods: {
    /** 
    * @description 获取位置详情
    */
    async openDialog(mainId) {
      if (this.pending) return;
      this.pending = true;

      try {
        let res = await TaskApi.hoursRecordLocation({ mainId });
        if (res.success) {
          this.locationData = res.result;
          this.visible = true;
        } else {
          this.$platform.alert(res.message);
        }
      } catch(err) {
        console.error('get location detail error', err);
      }

      this.pending = false;
    },
    /** 
    * @description 工时记录节点映射
    */
    getTypeText(type) {
      let typeMap = ['开始计时', '中间点', '暂停计时', '恢复计时', '结束计时'];
      return typeMap[type - 1];
    }
  }
}
</script>

<style lang="scss" scoped>
.process-wrapper{
  position: relative;
  width: 500px;
  padding: 20px;
  font-size: 14px;

  * {
    padding: 0;
    margin: 0;
    box-sizing: border-box;
  }

  .process-item {
    position: relative;
    padding-left: 90px;
    list-style: none;

    .process-info{
      display: flex;
      position: absolute;
      top: 10px;
      left: 0;
      bottom: 0;
      width: 90px;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .process-info-text {
      width: 100%;
      text-align: right;
    }
    .process-body {
      position: relative;
      padding: 0 20px 15px 20px;

      &::before{
        content: '';
        position: absolute;
        display: block;
        width: 10px;
        height: 10px;
        background: #55b7b4;
        border-radius: 10px;
        left: 5px;
        top: 0;
      }

      &::after{
        content: '';
        position: absolute;
        display: block;
        width: 1px;
        top: 0;
        bottom: 0;
        left: 10px;
        background: #55b7b4;
      }
    }

    .process-title{
      line-height: 1;
      margin-bottom: 6px;
      margin-top: 0;
      font-size: 14px;
    }
    .process-body-text{
      color: #55b7b4;
      font-size: 12px;
    }

    &:first-child {
      .process-info {
        top: 20px;
      }

      .process-body {
        &::before,
        &::after {
          top: 6px;
        }
      }
    }

    &:last-child {
      .process-body {
        &::before {
          top: 6px;
        }

        &::after {
          top: -6px;
          bottom: calc(100% - 10px);
        }
      }
    }
  }

}
</style>
