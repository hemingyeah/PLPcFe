<template>
  <div
    class="com-lenovoselect-box"
    :class="{ 'com-lenovoselect-box-focus': focusType }"
    ref="comLenovoselectBox"
  >
    <div class="flex-x cur-point choose-warp" @click="focus">
      <div class="choose-box flex-x flex-1">
        <div
          class="choose-item flex-x "
          v-for="(item, index) in nowChooseItem"
          :key="index"
        >
          <div class="flex-1 overHideCon-1">{{ item[chooseShowKey] }}</div>

          <div class="choose-item-close" @click.stop="deleteItem(index)">
            <i class="iconfont icon-circle-delete"></i>
          </div>
        </div>
      </div>
      <div
        class="choose-box-close"
        @click.stop="deleteAll"
        v-if="nowChooseItem.length > 0"
      >
        <i class="iconfont icon-circle-delete"></i>
      </div>
      <div
        class="choose-box-arrow-down"
        :class="{ 'choose-box-arrow-up': focusType }"
        v-else
      >
        <i class="iconfont icon-up"></i>
      </div>
    </div>
    <div
      class="select-box"
      :class="{ 'select-box-show': focusType, 'select-box-show-top': topShow }"
    >
      <div
        class="normal-arrow-top pop-arrow"
        :class="{ 'normal-arrow-bottom': topShow }"
      ></div>
      <div class="select-box-con">
        <el-input
          ref="comLenovoInput"
          v-if="!topShow"
          v-model="keyword"
          :disabled="pending"
        ></el-input>
        <div :class="topShow ? 'mar-b-12' : 'mar-t-12'" ref="showData">
          <div class="data-box" @scroll="scrollData">
            <slot
              name="select"
              :slotData="page"
              :slotNowData="nowChooseItem"
              :slotNowDataIndex="nowChooseIndex"
            ></slot>
            <template v-if="defaultItem">
              <div
                v-for="(item, index) in page.list"
                :key="index"
                class="flex-x overHideCon-1"
                @click.prevent="chooseItem(item)"
              >
                <div>{{ item[listShowKey] }}</div>
              </div>
            </template>
            <div v-if="page.list.length > 0 && !page.hasNextPage && !pending">
              没有更多的数据啦
            </div>
            <div
              class="nothing-box"
              v-if="page.list.length <= 0 && !pending && searched"
            >
              暂无数据
            </div>
          </div>
        </div>

        <div class="loading-box" v-if="pending">
          数据加载中
        </div>
        <el-input
          v-if="topShow"
          v-model="keyword"
          :disabled="pending"
        ></el-input>
      </div>
    </div>
  </div>

  <!-- 
    demo
    
    <div>
      <com-lenovoselect
        :search-data="lenovoselectSearchData"
        :default-item="false"
        ref="comLenovoselect"
        choose-show-key="goodsName"
        list-key="orderId"
        :com-ruturn-data="data1"
        @dataUpdate="dataUpdate()('data1')"
      >
        <template
          slot="select"
          slot-scope="slotProps"
          v-if="slotProps.slotData"
        >
          <div
            v-for="(item, index) in slotProps.slotData.list"
            :key="index"
            class="flex-x"
            :class="
              slotProps.slotNowDataIndex[item.orderId] > -1
                ? 'checked-item'
                : ''
            "
            @click.prevent="slotClick(item, 'comLenovoselect')"
          >
            <div>{{ item.goodsName }}</div>
          </div>
        </template>
      </com-lenovoselect>
    </div> 


    dataUpdate(e, key) {
      console.log(e, key, 'get')
      this[key] = e;
    },
    calculateClass(e, t) {
      let str = '';
      if (e.slotNowData) {
        for (let index = 0; index < e.slotNowData.length; index++) {
          const element = e.slotNowData[index];
          if (element.orderId === t.orderId) {
            str = 'checked-item';
          }
        }
      }
      return str;
    },
    slotClick(e, ref) {
      this.$refs[ref].chooseItem(e);
    },
    lenovoselectSearchData(data = {}) {
      return new Promise((resolve, reject) => {
        orderList({
          ...data,
        })
          .then((res) => {
            if (res.status != 200) {
              return reject();
            }
            resolve(res.data);
          })
          .catch((err) => {
            reject();
          });
      });
    },
    
    
    -->
