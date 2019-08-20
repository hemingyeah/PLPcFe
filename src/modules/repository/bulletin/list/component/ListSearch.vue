<template>
  <div class="bulletin-list-search" ref="search">
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
    <!-- 通知公告类型筛选 -->
    <div class="search-bottom">
      <el-select v-model="params.type" class="search-type" @change="search">
        <el-option v-for="item in typeOptions" :key="item.id" :value="item.id" :label="item.name">
          <span style="float: left">{{ item.name }}（{{ item.count }}）</span>
          <span style="float: right" class="type-operating">
            <i class="iconfont icon-chuanjianbaogao" style="font-size: 14px" @click.stop="editType(item)"></i>
            <i class="iconfont icon-qingkongshanchu" style="font-size: 14px" @click.stop="deleteType(item)"></i>
          </span>
        </el-option>
        <div class="add-type" @click="addType">新建分类</div>
      </el-select>
    </div>
    <!-- 添加编辑分类 -->
    <base-modal
      class="type-modal"
      :title="title"
      width="500px"
      :show.sync="show">
      <el-form :model="info" :rules="rules" ref="ruleForm">
        <el-form-item label="分类名称" prop="name">
          <el-input class="title" v-model="info.name"></el-input>
        </el-form-item>
      </el-form>

      <div slot="footer" class="edit-footer">
        <button type="button" class="btn btn-primary" @click="sumbitType">确定</button>
      </div>
    </base-modal>
  </div>
</template>

<script>
import * as RepositoryApi from '@src/api/Repository'

export default {
  name: 'list-search',
  data () {
    return {
      typeOptions: [], // 类型
      isSearch: false, // 搜索框显示标识
      params: {
        keyword: '',
        type: '',
      },
      info: {
        name: '',
        id: null
      },
      rules: {
        name: [{
          required: true,
          message: '请输入分类名称',
          trigger: 'blur'
        }]
      },
      newType: '',
      show: false,
      isEdit: false,
    }
  },
  computed: {
    title () {
      return this.isEdit ? '编辑分类' : '新建分类';
    }
  },
  mounted () {
    this.getTypes();
  },

  methods: {
    // 获取分类一级树状结构，每次更新一次
    async getTypes () {
      try {
        let res = await RepositoryApi.getBulletinTypes();
        if(res.success) {
          res.result.forEach(item => {
            item.count = 0;
          })

          this.typeOptions = res.result;
          this.getTypeCount();
        } else {
          this.$platform.alert(res.message);
        }
      } catch (err) {
        console.error(err);
      }
    },

    // 获取分类下各级分类的文章数量，每次更新一次
    async getTypeCount () {
      try {
        let res = await RepositoryApi.getBulletinTypesCount();
        if(res.success) {
          this.typeOptions.forEach(item => {
            res.result.forEach(info => {
              if(item.id == info.typeId) item.count = info.count;
            })
          })
        } else {
          this.$platform.alert(res.message);
        }
      } catch (err) {
        console.error(err);
      }
    },

    // 跳转到新建页面
    create () {
      let fromId = window.frameElement.getAttribute('id');
      
      this.$platform.openTab({
        id: 'bulletin_create',
        title: '新建文档',
        url: '/bulletin/create',
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

    // 添加分类
    addType () {
      let btn = document.getElementsByClassName('is-reverse')[0];

      btn.click();
      this.isEdit = false;
      this.show = true;
      this.info.name = '';
      this.info.id = null;
    },

    // 编辑分类
    editType (info) {
      let btn = document.getElementsByClassName('is-reverse')[0];
      btn.click();

      this.isEdit = true;
      this.show = true;
      this.info.name = info.name;
      this.info.id = info.id;
    },

    // 删除分类
    async deleteType (info) {
      // let btn = document.getElementsByClassName('is-reverse')[0];
      // btn.click();
      try {
        if (!await this.$platform.confirm('确定删除该文章分类吗？')) return;
        let params = {
          typeId: info.id
        } 
        let res = await RepositoryApi.deleteBulletinType(params);
        
        if (res.success) {
          this.$platform.alert('删除分类成功');
          this.getTypes();
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
        this.$refs.ruleForm.validate(async (valid) => {
          if(valid) {
            this.show = false;
            let res;

            if(this.isEdit) {
              res = await RepositoryApi.updateBulletinType(this.info);

            } else {
              res = await RepositoryApi.addBulletinType(this.info);
            }

            if(res.success) {
              let msg = this.isEdit ? '编辑分类成功' : '添加分类成功';
              this.$platform.alert(msg);
              this.getTypes();
            } else {
              this.$platform.alert(res.message);
            }
            this.isEdit = false;
          }
        })
        
      } catch (err) {
        console.error(err)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.bulletin-list-search {
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

  .search-bottom {
    font-size: 0;
    padding-top: 11px;

    .search-type {
      vertical-align: middle;
      width: 100%;
    }
  }
}

.el-select-dropdown__item {
  & >.type-operating {
    display: none;
  }

  &:hover > .type-operating {
    display: inline-block;
  }
}
.el-select-dropdown__list {

  .add-type {
    height: 40px;
    line-height: 40px;
    text-align: center;
    border-top: 1px solid #D3DCE6;
    color: #38A6A6;
    cursor: pointer;

    &:hover {
      color: #38A6A6;
    }
  }
}

.icon-chuanjianbaogao {
  &:hover {
    color: #38A6A6;
  }
}

.icon-qingkongshanchu {
  &:hover {
    color: #38A6A6;
  }
}

.type-modal {
  .base-modal-body {

    .el-form-item {
      margin: 0;
      padding: 10px 30px 0;
    }

    .title {
      width: 360px;
    }

  }

  .edit-footer {
    display: flex;
    justify-content: flex-end;
  }
}
</style>