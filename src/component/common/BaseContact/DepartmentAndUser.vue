<template>
  <base-modal 
    width="820px"
    :title="title" 
    :show.sync="show" 
    @closed="$emit('destroy')" 
    @cancel="$emit('cancel')"
  >
    <div class="bc-dept-wrap">
      <div class="bc-dept" v-if="depts.length > 0 && departShow">
        <base-tree
          :data="depts" 
          :node-render="nodeRender"
          :selected="selectedDept" 
          :show-checkbox="allowCheckDept"
          @node-selected="initDeptUser" 
          @node-check="chooseDept" 
        />
      </div>
      
      <div class="bc-user">
        <div class="bc-search">
          <label class="bc-search-inner">
            <i class="iconfont icon-search"></i>
            <input type="search" placeholder="搜索全部员工" :value="params.keyword" @input="inputKeyword" maxlength="50" autofocus>
          </label>
        </div>
        
        <div class="bc-user-panel" v-loadmore="loadmoreOptions">
          <p class="bc-contact-search-tip" v-if="mode == 'search' && !loading">为您查询到相关记录{{userPage.total || 0}}条</p>
          
          <contact-user-item 
            v-for="user in userPage.list" 
            :key="user.userId" 
            :user="user" @toggle="chooseUser" 
            :show-user-state="showUserState" 
            :state-color="stateColor"
            :show-location="showLocation"
          />
          
          <div class="bc-contact-loading" v-if="loading">正在加载，请稍等...</div>
          <div v-if="userPage.total == 0 && !loading && mode == 'choose'" class="bc-contact-empty">
            <img src="../../../assets/img/contact-empty.png" />
            <p>暂无成员</p>
          </div>
        </div>
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
        <template v-if="chosen.length > 0">
          <h4 v-if="allowCheckDept">已选人员</h4>
          <div class="bc-chosen-user" v-for="user in chosen" :key="user.userId">
            <div class="bc-chosen-user-head" :style="{backgroundImage: 'url(' + head(user) + ')'}"></div>
            <span>{{user.displayName}}</span>
            <i class="iconfont icon-fe-close" @click="removeUser(user)"></i>
          </div>
        </template>
      </div>
    </div>
    <div class="bc-contact-footer" v-if="isMulti">
      <span class="bc-contact-chosen-count">{{summary}}</span>
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

import ContactUserItem from './ContactUserItem.vue';
import DefaultHead from '@src/assets/img/avatar.png';

import { teamNameConversion } from '@src/util/conversionFunctionUtil.ts'

