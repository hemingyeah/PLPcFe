<template>
  <div class="right-top-selector-container">
    <!-- 底部线条 -->
    <div class="bottom-graph">
      <div class="graph-left-line"></div>
      <div class="graph-right-line"></div>
    </div>
    <!-- 右上边角 -->
    <div class="right-top-corner"></div>
    <!-- 选择器 -->
    <div class="selector-container">
      <el-select 
        v-model="currTime" 
        :popper-append-to-body="false"
        :placeholder="''"
        @input="changeTimeHandler"
      >
        <el-option
          v-for="item in timeRange"
          :key="item.key"
          :label="item.label"
          :value="item.key"
        ></el-option>
      </el-select>
    </div>
  </div>  
</template>

<script>
import {timeRange} from '@src/modules/dataScreen/component/setting/config';

export default {
  name: 'right-top-selector',
  props: {
    params: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      timeRange,
      currTime: '',
    }
  },
  methods: {
    changeTimeHandler(value) {
      let rest = timeRange.filter(i => i.key === value)[0];
      this.$emit('input', rest)
    }
  },
  mounted() {
    this.$nextTick(() => {
      let key = this.params.cycleRange;
      this.currTime = key;
    })
  }
}
</script>

<style lang="scss">
  // 样式公共import
  $panelBorderColor: #06A8A1;

  .right-top-selector-container {
    position: absolute;
    top: 0;
    right: 0;

    width: 194px;
    height: 33px;

    // 846 宽
    // 632 + 20 + 194

    // 973 高
    // 33 + 940
    .bottom-graph {
      position: absolute;
      left: 0;
      bottom: 0;
      width: 100%;

      display: flex;
      flex-wrap: nowrap;

      .graph-left-line {
        position: relative;
        width: 33px;
        height: 1px;

        &::before {
          content: '';
          position: absolute;
          width: 45px;
          height: 1px;
          right: 0;
          bottom: 0;
          background-color: $panelBorderColor;

          transform: rotate(45deg);
          transform-origin: right bottom;
        }

      }
      .graph-right-line {
        width: calc(100% - 20px);
        height: 1px;
        background-color: $panelBorderColor;
      }
    }

    .right-top-corner {
      $cornerMax: 24px;
      $cornerMin: 4px;

      position: absolute;
      top: -32px;
      right: -11px;
      &::before {
        content: '';
        position: absolute;
        top: 0;
        right: 0;

        width: $cornerMax;
        height: $cornerMin;
        background-color: $panelBorderColor;

      }
      &::after {
        content: '';
        position: absolute;
        top: 0;
        right: 0;

        width: $cornerMin;
        height: $cornerMax;
        background-color: $panelBorderColor;
      }
    }

    .selector-container {
      $width: 116px;
      $height: 36px;
      $bgc: rgba(11,89,84,1);
      $borderStyle: 1px solid $panelBorderColor;

      position: absolute;
      top: -18px;
      right: 2px;

      .el-input {
        width: $width;
        height: $height;
        background-color: $bgc;
        border: $borderStyle;

        .el-input__inner {
          // background: unset; // ie 兼容性问题不能使用unset
          background: transparent;
          border: none;
          user-select: none;
          color: #ffffff !important;
          font-size: 14px;
          &::placeholder {
            color: #ffffff;
            font-size: 14px;
          }
        }

        .el-input__suffix {
          display: flex;
          align-items: center;
          .el-icon-arrow-up {
            font-family: "iconfont" !important;
            font-size: 12px;
            font-style: normal;
            color: #06A987;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            &::before {
              content: '\e74d';
            }
          }
        }
      }
        
        .el-select-dropdown {
          margin: 0;
          background-color: $bgc;
          width: 100%;
          min-width: 100% !important; // fix in windows Chrome 77

          left: 0 !important;
          top: $height !important;
          border: none;

          .el-scrollbar__wrap {
            margin: 0;
          }

          .el-select-dropdown__list {
            padding: 0;
          }

          .el-select-dropdown__item {
            height: $height;
            border-bottom: $borderStyle;
            border-right: $borderStyle;
            border-left: $borderStyle;
            background-color: $bgc;
            color: #ffffff !important;

            padding-left: 10px;
            font-size: 14px;
          }

          .hover {
            background-color: unset;
          }

          .popper__arrow {
            display: none;
          }
        }
    }
  }
</style>
