<template>
  <div class="document-list-search" ref="search">
    <div class="search-top">
      <button class="base-button search-new" @click="create">新建</button>
      <!-- 关键词搜索框 -->
      <div class="search-input-container" ref="searchInput">
        <el-input 
          class="search-input"
          placeholder="输入关键词搜索" 
          v-model="params.keyword"
          @keyup.enter.native="search"
          v-if="isSearch"
          clearable>
          <i slot="suffix" class="el-input__icon el-icon-search"></i>
        </el-input>
        <button class="search-btn" @click="toSearch" v-else>
          <i class="iconfont icon-search1 serach-icon"></i>
        </button>
      </div>
    </div>
    <!-- 文档库类型筛选 -->
    <div class="search-middle">
      <el-select v-model="params.type" class="search-type search-type-left" @change="search">
        <el-option value="" label="全部(1312)"></el-option>
        <el-option value="1" label="我发布的(1312)"></el-option>
        <el-option value="2" label="草稿箱(1312)"></el-option>
      </el-select>
      <el-cascader 
        @click.stop="haha" 
        :options="options" 
        clearable 
        class="search-type search-type-right" 
        @change="search"
        filterable></el-cascader>
    </div>
    <!-- 文档库排序、标签 -->
    <div class="search-bottom">
      <el-select v-model="params.sort" class="search-sort" @change="search">
        <el-option value="1" label="按更新时间排序"></el-option>
        <el-option value="2" label="按访问量排序"></el-option>
      </el-select>
      <el-tag class="search-tag" closable @close="tag.show = false" v-if="tag.show">{{tag.name}}</el-tag>
    </div>
  </div>
</template>

<script>
export default {
  name: 'list-search',
  props: {
    tag: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      isSearch: false, // 搜索框显示标识
      params: {
        keyword: '',
        type: '',
        sort: '1',
      },
      options: [{ // 类型
        value: 'zhinan',
        label: '指南',
        children: [{
          value: 'shejiyuanze',
          label: '设计原则',
          children: [{
            value: 'yizhi',
            label: '一致'
          }, {
            value: 'fankui',
            label: '反馈'
          }, {
            value: 'xiaolv',
            label: '效率'
          }, {
            value: 'kekong',
            label: '可控'
          }]
        }, {
          value: 'daohang',
          label: '导航',
          children: [{
            value: 'cexiangdaohang',
            label: '侧向导航'
          }, {
            value: 'dingbudaohang',
            label: '顶部导航'
          }]
        }]
      }, {
        value: 'zujian',
        label: '组件',
        children: [{
          value: 'basic',
          label: 'Basic',
          children: [{
            value: 'layout',
            label: 'Layout 布局'
          }, {
            value: 'color',
            label: 'Color 色彩'
          }, {
            value: 'typography',
            label: 'Typography 字体'
          }, {
            value: 'icon',
            label: 'Icon 图标'
          }, {
            value: 'button',
            label: 'Button 按钮'
          }]
        }, {
          value: 'form',
          label: 'Form',
          children: [{
            value: 'radio',
            label: 'Radio 单选框'
          }, {
            value: 'checkbox',
            label: 'Checkbox 多选框'
          }, {
            value: 'input',
            label: 'Input 输入框'
          }, {
            value: 'input-number',
            label: 'InputNumber 计数器'
          }, {
            value: 'select',
            label: 'Select 选择器'
          }, {
            value: 'cascader',
            label: 'Cascader 级联选择器'
          }, {
            value: 'switch',
            label: 'Switch 开关'
          }, {
            value: 'slider',
            label: 'Slider 滑块'
          }, {
            value: 'time-picker',
            label: 'TimePicker 时间选择器'
          }, {
            value: 'date-picker',
            label: 'DatePicker 日期选择器'
          }, {
            value: 'datetime-picker',
            label: 'DateTimePicker 日期时间选择器'
          }, {
            value: 'upload',
            label: 'Upload 上传'
          }, {
            value: 'rate',
            label: 'Rate 评分'
          }, {
            value: 'form',
            label: 'Form 表单'
          }]
        }, {
          value: 'data',
          label: 'Data',
          children: [{
            value: 'table',
            label: 'Table 表格'
          }, {
            value: 'tag',
            label: 'Tag 标签'
          }, {
            value: 'progress',
            label: 'Progress 进度条'
          }, {
            value: 'tree',
            label: 'Tree 树形控件'
          }, {
            value: 'pagination',
            label: 'Pagination 分页'
          }, {
            value: 'badge',
            label: 'Badge 标记'
          }]
        }, {
          value: 'notice',
          label: 'Notice',
          children: [{
            value: 'alert',
            label: 'Alert 警告'
          }, {
            value: 'loading',
            label: 'Loading 加载'
          }, {
            value: 'message',
            label: 'Message 消息提示'
          }, {
            value: 'message-box',
            label: 'MessageBox 弹框'
          }, {
            value: 'notification',
            label: 'Notification 通知'
          }]
        }, {
          value: 'navigation',
          label: 'Navigation',
          children: [{
            value: 'menu',
            label: 'NavMenu 导航菜单'
          }, {
            value: 'tabs',
            label: 'Tabs 标签页'
          }, {
            value: 'breadcrumb',
            label: 'Breadcrumb 面包屑'
          }, {
            value: 'dropdown',
            label: 'Dropdown 下拉菜单'
          }, {
            value: 'steps',
            label: 'Steps 步骤条'
          }]
        }, {
          value: 'others',
          label: 'Others',
          children: [{
            value: 'dialog',
            label: 'Dialog 对话框'
          }, {
            value: 'tooltip',
            label: 'Tooltip 文字提示'
          }, {
            value: 'popover',
            label: 'Popover 弹出框'
          }, {
            value: 'card',
            label: 'Card 卡片'
          }, {
            value: 'carousel',
            label: 'Carousel 走马灯'
          }, {
            value: 'collapse',
            label: 'Collapse 折叠面板'
          }]
        }]
      }, {
        value: 'ziyuan',
        label: '资源',
        children: [{
          value: 'axure',
          label: 'Axure Components'
        }, {
          value: 'sketch',
          label: 'Sketch Templates'
        }, {
          value: 'jiaohu',
          label: '组件交互文档'
        }]
      }]
    }
  },
  methods: {
    // 跳转到新建页面
    create () {
      let fromId = window.frameElement.getAttribute('id');
      
      this.$platform.openTab({
        id: 'wiki_create',
        title: '新建文档',
        url: '/document/create',
        reload: true,
        close: true,
        fromId
      });
    },
    // 显示搜索框
    toSearch () {
      this.isSearch = true;
      this.toggleInput();
    },
    // 输入关键词或选择条件时向父组件触发search事件
    search () {
      this.$emit('search', this.params);
    },
    toggleInput () {
      if (this.isSearch) {
        document.addEventListener('click', (e) => {
          if(!this.$refs.searchInput || !this.$refs.search) return;
          if (this.params.keyword) return;
          if(!this.$refs.searchInput.contains(e.target) && this.$refs.search.contains(e.target)) {
            this.isSearch = false;
          }
        })
      } else {
        document.removeEventListener('click', (e) => {
          console.log('取消')
        })
      }
    }
  },
  watch: {
    // 标签改变时向父组件触发search事件
    'tag': {
      handler(newValue, oldValue) {
        this.search();
      },
      deep: true,
    }
  }
}
</script>

