<template>
  <base-modal 
    :title="title" width="820px"
    :show.sync="show" @closed="$emit('destory')" @cancel="$emit('canel')">
    <div class="bc-dept-wrap">
      <div class="bc-dept" v-if="teams.length > 0">
        <base-tree
          :data="teams" 
          :node-render="nodeRender"
          :selected="selectedTeam" 
          :show-checkbox="allowCheckDept"
          @node-selected="initTeamUser" 
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
            :user="user" 
            :show-user-state="showUserState" 
            :state-color="stateColor"
            @toggle="chooseUser"
          />
          
          <div class="bc-contact-loading" v-if="loading">正在加载，请稍等...</div>
          <div v-if="userPage.total == 0 && !loading && mode == 'choose'" class="bc-contact-empty">
            <img src="../../../assets/img/contact-empty.png" />
            <p>暂无成员</p>
          </div>
        </div>
      </div>
      <div class="bc-chosen" v-if="isMulti">

        <!-- start 已选择部门 -->
        <template v-if="allowCheckDept && chosenDept.length > 0">
          <h4>已选部门</h4>
          <div 
            class="bc-chosen-team-user" 
            v-for="dept in chosenDept" :key="dept.id">
            <span>{{dept.name}}</span>
            <i class="iconfont icon-fe-close" @click="chooseDept({node: dept, value: false})"></i>
          </div>
        </template>
        <!-- end 已选择部门 -->

        <!-- start 已选择人员 -->
        <template v-if="chosen.length > 0 && !isGroup">
          <h4 v-if="allowCheckDept">已选人员</h4>
          <div class="bc-chosen-team-user" v-for="(user, index) in chosen" :key="`${user.userId}_${index}`">
            <div class="bc-chosen-team-user-head" :style="{backgroundImage: 'url(' + head(user) + ')'}"></div>
            <div class="bc-chosen-team-user-content">
              <span class="bc-chosen-team-user-name">{{user.displayName}}</span>
              <span class="bc-chosen-tema-user-tagname">
                {{ user.tagName }}
              </span>
            </div>
            <i class="iconfont icon-fe-close" @click="removeRepeatUser(user)"></i>
          </div>
        </template>
        <template v-else>
          <div class="chosen-tree-node-content" :class="{'chosen-tree-selected': isSelected}" >
            <div>
              <span class="base-tree-node-arrow" :class="{'base-tree-node-arrow-down': isExpand}" @click="toggle"><i class="iconfont icon-arrow-right" v-if="node.subDepartments.length > 0"></i></span>
            </div>
            <div class="bc-chosen-team-user" v-for="(user, index) in chosen" :key="`${user.userId}_${index}`">
              <div class="bc-chosen-team-user-head" :style="{backgroundImage: 'url(' + head(user) + ')'}"></div>
              <div class="bc-chosen-team-user-content">
                <span class="bc-chosen-team-user-name">{{user.displayName}}</span>
                <span class="bc-chosen-tema-user-tagname">
                  {{ user.tagName }}
                </span>
              </div>
              <i class="iconfont icon-fe-close" @click="removeRepeatUser(user)"></i>
            </div>
          </div>
        </template>
        <!-- end 已选择人员 -->

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

