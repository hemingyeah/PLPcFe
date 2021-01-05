import Vue from 'vue';

import {isEnterprise} from '@src/util/Platform';
// 选部门和人员组件
import DepartmentAndUser from './DepartmentAndUser.vue';
// 团队选人组件
import Team from './Team.vue';
import MulTeam from './MulTeam.vue';
// 选择部门组件
import Department from './Department.vue';
/* util */
import Log from '@src/util/log.ts'
import { destroyComponent } from '@src/util/dom';
import fastCall from '@src/component/util/fastCall'


const DepartmentAndUserComponent = Vue.extend(DepartmentAndUser);

function choose(type = 'dept', options = {}) {
  Log.succ(type, 'type', choose.name)
  
  if(type == 'dept') return deptWithUser(options);
  if(type == 'team') return teamWithUser(options);
  if(type == 'dept_only') return department(options);
}

/** 部门和人员 */
function deptWithUser(options){
  // 处理传入参数
  let selectedUser = [];
  let max = options.max;
  
  if(
    ( typeof max == 'number' || typeof max == 'string' )
    && !isNaN(max) 
    && isFinite(max)
  ) {
    max = parseInt(max);
  } else {
    max = 0;
  }
  
  // 后端已经限制了人数，前端不应限制选人
  if(Array.isArray(options.selected)) {
    selectedUser = max === 1 ? [] : options.selected;
  }
  
  let selectedDepts = [];
  if(options.showDeptCheckbox && Array.isArray(options.selectedDepts)) {
    selectedDepts = options.selectedDepts;
  }

  let showLocation = !!options.allotMap;
  let action = '/security/tag/userList';
  // 多端工单选择负责人接口也改成/security/tag/userList
  // if(showLocation || options.allot) action = '/task/department/user/dispatch/list';
  if(options.action) action = options.action;

  let instance = new DepartmentAndUserComponent({
    propsData: {
      title: options.title,
      selectedUser,
      selectedDepts,
      max,
      showTaskCount: options.showTaskCount === true,
      showUserState: options.showUserState === true,
      showLocation, // 是否显示定位信息
      lat: options.lat,
      lng: options.lng,
      action,
      showDeptCheckbox: options.showDeptCheckbox === true,
      seeAllOrg: options.seeAllOrg || false, /** 是否 只可见本团队成员 */
      departShow: options.departShow,
      showDeleteUser: options.showDeleteUser || false, // 是否显示离职人员
    }
  });
  
  let ele = document.createElement('div');
  let body = document.body;
  let pending = false;
  
  return new Promise((resolve, reject) => {
    instance.$on('destroy', event => {
      setTimeout(() => destroyComponent(instance), 1500);
    })
    
    instance.$on('input', user => {
      if(pending) return;
      
      pending = true;
      resolve({status: 0, data: user});
    });
    
    instance.$on('cancel', () => {
      if(pending) return;
      
      pending = true;
      resolve({status: 1, message: 'cancel'});
    })
    
    body.appendChild(ele);
    instance.$mount(ele);
  })
}

