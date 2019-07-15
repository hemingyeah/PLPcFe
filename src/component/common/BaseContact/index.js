import Vue from 'vue';

// 部门组件
import Department from './Department.vue';
import Team from './Team.vue';

import { destroyComponent } from '@src/util/dom';
import fastCall from '@src/component/util/fastCall'

const DeptComponent = Vue.extend(Department);
const MAX_NUM = 150; // 单次选人上限

function choose(type = 'dept', options = {}){
  if(type == 'dept') return dept(options);
  if(type == 'team') return team(options);
}

/** 部门 */
function dept(options){
  // 处理传入参数
  let selectedUser = [];
  let max = 0;

  if(typeof options.max == 'number' && !isNaN(max) && isFinite(max)) max = parseInt(options.max);
  if(max <= 0 || max > MAX_NUM) max = MAX_NUM; // 单次上限是150个
  if(max > 1 && Array.isArray(options.selected)) {
    selectedUser = options.selected.length > max ? options.selected.slice(0, max) : options.selected;
  }

  let showLocation = !!options.allotMap;
  let action = '/security/department/user';
  if(showLocation || options.allot) action = '/task/department/user/dispatch/list';
  if(options.action) action = options.action;

  let instance = new DeptComponent({
    propsData: {
      title: options.title,
      selectedUser,
      max,
      showTaskCount: options.showTaskCount === true,
      showUserState: options.showUserState === true,
      showLocation, // 是否显示定位信息
      lat: options.lat,
      lng: options.lng,
      action,
      showDeptCheckbox: options.showDeptCheckbox === true,
      seeAllOrg: options.seeAllOrg || false, /** 是否 只可见本团队成员 */
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

/** 团队  */
function team( options = {} ){
  // 处理传入参数
  let selectedUser = [];
  let selectedTeam = [];
  let max = 0;
  let action = '/security/tag/tagComponet/getUserList';
  let selectTypes = ['universal', 'performance'];
  let selectType = 'universal';

  if(typeof options.max == 'number' && !isNaN(max) && isFinite(max)) max = parseInt(options.max);
  if(max <= 0 || max > MAX_NUM) max = MAX_NUM; // 单次上限是150个
  if(max > 1 && options.selected && Object.keys(options.selected).length > 0) {
    let users = options?.selected?.users;
    let teams = options?.selected?.teams;
    let isUserArray = Array.isArray(users);
    let isTeamArray = Array.isArray(teams);

    if(isUserArray) selectedUser = users.length > max ? options.selected.slice(0, max) : users;
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
          let el = this.$el;
          // this.$destroy(true);

          // el.parentNode && el.parentNode.removeChild(el); 
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
          <base-contact-team 
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
        [Team.name]: Team
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