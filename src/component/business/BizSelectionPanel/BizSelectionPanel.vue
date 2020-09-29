<template>
  <base-panel class="selection-panel" :show.sync="multipleSelectionPanelShow" width="420px">

    <!-- start title -->
    <h3 slot="title">
      <span>已选中{{ title }}({{ value.length }})</span>
      <i
        v-if="value.length"
        class="iconfont icon-qingkongshanchu selection-panel-btn"
        data-placement="right" 
        title="清空已选中数据" 
        v-tooltip
        @click="clear"
      >
      </i>
    </h3>
    <!-- end title -->

    <!-- start list -->
    <div class="selection-selected-panel">
      <div class="selection-selected-tip" v-if="!value.length">
        <img :src="noDataImage">
        <p>暂无选中的数据，请从列表中选择。</p>
      </div>
      <template v-else>
        <div class="selection-selected-list">
          <div class="selection-selected-row selection-selected-head">
            <span :class="column.key" v-for="column in columns" :key="column.key">
              {{ column.text }}
            </span>
          </div>
          
          <!-- TODO: slot -->
          <div class="selection-selected-row" v-for="item in value" :key="item.id" >
            <span :class="column.key" v-for="column in columns" :key="column.key">
              {{ item[column.key] }}
            </span>
            <button type="button" class="selection-selected-delete" @click="removeFromSelection(item)">
              <i class="iconfont icon-fe-close"></i>
            </button>
          </div>

        </div>
      </template>
    </div>
    <!-- end list -->

  </base-panel>
</template>

<script>
/* compoents */
import BasePanel from '@src/component/common/BasePanel'

import NoDataImage from '@src/assets/img/no-data.png'

export default {
  name: 'biz-selection-panel',
  props: {
    columns: {
      type: Array,
      default: () => []
    },
    title: {
      type: String,
      default: ''
    },
    value: {
      type: Array,
      default: () => []
    },
  },
  data() {
    return {
      multipleSelectionPanelShow: false,
      noDataImage: NoDataImage,
    }
  },
  methods: {
    clear() {
      this.$emit('clear');
    },
    open() {
      this.multipleSelectionPanelShow = true;
    },
    removeFromSelection(selectItem) {
      if(!selectItem || !selectItem.id) return 

      let selection = this.value.filter(ms => ms.id !== selectItem.id);
      
      this.$emit('remove', { selection, item: selectItem });
      this.$emit('input', selection);
    },
  },
  components: {
    [BasePanel.name]: BasePanel
  }
}
</script>

<style lang="scss">
.selection-panel {
  font-size: $font-size-base;

  .selection-selected-list {
    height: 100%;
    padding: 10px;
    overflow-y: auto;
  }

  .selection-selected-row{
    border-bottom: 1px solid #ebeef5;

    display: flex;
    flex-flow: row nowrap;

    line-height: 36px;
  }

  .selection-selected-head{
    background-color: #F0F5F5;
    color: #333;
    font-size: $font-size-base;
  }

  .base-panel-title {
    h3 {
      display: flex;
      justify-content: space-between;
    }
    .selection-panel-btn {
      cursor: pointer;
      &:hover {
        color: $color-primary;
      }
    }
  }

}

.selection-selected-row {
  .taskNo {
    flex: 1;
    padding-left: 10px;
  }

  .selection-selected-delete {
    border: none;
    background-color: transparent;
    color: #646B78;
    outline: none;

    height: 36px;
    width: 36px;
    padding: 0;
  }
}

.selection-selected-panel {
  .selection-selected-tip {
    padding-top: 80px;
    img {
      display: block;
      margin: 0 auto;
      width: 240px;
    }
    p {
      color: #9a9a9a;
      line-height: 20px;
      text-align: center;
      
      margin: 30px 0 0 0;
    }
  }
}
</style>