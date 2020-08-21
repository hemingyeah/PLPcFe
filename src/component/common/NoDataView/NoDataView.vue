<template>
  <div class="app-nodata-view">

    <div class="app-nodata-img-container">
      <img class="app-nodata-img" :src="getImage()">
    </div>
    <div class="app-nodata-notice">{{ noticeMsg }}</div>

  </div>
</template>

<script>
import NO_DATA_IMG from '../../../assets/img/empty.png';

export default {
  name: 'no-data-view',
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
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;

    background-color: #ffffff;
    
    .app-nodata-img-container {
      display: flex;
      justify-content: center;
      align-items: center;

      padding: 100px 0 0;
      
      .app-nodata-img {
        width: 100px;
        height: 100px;
      }
    }

    .app-nodata-notice {
      padding-top: 10px;
      text-align: center;

      font-size: 14px;
    }
  }
</style>