<style lang="scss">
.document-list-search {
  background: #fff;
  padding: 11px;
  
  .search-top {
    display: flex;
    justify-content: space-between;

    .search-input-container {
      position: relative;

      .search-input {
        height: 36px;
        width: 250px;
        // position: absolute;
        // right: 36px;
        // vertical-align: middle;

        .el-input__inner {
          height: 100%;
        }
      }

      .search-btn {
        // vertical-align: middle;
        margin: 0;
        border: 1px solid #E3E9EA;  //自定义边框
        outline: none;    //消除默认点击蓝色边框效果
        height: 36px;
        width: 36px;
        line-height: 30px;
        border-radius: 2px;

        .serach-icon {
          font-size: 18px;
          color: #55B7B4;
        }
      }
    }
  }

  .search-middle {
    padding: 11px 0;
    display: flex;

    .search-type {
      height: 36px;

      .el-cascader .el-input.is-focus .el-input__inner {
        border-color: #e0e1e2;
      }

      .el-input__inner:focus {
        border-color: #e0e1e2;
      }

      .el-input__inner:hover {
        border-color: #e0e1e2;
      }
    }

    .search-type-left {
      width: 140px;

      .el-input__inner {
        border-right: none;
        border-radius: 2px 0 0 2px;
      }
    }

    .search-type-right {
      flex: 1;

      .el-input__inner {
        border-radius: 0 2px 2px 0;
      }
    }
  }

  .search-bottom {
    font-size: 0;

    .search-sort {
      vertical-align: middle;

      .el-input__inner {
        height: 24px;
        border: none;
        background: #E8EFF0;
        width: 140px;
        color: #717C83 !important;
      }

      .el-input__icon {
        line-height: 24px;
      }
    }

    .search-tag {
      vertical-align: middle;
      margin-left: 5px;
      height: 24px;
      line-height: 24px;
      border: none;
      background: #E8EFF0;
      border-radius: 2px;
      color: #717C83;

      .el-icon-close {
        color: #333;

        &:hover {
          background: #999;
          color: #fff;
        }
      }
    }
  }
}
</style>