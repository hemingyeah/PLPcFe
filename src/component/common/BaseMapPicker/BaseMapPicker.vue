<template>
  <base-modal
    :title="title"
    width="840px"
    body-class="bm-picker"
    :show.sync="show"
    @closed="$emit('destroy')"
    @cancel="$emit('cancel')">

    <div class="bm-picker-map" ref="container">
    </div>

    <div class="bm-picker-list" :style="{position : !addressInfo.show ? 'absolute' : 'initial'}">
      <div class="search-inp">
        <input id='locationKeyword' type="text" placeholder="请输入关键字" autofocus>
        <div id="completeList"></div>
      </div>

      <div v-if="addressInfo.show">
        <h3>当前选择位置</h3>
        <div class="bm-address-item">
          <div class="bm-address-recommend" :class="{'bm-address-checked': addressInfo.recommend.checked}">
            <a href="javascript:;" @click="moveMarker(addressInfo.recommend)">{{addressInfo.recommend |
              fmt_address}}</a>
          </div>
        </div>
      </div>
      <template v-if="addressInfo.pois.length > 0">
        <h3>附近地点</h3>
        <div class="bm-address-item" id="bm-address-item" v-for="item in addressInfo.pois" :key="item.id"
             :class="{'bm-address-checked': item.checked}">
          <div class="bm-address-poi">
            <a href="javascript:;" @click="moveMarker(item)">{{item.name}}</a>
            <p>{{item.address}}</p>
          </div>
        </div>
      </template>
    </div>

    <div class="bm-window" ref="infoWindow" v-show="chosenItem">
      <div class="bm-window-header">
        <h3>当前位置</h3>
        <button type="button" class="bm-window-header-close" @click="closeInfoWindow">
          <i class="iconfont icon-guanbi"></i>
        </button>
      </div>
      <div class="bm-window-body">
        <div v-if="loading">正在解析地址...</div>
        <template v-else>
          {{chosenItem && chosenItem.formattedAddress}}
          <button
            type="button" class="bm-window-btn"
            @click="choose(chosenItem)"
            v-if="chosenItem && chosenItem.formattedAddress != '无效地址，请重新选择'">使用地址
          </button>
        </template>
      </div>
    </div>

  </base-modal>
</template>

