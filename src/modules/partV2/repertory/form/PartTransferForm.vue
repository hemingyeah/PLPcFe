<template>
  <section class="part-re-stock-view">
    <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" label-position="right" class="demo-ruleForm">
      <el-form-item label="申请人:" prop="propserName">
        <el-input v-model="ruleForm.propserName" readonly></el-input>
      </el-form-item>
      <el-form-item label="申请时间:" prop="propserTime">
        <el-input v-model="ruleForm.propserTime" readonly></el-input>
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
      <!-- 现仓库 -->
      <el-form-item label="仓库:" prop="currentDepot">
        <el-input v-model="ruleForm.currentDepot" readonly></el-input>
      </el-form-item>
      <!-- 库存数 -->
      <el-form-item label="库存数:">
        <el-input v-model="ruleForm.repertoryCount" readonly></el-input>
        <el-tag v-if="ruleForm.safetyStock && (Number(ruleForm.safetyStock) > ruleForm.repertoryCount)" size="mini" type="danger" class="tag-position">库存提醒</el-tag>
        <el-tooltip class="item" effect="dark" :content="`安全库存：${ruleForm.safetyStock}`" placement="top">
          <div class="tag-position shadow"></div>
        </el-tooltip>
      </el-form-item>
      <!-- 个人库 -->
      <el-form-item label="目标库:" prop="repertory">
        <el-input v-model="ruleForm.repertory" readonly></el-input>
      </el-form-item>
      <!-- 分配数 -->
      <el-form-item label="调拨数:" prop="sparesNum">
        <el-input v-model="ruleForm.sparesNum" readonly></el-input>
      </el-form-item>
      <el-form-item label="操作:" prop="sparesNum">
        <el-radio v-model="ruleForm.action" :label="0">拒收</el-radio>
        <el-radio v-model="ruleForm.action" :label="1">接收</el-radio>
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
    name: 'part-transfer-form',
    props: {
      formdata: Object,
    },
    data() {
      return {
        ruleForm: {
          applayId: '',
          applyName: '',
          name: '',
          time: '',
          applyRemarks: '',
          serialNumber: '',
          type: '',
          standard: '',
          currentDepot: '',
          repertoryCount: 0,
          repertory: '',
          sparesNum: '',
          operate: true,
          remarks: '',
          action: 1,
        },
        rules: {
          repertoryCount: [
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
      this.ruleForm.propserName = data.propserName;
      this.ruleForm.propserTime = data.propserTime;
      this.ruleForm.applyName = data.propserName;
      this.ruleForm.time = data.propserTime;
      this.ruleForm.applyRemarks = data.remark;
      this.ruleForm.name = data.sparepartRepertory.sparepart.name || '';
      this.ruleForm.type = data.sparepartRepertory.sparepart.type || '';
      this.ruleForm.serialNumber = data.sparepartRepertory.sparepart.serialNumber || '';
      this.ruleForm.standard = data.sparepartRepertory.sparepart.standard || '';
      this.ruleForm.currentDepot = data.sparepartRepertory.repertory.name || '';
      this.ruleForm.safetyStock = data.sparepartRepertory.safetyStock || 0;
      this.ruleForm.repertoryCount = data.sparepartRepertory.repertoryCount || 0;
      this.ruleForm.repertory = data.targetName || '';
      this.ruleForm.sparesNum = data.variation - data.solvedVariation || 0;
      this.ruleForm.action = data.action;
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
  .part-re-stock-view {

    .el-dialog .el-dialog__body {
        padding-right: 30px;
    }

    .el-form-item {
      margin: 0;
    }
    .tag-position {
        position: absolute;
        top: 50%;
        right: 0px;
        -webkit-transform: translateY(-50%);
        transform: translateY(-50%);
    }
  }
</style>
