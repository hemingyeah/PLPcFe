<template>
  <div class="document-list-search" ref="search">
    <div class="search-left">
      <button class="base-button search-new" @click="create" v-if="infoEdit.INFO_EDIT && infoEdit.INFO_EDIT == 3">新建</button>

      <!-- 文档库类型筛选 -->
      <div class="search-middle">
        <!-- 视图删选 -->
        <el-select v-model="params.view" class="search-type search-type-left" @change="search" v-if="viewOptions.length > 0">
          <el-option v-for="item in viewOptions" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>

        <!-- 类别删选 -->
        <el-cascader 
          :options="typeOptions"
          class="search-type search-type-right"
          popper-class="search-cascader-panel"  
          clearable 
          @change="handleChange"
          @visible-change="showCascader"
          v-model="params.type"
          filterable>
          <template slot-scope="{ node, data }" class="type">
            <span v-if="data.label != '全部'">{{data.label}}（{{data.count}}）</span>
            <span v-else>{{data.label}}</span>
            <span class="type-operating" v-if="data.label != '全部'">
              <i class="iconfont icon-bianji icon-operating" @click.stop="editType(data)"></i>
              <i class="iconfont icon-qingkongshanchu icon-operating" @click.stop="deleteType(data)"></i>
            </span>
          </template>
        </el-cascader>
      </div>

      <!-- 文档库排序、标签 -->
      <div class="search-bottom">
        <el-select v-model="params.orderDetail.column" class="search-sort" @change="search">
          <el-option value="updatetime" label="按更新时间排序"></el-option>
          <el-option value="readTimes" label="按访问量排序"></el-option>
        </el-select>

        <el-tag class="search-tag" closable @close="closeTag" v-if="tag.show">{{tag.name}}</el-tag>
      </div>
    </div>
    
    
    <!-- 关键词搜索框 -->
    <div class="search-input-container" ref="searchInput">
      <div class="list-top" v-if="total && total > 0">符合搜索结果的共<span style="color: #FF7B00">{{total}}</span>条</div>

      <el-input 
        class="search-input"
        placeholder="输入关键词搜索" 
        v-model="params.keyword"
        @keyup.enter.native="search">
        <i slot="suffix" class="el-input__icon el-icon-search"></i>
      </el-input>

      <base-button type="primary" @event="search()" native-type="submit">
        搜索
      </base-button>
      <base-button type="ghost" @event="resetParams">
        重置
      </base-button>
      <!-- v-if="isSearch" -->
      <!-- <button class="search-btn" @click="toSearch" v-else>
        <i class="iconfont icon-search1 serach-icon"></i>
      </button> -->
    </div>
    
    <!-- 分类编辑、添加 -->
    <type-modal v-model="info" :title="title" @sumbitType="sumbitType" ref="typeModal"></type-modal>
    
  </div>
</template>

<script>
import TypeModal from './TypeModal'
import * as RepositoryApi from '@src/api/Repository'