export default {
  name: 'base-contact-team',
  props: {
    /** 用户数据请求地址 */
    action: {
      type: String,
      default: '/security/department/user',
    },
    /** 是否允许选择重复的人员 */
    isRepeatUser: {
      type: Boolean,
      default: false,
    },
    /** 是否分组 */
    isGroup: {
      type: Boolean,
      default: false,
    },
    /** 
     * 最大选择人数，
     * 1 -- 单选
     * > 1 -- 多选
     * <= 0 -- 不限制选择人数
     */
    max: {
      type: Number,
      default: 0,
    },
    /** 已选中用户  */
    selectedUser: {
      type: Array,
      default: () => ({}),
    },
    /** 是否显示多选  */
    showTeamCheckbox: {
      type: Boolean,
      default: false,
    },
    /** 是否显示用户状态 */
    showUserState: {
      type: Boolean,
      default: false
    },
    /** 标题  */
    title: {
      type: String,
      default: '请选择人员',
    },
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

      teams: [], // 部门
      selectedTeam: {}, // 选中的部门
      chosenDept: [], // 选择的部门
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
      chosenGroup: [],

      params: {
        keyword: '', // 搜索关键词
        tagId: '',
        pageNum: 1,
        pageSize: 50
      }, // 参数
      userPage: new Page(),

      stateColor: {}, //用户工作状态颜色
    }

    let selectedUser = this.selectedUser;

    data.chosen = selectedUser.map(user => {
      return {
        userId: user.userId,
        displayName: user.displayName,
        staffId: user.staffId,
        head: user.head || ''
      }
    })

    return data
  },
  computed: {
    /** 是否允许添加用户 */
    allowAddUser(){
      return this.chosen.length < this.max;
    },
    /** 是否允许选中部门 */
    allowCheckDept(){
      return this.isMulti && this.showDeptCheckbox;
    },
    /** 按钮文字  */
    btnText(){
      return this.max > 0 ? `(${this.chosen.length}/${this.max})` : "";
    },
    /** 是否多选 */
    isMulti(){
      return this.max != 1;
    },
    /** 当前已选概览 */
    summary(){
      let text = `当前已选${this.chosen.length}人`;

      if(this.allowCheckDept) {
        text += `, 部门${this.chosenDept.length}个`;
      }
      return text;
    },
  },
  watch: {
    'chosen': {
      handler(newValue, oldValue) {
        if(!this.isGroup) return

        let chosen = newValue.slice();
        let team = {};

        chosen.forEach(c => {
          let tagName = c.tagName;
          team.hasOwnProperty(tagName)
          ? ''
          : team[tagName] = []

          team[tagName].push(c)
        });

        this.chosenGroup = [];

        for(let key in team) {
          this.chosenGroup.push({
            tagId: team[key][0].tagId,
            tagName: team[key][0].tagName,
            children: team[key]
          })
        }
      },
      deep: true,
    }
  },
  mounted(){
    this.initialize();
  },
  methods: {
    /** 添加人员 */
    addUser(user){
      if(!this.allowAddUser) return alert(`最多选择${this.max}人`);
    
      this.$set(user, 'selected', true);

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
    /** 添加重复的用户  */
    addRepeatUser(user) {
      if(!this.allowAddUser) return alert(`最多选择${this.max}人`);

      this.$set(user, 'selected', true);

      this.chosen.push(user);
    },
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

      user.selected 
        ? this.removeUser(user) 
        : this.isRepeatUser 
          ? this.addRepeatUser(user)
          : this.addUser(user);
    },
    /** 选择部门 */
    chooseDept(event){

      let {node, value} = event;

      this.toggleDeptCheckStatus(node, value);

      this.chosenDept = this.filterChosenDept(this.teams);
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

        let teams = this.chosenDept.map(item => {
          return {
            id: item.id,
            name: item.name
          }
        }) 
        data.teams = teams;

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

        this.initTeamUser(this.selectedTeam);
        return;
      }

      this.searchUser();
    }, 500),
    /** 移除选择的人员 */
    removeUser(user){
      this.$set(user, 'selected', false);

      var index = -1;
      var len = this.chosen.length;

      for(var i = 0; i < len; i++){

        let isRepeatUser = (
          this.isRepeatUser
          ? this.chosen[i].tagId == this.selectedTeam.id
          : true
        )

        if(isRepeatUser && this.chosen[i].userId == user.userId){
          index = i;
          break;
        }
      }
      index >= 0 && this.chosen.splice(index,1);
    },
    removeRepeatUser(user) {
      this.$set(user, 'selected', false);

      if(user.tagId === this.selectedTeam.id) {
        let list = this.userPage.list;
        let item = null;
        for(let i = 0; i < list.length; i++) {
          item = list[i];
          if(item.userId == user.userId) {
            this.$set(item, 'selected', false);
          }
        }
      }

      let index = this.chosen.findIndex(u => u.userId == user.userId);
      this.chosen.splice(index, 1);
    },
    /** 搜索用户 */
    async searchUser(){
      try {
        this.mode = 'search';
        this.loading = true;
        this.userPage.list = [];

        this.params.tagId = 'root';
        this.params.pageNum = 1;

        let userPage = await this.fetchUser(this.params);

        this.userPage.merge(Page.as(userPage));
        
      } catch (error) {
        console.error(error)
      }

      this.loading = false
      this.loadmoreOptions.disabled = !this.userPage.hasNextPage;
    },
    /** 选中一个部门 */
    async initTeamUser(team){
      try {
        this.mode = 'choose';
        this.selectedTeam = team;
        this.userPage.list = [];
        this.loading = true;

        // 查询用户
        this.params.keyword = '';
        this.params.tagId = this.selectedTeam.id;
        this.params.pageNum = 1;

        let userPage = await this.fetchUser(this.params);
        userPage.list = userPage.list.map(l => {
          return {
            ...l,
            tagId: this.selectedTeam.id,
            tagName: this.selectedTeam.name,
          }
        })

        this.userPage.merge(Page.as(userPage));
      } catch (error) {
        console.error(error)
      }

      this.loading = false;
      this.loadmoreOptions.disabled = !this.userPage.hasNextPage;
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
    /** 抓取用户数据 */
    fetchUser( params = {} ) {
      return http.post(this.action, params, false).then(page => {
        // 合并数据
        let rows = page.list || [];

        for(let i = 0;i < rows.length; i++){
          let user = rows[i];

          let index = -1;

          for(let j = 0; j < this.chosen.length; j++){

            let chosenItem = this.chosen[j];
            let isRepeatUser = (
              this.isRepeatUser
              ? chosenItem.tagId == this.selectedTeam.id
              : true
            )

            if(isRepeatUser && user.userId == chosenItem.userId){
              index = j;
              break;
            }
          }

          // 存在相同数据且不允许重复数据  则替换原数据
          if(index >= 0){
            this.$set(user, 'selected', true);

            let hasTeamDataUser = {
              ...this.chosen[index],
              ...user,
            }
            this.$set(this.chosen, index, hasTeamDataUser);
          }else{
            this.$set(user, 'selected', false);
          }
        }
        return page;
      })
        .catch(err => console.error('err', err));
    },
    /** 抓取团队数据 */
    fetchTeam(){
      let params = {
        onlyParent: true,
        pageNum: this.params.pageNum,
        pageSize: 0
      };

      return http.post('/security/tag/list', params).then(result => {
        if(result.status == 1) return [];

        let teams = result.list.map(l => {
          return {
            ...l,
            name: l.tagName ? l.tagName : l.name,
            subDepartments: l.children.map(c => {
              return {
                ...c,
                name: c.tagName ? c.tagName : c.name,
                subDepartments: c.children,
              }
            }) || [],
          }
        }) || [];

        return teams;
      }).catch(err => console.error('err', err));
    },
    /** 获取用户头像 */
    head(user){
      return user.head || DefaultHead;
    },
    /** 初始化 */
    initialize(){
      this.show = true;

      this.initializeTeam();

      if(this.showUserState) this.initializeStateColor();
    },
    /** 初始化团队数据 */
    async initializeTeam(){
      this.isSeeAllOrg = false;

      let subtask = [
        this.fetchTeam()
      ];

      Promise.all(subtask)
        .then(result => {
          let teams = result[0] || []

          this.teams = teams;

          this.initTeamUser(this.teams[0]); // 默认选中第一个
        })
        .catch(err => console.error(err))
    },
    /** 初始化工作状态的颜色 */
    initializeStateColor(){
      http.get('/setting/getStateColorMap')
        .then(res => this.stateColor = _.assign({}, this.stateColor,res || {}))
        .catch(err => console.error(err))
    },
    /** 加载更多  */
    async loadmore(){
      this.loadmoreOptions.disabled = true;
      this.loading = true;

      try {
        this.params.pageNum += 1;
      
        let userPage = await this.fetchUser(this.params);

        this.userPage.merge(Page.as(userPage));

      } catch (error) {
        console.error(error)
      }

      this.loading = false;
      this.loadmoreOptions.disabled = !this.userPage.hasNextPage;
    },
    nodeRender(h, node){
      let content = <span>{node.name}</span>;
      if(!this.allowCheckDept) return content
      
      let count = 0
      if(count <= 0) return content;

      return (
        <div class="bc-dept-node-wrap">
          <span class="bc-dept-node-name">{node.name}</span>
          <span class="bc-dept-node-count">{count}</span>
        </div>
      )
    },
  },
  components: {
    [ContactUserItem.name]: ContactUserItem
  }
}
</script>

