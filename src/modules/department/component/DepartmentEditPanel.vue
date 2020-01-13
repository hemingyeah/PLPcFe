<template>
  <div class="department-edit-panel">
    <!-- 新建编辑部门 -->
    <base-panel :show.sync="visible" :width="panelWidth">
      <h3 slot="title">
        <span>{{ isEdit ? '编辑部门' : '新建部门' }}</span>
      </h3>

      <!-- start 编辑表单 -->
      <div class="department-edit-form">

        <el-form :model="form" status-icon :rules="rules" ref="form" label-width="100px" class="demo-ruleForm">

          <el-form-item label="部门名称" prop="name">
            <el-input v-model="form.name" autocomplete="off" :maxlength="10"></el-input>
          </el-form-item>

          <el-form-item label="上级部门" prop="higherDepartmentId">
            <el-input v-model="form.higherDepartmentId" autocomplete="off"></el-input>
          </el-form-item>

        </el-form>

      </div>
      <!-- end 编辑表单 -->

      <!-- start 底部按钮 -->
      <div class="department-edit-panel-bottom">
        <base-button type="primary" @event="validate">保存</base-button>
        <base-button type="danger" @event="departmentDelete">删除</base-button>
      </div>
      <!-- end 底部按钮 -->

    </base-panel>
  </div>
</template>

<script>
/* apis */
export default {
  name: 'department-edit-panel',
  data(){
    return {
      action: 'create',
      form: {
        name: '',
        higherDepartmentId: ''
      },
      rules: {
        name: [
          { required: true, message: '请填写部门名称', trigger: 'change' }
        ],
        higherDepartmentId: [
          { required: true, message: '请选择上级部门', trigger: 'change' }
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
    close() {
      this.visible = false;
    },
    departmentCreate() {
      this.$emit('create', this.form); 
    },
    departmentEdit() {
      this.$emit('edit', this.form); 
    },
    async departmentDelete() {
      this.$emit('delete');
    },
    open(action, data) {
      this.action = action;
      this.packData(data);

      this.visible = true;
    },
    packData(data) {
      this.form.name = data.name || '';
    },
    submit() {
      this.isEdit ? this.departmentEdit() : this.departmentCreate();
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
.department-edit-panel {

  .department-edit-form {
    padding: 20px 20px 0 0;
  }

  .department-edit-panel-bottom {
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