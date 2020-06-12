<template>
  <div class="call-center-workbench">
    <div class="left">
      <el-card class="current-card">
        <div slot="header" >当前通话</div>
        <div class="current-item">
          <div class="item">
            <p>{{unkonwn ? '未知联系人' : '张三 15000000000'}} </p>
            <span>18:00</span>
          </div>
          <div class="item">
            <p v-if="!unkonwn" style="margin-bottom:0">张三</p>
            <i class="iconfont icon-fd-phone"></i>
          </div>
        </div>
      </el-card>
      <el-card class="history-card">
        <div slot="header">今日历史通话（{{historyList.length}}）</div>
        <div v-for="(item,index) in historyList" :key="item.id" class="history-item" :class="{'item-selected':currentIndex===index}" @click="handleHistoryItem(index)">
          <i v-if="currentIndex===index" class="iconfont icon-fe-close" @click.stop="delHistoryItem(index)"></i>
          <div class="current-item">
            <div class="item">
              <p>张三 15000000000</p>
              <span>18:00</span>
            </div>
            <div class="item">
              <p style="margin-bottom:0">张三</p>
              <i class="iconfont icon-fd-phone"></i>
            </div>
          </div>

        </div>
      </el-card>
    </div>
    <div class="main">
      <base-tabbar :tabs="tabs" v-model="currTab"></base-tabbar>
      <keep-alive>
        <component :is="currTab"></component>
      </keep-alive>
    </div>
    <div class="right">
      <template v-if="remarkList.length">
        <div v-for="(item, index) in remarkList" :key="item.id" class="item" @click="delRemark(item, index)">
          <div class="item-title">
            <h4>服务备注（{{index + 1}}）</h4>
            {{item.isDelete}}
            <i v-if="!item.isDelete" class="iconfont icon-qingkongshanchu"></i>
          </div>
          <div class="item-header">
            <img src="../../../assets/img/avatar.png">
            <p>{{item.createUser}}</p>
            <span>{{item.createTime}}</span>
          </div>

          <div v-if="item.isDelete" class="item-isDelete">
            <span>删除了服务备注</span>
          </div>
          <div v-else class="item-content">
            <el-tag>{{item.sortName}}</el-tag>
            <el-tag :type="item.status ==1 ? 'info' : 'danger'">{{item.status ? '已解决' : '未解决'}}</el-tag>
            <p>{{item.remark}}</p>
          </div>

        </div>
        <el-button v-if="!showAddRemarkForm" type="primary" @click="showAddRemarkForm=true">添加新备注</el-button>
      </template>

      <el-form v-if="remarkList.length == 0 || showAddRemarkForm" :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" label-position="left">
        <el-form-item label="咨询分类">
          <el-cascader expand-trigger="hover" :options="categoryList" :props="cascaderProps" v-model="selectedKeys" @change="parentCateChanged" clearable change-on-select>
          </el-cascader>
        </el-form-item>
        <el-form-item label="解决状态" prop="status">
          <el-select v-model="ruleForm.status" placeholder="请选择解决状态">
            <el-option label="未解决" value="0"></el-option>
            <el-option label="已解决" value="1"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input type="textarea" v-model="ruleForm.remark" :autosize="{ minRows: 2, maxRows: 4}"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="saveRemark('ruleForm')">保存</el-button>
        </el-form-item>
      </el-form>

    </div>
  </div>
</template>

