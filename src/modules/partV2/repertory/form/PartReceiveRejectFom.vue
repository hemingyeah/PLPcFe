<template>
  <section class="part-receive-reject-form-view">
    <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" label-position="right" class="demo-ruleForm">
      <!-- 申请人名称 -->
      <el-form-item label="申请人:" prop="applyName">
        <el-input v-model="ruleForm.applyName" readonly></el-input>
      </el-form-item>
      <!-- 申请时间 -->
      <el-form-item label="申请时间:" prop="time">
        <el-input v-model="ruleForm.time" readonly></el-input>
      </el-form-item>
      <!-- 备件名称 -->
      <el-form-item label="备件名称:" prop="name">
        <el-input v-model="ruleForm.name" readonly></el-input>
      </el-form-item>
      <!-- 备件编号 -->
      <el-form-item label="备件编号:" prop="serialNumber">
        <el-input v-model="ruleForm.serialNumber" readonly></el-input>
      </el-form-item>
      <!-- 备件类别 -->
      <el-form-item label="备件类别:" prop="type">
        <el-input v-model="ruleForm.type" readonly></el-input>
      </el-form-item>
      <!-- 备件规格 -->
      <el-form-item label="备件规格:" prop="standard">
        <el-input v-model="ruleForm.standard" readonly></el-input>
      </el-form-item>
      <!-- 仓库 -->
      <el-form-item label="仓库:" prop="currentDepot">
        <el-input v-model="ruleForm.currentDepot" readonly></el-input>
      </el-form-item>
      <!-- 个人库 -->
      <el-form-item label="个人库:" prop="repertory">
        <el-input v-model="ruleForm.repertory" readonly></el-input>
      </el-form-item>
      <!-- TODO: 持有数量 -->
      <!-- 分配数 -->
      <el-form-item label="分配数:" prop="sparesNum">
        <el-input v-model="ruleForm.sparesNum" readonly></el-input>
      </el-form-item>
      <!-- 操作 TODO:-->
      <el-form-item label="操作:" prop="operate">
        <el-radio v-model="ruleForm.operate" label="yes">接收</el-radio>
        <el-radio v-model="ruleForm.operate" label="no">拒收</el-radio>
      </el-form-item>
      <!-- 备注 -->
      <el-form-item label="备注:" prop="remarks">
        <el-input
          type="textarea"
          :rows="4"
          :maxlength="500"
          placeholder="请输入备注"
          v-model="ruleForm.remarks">
        </el-input>
      </el-form-item>
    </el-form>
  </section>
</template>

<script>
  export default {
    name: 'part-receive-reject-form',
    inject: ['initData'],
    props: {
      formdata: Object,
      receiveOrReject: String
    },
    data() {
      return {
        ruleForm: {
          applayId: '',
          applyName: '',
          name: '',
          time: '',
          serialNumber: '',
          type: '',
          standard: '',
          currentDepot: '',
          repertoryCount: '',
          personLibraryNum: '',
          repertory: '',
          sparesNum: '',
          operate: '',
          remarks: ''
        },
        rules: {
          name: [
            { message: '', trigger: 'change' },
          ],
          serialNumber: [
            { message: '', trigger: 'change' }
          ],
          type: [
            { message: '', trigger: 'change' }
          ],
          standard: [
            { message: '', trigger: 'change' }
          ],
          currentDepot: [
            { message: '', trigger: 'change' }
          ],
          repertoryCount: [
            { type:'number', message: '', trigger: 'change' }
          ],
          personLibraryNum: [
            { type:'number', message: '', trigger: 'change' }
          ],
          sparesNum: [
            { type: 'number', message: '', trigger: 'change' }
          ],
          remarks: [
            { message: '请输入备注', trigger: 'change' }
          ],

        }
      }
    },
    created() {
      let data = this.formdata;
      // 赋值
      this.ruleForm.applayId = data.id;
      this.ruleForm.applyName = data.propserName;
      this.ruleForm.time = data.propserTime;
      this.ruleForm.name = data.sparepartRepertory.sparepart.name || '';
      this.ruleForm.type = data.sparepartRepertory.sparepart.type || '';
      this.ruleForm.serialNumber = data.sparepartRepertory.sparepart.serialNumber || '';
      this.ruleForm.standard = data.sparepartRepertory.sparepart.standard || '';
      this.ruleForm.currentDepot = data.sparepartRepertory.repertory.name || '';
      this.ruleForm.repertoryCount = data.sparepartRepertory.repertoryCount || '0';
      this.ruleForm.repertory = data.targetName || '';
      this.ruleForm.sparesNum = data.variation || '0';

      if(this.receiveOrReject == '0') {
        this.ruleForm.operate = 'yes';
      } else {
        this.ruleForm.operate = 'no';
      }
    },
    methods: {
      pack() {
        let _this = this;
        try {
          return _this.ruleForm;
        } catch (e) {
          console.error('err', e);
        }
      },
    }
  }
</script>

<style lang="scss">
  .part-receive-reject-form-view {

    .el-dialog .el-dialog__body {
        padding-right: 30px;
    }

    .el-form-item {
      margin: 0;
    }
  }
</style>
