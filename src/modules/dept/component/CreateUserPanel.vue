<template>
  <div class="create-user-panel">
    <!-- 新建编辑部门 -->
    <base-panel :show.sync="visible" :width="panelWidth" class="createUserPanel">
      <h3 slot="title">
        <span>{{ '新建账号' }}</span>
      </h3>
      
      <!-- start 添加成员 -->
      <div class="create-user-form">
        
        <el-form :model="form" :rules="rules" ref="form" label-width="100px" class="demo-ruleForm">
          
          <el-form-item label="手机号" prop="phone">
            <input type="password" style="position: fixed;left: -9999px;">
            <el-input v-model="form.phone" autocomplete="off" :maxlength="11"></el-input>
          </el-form-item>
          
          <el-form-item label="姓名" prop="name">
            <input type="password" style="position: fixed;left: -9999px;">
            <el-input v-model="form.name" autocomplete="off" :maxlength="10"></el-input>
          </el-form-item>
          
          <el-form-item label="登录密码" prop="pass">
            <input type="password" style="position: fixed;left: -9999px;">
            <el-input type="password" v-model="form.pass" autocomplete="off"></el-input>
          </el-form-item>
          
          <el-form-item label="确认密码" prop="checkPass">
            <input type="password" style="position: fixed;left: -9999px;">
            <el-input type="password" v-model="form.checkPass" autocomplete="off"></el-input>
          </el-form-item>
          
          <el-form-item label="角色" prop="role">
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
        <base-button type="ghost" @event="close">取消</base-button>
        <base-button type="primary" @event="validate">确定</base-button>
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
    }
    return {
      action: 'create',
      higherDepartment: {},
      form: this.buildForm(),
      rules: {
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
          { required: true, validator: this.checkAccountName, trigger: ['blur', 'change'] },
        ],
        role: [
          { required: true, message: '请选择角色', trigger: ['blue'] }
        ]
      },
      visible: false,
    }
  },
  computed: {
    isEdit() {
      return this.action == 'edit';
    },
    roleOptions() {
      let roles = this.initData.rolesJson || [];
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
        return callback(new Error('请输入手机号'));
      } else if (!PHONE_REG.test(value)) {
        return callback(new Error('请输入正确的手机号!'));
      }
      
      let params = {
        loginName: this.form.phone,
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
      this.$refs.form.resetFields();
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
    overflow-y: auto;
    padding: 20px 20px 0 0;
  }
  .create-user-panel-bottom {
    padding: 0 20px;
    text-align: right;
    .base-button {
      margin-right: 20px;
    }
  }
  .el-select {
    width: 100%;
  }
}
</style>