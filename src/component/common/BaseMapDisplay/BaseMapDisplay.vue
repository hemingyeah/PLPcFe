<template>
  <base-modal
    class="modal"
    :title="title"
    width="840px"
    body-class="bm-display"
    :show.sync="show"
    @closed="$emit('destroy')"
    @cancel="$emit('cancel')">
    <div class="display-map" ref="container"></div>

  </base-modal>
</template>

<script>
  /* global AMap */
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
        show: false,
      }
    },
    mounted() {
      this.initialize();
    },
    methods: {
      initialize() {
        this.show = true;
        let lng = this.address.adLongitude || this.address.longitude || this.address.lng
        let lat = this.address.adLatitude || this.address.latitude || this.address.lat
        const position = new AMap.LngLat(lng, lat);
        const content = `<div class = 'mark-title'><i class="iconfont icon-triangle-down"></i></br>${this.options.title || '客户地址'}</div>`;
        const option = {zoom: 13, center: position,};

        const map = new AMap.Map(this.$refs.container, option);

        var marker = new AMap.Marker({
          position,
          offset: new AMap.Pixel(-10, -10),
          content,
        });

        map.add(marker);
      }
    },
  }
</script>

<style lang="scss">

  .bm-display {
    .mark-title {
      text-align: center;
      color: red;
      transform: translateX(-50%);
      width: 100px;
    }

    .display-map {
      height: 500px;
    }
  }


</style>