<style lang="scss">
.bc-dept-wrap{
  display: flex;
  flex-flow: row nowrap;
  height: 450px;
  user-select: none;
}

.bc-dept{
  width: 260px;
  overflow: auto;
  height: 100%;
  padding: 2px 5px;
}

.bc-user{
  height: 100%;
  flex: 1;
  overflow: hidden;
  border-left: 1px solid #e9ecef;
}

.bc-search{
  height: 41px;
  padding: 6px;
  border-bottom: 1px solid #e9ecef;
}

.bc-search-inner{
  background-color: #f0f0f0;
  display: flex;
  flex-flow: row nowrap;
  border-radius: 2px;
  margin: 0;
  padding: 2px;

  i{
    display: block;
    width: 24px;
    height: 24px;
    line-height: 24px;
    text-align: center;
    font-size: 14px;
  }

  input[type='search']{
    flex: 1;
    border: none;
    outline: none;
    height: 24px;
    padding: 0;
    line-height: 24px;
    margin: 0;
    font-size: 14px;
    background-color: transparent;
    -webkit-appearance:none; 
  }
}

.bc-user-panel{
  height: calc(100% - 41px);
  overflow-y: auto;
}

.bc-chosen{
  width: 180px;
  border-left: 1px solid #e9ecef;
  padding: 0 5px;
  overflow-y: auto;

  h4{
    margin: 0;
    padding: 0 3px;
    line-height: 24px;
    font-size: 14px;
  }
}