/** 团队和人员 */
function teamWithUser( options = {} ){
  // 处理传入参数
  let selectedUser = [];
  let selectedTeam = [];
  let max = options.max;
  let from = options.from;
  let action = isEnterprise ? '/security/tag/userList' : '/security/tag/tagComponet/getUserList';
  let selectTypes = ['universal', 'performance'];
  let selectType = 'universal';
  
  if(
    ( typeof max == 'number' || typeof max == 'string' )
    && !isNaN(max) 
    && isFinite(max)
  ) {
    max = parseInt(max);
  } else {
    max = 0;
  }
  
  if(options.selected && max !== 1 && Object.keys(options.selected).length > 0) {
    let users = options?.selected?.users;
    let teams = options?.selected?.teams;
    let isUserArray = Array.isArray(users);
    let isTeamArray = Array.isArray(teams);
    
    if(isUserArray) selectedUser = users;
    if(isTeamArray) selectedTeam = teams;
  }
  if(options.action) action = options.action;
  if(selectTypes.indexOf(options.selectType) > 0) {
    selectType = options.selectType;
  }
  
  let ele = document.createElement('div');
  let body = document.body;
  let pending = false;

  body.appendChild(ele);

  return new Promise((resolve, reject) => {
    new Vue({
      el: ele,
      methods: {
        /** 取消  */
        cancel() {
          if(pending) return;
          
          pending = true;
          resolve({status: 1, message: 'cancel'});
        },
        /** 销毁  */
        destroy() {
          setTimeout(() => destroyComponent(this), 1500);
        },
        /** 值的改变  */
        input(user) {
          if(pending) return;
          
          pending = true;
          resolve({status: 0, data: user});
        }
      },
      render(){
        return (
          isEnterprise 
            ? <base-contact-team-mul
              action={action}
              dataFunc={typeof options.dataFunc == 'function' ? options.dataFunc : undefined}
              lat={options.lat}
              lng={options.lng}
              isRepeatUser={options.isRepeatUser === true}
              isGroup={options.isGroup === true}
              isHideTeam={options.isHideTeam === true}
              max={max}
              selectType={selectType}
              selectedTeam={selectedTeam}
              selectedUser={selectedUser}
              showTeamCheckbox={ options.showTeamCheckbox === true}
              showTaskCount={options.showTaskCount === true}
              showUserState={options.showUserState === true}
              title={options.title}
              onDestroy={this.destroy.bind(this)}
              onCancel={this.cancel.bind(this)}
              onInput={this.input.bind(this)}
            >
            </base-contact-team-mul> 
            : <base-contact-team 
              action={action}
              dataFunc={typeof options.dataFunc == 'function' ? options.dataFunc : undefined}
              lat={options.lat}
              lng={options.lng}
              isRepeatUser={options.isRepeatUser === true}
              isGroup={options.isGroup === true}
              isHideTeam={options.isHideTeam === true}
              max={max}
              selectType={selectType}
              selectedTeam={selectedTeam}
              selectedUser={selectedUser}
              showTeamCheckbox={ options.showTeamCheckbox === true}
              showTaskCount={options.showTaskCount === true}
              showUserState={options.showUserState === true}
              title={options.title}
              onDestroy={this.destroy.bind(this)}
              onCancel={this.cancel.bind(this)}
              onInput={this.input.bind(this)}
            >
            </base-contact-team>
        )
      },
      components: {
        [Team.name]: Team,
        [MulTeam.name]: MulTeam,
      }
    })
  })
}

/** 选择部门 */
function department( options = {} ){
  // 处理传入参数
  let max = options.max;

  if(
    ( typeof max == 'number' || typeof max == 'string' )
    && !isNaN(max) 
    && isFinite(max)
  ) {
    max = parseInt(max);
  } else {
    max = 0;
  }
  
  let selectedDepts = [];
  if(Array.isArray(options.selectedDepts)) {
    selectedDepts = options.selectedDepts;
  }

  let body = document.body;
  let mountEl = options.mountEl instanceof HTMLElement ? options.mountEl : body


  let ele = document.createElement('div');
  let pending = false;

  mountEl.appendChild(ele);

  return new Promise((resolve, reject) => {
    new Vue({
      el: ele,
      methods: {
        /** 取消  */
        cancel() {
          if(pending) return;

          pending = true;
          resolve({status: 1, message: 'cancel'});
        },
        /** 销毁  */
        destroy() {
          setTimeout(() => destroyComponent(this), 1500);
        },
        /** 值的改变  */
        input(user) {
          if(pending) return;

          pending = true;
          resolve({status: 0, data: user});
        }
      },
      render(){
        return (
          <base-contact-department 
            max={max}
            selectedDept={selectedDepts}
            seeAllOrg={options.seeAllOrg || false}
            title={options.title || undefined}
            onDestroy={this.destroy.bind(this)}
            onCancel={this.cancel.bind(this)}
            onInput={this.input.bind(this)}
          >
          </base-contact-department>
        //   <base-contact-team 
        //   action={action}
        //   from={from}
        //   dataFunc={typeof options.dataFunc == 'function' ? options.dataFunc : undefined}
        //   lat={options.lat}
        //   lng={options.lng}
        //   isRepeatUser={options.isRepeatUser === true}
        //   isGroup={options.isGroup === true}
        //   isHideTeam={options.isHideTeam === true}
        //   max={max}
        //   selectType={selectType}
        //   selectedTeam={selectedTeam}
        //   selectedUser={selectedUser}
        //   showTeamCheckbox={ options.showTeamCheckbox === true}
        //   showTaskCount={options.showTaskCount === true}
        //   showUserState={options.showUserState === true}
        //   title={options.title}
        //   onDestroy={this.destroy.bind(this)}
        //   onCancel={this.cancel.bind(this)}
        //   onInput={this.input.bind(this)}
        // >
        // </base-contact-team>
        )
      },
      components: {
        [Department.name]: Department
      }
    })
  })
}

const BaseContact = {
  install(Vue){
    fastCall(Vue, 'contact', { choose })
  },
  namespace: 'contact',
  props: {
    choose
  }
};

export default BaseContact;
