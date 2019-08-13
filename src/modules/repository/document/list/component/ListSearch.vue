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
        :options="options"
        class="search-type search-type-right"
        popper-class="search-cascader-panel"  
        clearable 
        @change="search"
        @visible-change="showCascader"
        @click="click"
        filterable>
        <template slot-scope="{ node, data }" class="type">
          <span>{{data.label}}</span>
          <span class="type-operating">
            <i class="iconfont icon-chuanjianbaogao icon-operating" @click.stop="editType(data)"></i>
            <i class="iconfont icon-qingkongshanchu icon-operating" @click.stop="deleteType(data)"></i>
          </span>
        </template>
      </el-cascader>
    </div>
    <!-- 文档库排序、标签 -->
    <div class="search-bottom">
      <el-select v-model="params.sort" class="search-sort" @change="search">
        <el-option value="1" label="按更新时间排序"></el-option>
        <el-option value="2" label="按访问量排序"></el-option>
      </el-select>
      <el-tag class="search-tag" closable @close="tag.show = false" v-if="tag.show">{{tag.name}}</el-tag>
    </div>
    
    <type-modal v-model="info" :title="title" @sumbitType="sumbitType" ref="typeModal"></type-modal>

  </div>
</template>

<script>
import TypeModal from './TypeModal'

export default {
  name: 'list-search',
  props: {
    tag: {
      type: Object,
      default: () => ({})
    }
  },
  components: {
    [TypeModal.name]: TypeModal
  },
  data () {
    return {
      show: false,
      isEdit: false,
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
        }, {
          value: 'daohang',
          label: '导航',
        }]
      }, {
        value: 'zujian',
        label: '组件',
        children: [{
          value: 'basic',
          label: 'Basic',
        }, {
          value: 'form',
          label: 'Form',
        }, {
          value: 'data',
          label: 'Data',
        }, {
          value: 'notice',
          label: 'Notice',
        }, {
          value: 'navigation',
          label: 'Navigation',
        }, {
          value: 'others',
          label: 'Others',
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
      }],
      info: {
        newType: '',
        parentType: '',
        options: []
      },
    }
  },
  computed: {
    title () {
      return this.isEdit ? '编辑分类' : '新建分类';
    }
  },
  mounted () {
    this.info.options = this.options;
    let tag = document.getElementsByClassName('el-cascader-panel');
    tag[0].id = 'search-id';
    tag[1].id = 'add-type-id';
  },
  methods: {
    click () {
      console.log(5555)
    },
    // 展开下拉面板时添加新建按钮，并监听click事件，关闭时移除新建按钮
    showCascader (flag) {
      if(this.options.length <= 0) return;
      let parent = document.getElementById('search-id');
      // console.log(document.getElementsByClassName('el-cascader-panel'))
       

      if(flag) {
        let child = document.createElement('div');
        child.innerHTML = '新建分类';
        child.className = 'type';
        child.id = 'type-id';

        parent.style.paddingBottom = '40px';

        parent.appendChild(child);

        child.addEventListener('click', e => { // 打开新建分类
          let btn = document.getElementsByClassName('is-reverse')[0];

          btn.click();
          this.$refs.typeModal.open();
          this.isEdit = false;
          this.info.newType = '';
          this.info.parentType = '';
        });

      } else {
        let child = document.getElementById('type-id')

        parent.removeChild(child);
      }
      
    },
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
    },
    // 打开编辑分类
    editType (info) {
      let btn = document.getElementsByClassName('is-reverse')[0];

      btn.click();
      this.$refs.typeModal.open();
      this.isEdit = true;
      this.info.newType = info.label;
      this.info.parentType = '哈哈哈';
    },
    // 删除分类
    deleteType (info) {
      console.log(info)
    },
    // 提交编辑或添加的分类
    sumbitType () {
      console.log(this.info);
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

  .auxiliary {
    // display: none;
  }
}

.el-cascader-node__label {
  display: flex;
  justify-content: space-between;
  
  & >.type-operating {
    display: none;
  }

  &:hover > .type-operating {
    display: inline-block;
  }

  .type-operating {

    .icon-operating {
      font-size: 14px;

      &:hover {
        color: #38A6A6;
      }
    }
    
  }
}

.el-cascader-panel {
  position: relative;

  .type {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    text-align: center;
    line-height: 40px;
    color: #38A6A6;

    cursor: pointer;
  }
}
</style>