<template>
  <base-modal 
    :title="title" width="820px"
    :show.sync="show" @closed="$emit('destory')" @cancel="$emit('canel')">
    <div class="bc-team-wrap">
      <div class="bc-team" v-if="teams.length > 0">
        <base-tree-dept
          :data="teams"
          :node-render="nodeRender"
          :selected="selectTeam" 
          :show-checkbox="allowCheckTeam"
          @node-selected="initTeamUser" 
          @node-check="chooseTeam" 
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
            v-for="(user, index) in userPage.list"
            :key="`${user.userId}_${index}`" 
            :user="user" 
            :show-user-state="showUserState" 
            :state-color="stateColor"
            :show-tag="isShowTag"
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

        <!-- start 已选择团队 -->
        <template v-if="allowCheckTeam && chosenTeam.length > 0">
          <h4>已选团队</h4>
          <div 
            class="bc-chosen-team-user" 
            v-for="team in chosenTeam" :key="team.id"
          >
            <span>{{team.name}}</span>
            <i class="iconfont icon-fe-close" @click="chooseTeam({node: team, value: false})"></i>
          </div>
        </template>
        <!-- end 已选择团队 -->

        <!-- start 已选择人员 -->
        <template v-if="chosen.length > 0">
          <h4 v-if="allowCheckTeam">已选人员</h4>
          <div class="bc-chosen-team-user" :class="isHideTeam ? 'bc-chosen-team-user-row': ''" v-for="(user, index) in chosen" :key="`${user.userId}_${index}`">
            <div class="bc-chosen-team-user-head" :style="{backgroundImage: 'url(' + head(user) + ')'}"></div>
            <div class="bc-chosen-team-user-content" :ref="`bcChosenTeamUserContent${user.userId}_${user.tagId}`">
              <span class="bc-chosen-team-user-name">{{user.displayName}}</span>
              <span v-if="!isHideTeam" class="bc-chosen-tema-user-tagname">
                {{ user.tagName }}
              </span>
            </div>
            <i class="iconfont icon-fe-close" @click="removeRepeatUser(user)"></i>
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
import { teamNameConversion } from '@src/util/conversionFunctionUtil.ts'

import ContactUserItem from './ContactUserItem.vue';
import DefaultHead from '@src/assets/img/avatar.png';