</template>
<script>
import Page from '@model/Page';
import _ from 'lodash';
const thisData = {
  page: { ...new Page(), pageSize: 30 }, // page 对象
  keyword: '',
  reflash: true,
  pending: false,
  nowChooseIndex: {},
  focusType: false,
  topShow: false,
  searched: false,
  dataLast: true,
};
let notSearch = false;
export default {
  name: 'com-lenovoselect',
  props: {
    searchData: {
      type: Function,
    },
    defaultItem: {
      type: Boolean,
      default: true,
    },
    chooseShowKey: {
      type: String,
      default: 'key',
    },
    listKey: {
      type: String,
      default: 'key',
    },
    listShowKey: {
      type: String,
      default: 'value',
    },
    searchKey: {
      type: String,
      default: 'keyword',
    },
    comRuturnData: {
      type: Array,
      default: () => {
        [];
      },
    },
  },
  computed: {
    nowChooseItem: {
      get() {
        return this.comRuturnData || [];
      },
      set(val) {
        this.$emit('dataUpdate', val);
      },
    },
  },
  data() {
    return thisData;
  },
  watch: {
    keyword: _.debounce(function(newVal, oldVal) {
      this.loadData(true);
    }, 800),
    nowChooseItem(newVal, oldVal) {
      let obj = {};
      if (newVal.length > 0) {
        newVal.forEach((item, index) => {
          obj[item[this.listKey]] = index;
        });
      }
      this.nowChooseIndex = obj;
    },
  },
  created() {
    document.addEventListener('click', this.blur);
    let obj = {};
    if (this.nowChooseItem.length > 0) {
      this.nowChooseItem.forEach((item, index) => {
        obj[item[this.listKey]] = index;
      });
    }
    this.nowChooseIndex = obj;
  },
  beforeDestroy() {
    document.removeEventListener('click', this.blur);
  },

  methods: {
    loadData: _.debounce(function(reflash = false) {
      if (notSearch) return;
      notSearch = false;
      if (!this.page?.hasNextPage) return;
      let { pageNum, pageSize } = this.page;
      let now_data = this.page.list;
      if (reflash == true) {
        pageNum = 1;
        now_data = [];
      }
      this.pending = true;
      this.reflash = reflash;
      this.searchData({
        pageNum,
        pageSize,
        [this.searchKey]: this.keyword,
      })
        .then((res) => {
          res.list = [...now_data, ...res.list];
          res.pageNum = pageNum * 1 + 1;
          this.page = res;
          this.page.pageSize = 30;
          this.reflash = false;
          this.searched = true;
          this.$nextTick(() => {
            let scrollHeight = this.$refs.showData.scrollHeight * 1;
            if (scrollHeight < 300 && this.dataLast == true) {
              this.dataLast = false;
              this.loadData();
            }
          });
        })
        .catch((err) => {
          let page = new Page();
          page.pageSize = 20;
          this.page = page;
        })
        .finally((res) => {
          this.pending = false;
          this.reflash = false;
          this.searched = true;
        });
    }, 500),
    chooseItem(e) {
      if (this.nowChooseIndex[e[this.listKey]] > -1) {
        this.nowChooseItem.splice(this.nowChooseIndex[e[this.listKey]], 1);
        // delete this.nowChooseIndex[e[this.listKey]];
      } else {
        this.nowChooseItem.push(e);
        // this.nowChooseIndex[e[this.listKey]] = this.nowChooseItem.length - 1;
      }
    },
    scrollData(e) {
      // console.log(e.target.scrollHeight, e.target.scrollTop, e);
      if (e.target.scrollHeight - 300 <= e.target.scrollTop + 50) {
        this.loadData();
      }
    },
    focus(e) {
      if (!this.focusType) {
        let bottomH = window.innerHeight
          - e.target.getBoundingClientRect().y
          - e.target.getBoundingClientRect().height;
        if (bottomH < 370) {
          this.topShow = true;
        }
        this.$nextTick(() => {
          this.$refs.comLenovoInput.$el.querySelector('input').focus();
        });
      }
      this.focusType = !this.focusType;
    },
    blur(event) {
      const e = event || window.event;
      if (
        this.$refs.comLenovoselectBox
        && !this.$refs.comLenovoselectBox.contains(e.target)
      ) {
        if (this.focusType) this.focusType = false;
      }
    },
    deleteAll() {
      // this.nowChooseIndex = {};
      this.nowChooseItem.splice(0, this.nowChooseItem.length);
    },
    deleteItem(index) {
      // let key = this.nowChooseItem[index][this.listKey];
      // delete this.nowChooseIndex[key];
      this.nowChooseItem.splice(index, 1);
    },
    resetSerchList() {
      this.page = { ...new Page(), pageSize: 30 };
      this.keyword = '';
      this.reflash = true;
      this.searched = false;
      notSearch = true;
    },
  },
};
</script>
<style lang="scss" scoped>
$arrow-border: 8px;
$base-slect-box-top: 38px;
.com-lenovoselect-box {
  width: 100%;
  min-width: 120px;
  height: 32px;
  padding: 0 12px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  border: 1px solid $color-border-l1;
  position: relative;
  .choose-warp {
    width: 100%;
    height: 32px;
  }
  .choose-box {
    overflow-x: scroll;
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE 10+ */
    &::-webkit-scrollbar {
      display: none; /* Chrome Safari */
    }
    .choose-item {
      &:not(:first-child) {
        margin-left: 10px;
      }
      max-width: 180px;
      background: #f5f5f5;
      border-radius: 3px;
      padding: 2px 10px;
      font-size: 12px;
      flex-shrink: 0;
      .choose-item-close {
        margin-left: 10px;
        color: #d9d9d9;
        cursor: pointer;
      }
    }
  }

  .choose-box-close {
    width: 15px;
    height: 32px;
    padding-left: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    .iconfont {
      color: #d9d9d9;
    }
  }
  .choose-box-arrow-down {
    @extend .choose-box-close;

    .iconfont {
      transition: all 0.8s;
      transform: rotateZ(-180deg);
      font-size: 12px;
    }
  }
  .choose-box-arrow-up {
    .iconfont {
      transform: rotateZ(0);
    }
  }

  .select-box {
    position: absolute;
    z-index: 996;
    top: ($base-slect-box-top + $arrow-border);
    background: #fff;
    width: 100%;
    height: 0;
    overflow: hidden;
    left: 0;
    box-sizing: border-box;
    transition: height 0.8s;
    border-radius: 4px;
    -webkit-filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.5)) !important;
    filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.5)) !important;
    /* 向上的箭头 */

    .normal-arrow-top {
      font-size: 0;
      line-height: 0;
      border-width: $arrow-border;
      border-color: #fff;
      width: 0;
      border-top-width: 0;
      border-style: dashed;
      border-bottom-style: solid;
      border-left-color: transparent;
      border-right-color: transparent;
      position: absolute;
      top: -$arrow-border;
      left: 20px;
    }
    .normal-arrow-bottom {
      border-top-width: $arrow-border;
      border-bottom-width: 0;
      bottom: -$arrow-border;
      top: auto;
    }

    .select-box-con {
      padding: 12px;
    }
    .mar-t-12 {
      margin-top: 12px;
    }
    .mar-b-12 {
      margin-bottom: 12px;
    }
    .data-box {
      max-height: 300px;
      overflow-y: scroll;
    }
  }
  .select-box-show {
    height: auto;
    overflow: inherit;
    // outline: 1px solid $color-border-l1;
  }
  .select-box-show-top {
    top: auto;
    bottom: ($base-slect-box-top + $arrow-border);
  }
}
.com-lenovoselect-box-focus {
  border-color: $color-primary;
}
</style>