export default {
  name: 'base-contact-dept-user',
  props: {
    /** 
     * 最大选择人数，
     * 1 -- 单选
     * > 1 -- 多选
     * <= 0 -- 不限制选择人数
     */
    max: {
      type: Number,
      default: 0
    },
    selectedUser: {
      type: Array,
      default: () => []
    },
    title: {
      type: String,
      default: '请选择人员'
    },
    // 是否显示任务统计
    showTaskCount: {
      type: Boolean,
      default: false
    },
    // 是否显示用户工作状态
    showUserState: {
      type: Boolean,
      default: false
    },
    action: { // 用户数据请求地址
      type: String,
      default: '/security/tag/userList'
    },
    lat: {
      type: String,
      default: ''
    },
    lng: {
      type: String,
      default: ''
    },
    // 是否显示定位信息
    showLocation: { 
      type: Boolean,
      default: false
    },
    // 是否允许选中部门
    showDeptCheckbox: {
      type: Boolean,
      default: false
    },
    selectedDepts: {
      type: Array,
      default: () => ([])
    },
    /* 是否查询 开始降低组织架构的选项 */
    seeAllOrg: {
      type: Boolean,
      default: false
    },
    departShow: {
      type: Boolean,
      default: true
    },
    // 是否显示离职人员
    showDeleteUser: {
      type: Boolean,
      default: false
    }
  },
  data(){
    let data = {
      mode: 'choose',
      show: false,
      loading: true,
      loadmoreOptions: {
        disabled: false,
        callback: this.loadmore
      },

      depts: [], // 部门
      deptUserCount: {},
      selectedDept: {}, // 选中的部门
      chosenDept: this.selectedDepts.map(dept => {
        return {
          id: dept.id,
          name: dept.name || dept.tagName
        }
      }),
      // 已选择的人
      chosen: this.selectedUser.map(item => {
        return {
          userId: item.userId,
          displayName: item.displayName,
          staffId: item.staffId,
          head: item.head || '',
          selected: true
        }
      }), 

      params: {
        keyword: '', // 搜索关键词
        // deptId: '',
        // departmentId: '',
        pageNum: 1,
        pageSize: 50
      }, // 参数
      userPage: new Page(),

      stateColor: {}, //用户工作状态颜色
      isSeeAllOrg: false, /** 是否 只可见本团队成员 */
    }

    return data
  },
  computed: {
    isDingtalk(){
      // 判断是否钉钉端选择通讯录
      let tenantType = localStorage.getItem('tenantType');
      console.log('tenantType:', tenantType, localStorage.getItem('allotByTag'));
      return tenantType == 0 && localStorage.getItem('allotByTag') == 0; 
    },
    btnText(){
      return this.max > 0 ? `(${this.chosen.length}/${this.max})` : "";
    },
    // 是否多选
    isMulti(){
      return this.max != 1;
    },
    // 是否允许添加用户
    allowAddUser(){
      if (this.max <= 0) return true;
      return this.chosen.length < this.max;
    },
    // 当前已选概览
    summary(){
      let text = `当前已选${this.chosen.length}人`;
      if(this.allowCheckDept) {
        text += `, 部门${this.chosenDept.length}个`;
      }
      return text;
    },
    // 是否允许选中部门
    allowCheckDept(){
      return this.isMulti && this.showDeptCheckbox;
    },
  },
  methods: {
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
    inputKeyword(event){
      this.params.keyword = event.target.value;
      this.search();
    },
    /** 搜索人员 */
    search: _.debounce(function(){
      if(!this.params.keyword){ // 空值  显示团队
        this.mode = 'choose';
        this.initDeptUser(this.selectedDept);
        return;
      }
      
      this.searchUser();
    }, 500),
    /** 选择人员 */
    chooseUser(user){
      if(!user) return;
      
      // 单选则直接返回
      if(!this.isMulti) {
        this.show = false;
        this.$emit('input', {
          users: [{
            userId: user.userId,
            displayName: user.displayName,
            staffId: user.staffId,
            head: user.head || ''
          }]
        })
        return;
      }
      
      user.seleced ? this.removeUser(user) : this.addUser(user);
    },
    /** 添加人员 */
    addUser(user){
      if(!this.allowAddUser) return alert(`最多选择${this.max}人`);
      
      user.selected = true;
      
      var index = -1;
      var len = this.chosen.length;
      for(var i = 0; i < len;i++){
        if(user.userId == this.chosen[i].userId){
          index = i;
          break;
        }
      }
      index == -1 && this.chosen.push(user);
    },
    /** 移除选择的人员 */
    removeUser(user){
      user.selected = false;

      var index = -1;
      var len = this.chosen.length;
      for(var i = 0; i < len;i++){
        if(this.chosen[i].userId == user.userId){
          index = i;
          break;
        }
      }
      index >= 0 && this.chosen.splice(index,1);
    },
    /** 搜索用户 */
    async searchUser(){
      try {
        this.mode = 'search';
        this.loading = true;
        this.userPage.list = [];

        this.params.deptId = 'root';
        this.params.tagId = '';
        this.params.pageNum = 1;

        if(this.showLocation){
          this.params.lat = this.lat;
          this.params.lng = this.lng;
        }
        this.params.seeAllOrg = this.isSeeAllOrg;
        // 可显示离职人员
        this.params.showDeleteUser = this.showDeleteUser ? 2 : 0;

        let userPage = await this.fetchUser(this.params);
        this.userPage.merge(Page.as(userPage));
      } catch (error) {
        console.error(error)
      }

      this.loading = false
      this.loadmoreOptions.disabled = !this.userPage.hasNextPage;
    },
    /** 选中一个部门 */
    async initDeptUser(dept){
      try {
        this.mode = 'choose';
        this.selectedDept = dept;
        this.userPage.list = [];
        this.loading = true;
        
        // 查询用户
        this.params.keyword = '';
        this.params.tagId = this.selectedDept.id;
        // start 兼容钉钉端 
        this.params.deptId = this.selectedDept.id;
        this.params.departmentId = this.selectedDept.id;
        // end 
        this.params.pageNum = 1;

        if(this.showLocation){
          this.params.lat = this.lat;
          this.params.lng = this.lng;
        }
        this.params.seeAllOrg = this.isSeeAllOrg;
        // 离职人员
        dept.name = dept.name || dept.tagName
        this.params.showDeleteUser = (dept.id == 'root' && dept.name == '离职人员') ? 1 : 0;
        let userPage = await this.fetchUser(this.params);

        this.userPage.merge(Page.as(userPage));
      } catch (error) {
        console.error(error)
      }

      this.loading = false;
      this.loadmoreOptions.disabled = !this.userPage.hasNextPage;
    },
    /** 选择部门 */
    chooseDept(event){
      let {node, value} = event;
      this.toggleDeptCheckStatus(node, value);
      this.chosenDept = this.filterChosenDept(this.depts).map(teamNameConversion)
    },
    /** 切换该部门及子部门选中状态 */
    toggleDeptCheckStatus(dept, value){
      this.$set(dept, 'isChecked', value);

      let subDepts = dept.children || [];
      if(subDepts.length > 0){
        subDepts.forEach(item => this.toggleDeptCheckStatus(item, value))
      }
    },
    // 筛选所有被选中的部门
    filterChosenDept(depts){
      if(!Array.isArray(depts) || depts.length == 0) return [];

      let chosen = [];
      for(let i = 0; i < depts.length; i++){
        let dept = depts[i];
        if(dept.isChecked) chosen.push(dept);
        if(dept.children) chosen = chosen.concat(this.filterChosenDept(dept.children))
      }
      return chosen;
    },
    async loadmore(){
      this.loadmoreOptions.disabled = true;
      this.loading = true;

      try {
        this.params.pageNum += 1;
        this.params.seeAllOrg = this.isSeeAllOrg;
      
        let userPage = await this.fetchUser(this.params);
        this.userPage.merge(Page.as(userPage));
      } catch (error) {
        console.error(error)
      }

      this.loading = false;
      this.loadmoreOptions.disabled = !this.userPage.hasNextPage;
    },
    /** 抓取用户数据 */
    fetchUser(params = {}){    
      if(this.isDingtalk) return this.fetchDingtalkUser()
      return http.post(this.action, params, false).then(page => {
        // 合并数据
        let rows = page.list || [];

        for(let i = 0;i < rows.length; i++){
          let user = rows[i];

          let index = -1;
          for(let j = 0; j < this.chosen.length; j++){
            if(user.userId == this.chosen[j].userId){
              index = j;
              break;
            }
          }

          if(index >= 0){// 存在相同数据 则替换原数据
            user.selected = true;
            this.$set(this.chosen, index, user);
          }else{
            user.selected = false;
          }
        }
        return page;
      })
        .catch(err => console.error('err', err));
    },
     /** 抓取钉钉端用户数据 */
    fetchDingtalkUser(){      
      let params = this.params;
      params.useStateBlackList = localStorage.getItem('useStateBlackList') || 0; 
      return http.get('/security/department/user', params).then(userPage => {

        return userPage;
      })
        .catch(err => console.error('err', err))
    },
    /** 抓取部门数据 */
    fetchDept(){
      if(this.isDingtalk) return this.fetchDingtalkDept();
      let params = {};
      params.seeAllOrg = this.isSeeAllOrg;
      params.showDeleteUser = this.showDeleteUser ? 1 : 0;
      return http.post('/security/tag/tree', params).then(result => {
        let depts = (result && result.list) || [];
        return depts;
      })
        .catch(err => console.error('err', err));
    },
    /** 抓取钉钉部门数据 */
    fetchDingtalkDept(){
      let params = {};
      params.seeAllOrg = this.isSeeAllOrg;
      params.showDeleteUser = this.showDeleteUser ? 1 : 0;
      return http.get('/security/department/tree', params).then(result => {
        if(result.status == 1) return [];

        let depts = result.data || [];
        // 钉钉端数据处理
        depts =  JSON.parse(JSON.stringify(depts).replaceAll("name", "tagName").replaceAll("subDepartments","children")); 
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
    /** 初始化 */
    initialize(){
      this.show = true;
      this.initializeDept();
      if(this.showUserState) this.initializeStateColor();
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
          this.depts = depts
          this.initChosenDept(this.depts);
          this.initDeptUser(this.depts[0]); // 默认选中第一个
        })
        .catch(err => console.error(err))
    },
    /** 初始化选中的部门 */
    initChosenDept (depts) {
      this.chosenDept.forEach (chosen => {
        depts.forEach (dept => {
          let value = true;
          if(chosen.id == dept.id) this.toggleDeptCheckStatus(dept, value)
          if(dept.children.length > 0){
            this.initChosenDept(dept.children)
          }
        })
      })
    },
    /** 初始化工作状态的颜色 */
    initializeStateColor(){
      http.get('/setting/getStateColorMap')
        .then(res => this.stateColor = _.assign({}, this.stateColor,res || {}))
        .catch(err => console.error(err))
    },
    /** 获取用户头像 */
    head(user){
      return user.head || DefaultHead;
    },
    nodeRender(h, node){
      let content = <span>{node.tagName}</span>;
      if(!this.allowCheckDept) return content
      
      // let count = this.deptUserCount[node.id] || 0
      let count =  0
      if(count <= 0) return content;

      return (
        <div class="bc-dept-node-wrap">
          <span class="bc-dept-node-name">{node.tagName}</span>
          <span class="bc-dept-node-count">{count}</span>
        </div>
      )
    },
    changeDept(dept) {
      return
      this.depts.forEach(d => {
        this.$set(d, 'selected', false);
      });

      this.$set(dept, 'selected', true);
      this.initDeptUser(dept);
    },
    /* 查询是否开启 降低组织架构的开关 */
    getSeeAllOrg() {
      return http.post('/setting/user/getSeeAllOrg').then(result => { 
          return result
      })
      
    }
  },
  mounted(){
    this.initialize();
  },
  components: {
    [ContactUserItem.name]: ContactUserItem
  }
}
</script>

<style lang="scss">
  @import './department.scss';
</style>
