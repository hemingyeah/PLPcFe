<template>
  <section>
    <base-modal :show.sync="show" width="600px" class="plan-task-edit-modal" @closed="reset">
      <div slot="title">
        <div class="plan-task-edit-modal-title"> 
          {{ title }} 
          <el-tooltip placement="right">
            <div slot="content" v-html="'计划任务是指按照您指定的时间规则自动创建的工单，</br> 可以应用于周期性服务场景'"></div>
            <i class="iconfont icon-info"></i>
          </el-tooltip>
        </div>
        <div class="plan-task-edit-modal-prompt"> 注意：如果工单类型、客户信息、产品信息等内容被修改或删除，请更新计划，避免工单发生错误</div>
      </div>

      <div class="build-stage">

        <el-form ref="form" :model="form" label-width="140px" label-position="left">
          
          <!-- start 计划名称 -->
          <el-form-item label="计划名称：" :error="validation.name" required>
            <el-input v-model="form.name" @change="validate" :maxlength="50"></el-input>
          </el-form-item>
          <!-- end 计划名称 -->          

          <!-- start 重复周期 -->
          <el-form-item :error="validation.period" required>
            <!-- start label -->
            <template slot="label">
              重复周期：
              <el-tooltip placement="right">
                <div slot="content" v-html="'以创建工单时的第一个计划时间为基准，</br> 设置重复周期'"></div>
                <i class="iconfont icon-info"></i>
              </el-tooltip>
            </template>
            <!-- end label -->
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
          <el-form-item :error="isEndTime ? validation.endTime : validation.endNum" required>
            <!-- start label -->
            <template slot="label">
              截止：
              <el-tooltip placement="right">
                <div slot="content" v-html="'设置计划的截止日期或最多执行次数，</br> 最长周期不超过1年，</br> 最大次数不超过366次'"></div>
                <i class="iconfont icon-info"></i>
              </el-tooltip>
            </template>
            <!-- end label -->
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
          <el-form-item :error="validation.advance" required>
            <!-- start label -->
            <template slot="label">
              创建时间：
              <el-tooltip placement="right">
                <div slot="content" v-html="'系统将在您设定的提前时间点创建出工单'"></div>
                <i class="iconfont icon-info"></i>
              </el-tooltip>
            </template>
            <!-- end label -->
            在计划时间前 
            <el-input class="plan-task-edit-create-time" type="number" :value="form.advance" @input="changeAdvance"></el-input>
            天创建工单
          </el-form-item>
          <!-- end 创建时间 -->

          <div class="plan-task-edit-modal-subtitle">
            派单设置
            <el-tooltip placement="right">
              <div slot="content" v-html="'如果派单时指定人员账号被删除，</br> 会导致派单失败，</br> 如果发生人员更迭，</br> 请注意更新计划任务中的负责人等人员信息'"></div>
              <i class="iconfont icon-info"></i>
            </el-tooltip>
          </div>

          <!-- start 工单分配负责人/协同人select -->
          <task-allot-select 
            ref="TaskAllotSelect"
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
