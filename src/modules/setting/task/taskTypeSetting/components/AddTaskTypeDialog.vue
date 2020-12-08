<template>
    <base-modal
        title="新建工单类型"
        width="672px"
        @cancel="cancel"
        :show.sync="isShow"
        :mask-closeable="false">
        <div class="add-task-type">
            <h2>新建工单类型弹窗</h2>
        </div>
    </base-modal>
</template>

<script>
export default {
    name:'add-task-type-dialog',
    props: {
        visable: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            isShow: false,
        }
    },
    watch: {
        visable(newVal){
            this.isShow = newVal;
        }
    },
    methods: {
        cancel() {
            this.$emit('update:visable', false);
        },
    }
}
</script>

<style lang="scss" scoped>
.add-task-type{
    height: 403px;
}
</style>