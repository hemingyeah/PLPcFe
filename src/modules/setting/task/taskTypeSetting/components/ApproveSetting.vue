<template>
    <div class="setting-approve">
        <el-radio-group v-model="radio">
            <el-radio :label="3">一级审批</el-radio>
            <el-radio :label="6" class="ml-12">二级审批</el-radio>
        </el-radio-group>
        <div class="setting-approve-people">
            完成该节点时需要审批，审批人
            <el-select class="input-w200" v-model="value" placeholder="请选择">
                <el-option
                    v-for="item in options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                </el-option>
            </el-select>
        </div>
    </div>
</template>

<script>
export default {
    name: 'approve-setting',
    data() {
        return {
            radio: '',
            value: '',
            options: [{
                value: '选项1',
                label: '黄金糕'
            }, {
                value: '选项2',
                label: '双皮奶'
            }]
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

</style>