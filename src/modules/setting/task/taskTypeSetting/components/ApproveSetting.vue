<template>
    <div class="setting-approve">
        <el-radio-group v-model="radio">
            <el-radio :label="3">一级审批</el-radio>
            <el-radio :label="6" class="ml-12">二级审批</el-radio>
        </el-radio-group>
        <div class="setting-approve-people">
            完成该节点时需要审批，审批人
            <el-select class="w-200" v-model="approveSetting.type" placeholder="请选择">
                <el-option
                    v-for="item in options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                </el-option>
            </el-select>
            <el-row v-if="approveSetting.type === 'users'" class="mt-12">
                <el-input class="w-200" placeholder="请选择审批人" readonly :value="userNames" @click.native="selectApproveUser"/>
                <el-button class="ml-12" type="primary" size="small" @click="selectApproveUser">添加审批人</el-button>
            </el-row>
        </div>
    </div>
</template>

<script>
export default {
    name: 'approve-setting',
    props: {
        options: {
            type: Array,
            default: () => []
        },
        approveSetting: {
            type: Object,
            default: () => {
                return {
                    type: '',
                    users: []
                }
            }
        }
    },
    data() {
        return {
            radio: '',
            value: '',
        }
    },
    computed: {
        userNames() {
            return this.approveSetting.users && this.approveSetting.users.map(item => item.displayName).join(',');
        }
    },
    methods: {
        selectApproveUser() {
            let options = {
                title: '选择审批人',//[选填] 默认值为 '请选择人员'
                max:14, //[选填]最大人数：当值小于等于0或者不填时，不对选择人数做限制，max值为1时单选，大于1时多选
                selected: this.approveSetting.users //[选填] 已选人员 每个人员必须包括userId,displayName,staffId,head这四个属性，只有带max大于1时生效
            };

            this.$fast.contact.choose('dept', options)
                .then(res => {
                    if(res.status != 0) return;
                    console.log(res);
                    this.$emit('update',res.data.users);
                })
                .catch(err => {
                    console.warn(err)
                })
        }
    }
}
</script>

<style lang="scss" scoped>
.setting-approve{
    &-people{
        font-size: 14px;
        color: #999999;
    }
}

.ml-12{
  margin-left: 12px;
}

.mt-12{
    margin-top: 12px;
}

.w-200{
    width: 200px;
}

</style>