<script>
import ContactInfo from './ContactInfo.vue'
import ServiceRecord from './ServiceRecord.vue'
export default {
  name: 'workbench',
  data() {
    return {
      unkonwn: false,
      currentIndex: -1,
      historyList: [{ id: '1' }, { id: '2' }, { id: '3' }],
      tabs: [
        {
          displayName: '联系人信息',
          component: ContactInfo.name,
          show: true
        },
        {
          displayName: '服务记录',
          component: ServiceRecord.name,
          show: true
        }
      ],
      currTab: 'contact-info',
      remarkList: [],
      showAddRemarkForm:false,
      categoryList: [],
      cascaderProps: {
        value: 'id',
        label: 'name',
        children: 'children'
      },
      selectedKeys: [],
      ruleForm: {
        sortId: '',
        status: '',
        remark: ''
      },
      rules: {
        status: [{ required: true, message: '请选择解决状态', trigger: 'blur' }]
      }
    }
  },
  mounted() {
    this.$eventBus.$on('callcenter-workbench.select_tab', this.selectTab)
    this.getHistoryList()
    this.getRemarkList()
    this.getCategoryList()
  },
  beforeDestroy() {
    this.$eventBus.$off('callcenter-workbench.select_tab', this.selectTab)
  },
  methods: {
    // 获取服务备注列表
    async getRemarkList(){
      const params = {
        recordId: 1
      }
      try {
        let {code, message, result} = await this.$http.get('/outside/callcenter/api/getFwRemarkList', params)
        if (code != 0) return this.$message.error(message || '内部错误')
        this.remarkList = result || []
      } catch (error) {
        console.error(error)
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
    // 选择项发生变化触发这个函数
    parentCateChanged() {
      console.info('this.selectedKeys:', this.selectedKeys)
      // 如果 selectedKeys 数组中的 length 大于0，证明选中父级分类
      if (this.selectedKeys.length > 0) {
        this.ruleForm.sortId = this.selectedKeys[this.selectedKeys.length - 1]
      } else {
        this.ruleForm.sortId = 0
      }
    },
    async getHistoryList(){
      const res = await this.$http.get('/outside/callcenter/api/getTodayCalledRecordList', {phone :'13956914854'})
      console.info('res', res);
    },
    handleHistoryItem(index) {
      this.currentIndex = index
    },
    delHistoryItem(index) {
      this.historyList.splice(index, 1)
    },
    selectTab(tab) {
      this.currTab = tab
    },
    saveRemark(formName) {
      this.$refs[formName].validate(async valid => {
        if (!valid) {
          return false
        } 
        const params = this.ruleForm
        params.recordId = 1
        // console.info('params', params)
        try {
          const {code, message} = await this.$http.post('/outside/callcenter/api/saveFwRemark', params, false)
          if (code !== 0) return this.$platform.notification({
            title: '保存失败',
            message: message || '',
            type: 'error',
          })
          this.$refs[formName].resetFields()
          this.selectedKeys = []
          this.getRemarkList()
          this.$platform.notification({
            title: '保存成功',
            type: 'success',
          })
        } catch (e) {
          console.error(e)
        }
      })
    },
    async delRemark(item, index){
      try {
        if (!await this.$platform.confirm('确定要删除该服务备注？')) return;
        const {code, message} = await this.$http.post('/outside/callcenter/api/deleteFwRemark', {id:item.id}, false)
        if (code !== 0) return this.$platform.notification({
          title: '删除失败',
          message: message || '',
          type: 'error',
        });
        this.remarkList.splice(index, 1)
        this.$platform.notification({
          title: '删除成功',
          type: 'success',
        });
      } catch (e) {
        console.error(e);
      }
    }
  },
  components: {
    [ContactInfo.name]: ContactInfo,
    [ServiceRecord.name]: ServiceRecord
  }
}
</script>

<style lang="scss">
.item-selected {
  background: #f5f5f5;
}
.call-center-workbench {
  display: flex;
  padding: 10px;
  position: relative;
  box-sizing: border-box;
  min-height: 100vh;
  max-width: 100vw;
  .left {
    width: 25%;
    min-width: 270px;
    .current-card {
      box-shadow: 0 0 0 0;
      border: none;
      .el-card__body {
        padding: 10px 15px;
        background: #f5f5f5;
        border-left: 3px solid $color-primary;
        .current-item {
          .item {
            display: flex;
            justify-content: flex-end;
            p {
              flex: 1;
            }
            i,
            span {
              color: #999;
            }
          }
        }
      }
    }
    .history-card {
      box-shadow: 0 0 0 0;
      .el-card__body {
        padding: 0;
        .history-item {
          padding: 10px 15px;
          display: flex;
          align-items: center;
          border-bottom: 1px solid #e0e1e2;

          .icon-fe-close {
            margin-right: 10px;
          }
          .current-item {
            flex: 1;
            .item {
              display: flex;
              justify-content: space-between;
              i,
              span {
                color: #999;
              }
            }
          }
        }
      }
    }

    .el-card__header {
      font-size: 16px;
      font-weight: 500;
      color: #051A13;
    }

  }

  .main {
    flex: 1;
    margin: 0 20px;
    background: #fff;
  }
  .right {
    background: #fff;
    width: 25%;
    min-width: 330px;
    padding: 10px;
    .item {
      margin-bottom: 10px;
      border-bottom: 1px solid #f5f5f5;
      .item-title {
        display: flex;
        justify-content: space-between;
      }
      .item-header {
        display: flex;
        align-items: center;
        img {
          width: 36px;
          height: 36px;
        }
        p {
          flex: 1;
          margin-bottom: 0;
          margin-left: 10px;
        }
      }
      .item-isDelete {
        color: #fb602c;
        height: 42px;
        font-size: 14px;
        line-height: 42px;
      }
      .item-content {
        padding: 5px;
        p {
          background-color: #fafbfc;
          padding: 10px;
          margin: 10px 0;
          color: #737f7b;
        }
      }
    }
  }
}
</style>