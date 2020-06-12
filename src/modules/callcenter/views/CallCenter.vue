<template>
  <div class="call-center-setting">
    <div class="container">
      <div class="left-menu">
        <div class="menu-title">呼叫中心设置</div>
        <nav :class="`menu-list ${current == index ? 'menu-checked' : ''}`" v-for="(item,index) in menuList" :key="index" @click="changePage(index)">
          <div class="icon-box">
            <i :class="`iconfont ${item.icon} ${current == index ? 'font-size-16 font-w-600' : 'font-size-14'}`"></i>
          </div>
          <span>{{item.name}}</span>
        </nav>
      </div>
      <div class="main">
        <template v-if="current == 0">
          <div class="service-line">
            <p>欢迎使用售后宝呼叫中心</p>
            <div class="info">
              <div class="info-item">
                <i class="iconfont icon-duanxin3"></i>
                <div class="item-content">
                  <p>呼叫中心号码：</p>
                  <span>{{AccountInfo.hotLine}}</span>
                  <p>外呼号码：</p>
                  <span>{{AccountInfo.displayPhone}}</span>
                </div>
              </div>
              <div class="info-item">
                <i class="iconfont icon-duanxin3"></i>
                <div class="item-content">
                  <p>坐席：</p>
                  <span style="display:inline-block;">{{AccountInfo.agentNum}}</span>
                  <el-tooltip content="已配置坐席数/购买坐席数">
                    <i class="iconfont icon-info" style="color: #b9bfbd;margin-left: 10px;"></i>
                  </el-tooltip>
                </div>
              </div>
              <div class="info-item">
                <i class="iconfont icon-duanxin3"></i>
                <div class="item-content">
                  <p>到期时间：</p>
                  <span>{{AccountInfo.endTime}}</span>
                </div>
              </div>
              <div class="info-item">
                <i class="iconfont icon-duanxin3"></i>
                <div class="item-content">
                  <p>话费余额：</p>
                  <span class="money">{{AccountInfo.cost}}</span>
                </div>
              </div>
            </div>
          </div>
        </template>
        <template v-else-if="current == 1">
          <!-- start 表格 -->
          <div class="table-container">
            <div class="operation-bar-container">
              <form-item label="添加成员">
                <form-user :field="field" v-model="selectUsers" :max="maxNum"/>
              </form-item>
            </div>
            <el-table :data="userList" style="width: 100%" stripe header-row-class-name="callcenter-table-header" ref="usersTable" class="callcenter-table">
              <el-table-column prop="agentName" label="坐席"></el-table-column>
              <el-table-column label="坐席电话">
                <template slot-scope="scope">
                  <el-input v-if="scope.row.verifyStatus == 0" v-model="scope.row.phone" placeholder="请输入坐席电话"></el-input>
                  <span v-else>{{scope.row.phone}}</span>
                </template>
              </el-table-column>
              <el-table-column label="状态">
                <template slot-scope="scope">
                  {{fmt_user_state(scope.row.verifyStatus)}}
                </template>
              </el-table-column>
              <el-table-column label="上线">
                <template slot-scope="scope">
                  <el-switch v-model="scope.row.status" @change="statusChange(scope.row,$event)">
                  </el-switch>
                </template>
              </el-table-column>
              <el-table-column label="操作">
                <template slot-scope="scope">
                  <el-button type="text" :disabled="scope.row.verifyStatus!=0" @click="submit(scope.row,'present')">提交</el-button>
                  <el-button type="text" :disabled="scope.row.verifyStatus==1" @click="del(scope.row,scope.$index,'present')">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <!-- end 表格 -->
        </template>
        <template v-else-if="current == 2">
          <div class="query-type-manage">
            <div class="header">
              <p>咨询分类管理</p>
              <base-button type="primary" @event="edit">添加咨询分类</base-button>
            </div>
          
            <tree-table class="treeTable" :data="categoryList" :columns="columns" :selection-type="false" :expand-type="false" border :show-row-hover="false">
              <template slot="opt" slot-scope="scope">
                <el-button type="primary" @click="edit(scope.row,'category')">编辑</el-button>
                <el-button type="danger" @click="del(scope.row,scope.$index,'category')">删除</el-button>
              </template>
            </tree-table>

            <!-- <el-table :data="categoryList" style="width: 100%;margin-bottom: 20px;" row-key="id" border
                      :tree-props="{children: 'children', hasChildren: 'hasChildren'}">
              <el-table-column prop="name" label="分类名称"></el-table-column>
              <el-table-column label="操作">
                <template slot-scope="scope">
                  <el-button type="text" @click="edit(scope.row,'category')">编辑</el-button>
                  <el-button type="text" @click="del(scope.row,scope.$index,'category')">删除</el-button>
                </template>
              </el-table-column>
            </el-table> -->

          </div>
        </template>
      </div>
    </div>

    <!-- 添加咨询分类的对话框 -->
    <el-dialog :title="title" :visible.sync="categoryDialogVisible" width="30%" @close="categoryDialogClosed">
      <!-- 内容主体区域 -->
      <el-form :model="categoryForm" :rules="categoryFormRules" ref="categoryFormRef" label-width="100px" label-position="left">
        <el-form-item label-width="100px" label="分类名称" prop="name">
          <el-input v-model="categoryForm.name"></el-input>
        </el-form-item>

        <el-form-item label="父级分类">
          <el-cascader style="width:100%;" expand-trigger="hover" :options="categoryList" :props="cascaderProps" v-model="selectedKeys" @change="parentCateChanged" clearable change-on-select>
          </el-cascader>
        </el-form-item>
       
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="categoryDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCategory">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  name: 'call-center',
  props: {
    initData: {
      type: Object,
      default: () => ({})
    },
    AccountInfo: {
      type: Object,
      default: () => ({})
    },
  },
  computed: {
    title() {
      return this.categoryId ? '编辑咨询分类' : '添加咨询分类' 
    }
  },
  data() {
    return {
      field: {
        displayName: '成员',
        fieldName: 'user',
        formType: 'user'
      },
      selectUsers: [],
      maxNum: 1,
      menuList: [
        {
          name: '客服热线',
          icon: 'icon-Gateway'
        },
        {
          name: '坐席设置',
          icon: 'icon-weixin2'
        },
        {
          name: '工作台设置',
          icon: 'icon-duanxin3'
        }
      ],
      current: 0,
      userList: [],
      categoryList: [],
      columns: [{
        label: '分类名称',
        prop: 'name'
      },
      {
        label: '操作',
        type: 'template',
        template: 'opt'
      }],
      categoryId:'',
      categoryDialogVisible: false,
      categoryForm: {
        name: '',
        parentId: ''
      },
      categoryFormRules: {
        name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
      },
      cascaderProps: {
        value: 'id',
        label: 'name',
        children: 'children'
      },
      selectedKeys: []
    }
  },
  mounted () {
    this.getAgentList()
    this.getCategoryList()
  },
  methods: {
    // 坐席状态
    fmt_user_state(value) {
      let state = ''
      switch (value) {
      case 0:
        state = '未提交';
        break;
      case 1:
        state = '审核中';
        break;
      case 2:
        state = '审核通过';
        break;
      case -1:
        state = '审核未通过';
        break;
      default:
        break;
      }
      return state
    },
    // 获取坐席列表
    async getAgentList(){
      try {
        const {code, message, result} = await this.$http.get('/outside/callcenter/api/getAgentList')
        if (code !== 0) return this.$message.error(message || '内部错误')
        this.userList = result || []
      } catch (error) {
        console.error(error);
      }
    },
    // 获取咨询分类列表
    async getCategoryList(){
      try {
        const {code, message, result} = await this.$http.get('/outside/callcenter/api/getZxSortList')
        if (code !== 0) return this.$message.error(message || '内部错误')
        this.categoryList = result || []
        console.info('this.categoryList:', this.categoryList);
      } catch (error) {
        console.error(error);
      }
    },
    // 坐席上线下线
    async statusChange(item, status) {
      console.info('item:', item, status);
      try {
        const { code, message } = await this.$http.post('/outside/callcenter/api/updateStatus', {id:item.id, status:status ? 1 : 0}, false)
        if (code !== 0) return this.$platform.notification({
          title: '操作失败',
          message: message || '',
          type: 'error',
        });
        this.$platform.notification({
          title: '操作成功',
          type: 'success',
        });  
      } catch (error) {
        console.error(error);
      }
    },
    // 切换设置页
    changePage(index) {
      if (this.current == index) {
        return
      }
      this.current = index      
    },
    // 坐席修改提交
    async submit(item, type) {
      try {
        const { status, message } = await this.$http.post('/outside/callcenter/api/updateAgent', {id:item.id, phone:item.phone}, false)
        if (status !== 0) return this.$platform.notification({
          title: '提交失败',
          message: message || '',
          type: 'error',
        });
        this.$platform.notification({
          title: '提交成功',
          type: 'success',
        });  
        this.getAgentList();
      } catch (error) {
        console.error(error);
      }
    },
    // 咨询分类添加编辑
    edit(item) {
      console.info('item:', item)
      this.categoryDialogVisible = true
      if(item) {
        this.categoryId = item.id
        this.categoryForm.name = item.name 
        this.categoryForm.parentId = item.parentId 
        if(item.parentId) {
          this.selectedKeys = [item.parentId, item.id]
        } else {
          this.selectedKeys = [item.id]
        }
      }
    },
    // 选择项发生变化触发这个函数
    parentCateChanged() {
      console.info('this.selectedKeys:', this.selectedKeys)
      // 如果 selectedKeys 数组中的 length 大于0，证明选中父级分类
      if (this.selectedKeys.length > 0) {
        this.categoryForm.parentId = this.selectedKeys[this.selectedKeys.length - 1]
      } else {
        this.categoryForm.parentId = 0
      }
    },
    // 删除
    async del(item, index, type) {
      console.info('item-index:', item, index, type)
      try {
        if (!await this.$platform.confirm(`确定要删除该${ type === 'present' ? '坐席？' : '咨询分类？'}`)) return;
        const url = type === 'present' ? '/outside/callcenter/api/deleteAgent' : '/outside/callcenter/api/deleteZxSort'
        const { status, message } = await this.$http.post(url, {id:item.id}, false)
        if (status !== 0) return this.$platform.notification({
          title: '删除失败',
          message: message || '',
          type: 'error',
        });
        if (type === 'present') {
          this.userList.splice(index, 1);
        } else if (type === 'category') {
          this.categoryList.splice(index, 1);  
        }  
        this.$platform.notification({
          title: '删除成功',
          type: 'success',
        }); 
      } catch (error) {
        console.error(error);
      }
    },
    // 关闭添加分类弹框
    categoryDialogClosed() {
      this.$refs.categoryFormRef.resetFields()
      this.categoryForm.parentId = 0
    },
    // 添加或者编辑咨询分类
    async addCategory() {
      try {
        const params = this.categoryForm;
        if(this.categoryId) params.id = this.categoryId
        console.info('params:', params);
        const { code, message } = await this.$http.post('/outside/callcenter/api/saveZxSort', params, false)
        if (code !== 0) return this.$platform.notification({
          title: this.categoryId ? '编辑失败' : '添加失败',
          message: message || '',
          type: 'error',
        })
        this.$platform.notification({
          title: '保存成功',
          type: 'success',
        })
        this.categoryDialogVisible = false
        this.categoryDialogClosed()  
        this.getCategoryList()  
      } catch (error) {
        console.error(error)
      }
    },
   
  },
  watch: {
    selectUsers: {
      immediate: true,
      deep: true,
      handler(newValue, oldValue) {
        console.info('new:', newValue)
        // 添加坐席成员后
        if (newValue && newValue[0]) {
          const {code, message} = this.$http.post('/outside/callcenter/api/saveAgent', {userId:newValue[0].userId, agentName: newValue[0].displayName}, false)
          // this.addUser(newValue[0])
          if (code !== 0) return this.$platform.notification({
            title: '添加失败',
            message: message || '',
            type: 'error',
          });
          this.$platform.notification({
            title: '添加成功',
            type: 'success',
          }); 
          this.getAgentList();
        }
      }
    }
  },
  
}
</script>
<style lang="scss">
.call-center-setting {
  padding: 10px;
  position: relative;
  box-sizing: border-box;
  min-height: 100vh;
  max-width: 100vw;
  .container {
    display: flex;
    align-items: flex-start;
    .left-menu {
      width: 25%;
      min-width: 200px;
      background: #fff;
      box-sizing: border-box;
      border-radius: 3px;
      overflow: hidden;
      position: sticky;
      position: -webkit-sticky;
      top: 10px;
      height: 100vh;
      .menu-title {
        font-size: 18px;
        color: #454648;
        padding: 10px;
        font-weight: 600;
      }
      .menu-list {
        border-left: 3px solid transparent;
        border-top: 1px solid #f4f4f4;
        padding: 10px 15px;
        position: relative;
        display: flex;
        align-items: center;
        cursor: pointer;
        &:hover {
          background: rgb(246, 246, 246);
        }
        span {
          font-size: 12px;
        }
        .left-border {
          height: 100%;
          width: 3px;
          position: absolute;
          left: 0;
          background: #55b7b4;
          top: 0;
        }
        .icon-box {
          width: 22px;
          height: 22px;
          display: flex;
          align-items: center;
          margin-right: 13px;
          i {
            font-size: 16px;
            font-weight: 600;
          }
        }
      }
      .menu-checked {
        border-left: 3px solid #55b7b4;
        &:hover {
          background: #fff;
        }
        span {
          font-size: 13px;
          font-weight: 700;
        }
      }
    }
    .main {
      margin-left: 10px;
      flex: 1;
      min-width: 920px;
      box-sizing: border-box;
      min-height: 100vh;
      .service-line {
        background: #fff;
        p {
          font-size: 20px;
          font-weight: 500;
          padding: 20px 108px;
          margin: 0;
        }
        .info {
          display: flex;
          border-top: 1px solid rgba(235, 237, 237, 1);
          border-bottom: 1px solid rgba(235, 237, 237, 1);
          .info-item {
            display: flex;
            flex: 1;
            margin: 12px;
            i {
              margin-top: 10px;
            }
            .item-content {
              flex: 1;
              height: 232px;
              border-right: 1px solid rgba(235, 237, 237, 1);
              text-align: left;
              margin-left: 10px;
              p {
                padding: 0;
                font-size: 16px;
                margin: 10px 0;
              }
              span {
                font-size: 14px;
                display: block;
                margin-bottom: 8px;
              }
              .money {
                color: #fb602c;
              }
            }
          }
        }
      }

      .callcenter-table {
        padding: 10px;

        &:before {
          height: 0;
        }

        .callcenter-table-header th {
          background: #f5f5f5;
          color: $text-color-primary;
          font-weight: normal;
        }

        .view-detail-btn {
          width: 100%;
          color: $color-primary;
        }

        .select-column .el-checkbox {
          position: relative;
          top: 3px;
        }
      }

      .operation-bar-container {
        display: flex;
        justify-content: flex-end;
        background: #fff;
        padding: 10px;
      }

      .query-type-manage {
        .header {
          background: #fff;
          padding: 10px;
        }
      }
    }
  }
}

.el-table .warning-row {
  background: oldlace;
}

.el-table .success-row {
  background: #f0f9eb;
}

.el-table th > .cell {
  font-size: 14px !important;
  color: #333 !important;
  font-weight: 500 !important;
}

::-webkit-scrollbar-track {
  background: transparent;
}

.form-item label {
  text-align: center;
  padding: 0 15px;
  line-height: 32px;
  display: inline-block;
  background: #eef8f8;
  color: #333;
  outline: none;
  margin-left: 5px;
  &:hover {
    cursor: pointer;
    color: #fff;
    background: #55b7b4;
  }
}

.form-user input {
  width: 0;
  padding: 0;
  border: none;
}

.advanced-search-btn-group {
  display: flex;
  justify-content: flex-end;
  width: 100%;
  position: absolute;
  bottom: 0px;
  background: #fff;
  padding: 15px 20px;

  .base-button {
    margin: 0 10px;
  }
}
</style>