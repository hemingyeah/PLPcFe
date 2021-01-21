<template>
  <div class="setting-approve">
    <el-radio-group v-model="approveSetting.level" @change="switchLevel">
      <el-radio :label="0">无需审批</el-radio>
      <el-radio :label="1" class="ml-12">一级审批</el-radio>
      <el-radio :label="2" class="ml-12">二级审批</el-radio>
    </el-radio-group>
    <div v-if="approveSetting.level >= 1" class="setting-approve-people">
      <!--S 一级审批设置 -->
      完成该节点时需要审批，{{ approveSetting.level > 1 ? "一级" : "" }}审批人
      <el-tooltip :disabled="!approveSetting.leader || options.some(opt => approveSetting.leader === opt.value)" content="您设置的审批人员已被删除，请重新选择">
        <el-select
          class="w-200"
          :value="approveSetting.leader"
          placeholder="请选择"
          @change="(val) => updateApproveSetting('leader', val, 1)"
        >
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </el-tooltip>
      <template v-if="approveSetting.leader === 'users'" class="mt-12">
        <el-input
          class="w-200"
          placeholder="请选择审批人"
          readonly
          :value="getApproverNames(approveSetting.approvers)"
          @click.native="selectApproveUser(1)"
        />
        <!-- <el-button class="ml-12" type="primary" size="small" @click="selectApproveUser(1)">添加审批人</el-button> -->
      </template>
      <!--E 一级审批设置 -->
      <!--S 二级以上审批设置 -->
      <template v-if="approveSetting.level > 1">
        <span
          v-for="(setting, idx) in approveSetting.multiApproverSetting"
          :key="idx"
        >
          {{ (idx + 2) | formatNumToCN }}级审批人
          <el-tooltip :disabled="!approveSetting.multiApproverSetting[idx].leader || options.some(opt => approveSetting.multiApproverSetting[idx].leader === opt.value)" content="您设置的审批人员已被删除，请重新选择">
            <el-select
              class="w-200"
              :value="setting.leader"
              placeholder="请选择"
              @change="(val) => updateApproveSetting('leader', val, idx + 2)"
            >
              <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-tooltip>
          <el-input
            v-if="setting.leader === 'users'"
            class="w-200 mt-12"
            placeholder="请选择审批人"
            readonly
            :value="getApproverNames(setting.approvers)"
            @click.native="selectApproveUser(idx + 2)"
          />
        </span>
      </template>
      <!--E 二级以上审批设置 -->
    </div>
  </div>
</template>

<script>
import _ from 'lodash';
import TaskApprover from '@model/types/setting/task/TaskApprover';

export default {
  name: 'approve-setting',
  props: {
    options: {
      type: Array,
      default: () => [],
    },
    approveSetting: {
      type: Object,
      default: () => new TaskApprover(),
    },
  },
  filters: {
    formatNumToCN(num) {
      let changeNum = [
        '零',
        '一',
        '二',
        '三',
        '四',
        '五',
        '六',
        '七',
        '八',
        '九',
      ];

      return changeNum[num];
    },
  },
  methods: {
    /** 选择审批等级 */
    switchLevel(val) {
      let multiApproverSetting = [];
      if (val > 1) {
        for (let i = 0; i < val - 1; i++) {
          if (this.approveSetting.multiApproverSetting && this.approveSetting.multiApproverSetting[i]) {
            multiApproverSetting.push(
              this.approveSetting.multiApproverSetting[i]
            );
          } else {
            multiApproverSetting.push({
              leader: '',
              approvers: [],
            });
          }
        }

        this.approveSetting.multiApproverSetting = multiApproverSetting;
      }
    },
    getApproverNames(approvers) {
      return approvers.map((item) => item.displayName).join(',');
    },
    /**
     * 更新审批设置
     *
     * @param {string} key 更新的key值
     * @param {string} value 更新值
     * @param {number} level 更新审批的层级
     */
    updateApproveSetting(key, value, level) {
      console.log(key, value, level);
      let approveSetting = _.cloneDeep(this.approveSetting);

      // 一级设置
      if (level <= 1) {
        approveSetting[key] = value;
        if (approveSetting.leader !== 'users') {
          approveSetting.approvers = [];
        }
      }
      // 多级设置
      if (level > 1) {
        let multiApproverSetting = approveSetting.multiApproverSetting[level - 2];
        multiApproverSetting[key] = value;
        if (multiApproverSetting.leader !== 'users') {
          multiApproverSetting.approvers = [];
        }
      }

      this.$emit('change', approveSetting);
    },
    /**
     * 选择指定的审批人员
     * @param {number} level 审批的层级
     */
    selectApproveUser(level) {
      let selected = level < 2
        ? this.approveSetting.approvers
        : this.approveSetting.multiApproverSetting[level - 2].approvers;
      let options = {
        title: '选择审批人', // [选填] 默认值为 '请选择人员'
        max: 14, // [选填]最大人数：当值小于等于0或者不填时，不对选择人数做限制，max值为1时单选，大于1时多选
        selected, // [选填] 已选人员 每个人员必须包括userId,displayName,staffId,head这四个属性，只有带max大于1时生效
      };

      this.$fast.contact
        .choose('dept', options)
        .then((res) => {
          if (res.status != 0) return;

          this.updateApproveSetting('approvers', res.data.users, level);
        })
        .catch((err) => {
          console.warn(err);
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.setting-approve {
  &-people {
    margin-bottom: 12px;
    font-size: 14px;
    color: #999999;
  }
}

.ml-12 {
  margin-left: 12px;
}

.mt-12 {
  margin-top: 12px;
}

.mb-12 {
  margin-bottom: 12px;
}

.w-200 {
  width: 200px;
}
</style>
