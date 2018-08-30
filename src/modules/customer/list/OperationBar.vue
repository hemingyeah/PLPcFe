<template>
  <div class="operation-bar-container">
    <el-button-group>
      <el-button type="primary" icon="el-icon-plus">新建</el-button>
      <el-button type="primary" icon="el-icon-delete" @click="deleteCustomer">删除</el-button>
    </el-button-group>

    <div>
      <el-dropdown trigger="click">
        <el-button type="primary">
          批量操作<i class="el-icon-arrow-down el-icon--right"></i>
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item >
            <span @click="openDialog('sendMessage')">发送短信</span>
          </el-dropdown-item>
          <el-dropdown-item>
            <span @click="openDialog('edit')">批量编辑</span>
          </el-dropdown-item>
          <el-dropdown-item>
            <span @click="openDialog('remind')">批量提醒</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>

      <el-dropdown :hide-on-click="false" trigger="click" :show-timeout="150">
        <el-button type="primary">
          选择列<i class="el-icon-arrow-down el-icon--right"></i>
        </el-button>
        <el-dropdown-menu slot="dropdown" class="customer-columns-dropdown-menu">
          <el-dropdown-item v-for="item in ownedColumns" :key="item.label">
            <el-checkbox v-model="item.show" @change="chooseColumns" :label="item.label">{{item.label}}</el-checkbox>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <el-dropdown>
        <el-button type="primary">
          更多操作<i class="el-icon-arrow-down el-icon--right"></i>
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item>导入客户</el-dropdown-item>
          <el-dropdown-item>导入联系人</el-dropdown-item>
          <el-dropdown-item>导出</el-dropdown-item>
          <el-dropdown-item>导出全部</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>

    </div>

    <!-- dialog of operation -->
    <send-message-dialog
      ref="messageDialog"
      :selectedCustomer="selectedCustomer">

    </send-message-dialog>

    <batch-editing-customer-dialog
      ref="batchEditingCustomerDialog"
      :selectedCustomer="selectedCustomer">

    </batch-editing-customer-dialog>
    <!--batch-reminding-customer-dialog-->

    <batch-reminding-customer-dialog
      ref="batchRemindingCustomerDialog"
      :selectedCustomer="selectedCustomer">

    </batch-reminding-customer-dialog>

  </div>
</template>

<script>
  import _ from 'lodash';
  import SendMessageDialog from './operationDialog/SendMessageDialog.vue';
  import BatchEditingCustomerDialog from './operationDialog/BatchEditingCustomerDialog.vue';
  import BatchRemindingCustomerDialog from './operationDialog/BatchRemindingCustomerDialog.vue';

  export default {
    name: "operation-bar",
    data() {

      return {
        pending: false,

      };
    },
    props: {
      selectedCustomer: {
        type: Array,
        default: () => ([]),
      },
      columns: {
        type: Array,
        default: () => ([]),
      },
    },
    computed: {
      ownedColumns() {
        return  _.cloneDeep(this.columns);
      }
    },
    mounted() {
    },
    methods: {
      openDialog(category) {
        console.log('category', category);
        if (category === 'sendMessage') {
          console.log('this.$ref.messageDialog', this.$refs.messageDialog);
          this.$refs.messageDialog.openSendMessageDialog();
        }
        if (category === 'edit') {
          this.$refs.batchEditingCustomerDialog.openBatchEditingCustomerDialog();
        }
        if (category === 'remind') {
          this.$refs.batchRemindingCustomerDialog.openBatchRemindingCustomerDialog();
        }
      },
      deleteCustomer() {
        if (!this.selectedCustomer.length) {
          return this.$platform.alert('请选择需要删除的客户');
        }

        this.$platform.confirm('确定要删除选择的客户？')
          .then(result => {
            if (!result) return;
            console.log('确定要删除选择的客户!!!!', result)

          })
      },
      sendMessage() {
        console.log('sendMessage');
      },
      batchEditCustomer() {
        // console.log('batchEditCustomer');
      },
      remindMultipleCustomer() {
        // console.log('remindMultipleCustomer');
      },
      chooseColumns() {
        this.$emit('modify-columns-display', this.ownedColumns);
      },
    },
    components: {
      [SendMessageDialog.name]: SendMessageDialog,
      [BatchEditingCustomerDialog.name]: BatchEditingCustomerDialog,
      [BatchRemindingCustomerDialog.name]: BatchRemindingCustomerDialog,
    }
  }
</script>

<style lang="scss" scoped>

  .customer-columns-dropdown-menu {
    max-height: 300px;
    overflow: auto;
    .el-checkbox {
      width: 100%;
    }
  }

  .operation-bar-container {
    background: #fff;
    border-radius: 3px;
    display: flex;
    justify-content: space-between;
    padding: 10px;
  }

</style>