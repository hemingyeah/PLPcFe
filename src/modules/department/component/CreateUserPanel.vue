<template>
  <div class="create-user-panel">
    <!-- 新建编辑部门 -->
    <base-panel :show.sync="visible" :width="panelWidth" class="createUserPanel">
      <h3 slot="title">
        <span>{{ '添加成员' }}</span>
      </h3>

      <!-- start 添加成员 -->
      <div class="create-user-form">

        <el-form :model="form" :rules="rules" ref="form" label-width="100px" class="demo-ruleForm">

          <el-form-item label="账户名" prop="accountName">
            <el-input v-model="form.accountName" autocomplete="off" :maxlength="10"></el-input>
          </el-form-item>

          <el-form-item label="密码" prop="pass">
            <el-input type="password" v-model="form.pass" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="确认密码" prop="checkPass">
            <el-input type="password" v-model="form.checkPass" autocomplete="off"></el-input>
          </el-form-item>

          <el-form-item label="姓名" prop="name">
            <el-input v-model="form.name" autocomplete="off" :maxlength="10"></el-input>
          </el-form-item>

          <el-form-item label="手机" prop="phone">
            <el-input v-model="form.phone" autocomplete="off" :maxlength="11"></el-input>
          </el-form-item>

          <el-form-item label="邮箱" prop="email">
            <el-input v-model="form.email" autocomplete="off" :maxlength="20"></el-input>
          </el-form-item>

          <el-form-item label="角色" prop="role" v-if="initData.canUpdateRole">
            <el-select v-model="form.role" placeholder="请选择" multiple>
              <el-option
                v-for="item in roleOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
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
/* apis */
import { userLoginNameUnique } from '@src/api/DepartmentApi';
/* util */
import { PHONE_REG } from '@src/util/validator';
import _ from 'lodash';

export default {
  name: 'create-user-panel',
  inject: ['initData'],
  data(){
    let validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'));
      } else {
        if (this.form.checkPass !== '') {
          this.$refs.form.validateField('checkPass');
        }
        callback();
      }
    };
    let validatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'));
      } else if (value !== this.form.pass) {
        callback(new Error('两次输入密码不一致!'));
      } else {
        callback();
      }
    };
    let validatePhone = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入手机号'));
      } else if (!PHONE_REG.test(value)) {
        callback(new Error('请输入正确的手机号!'));
      } else {
        callback();
      }
    };
    return {
      action: 'create',
      higherDepartment: {},
      form: this.buildForm(),
      rules: {
        accountName: [
          { required: true, validator: this.checkAccountName, trigger: 'change' }
        ],
        name: [
          { required: true, message: '请填写姓名', trigger: ['blur', 'change'] }
        ],
        pass: [
          { required: true, validator: validatePass, trigger: ['blur', 'change'] }
        ],
        checkPass: [
          { required: true, validator: validatePass2, trigger: ['blur', 'change'] }
        ],
        phone: [
          { required: false, validator: validatePhone, trigger: ['blur', 'change'] },
        ],
        role: [
          { required: true, message: '请选择角色', trigger: ['blue'] }
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
    roleOptions() {
      let rolesJson = this.initData.rolesJson;
      let roles = JSON.parse(rolesJson) || [];
      
      return roles.map(role => ({ label: role.text, value: role.id}))
    },
    panelWidth() {
      return '420px';
    },
  },
  methods: {
    buildForm() {
      return {
        accountName: '',
        pass: '',
        checkPass: '',
        name: '',
        phone: '',
        department: [],
        email: '',
        role: [],
        team: []
      }
    },
    checkAccountName: _.debounce(function (rule, value, callback) {
      if (!value) {
        return callback(new Error('请输入账户名'));
      }

      let params = {
        loginName: this.form.accountName,
        userId: ''
      }
      userLoginNameUnique(params).then(result => {
        if(result.error) {
          callback(new Error(result.error));
        } else {
          callback();
        }
      })
      
    }, 500),
    close() {
      this.visible = false;
    },
    open(data) {
      this.packData(data);

      this.visible = true;
    },
    packData(data) {
      this.form = this.buildForm();
      
      this.form.name = data.name || '';
      this.form.department = data.department || [];
    },
    submit() {
      this.$emit('submit', this.form);
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
    height: calc(100% - 110px);
    overflow-y: auto;
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

  .el-select {
    width: 100%;
  }
}
</style>