<script>
  /* global AMap */
  import _ from 'lodash';
  import platform from '@src/platform';

  let map = null;
  let geocoder = null;
  let marker = null;
  let infoWindow = null;

  export default {
    name: 'base-map-picker',
    props: {
      title: {
        type: String,
        default: '选择地址'
      },
      address: {
        type: Object,
        default: null
      },
      defaultArea: {
        type: String,
        default: ''
      }
    },
    data() {
      return {
        show: false,
        addressInfo: {
          recommend: {},
          pois: [],
          show: false
        },
        chosenItem: null,
        loading: false
      }
    },
    methods: {
      /** 移动标记 */
      moveMarker(item) {
        this.addressInfo.recommend.checked = false;
        this.addressInfo.pois.forEach(item => item.checked = false);
        item.checked = true;

        this.chosenItem = item;
        this.$nextTick(() => {
          let location = new AMap.LngLat(item.longitude, item.latitude);
          if (marker.getMap() == null) marker.setMap(map)
          marker.setPosition(location);
          infoWindow.open(map, location);
          map.setCenter(location)
        })
      },
      /** 选中地址 */
      choose(item) {
        platform.confirm('确定要使用该地址？').then(value => {
          if (!value) return Promise.reject('cancel')

          //如果选择的是推荐地址，直接返回数据
          if (!item.isPOI) {
            let data = {
              province: item.province,
              city: item.city,
              dist: item.dist,
              address: item.address,
              latitude: item.latitude,
              longitude: item.longitude
            };
            this.show = false;
            this.$emit('input', data);
            return
          }

          //如果是附近的点，需要先解析当前位置
          let location = new AMap.LngLat(item.longitude, item.latitude)
          this.getAddress(location).then(result => {
            if (null == result) {
              return platform.alert('当前地址不可用，请重新选择')
            }

            let regeocode = result.regeocode || {};
            let address = this.convertAddress(regeocode, location);//只有省和市都存在时，才是有效地址

            if (!this.isSafeAddress(address)) {
              return platform.alert('当前地址不可用，请重新选择')
            }

            this.show = false;
            this.$emit('input', address);
          })
        })
        .catch(err => console.error(err))
      },
      /** 解析地址 */
      parseAddress(location) {
        if (!location) return;
        if (marker.getMap() == null) marker.setMap(map);
        marker.setPosition(location);
        infoWindow.open(map, location);

        this.loading = true;
        this.getAddress(location).then(result => {
          this.loading = false;

          if (null == result) {
            this.addressInfo = _.assign({}, this.addressInfo, this.buildEmptyRecommend());
            if (this.chosenItem) this.chosenItem.formattedAddress = '无效地址，请重新选择'
            return;
          }

          let regeocode = result.regeocode || {};
          //拆解选中的地址
          let address = this.convertAddress(regeocode, location);

          if (!this.isSafeAddress(address)) {
            this.addressInfo = _.assign({}, this.addressInfo, this.buildEmptyRecommend());
            if (this.chosenItem) this.chosenItem.formattedAddress = '无效地址，请重新选择'
            return;
          }

          //拆解poi信息
          let pois = this.convertPOI(regeocode);

          //补全信息
          address.checked = true;
          address.isPOI = false;
          address.formattedAddress = regeocode.formattedAddress;

          this.chosenItem = address;
          this.addressInfo = _.assign({}, this.addressInfo, {recommend: address, pois, show: true});

          let zoom = 13;

          if (map.G && map.G.zoom) {
            zoom = map.G.zoom > 13 ? map.G.zoom : 13;
          }

          // setTimeout(() => map.setCenter(location), 150)
          setTimeout(() => map.setZoomAndCenter(zoom, [location.lng, location.lat]), 150);
        })
        .catch(err => console.error(err))
      },
      getAddress(location) {
        return new Promise((resolve, reject) => {
          geocoder.getAddress(location, function (status, result) {
            //无数据返回null
            resolve(status == 'no_data' ? null : result)
          })
        })
      },
      buildEmptyRecommend() {
        return {
          recommend: {
            province: '',
            city: '',
            dist: '',
            address: '',
            latitude: null,
            longitude: null,
            checked: false,
            isPOI: false,
            formattedAddress: '无效地址，请重新选择'
          },
          pois: [],
          show: false
        }
      },
      closeInfoWindow() {
        infoWindow.close();
      },
      /** 地址信息必须包含省和市 */
      isSafeAddress(adr) {
        if (null == adr) return false;
        if (adr.province == '其他区域') return true;

        let province = adr.province;
        let city = adr.city;
        //let dist = adr.district;

        return province && city;
      },
      /** 将地图返回地址拆解成系统可用地址  */
      convertAddress(regeocode, location) {
        let adr = regeocode.addressComponent || {};
        let formattedAddress = regeocode.formattedAddress || '';

        let province = adr.province;
        let city = adr.city;
        let dist = adr.district;
        let address = formattedAddress.replace(province + city + dist, "")

        //无省份视为无效地址
        if (!province) return null;

        //港、澳、台三地归入 其他区域
        if (['香港', '澳门', "澳門", '台湾'].some(item => province.indexOf(item) == 0)) {
          return {
            province: "其他区域",
            city: "其他",
            dist: "",
            address: regeocode.formattedAddress,
            latitude: location.lat,
            longitude: location.lng
          };
        }

        let result = {province, city, dist, address};

        //直辖市补全city
        if (['北京市', '上海市', '重庆市', '天津市'].indexOf(province) >= 0) result.city = '市辖区';

        //海南省对city特殊处理
        if (province == '海南省' && !result.city) {
          result.city = result.dist;
          result.dist = '';
        }

        //部分地区存在区划变更的情况
        let map = {
          //2018年那曲地区变更为那曲市
          "那曲地区": {
            level: "city",
            alias: ["那曲市"]
          }
        };

        for (let key in map) {
          let {level, alias} = map[key];

          if (alias.indexOf(result[level]) >= 0) {
            result[level] = key;
          }
        }

        //补全经纬度
        result.latitude = location.lat,
          result.longitude = location.lng

        return result;
      },
      /** 拆解poi信息 */
      convertPOI(regeocode) {
        return regeocode.pois.map(item => {
          return {
            id: item.id,
            name: item.name,
            address: item.address,
            latitude: item.location.lat,
            longitude: item.location.lng,
            formattedAddress: item.address + item.name,
            checked: false,
            isPOI: true
          }
        });
      },
      initialize() {
        this.show = true;
        let ctx = this;
        map = new AMap.Map(this.$refs.container, {zoom: 13});
        marker = new AMap.Marker();

        if (this.defaultArea) map.setCity(this.defaultArea);

        infoWindow = new AMap.InfoWindow({
          isCustom: true,
          offset: new AMap.Pixel(0, -34),
          autoMove: true,
          content: this.$refs.infoWindow //使用默认信息窗体框样式，显示信息内容
        });

        let location = null;
        //设置初始值
        if (null != this.address && this.address.latitude && this.address.longitude) {
          let adr = this.address;
          location = new AMap.LngLat(adr.longitude, adr.latitude);
        }

        AMap.plugin(['AMap.Geocoder', 'AMap.Autocomplete'], function () {
          geocoder = new AMap.Geocoder({
            extensions: 'all'
          });

          map.on('click', function (event) {
            ctx.parseAddress(event.lnglat)
          });

          if (location) ctx.parseAddress(location);

          let autocomplete = new AMap.Autocomplete({
            input: 'locationKeyword',
          });

          AMap.event.addListener(autocomplete, "select", function (e) {
            if (e.poi.location) {
              return ctx.parseAddress(e.poi.location);
            }
            map.setCity(e.poi.name);
          });
        })
      }
    },
    mounted() {
      this.initialize();
    },
    destroyed() {
      map.destroy();
    }
  }
