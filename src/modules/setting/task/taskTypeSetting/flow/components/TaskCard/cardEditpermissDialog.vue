<template>
  <base-modal
    :show.sync="show"
    width="673px"
    class="editpermiss-dialog"
    @closed="onClose"
  >
    <div slot="title">
      <span class="el-dialog__title">编辑权限</span>
    </div>
    <div class="base-modal-content" v-if="tableData.length>0">
      <el-table
        ref="multipleTable"
        :data="tableData"
        style="width: 100%"
        class="page-table"
        :highlight-current-row="false"
        header-row-class-name="page-table-header"
        stripe
        tooltip-effect="dark"
      >
        <el-table-column prop="name" label="角色名称"></el-table-column>
        <el-table-column prop="canRead" label="查看">
          <template slot-scope="scope">
            <el-checkbox v-model="scope.row.canRead" @change="checkAll(scope.row,'canRead')"></el-checkbox>
          </template>
        </el-table-column>
        <el-table-column prop="canCreate" label="新增">
          <template slot-scope="scope">
            <el-checkbox v-model="scope.row.canCreate" @change="checkAll(scope.row,'canCreate')"></el-checkbox>
          </template>
        </el-table-column> 
        <el-table-column prop="canWrite" label="编辑">
          <template slot-scope="scope">
            <el-checkbox v-model="scope.row.canWrite" @change="checkAll(scope.row,'canWrite')"></el-checkbox>
          </template>
        </el-table-column>
        <el-table-column prop="canDelete" label="删除">
          <template slot-scope="scope">
            <el-checkbox v-model="scope.row.canDelete" @change="checkAll(scope.row,'canDelete')"></el-checkbox>
          </template>
        </el-table-column>

      </el-table>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="onClose">取 消</el-button>
      <el-button type="primary" @click="onSubmit('form')">确 定</el-button>
    </div>
  </base-modal>
</template>
<script>
// api
import * as SettingTaskApi from '@src/api/SettingTaskApi';
import { uniqBy, cloneDeep } from 'lodash';
export default {
  name: 'card-editpermiss-dialog',
  props: {
    taskCard: {
      type: Object,
      default: () => ({}),
    },
    taskTypeId: {
      type: String,
    },
    visiable: {
      type: Boolean,
    },
  },
  data() {
    return {
      tableData:[],
      roleList:[],
      show: false, 
      allRoles:{
        canCreate: true,
        canDelete: true,
        canRead: true,
        canWrite: true,
        id: 'all',
        name: '全部'

      }
    };
  },
  computed: {

  },
  watch: {
    visiable(newValue) {
      this.show = newValue;

      if (newValue) {
        this.getRoleListReq();
        this.tableData = this.rolesList()
      }
    },
  },
  methods: {
    // 角色权限全选
    checkAll(row, type) {
      if(row.id == 'all') {
        this.tableData.forEach(item=>item[type] = row[type]) ;
      }else{
        if(this.tableData.some(item=>!item[type] && item.id != 'all')){
          this.tableData.forEach(item=>{
            if(item.id == 'all') {
              item[type] = false
            }   
          })
        }else{
          this.tableData.forEach(item=>{
            if(item.id == 'all') {
              item[type] = true
            }   
          })
        }     
      }
    },

    // 初始化角色数据
    rolesList() {
      let rolesList = cloneDeep(this.taskCard.authInfo)

      rolesList.forEach((item, index)=>{
        item.canCreate = item.canCreate == undefined ? item.canWrite : item.canCreate;
        item.canDelete = item.canDelete == undefined ? item.canWrite : item.canDelete;
        if(!item.canRead){
          this.allRoles.canRead = false;
        }
        if(!item.canWrite){
          this.allRoles.canWrite = false;
        }
        if(!item.canCreate){
          this.allRoles.canCreate = false;
        }
        if(!item.canDelete){
          this.allRoles.canDelete = false;
        }
      })
      return [this.allRoles, ...rolesList];
    },

    onClose() {
      this.allRoles = {
        canCreate: true,
        canDelete: true,
        canRead: true,
        canWrite: true,
        id: 'all',
        name: '全部'
      }
      this.$emit('onClose');
    },
    onSubmit(form) {
      // 新增组件
      this.saveCardAuth();
    },
    // 获取角色列表
    getRoleListReq() {
      SettingTaskApi.getRoleList({pageSize:0})
        .then((res) => {
          const { status, message, list } = res;
          this.roleList = list;
          this.mergeRoles();

        })
        .catch((error) => {
          console.log(error);
        });
    },

    // 合并权限数据
    mergeRoles() {
      let oldroles = cloneDeep(this.taskCard.authInfo)
      let newRoles = []
      for(let i = 0;i < this.roleList.length; i++){
        let role = this.roleList[i];

        let index = -1;
        for(let j = 0; j < oldroles.length; j++){
          if(role.id == oldroles[j].id){
            index = j;
            newRoles.push(oldroles[j])
            break;
          }
        }
        if(index < 0){// 存在不同相同数据 则追加
          let obj = {
            canCreate: false,
            canDelete: false,
            canRead: false,
            canWrite: false,
            id: role.id,
            name: role.name
          }    
          newRoles.push(obj)
        }
      }
      return newRoles;
    },
    // 创建附加组件
    saveCardAuth() {
      let authJson = [];
      authJson = this.tableData.filter(item=>item.id !== 'all');
      this.$emit('update', authJson)
    },

    // 修改附加组件
    onUpdateCardReq() {
      const params = {
        description: this.form.description,
        id: this.form.id,
        name: this.form.name,
      };
      SettingTaskApi.onUpdateCard(params)
        .then((res) => {
          const { status, message, data } = res;
          if (status == 0) {
            this.$message.success('修改成功');
            location.reload();
          } else {
            this.$message.error(message);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    },

    // 获取附加组件的信息
    getCardInfoReq() {
      SettingTaskApi.getCardInfo({ id: this.form.id })
        .then((res) => {
          const { status, message, data } = res;
          if (status == 0) {
            this.form = data;
          }
        })
        .catch((error) => ({}));
    },
  },
};
</script>
<style lang="scss">
.editpermiss-dialog {
  .base-modal-header {
    display: flex;
    justify-content: space-between;
    .el-dialog__title {
      font-size: 18px;
    }
    .el-tooltip {
      color: #999;
    }
  }
  .base-modal-body {
    padding: 20px;
  }
  .base-modal-content {
    .page-table{
      padding: 0;
    }
  }
}
</style>