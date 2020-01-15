<template>
  <div class="create-user-panel">
    <!-- 新建编辑部门 -->
    <base-panel :show.sync="visible" :width="panelWidth">
      <h3 slot="title">
        <span>{{ '添加成员' }}</span>
      </h3>

      <!-- start 添加成员 -->
      <div class="create-user-form">

        <el-form :model="form" :rules="rules" ref="form" label-width="100px" class="demo-ruleForm">

          <el-form-item label="姓名" prop="name">
            <el-input v-model="form.name" autocomplete="off" :maxlength="10"></el-input>
          </el-form-item>

          <el-form-item label="手机" prop="phone">
            <el-input v-model="form.name" autocomplete="off" :maxlength="11"></el-input>
          </el-form-item>

          <el-form-item label="部门" prop="department">
            <div @click="chooseDepartment" class="department-higher-name">{{ form.department }}</div>
          </el-form-item>

          <el-form-item label="邮箱" prop="email">
            <el-input v-model="form.email" autocomplete="off" :maxlength="20"></el-input>
          </el-form-item>

        </el-form>

      </div>
      <!-- end 编辑表单 -->

      <!-- start 底部按钮 -->
      <div class="create-user-panel-bottom">
        <base-button type="primary" @event="validate">保存</base-button>
        <!-- <base-button type="danger" @event="departmentDelete">删除</base-button> -->
      </div>
      <!-- end 底部按钮 -->

    </base-panel>
  </div>
</template>

<script>
/* util */
import { PHONE_REG } from '@src/util/validator';

export default {
  name: 'create-user-panel',
  data(){
    return {
      action: 'create',
      higherDepartment: {},
      form: {
        name: '',
        phone: '',
        department: '',
        email: '',
      },
      rules: {
        name: [
          { required: true, message: '请填写姓名', trigger: 'change' }
        ],
        phone: [
          { required: true, message: '请填写手机号', trigger: 'change' },
          { regexp: PHONE_REG, message: '请输入正确的手机号', trigger: ['blur', 'change'] }
        ],
        department: [
          { required: true, message: '请选择部门', trigger: 'change' }
        ],
        email: [
          { required: false, message: '请填写邮箱', trigger: 'change' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
        ],
      },
      visible: false,
    }
  },
  computed: {
    isEdit() {
      return this.action == 'edit';
    },
    panelWidth() {
      return '420px';
    }
  },
  methods: {
    /* 选择单个部门 */
    chooseDepartment() { 
      // TODO: 需要挂载的 el
      let options = {
        title: '请选择部门',
        seeAllOrg: true,
        max: -1,
      };

      this.$fast.contact.choose('dept_only', options).then(result => {
        let data = result.data || {};

        if(result.status == 0){
          this.form.department = data.depts || [];
        }

      })
        .catch(err => console.error(err))
    },
    close() {
      this.visible = false;
    },
    open(data) {
      this.packData(data);

      this.visible = true;
    },
    packData(data) {
      this.form.name = data.name || '';
      this.form.department = data.department || '';
    },
    submit() {
      this.$emit('submit');
    },
    validate() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.submit();
        } else {
          return false;
        }
      });
    }
  },
}
</script>

<style lang='scss'>
.create-user-panel {

  .create-user-form {
    padding: 20px 20px 0 0;
  }

  .create-user-panel-bottom {
    padding: 0 20px;

    position: absolute;
    bottom: 20px;
    left: 0;
    right: 0;

    .base-button {
      margin-right: 20px;
    }

  }
}
</style>