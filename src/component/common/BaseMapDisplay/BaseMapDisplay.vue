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
// TODO: 支持地图选点  用于更新客户地址
/* global AMap */
import platform from '@src/platform';

let map = null;

export default {
  name: 'base-map-display',
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
      show: false,
      add: {},
    }
  },
  computed: {
    displayTitle(){
      return this.options.title || '客户地址'
    },
    lat(){
      const { address, add} = this;
      return address.adLatitude || address.latitude || address.lat || add.lat
    },
    lng(){
      const { address, add} = this;
      return address.adLongitude || address.longitude || address.lng || add.lng
    }
  },
  mounted() {
    if (!this.lng || !this.lat) {
      return this.geoCode();
    }

    this.geoCode();
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
    geoCode() {
      const address = this.address;
      const str = (address.adProvince || address.province) + (address.adCity || address.city) + (address.adDist || address.dist) + (address.adAddress || address.address);
      let _self = this;

      AMap.service('AMap.Geocoder', function(){
        let geocoder = new AMap.Geocoder({
          radius: 1000,
          extensions: 'all',
          city: '全国'
        });
        geocoder.getLocation(str, function(status, result) {
          if (status === 'complete' && result.info === 'OK') {

            if (!result.geocodes || !result.geocodes.length) return _self.failed('根据地址查询位置失败');

            const location = result.geocodes[0];

            _self.add = {
              lat: location.location.lat,
              lng: location.location.lng,
            };
            return _self.initialize();
          }

          _self.failed('根据地址查询位置失败');
        });
      })
    },
    jumpToAmap(){
      platform.openLink(`https://uri.amap.com/marker?position=${this.lng},${this.lat}&name=${this.displayTitle}`)
    },
    failed(error) {
      return this.$platform.notification({
        title: '失败',
        message: error || '解析地址失败',
        type: 'error',
      });
    },
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