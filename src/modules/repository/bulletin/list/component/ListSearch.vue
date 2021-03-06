<template>
  <div class="bulletin-list-search" ref="search">
    <div class="search-top">
      <button class="base-button search-new" @click="create();trackEventHandler('create')" v-if="infoEdit.VIP_INFO_NOTICE_CREATE && infoEdit.VIP_INFO_NOTICE_CREATE == 3">新建</button>
      
      <!-- 通知公告类型筛选 -->
      <div class="search-bottom">
        <el-select v-model="params.typeId" class="search-type" @change="search" @visible-change="showCascader" clearable>
          <el-option v-for="item in typeOptions" :key="item.id" :value="item.id" :label="item.name">
            <span style="float: left">{{ item.name }}（{{ item.count }}）</span>
            <span style="float: right" class="type-operating" v-if="infoEdit.VIP_INFO_NOTICE_CREATE && infoEdit.VIP_INFO_NOTICE_CREATE == 3">
              <i class="iconfont icon-bianji" style="font-size: 14px" @click.stop="editType(item)"></i>
              <i class="iconfont icon-qingkongshanchu" style="font-size: 14px" @click.stop="deleteType(item)"></i>
            </span>
          </el-option>
        </el-select>
      </div>
    </div>

    <!-- 关键词搜索框 -->
    <div class="search-input-container" ref="searchInput">
      <div class="list-top">符合搜索结果的共<span style="color: #FF7B00">{{total}}</span>条</div>
      <el-input 
        class="search-input"
        placeholder="输入关键词搜索" 
        v-model="params.keyword"
        @keyup.enter.native="search"
        v-trim:blur>
        <i slot="suffix" class="el-input__icon el-icon-search"></i>
      </el-input>
      <base-button type="primary" @event="search();trackEventHandler('search')" native-type="submit">
        搜索
      </base-button>
      <!-- <base-button type="ghost" @event="resetParams();trackEventHandler('reset')">
        重置
      </base-button> -->
    </div>
    
    <!-- 添加编辑分类 -->
    <base-modal
      class="type-modal"
      :title="title"
      width="500px"
      v-if="show"
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
  props: {
    total: {
      type: Number,
      default: null
    },
    infoEdit: { // 编辑权限
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      typeOptions: [], // 类型
      isSearch: false, // 搜索框显示标识
      params: {
        keyword: '',
        typeId: null,
      },
      info: {
        name: '',
        id: null
      },
      rules: {
        name: [
          { required: true, message: '请输入分类名称！', trigger: 'blur' },
          { max: 20, message: '标题不能超过20个字符！', trigger: 'blur' }
        ]
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

  methods: {
    // 获取分类一级树状结构，每次更新一次
    async getTypes () {
      return new Promise(async (resolve, reject) => {
        try {
          let res = await RepositoryApi.getBulletinTypes();
          if(res.success) {
            res.result.forEach(item => {
              item.count = 0;
            })

            this.typeOptions = res.result;
            this.getTypeCount();
            resolve();
          } else {
            this.$platform.notification({
              title: res.message,
              type: 'error',
            });
            reject();
          }
        } catch (err) {
          console.error(err);
        }
      })
    },

    // 获取分类下各级分类的文章数量，每次更新一次
    async getTypeCount () {
      return new Promise(async (resolve, reject) => {
        try {
          let res = await RepositoryApi.getBulletinTypesCount();
          if(res.success) {
            this.typeOptions.forEach(item => {
              res.result.forEach(info => {
                if(item.id == info.typeId) item.count = info.count;
              })
            })
            resolve();
          } else {
            this.$platform.notification({
              title: res.message,
              type: 'error',
            });
            reject();
          }
        } catch (err) {
          console.error(err);
        }
      })
    },

    // 跳转到新建页面
    create () {
      let fromId = window.frameElement.getAttribute('id');
      
      this.$platform.openTab({
        id: 'bulletin_create',
        title: '信息公告新建',
        url: '/info/notice/create/page',
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

    showCascader (flag) {
      if(!(this.infoEdit.VIP_INFO_NOTICE_CREATE && this.infoEdit.VIP_INFO_NOTICE_CREATE == 3)) return;
      let parent;
      if(this.typeOptions.length <= 0) {
        parent = document.getElementsByClassName('el-select-dropdown__empty')[0];
        if(flag) {
          let child = document.createElement('div');
          child.innerHTML = '新建分类';
          child.className = 'add-type-empty';
          child.id = 'type-id';
          parent.after(child)

          child.addEventListener('click', e => { // 打开新建分类
            let btn = document.getElementsByClassName('is-reverse')[0];

            btn.click();
            this.isEdit = false;
            this.show = true;
            this.info.name = '';
            this.info.id = null;
          });
        } else {
          document.getElementById('type-id').remove();
        }
        
      } else {
        parent = document.getElementsByClassName('el-scrollbar')[1];
       
        if(flag) {
          let child = document.createElement('div');
          child.innerHTML = '新建分类';
          child.className = 'add-type';
          child.id = 'type-id';

          parent.style.paddingBottom = '46px';

          parent.appendChild(child);

          child.addEventListener('click', e => { // 打开新建分类
            let btn = document.getElementsByClassName('is-reverse')[0];

            btn.click();
            this.isEdit = false;
            this.show = true;
            this.info.name = '';
            this.info.id = null;
          });

          // 获取分类文章数量
          // this.getTypesCount();

        } else {
          let child = document.getElementById('type-id')

          parent.removeChild(child);
        }
      }
    },

    // 输入关键词或选择条件时向父组件触发search事件
    search () {
      this.params.pageNum = 1;
      if(!this.params.typeId) this.params.typeId = null;
      this.$emit('search', this.params);
    },

    resetParams () {
      this.params.keyword = '';
      this.params.typeId = null;
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
      let btn = document.getElementsByClassName('is-reverse')[0];
      btn.click();
      try {
        if (!await this.$platform.confirm('确定删除该文章分类吗？')) return;
        let params = {
          typeId: info.id
        } 
        let res = await RepositoryApi.deleteBulletinType(params);
        
        if (res.success) {
          this.$platform.notification({
            title: '删除分类成功。',
            type: 'success',
          });

          await this.getTypes();
          await this.getTypeCount();
          let isEdit = false;
          this.typeOptions.forEach(item => {
            if(item.id == this.params.typeId) {
              isEdit = true;
            }
          })
          if(!isEdit) this.params.typeId = null;
          this.search();
        } else {
          this.$platform.notification({
            title: res.message,
            type: 'error',
          });
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
              this.$platform.notification({
                title: msg,
                type: 'success',
              });
              await this.getTypes();
              await this.getTypeCount();
              this.params.typeId = this.info.id;
              this.search();
            } else {
              this.$platform.notification({
                title: res.message,
                type: 'error',
              });
            }
            this.isEdit = false;
          }
        })
        
      } catch (err) {
        console.error(err)
      }
    },

    // TalkingData事件埋点
    trackEventHandler (type) {
      if (type === 'create') {
        window.TDAPP.onEvent('pc：信息公告列表-新建事件');
        return;
      }
      if (type === 'search') {
        window.TDAPP.onEvent('pc：信息公告列表-搜索事件');
        return;
      }
      if (type === 'reset') {
        window.TDAPP.onEvent('pc：信息公告列表-重置事件');
        return;
      }
    }
  }
}
</script>

<style lang="scss">
.bulletin-list-search {
  background: #fff;
  padding: 11px;
  display: flex;
  justify-content: space-between;
  
  .search-top {

    .search-new {
      margin-right: 5px;
    }
    

    .search-bottom {
      display: inline-block;
      font-size: 0;
      height: 34px;

      .search-type {
        // vertical-align: middle;
        width: 100%;
        height: 34px;

        .el-input__inner {
          height: 34px;
          line-height: 34px;
        }
      }

      
    }

  }

  .search-input-container {
    position: relative;

    .list-top {
      display: inline-block;
      height: 34px;
      line-height: 34px;
      padding: 0 5px;
      color: #909399;
    }

    .search-input {
      height: 34px;
      width: 150px;

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

.el-select-dropdown__item {
  & >.type-operating {
    display: inline-block;
    opacity: 0;
  }

  &:hover > .type-operating {
    display: inline-block;
    opacity: 1;
  }
}
.el-scrollbar {
  position: relative;

  .add-type {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    text-align: center;
    line-height: 40px;
    color: #38A6A6;

    cursor: pointer;

    &:hover {
      color: #38A6A6;
    }

  }
}

.icon-bianji {
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

.el-select-dropdown {
  .add-type-empty {
    height: 40;
    text-align: center;
    line-height: 40px;
    color: #38A6A6;
    border-top: 6px solid #eee;

    cursor: pointer;
  }
}
</style>
