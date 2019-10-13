<template>
  <transition name="setting-fade">
    <div class="setting-dialog" >
      <div class="setting-mask" :style="headerBgFixStyleStr"></div>
      <!-- 设置 内容主容器 -->
      <div class="setting-dialog-container">
        <!--顶栏设置项 -->
        <div class="setting-topbar">
          <div 
            v-for="(tab, idx) in settingGroup"
            :key="idx"
            @click="changeSettingGroup(tab)"
            class="topbar-item"
            :class="{'topbar-item-active': activeGroup.key === tab.key}"
          >
            <span class="setting-topbar-title">{{ tab.label }}</span>
          </div>
        </div>
        <div class="setting-content">
          <!-- 所选group下的设置项 -->
          <div 
            v-for="setting in activeGroup.items || []"
            :key="setting.key"
            class="setting-item"
          >
            <!-- <el-checkbox-group
              v-model="activeGroupSelected[activeGroup.key]"
              :min="0"
              :max="activeGroup.limit || activeGroup.items.length"
            > -->
            <el-checkbox 
              :value="setting.value" :name="setting.name" @input="changeSettingItem($event, setting)" :label="setting.label"
            ></el-checkbox>
            <!-- </el-checkbox-group> -->
          </div>
          <div v-if="activeGroup.mark" class="setting-mark">{{ activeGroup.mark }}</div>
        </div>
        <div class="setting-action">
          <button @click="cancelHandler" class="setting-btn btn-cancel">取消</button>

          <button @click="resetHandler" class="setting-btn btn-reset">重置</button>
          <button @click="confirmHandler" class="setting-btn btn-confirm">确定</button>

        </div>
      </div>
    </div>
  </transition>
</template>

<script>

import {getSettingGroup} from './setting';

export default {
  name: 'setting-dialog',
  props: {
    config: {
      type: Object
    },
    params: {
      type: Object
    },
    scope: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    headerBgFixStyleStr() {
      if (!this.scope || !this.scope.bX) return '?';

      let scope = this.scope.bX;
      scope = scope > 1 ? scope : (1 / scope);

      return `transform: scaleX(${scope}); transform-origin: center center;`;
    }
  },
  data() {
    return {
      groupBackup: {},

      settingGroup: [],
      activeTab: 'leftTop',
      activeGroup: {},
      activeGroupSelected: {
        leftTop: [],
        rightTop: [],
        rightHistogram: [],
        rightPieChart: []
      }
    }
  },
  methods: {
    /**
     * 获取当前设置格式化的参数
     */
    getSettingBuildParams () {
      let result = {};

      for (let group in this.settingGroup) {
        this.settingGroup[group].items.forEach(setting => {
          let key = setting.key;
          let value = setting.value;

          result[key] = value;
        })
      }

      return result;
    },
    
    /**
     * 修改设置项处理方法
     * 手动判断是否能够继续选择
     */
    changeSettingItem (value, setting) {
      let limit = this.activeGroup.limit;

      // 该分组下属选项没有没有限制时 或 进行取消操作时, 允许操作
      if (!limit || !value) {
        setting.value = value;
        return;
      }

      // 有限制，进行选择操作时 仅选择后<=limit可行
      let selectedLength = this.activeGroup.items.filter(setting => setting.value === true).length;
      if (selectedLength + 1 <= limit) {
        setting.value = value;
        return;
      }
    },

    /**
     * 选择当前设置的分组
     */
    changeSettingGroup (group) {
      this.activeGroup = group;
    },

    /**
     * 确认按钮点击处理
     */
    confirmHandler () {
      let params = this.getSettingBuildParams();
      let group = this.settingGroup;

      let data = {
        params,
        group
      }
      this.$emit('update', data);
      this.$emit('close');
    },

    /**
     * 重置按钮点击事件处理
     * 重置settingGroup与activeGroup
     */
    resetHandler () {
      let backupParams = getSettingGroup(this.params);
      this.settingGroup = backupParams;

      this.activeGroup = this.settingGroup[this.activeGroup.key];
    },

    /**
     * 取消按钮点击事件处理
     */
    cancelHandler () {
      this.$emit('close');
    }
  },
  mounted() {
    this.settingGroup = getSettingGroup(this.params);

    this.activeGroup = this.settingGroup.leftTop;
  }
}
</script>

<style lang="scss">

  $borderColor: #06A8A1;
  $borderStyle: 1px solid $borderColor;
  $bgColor: #0D2D29;
  $dialogWidth: 568px;

  .setting-dialog {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 2;

    .setting-dialog-container {
      // 这里不再使用absolute 50%定位配合transform，
      // 顶级dom使用transform缩放，el select组件点击时会有抖动问题（去掉transform或scale(1)时不会有问题
      // position: absolute;
      // top: 50%;
      // left: 50%;
      // transform: translateX(-50%) translateY(-50%);
      position: relative;
      margin: 0 auto;
      top: 37%;

      width: $dialogWidth;
      transform: scale(1.5);

      .setting-topbar {
        display: flex;
        justify-content: flex-start;
        .topbar-item {
          position: relative;
          width: 131px;
          height: 36px;

          display: flex;
          justify-content: center;
          align-items: center;

          background-color: #0F1F1B;
          border-left: $borderStyle;
          border-top: $borderStyle;
          cursor: pointer;

          clip-path: polygon(93% 0, 100% 24%, 100% 100%, 0 100%, 0 0);
          overflow: hidden;

          &::before {
            content: '';
            position: absolute;
            top: 0;
            left: 112px;
            width: 20px;
            height: 1px;
            background-color: $borderColor;

            transform: rotate(45deg);
          }

          .setting-topbar-title {
            font-size: 14px;
            font-weight: 400;
            color: #ffffff;
          }
        }
        .topbar-item:nth-last-child(1) {
          border-right: $borderStyle;
        }
        .topbar-item-active {
          background-color: #06A8A1;
        }
      }

      .setting-content {
        position: relative;
        border: $borderStyle;
        border-bottom: none;
        background-color: $bgColor;

        padding: 20px 18px;

        display: flex;
        justify-content: flex-start;
        flex-wrap: wrap;

        .setting-item {
          min-width: 50%;
          flex-shrink: 0;

          .el-checkbox__label {
            color: #ffffff;
            font-size: 14px;
            font-weight: normal;

          }
          .el-checkbox__input {
            .el-checkbox__inner {
              background: transparent;
            }
          }

          .el-checkbox {
            .is-checked {
              .el-checkbox__inner {
                background: #55B7B4;
              }
            }
          }
        }

        .setting-mark {
          position: absolute;
          bottom: 2px;
          left: 18px;
          color: #ffffff;
          font-size: 12px;
          font-weight: 400;

          transform: scale(0.9);
          transform-origin: left top;
        }
      }

      .setting-action {
        padding: 14px 0;
        border: $borderStyle;
        background-color: $bgColor;

        display: flex;
        justify-content: center;
        align-items: center;

        .setting-btn {
          font-size: 16px;
          font-weight: 400;
          color: #ffffff;
          margin: 0 5px;
          outline: none;
          cursor: pointer;
          line-height: 1;

          padding: 10px 15px;
          white-space: nowrap;
        }
        .btn-confirm {
          background-color: #097C76;
          border: 1px solid #097C76;
        }
        .btn-reset, .btn-cancel {
          background: transparent;
          border: 1px solid #ffffff;
        }
      }
    }

    .setting-mask {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.6);
    }
  }
</style>