/* TODO: 可选团队 */
export default {
  name: 'base-contact-team-mul',
  props: {
    /** 用户数据请求地址 */
    action: {
      type: String,
      default: '/security/tag/userList',
    },
    /** 返回数据函数  */
    dataFunc: {
      type: Function,
      default(data) {
        let callData = {};
        
        // 返回用户
        callData.users = data.users.map(item => {
          let user = {
            userId: item.userId,
            displayName: item.displayName,
            staffId: item.staffId,
            head: item.head || ''
          };
          if(!this.isHideTeam) {
            user.tagId = item.tagId || '';
            user.tagName = item.tagName || '';
          }
          return user
        });
        
        // 如果允许选择团队
        if(this.allowCheckTeam) {
          callData.teams = data.teams.map(team => {
            return {
              id: team.id,
              name: team.name
            }
          })
        }
        
        return callData;
      }
    },
    /** 
     * @desc 是否允许选择重复的人员, 建议同时不要隐藏团队信息
    */
    isRepeatUser: {
      type: Boolean,
      default: false,
    },
    /** 是否分组 */
    isGroup: {
      type: Boolean,
      default: false,
    },
    /** 是否隐藏团队信息  */
    isHideTeam: {
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
    /** 搜索用户的 参数 */
    selectType: {
      type: String,
      default: 'universal',
    },
    /** 已选中用户  */
    selectedUser: {
      type: Array,
      default: () => [],
    },
    /** 已选中的团队  */
    selectedTeam: {
      type: Array,
      default: () => [],
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
      isMatchTeam: false,
      loading: true,
      loadmoreOptions: {
        disabled: false,
        callback: this.loadmore
      },

      teams: [], // 团队
      selectTeam: {}, // 选中的团队
      // 已选择的团队
      chosenTeam: [],
      // 已选择的人
      chosen: this.selectedUser.map(item => {
        return {
          displayName: item.displayName,
          head: item.head || '',
          userId: item.userId,
          selected: true,
          staffId: item.staffId,
          tagId: item.tagId,
          tagName: item.tagName,
        }
      }),
      
      params: {
        keyword: '', // 搜索关键词
        tagId: '',
        pageNum: 1,
        pageSize: 0,
        // selectType: ''
      }, // 参数
      userPage: new Page(),
      
      stateColor: {}, //用户工作状态颜色
    }
    
    return data
  },
  computed: {
    /** 是否允许添加用户 */
    allowAddUser(){
      if (this.max <= 0) return true;
      return this.chosen.length < this.max;
    },
    /** 是否允许选中团队 */
    allowCheckTeam(){
      return this.isMulti && this.showTeamCheckbox;
    },
    /** 按钮文字  */
    btnText(){
      return this.max > 0 ? `(${this.chosen.length}/${this.max})` : "";
    },
    /** 是否多选 */
    isMulti(){
      return this.max != 1;
    },
    /** 用户是否含有团队信息 */
    isUserHaveTagData() {
      return this.selectType !== 'universal';
    },
    /** 是否显示团队信息 */
    isShowTag() {
      return this.mode == 'search' && !this.isHideTeam;
    },
    /** 当前已选概览 */
    summary(){
      let text = `当前已选${this.chosen.length}人`;

      if(this.allowCheckTeam) {
        text += `, 团队${this.chosenTeam.length}个`;
      }
      return text;
    },
  },
  watch: {
    'selectedTeam': {
      handler(newValue, oldValue) {
        this.chosenTeam = newValue.map(item => {
          return { id: item.id, name: item.name }
        })
        this.isMatchTeam = true;
      },
      deep: true,
      immediate: true,
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

      let index = -1;
      let len = this.chosen.length;

      for(let i = 0; i < len;i++){
        if(user.userId == this.chosen[i].userId){
          index = i;
          break;
        }
      }
      index == -1
      ? this.chosen.push(user)
      : this.chosen.splice(index, 1, user)
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
            head: user.head || '',
            tagId: user.tagId || '',
            tagName: user.tagName || '',
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
    /** 选择团队 */
    chooseTeam(event){

      let {node, value} = event;

      this.toggleDeptCheckStatus(node, value);

      this.chosenTeam = this.filterChosenTeam(this.teams).map(teamNameConversion)
    },
    /** 选中一个团队 */
    async initTeamUser(team){
      try {
        this.mode = 'choose';
        this.selectTeam = team;
        this.userPage.list = [];
        this.loading = true;

        // 查询用户
        this.params.keyword = '';
        this.params.tagId = this.selectTeam.id;
        this.params.pageNum = 1;
        this.params.pageSize = 0;
        // this.params.selectType = this.selectType;

        let userPage = await this.fetchUser(this.params);
        this.userPage.merge(Page.as(userPage));

      } catch (error) {
        console.error(error)
      }

      this.loading = false;
      this.loadmoreOptions.disabled = !this.userPage.hasNextPage;
    },
    // 筛选所有被选中的团队
    filterChosenTeam(teams){
      if(!Array.isArray(teams) || teams.length == 0) return [];

      let chosen = [];

      for(let i = 0; i < teams.length; i++){
        let team = teams[i];
        if(team.isChecked) chosen.push(team);
        if(team.children) chosen = chosen.concat(this.filterChosenTeam(team.children))
      }
      return chosen;
    },
    /** 抓取用户数据 */
    fetchUser( params = {} ) {
      return http.post(this.action, params, false).then(page => {
        // 合并数据
        let rows = page.list || [];
        
        for(let i = 0; i < rows.length; i++){
          let user = rows[i];
          let index = -1;
          
          for(let j = 0; j < this.chosen.length; j++){
            // 匹配数据
            let chosenItem = this.chosen[j];
            let isRepeatUser = (
              user.userId == chosenItem.userId
              && (
                  (this.isRepeatUser && !this.isHideTeam)
                  ? chosenItem.tagId == user.tagId
                  : true
                )
            )
            
            if(isRepeatUser){
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
        pageNum: this.params.pageNum,
        pageSize: 0
      };
      
      return http.post('/security/tag/tree', params).then(result => {
        let teams = result.list.map(l => {
          let list = {
            ...l,
            name: l.tagName ? l.tagName : l.name,
            children: l.children.map(c => {
              return {
                ...c,
                name: c.tagName ? c.tagName : c.name,
                subDepartments: c.children,
              }
            }) || [],
          }
          list.subDepartments = list.children.slice();
          
          return list;
        }) || [];
        
        return teams;
      }).catch(err => console.error('err', err));
    },
    /** 获取用户头像 */
    head(user){
      return user.head || DefaultHead;
    },
    inputKeyword(event){
      this.params.keyword = event.target.value;
      this.search();
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
          this.matchTeam();
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
    /**  匹配团队 */
    matchTeam() {
      if(!this.isMatchTeam) return 

      let teams = this.teams;

      teams.forEach(team => {
        this.matchTeamToggle(team)
      });

      this.isMatchTeam = false;
    },
    matchTeamToggle(team, checked = true) {
      let children = team.children || [];
      let selectTeams = this.selectedTeam;
      let toggle = (t) => selectTeams.some(s => s.id === t.id);

      this.$set(team, 'isChecked', toggle(team) ? checked : false);

      if(children.length > 0){
        children.forEach(item => this.matchTeamToggle(item));
      }
    },
    nodeRender(h, node){
      let content = <span>{node.tagName}</span>;
      let count = 0
      if(count <= 0) return content;
      return (
        <div class="dept-node-wrap">
          <span class="dept-node-name">{node.tagName}</span>
          <span class="dept-node-count">&nbsp;({count})人</span>
        </div>
      )
    },
    post(){
      let data = {
        users: this.chosen,
        teams: this.chosenTeam,
      }
      let inputData = this.dataFunc(data);

      this.show = false;
      this.$emit('input', inputData);
    },
    /** 移除选择的人员 */
    removeUser(user){
      this.$set(user, 'selected', false);

      var index = -1;
      var len = this.chosen.length;

      for(var i = 0; i < len; i++){

        let isRepeatUser = (
          this.isRepeatUser
          ? this.chosen[i].tagId == user.tagId
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
      let list = this.userPage.list;
      let item = null;
      let condition = u => u.userId == user.userId && u.tagId == user.tagId;
      
      for(let i = 0; i < list.length; i++) {
        item = list[i];
        if(condition(item)) {
          this.$set(item, 'selected', false);
          break;
        }
      }

      let index = this.chosen.findIndex(u => condition(u));
      index >= 0 && this.chosen.splice(index, 1);
    },
    /** 搜索人员 */
    search: _.debounce(function(){
      if(!this.params.keyword){ // 空值  显示团队
        this.mode = 'choose';

        this.initTeamUser(this.selectTeam);
        return;
      }

      this.searchUser();
    }, 500),
    /** 搜索用户 */
    async searchUser(){
      try {
        this.mode = 'search';
        this.loading = true;
        this.userPage.list = [];

        this.params.tagId = '';
        this.params.pageNum = 1;

        let userPage = await this.fetchUser(this.params);

        this.userPage.merge(Page.as(userPage));
        
      } catch (error) {
        console.error(error)
      }

      this.loading = false
      this.loadmoreOptions.disabled = !this.userPage.hasNextPage;
    },
    toggle(item) {
      this.$set(item, 'isSelected', !item.isSelected);
    },
    /** 切换该团队及子团队选中状态 */
    toggleDeptCheckStatus(team, value){
      this.$set(team, 'isChecked', value);

      let subTeams = team.children || [];
      if(subTeams.length > 0){
        subTeams.forEach(item => this.toggleDeptCheckStatus(item, value))
      }
    },
  },
  components: {
    [ContactUserItem.name]: ContactUserItem
  }
}
</script>

<style lang="scss">
.bc-team-wrap{
  display: flex;
  flex-flow: row nowrap;
  height: 450px;
  user-select: none;
}

.bc-team{
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
  padding: 2px 5px;
  margin: 6px 3px;

  display: flex;
  align-items: center;
  justify-content: center;
  flex-flow: row nowrap;

  box-shadow: 0 0 1px rgba(0,0,0,.15);
  transition: background-color ease-out .3s;
  user-select: none;

  .bc-chosen-team-user-content {
    flex: 1;

    overflow: hidden;
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
    line-height: 20px;
    @include text-ellipsis();
  }

  i{
    color: #9a9a9a;
    cursor: pointer;

    display: flex;
    justify-content: flex-end;
    width: 20px;

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

.bc-chosen-team-user-row {
  padding: 5px;
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

.bc-team-node-wrap{
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
}

.bc-team-node-name{
  flex: 1;
  @include text-ellipsis();
}

.bc-team-node-count{
  margin-left: 5;
  color: #9a9a9a;
}

.bc-user-tooltip,
.bc-team-tooltip {
  max-width: 400px;
}
</style>