.bc-chosen-team-user{
  padding: 0 5px;
  margin: 6px 3px;

  display: flex;
  align-items: center;
  justify-content: center;
  flex-flow: row nowrap;

  box-shadow: 0 0 1px rgba(0,0,0,.15);
  transition: background-color ease-out .3s;
  user-select: none;

  .bc-chosen-team-user-content {
    padding-left: 5px;
    .bc-chosen-tema-user-tagname {
      color: #9e9e9e;
      font-size: 12px;
    }
  }


  span{
    flex: 1;
    display: block;
    font-size: 14px;
    padding-left: 5px;
    line-height: 24px;
    @include text-ellipsis();
  }

  i{
    color: #9a9a9a;
    cursor: pointer;

    display: flex;
    flex: 1;
    justify-content: flex-end;

    visibility: hidden;
    font-size: 14px;

    &:hover{
      color: #e84040;
    }
  }

  &:hover{
    background-color: #fafafa;

    i{
      visibility: visible;
    }
  } 
}

.bc-chosen-team-user-head{
  display: block;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  overflow: hidden;

  background-repeat: no-repeat;
  background-position: center center;
  background-size: cover;
}

.bc-contact-footer{
  height: 52px;
  padding: 10px;
  text-align: right;
  border-top: 1px solid #e9ecef;
}

.bc-contact-chosen-count{
  float: left;
  color: $text-color-secondary;
  font-size: 14px;
  line-height: 32px;
}

.bc-contact-choose,
.bc-contact-cancel{
  outline: none;
  border:none;
  height: 28px;
  padding: 0 10px;
  background-color: transparent;
  cursor: pointer;
  font-size: 13px;
  border-radius: 2px;
  min-width: 65px;
}


.bc-contact-choose{
  background-color: $color-primary;
  color: #fff;
  line-height: 32px;
  height: 32px;
}

.bc-contact-cancel{
  color: $text-color-secondary;
  background-color: #fff;
  height: 32px;
  line-height: 32px;
  transition: background-color ease .15s;

  &:hover{
    background-color: #f0f0f0;
  }
}

.bc-contact-loading{
  text-align: center;
  padding: 10px;
  color: #999;
  font-size: 14px;
}

.bc-contact-empty{
  padding-top: 50px;
  text-align: center;
  color: #999;

  img{
    display: block;
    margin: 0 auto;
    width: 180px;
    margin-bottom: 15px;
  }
}

.bc-contact-search-tip{
  margin: 0;
  font-size: 14px;
  color: #999;
  line-height: 20px;
  font-weight: 400;
  padding: 6px 0 4px 10px;
}

.bc-dept-node-wrap{
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
}

.bc-dept-node-name{
  flex: 1;
  @include text-ellipsis();
}

.bc-dept-node-count{
  margin-left: 5;
  color: #9a9a9a;
}
</style>