export default {
  name: 'list-search',
  props: {
    tag: { // 标签
      type: Object,
      default: () => ({})
    },
    total: { // 搜索数量
      type: Number,
      default: null
    },
    infoEdit: { // 编辑权限
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
      isEdit: false, // 是否编辑分类
      isSearch: false, // 搜索框显示标识
      params: { // 参数对象
        keyword: '',
        type: [],
        orderDetail: {
          isSystem: 1,
          column: 'updatetime',
          type: '',
          sequence: 'desc'
        },
        view: '',
      },
      // params: this.value,
      info: { // 新建、编辑type对象
        name: '',
        parentId: null,
        options: [],
        title: null
      },
      viewOptions: this.initView(), // 视图
      typeOptions: [], // 类别
    }
  },

  computed: {
    title () {
      return this.isEdit ? '编辑分类' : '新建分类';
    }
  },

  mounted () {   
    this.initView();
    this.getTypes();
  },

  methods: {
    // 初始化viewOptions对象，包括数量，每次更新一次
    async initView () {
      try {
        let options = [{
          value: '',
          label: ''
        }, {
          value: 'my',
          label: ''
        }, {
          value: 'draft',
          label: ''
        }];
        let res = await RepositoryApi.getDocumentViewCount();

        if(res.success) {
          options.forEach(item => {
            if(item.value == '') item.label = `全部（${ res.result.all }）`;
            if(item.value == 'my') item.label = `我发布的（${ res.result.my }）`;
            if(item.value == 'draft') item.label = `草稿箱（${ res.result.draft }）`;
          })
        }
        this.viewOptions = options;
        return options;
      } catch (err) {
        console.error(err)
      }
    },

    // 获取分类二级树状结构，每次更新一次
    async getTypes () {
      try {
        let res = await RepositoryApi.getDocumentTypes();
        if(res.success) {
          res.result.forEach(item => {
            item.value = item.id;
            item.label = item.name;
            item.children = item.subTypes;
            item.count = 0;

            item.children.forEach(childItem => {
              childItem.value = childItem.id;
              childItem.label = childItem.name;
              childItem.count = 0;
            })
            
            item.children.unshift({
              label: '全部',
              value: item.id
            })
          })
          this.typeOptions = res.result;
          this.info.options = this.typeOptions;
        } else {
          this.$platform.alert(res.message);
        }
      } catch (err) {
        console.error(err);
      }
    },

    // 获取分类下各级分类的文章数量，每次点击下拉框时更新
    // TODO: 检查
    async getTypesCount () {
      try {
        let params = {
          view: this.params.view
        }
        let res = await RepositoryApi.getTypesCount(params);
        this.typeOptions.forEach(parent => {
          res.result.forEach(info => {
            if(parent.id == info.typeId) parent.count = info.count
          })

          parent.children.forEach(child => {
            res.result.forEach(info => {
              if(child.id == info.typeId) child.count = info.count;
            })
          })
        })
      } catch (err) {
        console.error(err)
      }
    },

    // 展开下拉面板时添加新建按钮，并监听click事件，关闭时移除新建按钮
    showCascader (flag) {
      let parent = document.getElementsByClassName('el-cascader-panel')[0];
       

      if(flag) {
        let child = document.createElement('div');
        child.innerHTML = '新建分类';
        child.className = 'type';
        child.id = 'type-id';

        parent.style.paddingBottom = '40px';
        parent.style.maxHeight = '350px';
        parent.style.minHeight = '90px';

        parent.appendChild(child);

        child.addEventListener('click', e => { // 打开新建分类
          let btn = document.getElementsByClassName('is-reverse')[0];

          btn.click();
          this.$refs.typeModal.open();
          this.isEdit = false;
          this.info.name = '';
          this.info.parentId = '';
          this.info.id = null;
        });

        // 获取分类文章数量
        this.getTypesCount();

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
        url: '/wiki/create/page',
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

    resetParams () {
      this.params.keyword = '';
      this.params.view = '';
      this.params.typeIds = [];
      this.params.type = [];
      this.params.orderDetail = { // 排序
        isSystem: 1,
        column: 'updatetime',
        type: '',
        sequence: 'desc'
      };
      this.$emit('search', this.params);
    },

    // 所选类型改变时为params.typeIds赋值
    handleChange (value) {
      if (value.length > 0) {
        this.params.typeIds = [value[1]];
      } else {
        this.params.typeIds = [];
      }
      this.search();
    },

    // 搜索框的显示隐藏，点击放大镜显示，在没有内同时点击其他空白区域隐藏
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
      this.info.name = info.name;
      this.info.id = info.id;
      this.info.parentId = info.parentId;
      this.info.options = this.typeOptions;
      this.info.title = info.title;
    },

    // 删除分类
    async deleteType (info) {
      // let btn = document.getElementsByClassName('is-reverse')[0];
      // btn.click();
      try {
        let params = {
          typeId: info.id
        } 
        let res = await RepositoryApi.deleteDocumentType(params);
        
        if (res.success) {
          const result = await this.$platform.alert('删除分类成功');
          if (!result) return;
          window.location.reload();
        } else {
          this.$platform.alert(res.message);
        }
      } catch (e) {
        console.error(e);
      }
    },

    // 提交编辑或添加的分类
    async sumbitType () {
      try {
        if(this.info.name.length > 20) {
          this.$platform.alert('分类名称不能超过20字');
          return;
        }
        let res;
        if(this.isEdit) {
          res = await RepositoryApi.updateDocumentType(this.info);

        } else {
          res = await RepositoryApi.addDocumentType(this.info);
        }

        if(res.success) {
          let msg = this.isEdit ? '编辑分类成功' : '添加分类成功';
          const result = await this.$platform.alert(msg);
          if (!result) return;
          window.location.reload();
        } else {
          this.$platform.alert(res.message);
        }
        this.isEdit = false;
      } catch (err) {
        console.error(err)
      }
    },

    // 标签改变时向父组件触发search事件
    setTag () {
      this.params.label = this.tag.show ? this.tag.name : '';
      this.search();
    },

    closeTag () {
      this.tag.show = false;
      this.params.label = this.tag.show ? this.tag.name : '';
      this.search();
    }
  }
}
</script>

<style lang="scss">
.document-list-search {
  background: #fff;
  padding: 11px;
  display: flex;
  justify-content: space-between;
  
  .search-left {

    .search-new {
      margin-right: 10px;
    }

    .search-middle {
      display: inline-block;
      height: 34px;
      border: 1px solid #e0e1e2;
      border-radius: 2px;
      box-sizing: border-box;
      font-size: 0;

      .search-type {
        height: 32px;

        .el-input__inner {
          border: none;
        }
      }

      .search-type-left {
        position: relative;
        width: 140px;

        .el-input__inner {
          border-right: none;
          border-radius: 2px 0 0 2px;
        }

        &::after {
          content: "";

          position: absolute;
          top: 0;
          right: 0;
          width: 1px;
          height: 32px;
          background: #e0e1e2;
        }
      }

      .search-type-right {
        width: 190px;

        .el-input__inner {
          border-radius: 0 2px 2px 0;
        }
      }
    }

    .search-bottom {
      display: inline-block;
      margin-left: 10px;

      .search-sort {
        vertical-align: middle;

        .el-input__inner {
          height: 34px;
          border: none;
          background: #E8EFF0;
          width: 140px;
          color: #717C83 !important;
        }

        .el-input__icon {
          line-height: 34px;
        }
      }

      .search-tag {
        vertical-align: middle;

        max-width: 190px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;

        margin-left: 5px;
        height: 34px;
        line-height: 34px;
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

  .search-input-container {
    position: relative;
    flex: 1;
    text-align: right;
    
    .list-top {
      display: inline-block;
      height: 34px;
      line-height: 34px;
      padding: 0 11px;
      color: #909399;
    }

    .search-input {
      height: 34px;
      width: 200px;

      .el-input__inner {
        height: 100%;
      }
    }

    .base-button {
      margin-left: 5px;
    }

    .search-btn {
      margin: 0;
      border: 1px solid #E3E9EA;  //自定义边框
      outline: none;    //消除默认点击蓝色边框效果
      height: 34px;
      width: 34px;
      line-height: 30px;
      border-radius: 2px;

      .serach-icon {
        font-size: 18px;
        color: #55B7B4;
      }
    }
  }

}

.el-cascader-node__label {
  display: flex;
  justify-content: space-between;
  
  & >.type-operating {
    // display: none;
    display: inline-block;
    opacity: 0;
  }

  &:hover > .type-operating {
    display: inline-block;
    opacity: 1;
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