</script>

<style lang="scss">
  .bm-picker {
    position: relative;
    height: 500px;
    display: flex;
    flex-flow: row nowrap;
  }

  .bm-picker-map {
    flex: 1;
    height: 100%;
  }

  .search-inp {
    display: flex;
    justify-content: left;
    padding: 8px;
    input {
      width: 100%;
      border: 1px solid #ced4da;
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }
  }

  .bm-picker-list {
    width: 280px;
    max-height: 100%;
    overflow: auto;
    background-color: #fff;
    z-index: 999;
    position: absolute;
    top: 0;
    right: 0;

    h3 {
      font-size: 14px;
      padding: 2px 5px;
      line-height: 24px;
      margin: 0;
      background-color: #eee;
    }
  }

  .bm-address-item {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    border-bottom: 1px solid #e9ecef;

    &:hover {
      background-color: #f5f5f5;
    }
  }

  .bm-address-recommend {
    padding: 2px 0 2px 5px;
    margin: 8px 0;
    flex: 1;

    a {
      font-size: 14px;
      word-break: break-all;
      color: #333;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
        color: #007bff;
      }
    }
  }

  .bm-address-poi {
    padding: 5px 0 5px 5px;
    flex: 1;

    p,
    a {
      margin: 0;
      line-height: 24px;
      word-break: break-all;
    }

    a {
      font-size: 14px;
      color: #333;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
        color: #007bff;
      }
    }
    p {
      color: #666;
      font-size: 13px;
    }
  }

  .bm-address-checked a {
    color: #007bff;
  }

  .bm-window {
    width: 320px;
    background-color: #fff;
    border-radius: 2px;
    box-shadow: 1px 2px 4px rgba(0, 0, 0, 0.15);
  }

  .bm-window-header {
    position: relative;
    padding: 5px 30px 5px 8px;
    border-bottom: 1px solid #e9ecef;
    background-color: #eee;
    align-items: center;

    h3 {
      flex: 1;
      margin: 0;
      height: 20px;
      line-height: 20px;
      font-size: 14px;
      font-weight: 400;

    }

    &-close {
      position: absolute;
      right: 0;
      top: 0;
      height: 30px;
      width: 30px;
      padding: 0;
      margin: 0;

      background-color: transparent;
      border: none;
      outline: none;

      font-size: 14px;
      color: #999;

      cursor: pointer;

      &:hover {
        color: #e84040;
      }
    }
  }

  .bm-window-body {
    padding: 8px;
    font-size: 14px;
    line-height: 24px;
  }

  .bm-window-btn {
    padding: 0 8px;
    height: 24px;
    background-color: #3296fa;
    color: #fff;
    border-radius: 2px;
    border: none;
    outline: none;
    cursor: pointer;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
  }
</style>
