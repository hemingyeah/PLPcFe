<template>
  <div class="app-nodata-view">

    <div class="app-nodata-img-container">
      <img class="app-nodata-img" :src="getImage()">
    </div>
    <div class="app-nodata-notice">{{ noticeMsg }}</div>

  </div>
</template>

<script>
import NO_DATA_IMG from '../../../assets/img/noData.png';

export default {
  name: 'no-data-view-new',
  props: {
    noticeMsg: {
      type: String,
      default: '暂无数据'
    }
  },
  methods: {
    getImage () {
      return NO_DATA_IMG;
    }
  }
}
</script>

<style lang="scss" scoped>
  .app-nodata-view {
    .app-nodata-img-container {
      display: flex;
      justify-content: center;
      align-items: center;

      padding-top: 40px;
      
      .app-nodata-img {
        width: 100px;
        height: 100px;
      }
    }

    .app-nodata-notice {
      padding-top: 14px;
      text-align: center;
      color: #666;
      font-size: 14px;
    }
  }
</style>