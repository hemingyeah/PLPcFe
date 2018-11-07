<template>
  <base-modal
    class="bm-modal"
    width="840px"
    :title="displayTitle"
    :show.sync="show"
    @closed="$emit('destroy')"
    @cancel="$emit('cancel')">
    <div class="bm-display-map" ref="container"></div>
  </base-modal>
</template>

<script>
//TODO: 支持地图选点  用于更新客户地址
/* global AMap */
import platform from '@src/platform';

let map = null;

export default {
  name: "base-map-display",
  props: {
    title: {
      type: String,
      default: '位置信息'
    },
    address: {
      type: Object,
      default: null
    },
    options: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      show: false
    }
  },
  computed: {
    displayTitle(){
      return this.options.title || '客户地址'
    },
    lat(){
      return this.address.adLatitude || this.address.latitude || this.address.lat
    },
    lng(){
      return this.address.adLongitude || this.address.longitude || this.address.lng;
    }
  },
  mounted() {
    this.initialize();
  },
  methods: {
    initialize() {
      this.show = true;

      let position = new AMap.LngLat(this.lng, this.lat);
      let marker = new AMap.Marker({
        position,
        content: '<i class="bm-location-dot"></i>'
      });

      marker.on('click', this.jumpToAmap)

      map = new AMap.Map(this.$refs.container, {zoom: 13, center: position});
      map.add(marker);
    },
    jumpToAmap(){
      platform.openLink(`https://uri.amap.com/marker?position=${this.lng},${this.lat}&name=${this.displayTitle}`)
    }
  },
  destroyed(){
    map && map.destroy();
  }
}
</script>

<style lang="scss">

.bm-modal{
  .base-modal-header h3{
    font-weight: 500;
  }
  
  .bm-display-map{
    height: 500px;
  }
}

.bm-info-window{
  padding: 5px 8px;
  border-radius: 2px;
  max-width: 320px;
  background-color: #fff;
  box-shadow: 0 0 8px rgba(0, 0, 0, .35);

  p{
    font-weight: 500;
    word-break: break-all;
    margin: 0;
    line-height: 24px;
  }
}

.bm-location-dot{
  display: block;
  background-color: #E23B41;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 4px solid #f8ced0;
  box-shadow: 0 0 4px rgba(248, 206, 208, .25);
}
</style>