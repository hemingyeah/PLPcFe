<template>
  <base-modal
    class="department-modal"
    width="620px"
    :title="title" 
    :show.sync="show" 
    @closed="$emit('destroy')" 
    @cancel="$emit('cancel')">
    <div class="bc-dept-wrap">
      <div class="bc-dept" v-if="depts.length > 0">
        <base-tree
          :data="depts" :selected="selectedDept" :show-checkbox="allowCheckDept"
          @node-selected="selectedrDepartment" @node-check="chooseDept" 
          :node-render="nodeRender"
        />
      </div>

      <div class="bc-chosen" v-if="isMulti">
        <template v-if="allowCheckDept && chosenDept.length > 0">
          <h4>已选部门</h4>
          <div 
            class="bc-chosen-user" 
            v-for="dept in chosenDept" :key="dept.id">
            <span>{{dept.name}}</span>
            <i class="iconfont icon-fe-close" @click="chooseDept({node: dept, value: false})"></i>
          </div>
        </template>
      </div>
    </div>
    <div class="bc-contact-footer" v-if="isMulti">
      <span class="bc-contact-chosen-count">{{ summary }}</span>
      <button type="button" class="bc-contact-cancel" @click="show = false">关闭</button>
      <button type="button" class="bc-contact-choose" @click="post">确定</button>
    </div>
  </base-modal>
</template>

<script>
/* eslint-disable */
import _ from 'lodash';
import http from '@src/util/http';
import Page from '@model/Page';
import {alert} from '@src/platform/message';

export default {
  name: 'base-contact-department',
  props: {
    /** 
     * 最大选择部门数量，
     * 1 -- 单选
     * > 1 -- 多选
     * <= 0 -- 不限制选择人数
     */
    max: {
      type: Number,
      default: 0,
    },
    /* 是否查询 开始降低组织架构的选项 */
    seeAllOrg: {
      type: Boolean,
      default: false
    },
    /* 选中的部门 */
    selectedDepts: {
      type: Array,
      default: () => ([])
    },
    title: {
      type: String,
      default: '请选择部门'
    },
  },
  data(){
    return {
      chosenDept: this.selectedDepts.map(dept => {
        return {
          id: dept.id,
          name: dept.name
        }
      }),
      chosen: [],
      depts: [],
      deptUserCount: {},
      loading: true,
      mode: 'choose',
      selectedDept: {},
      show: false,
    }
  },
  computed: {
    allowCheckDept() {
      return this.isMulti;
    },
    // 是否多选
    isMulti(){
      return this.max != 1;
    },
    // 当前已选概览
    summary(){
      let text = `当前已选部门${this.chosenDept.length}个`;
      return text;
    },
  },
  mounted(){
    this.initialize();
  },
  methods: {
    /** 选择部门 */
    chooseDept(event){
      let {node, value} = event;
      this.toggleDeptCheckStatus(node, value);
      this.chosenDept = this.filterChosenDept(this.depts);
    },
    /** 抓取部门数据 */
    fetchDept(){
      let params = {};
      params.seeAllOrg = this.isSeeAllOrg;

      return http.get('/security/department/tree', params).then(result => {
        if(result.status == 1) return [];

        let depts = result.data || [];
        let index = -1;

        for(var i = 0; i < depts.length; i++){
          if(depts[i].name == '单独授权人员'){
            index = i;
            break;
          }
        }

        // 将单独授权人员放在最后
        if(index >= 0){
          let arr = depts.splice(index,1);
          depts.push(arr[0]); 
        }
        
        return depts;
      })
        .catch(err => console.error('err', err));
    },
    fetchDeptCount(){
      return http.get('/security/department/depUserCount')
    },
    // 筛选所有被选中的部门
    filterChosenDept(depts){
      if(!Array.isArray(depts) || depts.length == 0) return [];

      let chosen = [];
      for(let i = 0; i < depts.length; i++){
        let dept = depts[i];
        if(dept.isChecked) chosen.push(dept);
        if(dept.subDepartments) chosen = chosen.concat(this.filterChosenDept(dept.subDepartments))
      }
      return chosen;
    },
    /* 查询是否开启 降低组织架构的开关 */
    getSeeAllOrg() {
      return http.post('/setting/user/getSeeAllOrg').then(result => { 
          return result
      })
    },
    /** 初始化 */
    initialize(){
      this.show = true;
      this.initializeDept();
    },
    /** 初始化部门数据 */
    async initializeDept(){
      this.isSeeAllOrg = false;

      try {
        /* 如果开启 查询按组织架构选项 */
        if(this.seeAllOrg) {
          let result = await this.getSeeAllOrg();
          this.isSeeAllOrg = result.data;
        }
        
      } catch (error) {
        console.log('error: ', error);
        this.isSeeAllOrg = false;
      }
      let subtask = [
        this.fetchDept()
      ];

      if(this.allowCheckDept) subtask.push(this.fetchDeptCount())

      Promise.all(subtask)
        .then(result => {
          let depts = result[0] || [];
          
          if(this.allowCheckDept){
            let deptUserCount = result[1] || {};
            this.deptUserCount = deptUserCount.data || {};
          }
      
          this.depts = depts;
          this.initChosenDept(this.depts);
        })
        .catch(err => console.error(err))
    },
    /** 初始化选中的部门 */
    initChosenDept (depts) {
      this.chosenDept.forEach (chosen => {
        depts.forEach (dept => {
          let value = true;
          if(chosen.id == dept.id) this.toggleDeptCheckStatus(dept, value)
          if(dept.subDepartments.length > 0){
            this.initChosenDept(dept.subDepartments)
          }
        })
      })
    },
    nodeRender(h, node){
      let content = <span>{node.name}</span>;
      if(!this.allowCheckDept) return content
      
      let count = this.deptUserCount[node.id] || 0
      if(count <= 0) return content;

      return (
        <div class="bc-dept-node-wrap">
          <span class="bc-dept-node-name">{node.name}</span>
          <span class="bc-dept-node-count">{count}</span>
        </div>
      )
    },
    post(){
      let data = {};
      let users = this.chosen.map(item => {
        return {
          userId: item.userId,
          displayName: item.displayName,
          staffId: item.staffId,
          head: item.head || ''
        };
      });
      data.users = users;

      if(this.allowCheckDept){
        let depts = this.chosenDept.map(item => {
          return {
            id: item.id,
            name: item.name
          }
        }) 
        data.depts = depts;
      }

      this.show = false;
      this.$emit('input', data);
    },
    selectedrDepartment(dept){
      if(!this.isMulti) {
        this.show = false;
        this.$emit('input', {
          depts: [dept]
        })
      }
    },
    /** 切换该部门及子部门选中状态 */
    toggleDeptCheckStatus(dept, value){
      this.$set(dept, 'isChecked', value);

      let subDepts = dept.subDepartments || [];
      if(subDepts.length > 0){
        subDepts.forEach(item => this.toggleDeptCheckStatus(item, value))
      }
    },
  },
}
</script>

<style lang='scss'>
  @import './department.scss';

  .department-modal {
    .bc-dept {
      flex: 1;
    }
  }
</style>