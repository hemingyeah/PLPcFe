<template>
  <section>
    <base-modal :title="title" :show.sync="show" width="600px" class="plan-task-edit-modal" @closed="reset">
      <div class="build-stage">

        <el-form ref="form" :model="form" label-width="110px" label-position="left">
          
          <!-- start 计划名称 -->
          <el-form-item label="计划名称：" :error="validation.name" required>
            <el-input v-model="form.name" @change="validate" :maxlength="50"></el-input>
          </el-form-item>
          <!-- end 计划名称 -->          

          <!-- start 重复周期 -->
          <el-form-item label="重复周期：" :error="validation.period" required>
            每
            <el-input class="plan-task-edit-repetion-num" type="number" :value="form.periodSetting.period" @input="changePeriod"></el-input>
            <el-select class="plan-task-edit-repetion-time" v-model="form.periodSetting.periodUnit" placeholder="请选择运行规则，创建规则请到系统管理-绩效报告设置中设置" style="width: 100%;">
              <el-option
                v-for="item in repetitionPeriodList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
            创建执行工单
          </el-form-item>
          <!-- end 重复周期 -->

          <!-- start 截止 -->
          <el-form-item label="截止：" :error="isEndTime ? validation.endTime : validation.endNum" required>

            <el-select class="plan-task-edit-abort-select" v-model="form.endSetting.select" placeholder="请选择运行规则，创建规则请到系统管理-绩效报告设置中设置" style="width: 100%;">
              <el-option
                v-for="item in abortList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>

            <!-- start 按截止日期 -->
            <el-date-picker
              v-if="isEndTime"
              v-model="form.endSetting.time"
              @change="validate"
              :editable="false"
              type="date"
              prefix-icon="iconfont icon-fd-date"
              clearable
              placeholder="请选择截止日期"
              value-format="yyyy-MM-dd"
            >
            </el-date-picker>
            <!-- end 按截止日期 -->

            <!-- start 按执行次数 -->
            <el-input v-else class="plan-task-edit-abort-num" type="number" :value="form.endSetting.num" @input="changeEndSettingNum"></el-input>
            <!-- end 按执行次数 -->

          </el-form-item>
          <!-- end 截止 -->

          <!-- start 创建时间 -->
          <el-form-item label="创建时间：" :error="validation.advance" required>
            在计划时间前 
            <el-input class="plan-task-edit-create-time" type="number" :value="form.advance" @input="changeAdvance"></el-input>
            天创建工单
          </el-form-item>
          <!-- end 创建时间 -->

          <h3>派单设置</h3>

          <!-- start 工单分配负责人/协同人select -->
          <task-allot-select 
            :task-config="taskConfig"
            @update:type="changeAllotType"
            @update:synergies="changeSynergies"
            @update:executors="changeExecutors"
          >
          </task-allot-select>
          <!-- end -->

        </el-form>
        <div class="dialog-footer">
          <el-button @click="show = false" :disabled="pending">取 消</el-button>
          <el-button type="primary" @click="onSubmit" :disabled="pending">确 定</el-button>
        </div>
      </div>

    </base-modal>
  </section>
</template>

<script>
import PlanTaskEditForm from './PlanTaskEditForm';
export default PlanTaskEditForm
</script>

<style lang="scss">
  @import './PlanTaskEditForm';
</style>
