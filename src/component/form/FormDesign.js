import FormField from './FormField';
import Platform from '../../platform';
import normalizeWheel from '@src/util/normalizeWheel';

import * as config from './config'

import {
  FieldManager,
  PreviewComponents,
  SettingComponents
} from './components';

import {
  cloneDeep, 
  isEmpty
} from 'lodash';

import { 
  isSelect 
} from './util'
import {checkUser, deleteComponent} from '@src/api/TaskApi.ts';
import {deleteCardField} from '@src/api/SettingTaskApi';
/* enum */
import TableNameEnum from '@model/enum/TableNameEnum.ts';

/**
 * 展示是否必填项的字段
 * manager:  客户负责人
 */
const SHOW_IS_NULL_FIELD_COMP = ["manager"];

/** 创建字段预览组件 */
export function createPreviewComp(h, field){
  let currFieldId = field._id;
  let previewComp = FieldManager.findField(field.formType);

  if(previewComp == null){
    console.warn(`[not implement]: ${field.displayName}(${field.fieldName}): ${field.formType}. `)
    return null;
  }

  // 根据字段配置创建预览内容
  // todo 临时解决
  if (!previewComp) return;

  //TODO 隐藏字段不渲染
  if(field.isHidden == 1) return;
  
  let fieldPreview = h(previewComp.preview, {
    'class': 'form-design__ghost',
    props: { field, setting: previewComp}
  });
  
  let previewClass = {
    'form-design-preview': true,
    'form-design-selected': this.currField && (currFieldId == this.currField._id), // 被选中
    'form-design-dragging': field.dragging
  }
  
  return (
    <div class={previewClass} key={currFieldId}
      onMousedown={e => this.beginSort(field, e)}>
      {fieldPreview}
      {(field.isSystem == 0 || previewComp.forceDelete) && 
      <div class="form-design-operation">
        <div class="form-design-preview-hidden form-design-preview-btn" onClick={e => this.hiddenField(field)}>
          <el-tooltip class="item" effect="dark" content="隐藏" placement="top">
            <i class="iconfont icon-fdn-hidden"></i>
          </el-tooltip>
        </div>
        <div class="form-design-divider-separator" role="separator"></div>
        <div class="form-design-preview-delete form-design-preview-btn" onClick={e => this.deleteField(field)}>
          <el-tooltip class="item" effect="dark" content="删除" placement="top">
            <i class="iconfont icon-shanchu-copy"></i>
          </el-tooltip>
        </div>
      </div>}
      <div class="form-design-cover"></div>
    </div>
  )
}

/** 获取设置组件组件名，如果返回null，渲染默认组件 */
function getSettingComp(field, comp){
  // 先检测是否有扩展设置
  let extend = comp.extend || {};
  let key = `${this.mode}_${field.fieldName}_setting`;

  // TODO: 当fieldName不固定且是系统字段
  let systemKey = `${this.mode}_${field.formType}_setting`;
  if(extend[key] || extend[systemKey]) return extend[key] || extend[systemKey];

  // 系统字段默认设置
  if(field.isSystem == 1) return null;

  return comp.setting;
}

/** 创建字段设置组件 */
function createSettingComp(h, field){
  if(null == field) return null;
  if(field.isHidden == 1) return null;
  
  let formType = field.formType;
  let comp = FieldManager.findField(formType);
  if(null == comp) return null;

  let compName = getSettingComp.call(this, field, comp);
  
  if(null == compName) return (
    <div class="form-setting-panel">
      <h3 class="form-setting-panel-title">{field.displayName}</h3>   
      <p class="form-design-warning">该字段为系统内置字段，暂不支持修改、删除。</p>
      {SHOW_IS_NULL_FIELD_COMP.includes(field.fieldName) && createRequired(h, field)}
    </div> 
  );

  let props = { field, setting: comp, mode: this.mode, fields: this.value };
  if(isSelect(field)) props.getContext = () => this;

  return h(compName, {
    key: field._id,
    props,
    on: {
      input: event => {
        if (event.prop == 'dependencies') {
          let { operate, value } = event;

          if (operate == 'update') this.updateDependencies(value);
          if (operate == 'delete') this.deleteDependencies(field, false);
          return;
        }

        if (event.prop == 'isMulti' && event.value) {
          this.deleteDependencies(field);
        }
        
        if (event.isSetting) {
          this.$set(field.setting, event.prop, event.value);
        } else {
          this.$set(field, event.prop, event.value);
        }
      },
      updateOptions: event => {
        this.updateOptions(field, event);
      }
    }
  });
}

/**
 * 创建必填项
 */
function createRequired(h, field) {
  return h("el-checkbox", {
    props: {
      value: field.isNull,
      trueLabel: 0,
      falseLabel: 1,
    },
    on: {
      input: (value, prop) => {
        field.isNull = value;
      }
    },
  },["必填"]);
}

/**
 * 判断元素是否可见
 * @param {*} el 判断的元素
 */
function isVisibility(el, container){
  let min = container.scrollTop;
  let max = min + container.offsetHeight;
  
  return min <= el.offsetTop && (el.offsetTop + el.offsetHeight) <= max;
}

/** 检测元素是否在容器内 */
function isInContainer(elRect, containerRect){
  return !(
    elRect.right < containerRect.left // 检测是否在容器左边
    || elRect.left > containerRect.right // 检测是否在容器右边
    || elRect.top > containerRect.bottom // 检测是否在容器下边
    || elRect.bottom < containerRect.top // 检测是否在容器上边
  );
}

/** 获取拖拽显示模板 */
function getTemplate(el){
  if(el.classList.contains('form-design__ghost')){
    return el.outerHTML;
  }
  
  let tmp = el.querySelectorAll('.form-design__ghost');
  let outerHTML = '';
  if (tmp.length > 1) {
    tmp.forEach(item => {
      outerHTML += item.outerHTML
    })
  }

  return outerHTML;
}

const FormDesign = {
  name: 'form-design',
  props: {
    mode: {
      type: String,
      default: 'base'
    },
    value: {
      type: Array,
      default: () => []
    },
    /** 最大字段数量 */
    max: {
      type: Number,
      default: config.FORM_FIELD_MAX
    },
    /** 公共字段 */
    commonFields: {
      type: Array,
      default: () => ([])
    },
    relationFieldOptions: { // 关联查询字段关联项数据
      type: Object,
      default: () => ({})
    }
  },
  data(){
    let modeFields = FieldManager.findModeFields(this.mode);    
    let hasSystemField = false;
    let availableFields = [];
    
    modeFields.forEach(item => {
      let field = FieldManager.findField(item);
      if(null == field) return;

      if(field.isSystem == 1) hasSystemField = true;
      availableFields.push(field)
    })

    return {
      //角色列表
      roleList:[],
      // 当前模式下可用字段
      availableFields,
      // 是否显示系统字段tab
      hasSystemField,
      // 当前显示的字段 0 -- 基础组件  1 -- 系统组件
      fieldGroup: 0,
      // 拖拽相关
      $dragEvent: {
        target: null, // 正在被拖拽的元素
        offsetX: 0, // 鼠标与拖拽元素左边界距离
        offsetY: 0, // 鼠标与拖拽元素上边界距离
        prevClientY: 0, // 上一点的y坐标
        direction: 0, // 移动的方向 1 -- 向下  -1 -- 向上
        ghostEl: null,
        containerEl: null, // 字段容器
        mode: null, // 拖拽模式 sort -- 排序 insert -- 添加字段
        insertFieldOption: null // 待插入字段的选项
      },
      // 当前选择的字段
      currField: null,
      // 容器是否静默，不响应hover
      silence: false,
      // 插入的字段
      insertedField: null,
      // 插入前的值
      originValue: null,
      autographMax: config.AUTOGRAPH_MAX_LENGTH_MAX,
      show: false,
      // 修改公共字段配置
      fieldSettingModal: {
        visible: false,
        pending: false,
        backupField: {} // 备份数据
      }
    }
  },
  computed: {
    // 根据fieldMode筛选后的字段
    filterFields(){
      let groupFields = this.availableFields.filter(item => item.isSystem == this.fieldGroup);

      // 系统字段由于需要保证唯一性，需要剔除已存在的字段
      if(this.fieldGroup == 1){
        groupFields = groupFields.filter(f => this.value.findIndex(v => v.formType == f.formType) == -1);
      }

      return groupFields;
    },
    fieldControls(){
      let fieldArr = [];
      let groupFields = this.availableFields.filter(item => item.isSystem == 0 && item.formType != 'info' && item.formType != 'separator');
      let layoutFields = this.availableFields.filter(item => item.formType == 'info' || item.formType == 'separator');
      let sysFields = this.availableFields.filter(f => f.isSystem == 1);
      
      if(groupFields.length){
        let basisObj = {};
        basisObj.name = '基础控件'
        basisObj.field = groupFields;
        fieldArr.push(basisObj)
      }
      if(sysFields.length){
        let sysObj = {};
        sysObj.name = '系统字段'
        sysObj.field = sysFields;
        fieldArr.push(sysObj)
      }
      if(this.commonFields.length) {
        this.commonFields.map(field => field.name = field.displayName);

        let sysObj = {};
        sysObj.name = '公共字段'
        sysObj.field = this.commonFields;
        fieldArr.push(sysObj)
      }
      if(layoutFields.length){
        let layoutObj = {};
        layoutObj.name = '布局控件'
        layoutObj.field = layoutFields;
        fieldArr.push(layoutObj)
      }
      return fieldArr
    },
    // 是否为空
    isEmpty(){
      return !Array.isArray(this.value) || this.value.length == 0;
    },
    //已隐藏字段
    hiddenFields() {
     return this.value.filter(item => item.isHidden == 1);
    },
    //未隐藏字段
    unHiddenFields() {
      return this.value.filter(item => item.isHidden !== 1);
    },
    // 当前字段是否是公用字段
    isCommonField() {
      return this.currField && !!this.currField.isCommon;
    }
  },
  methods: {
    /** 触发input事件 */
    emitInput(value){
      this.$emit('input', value)
    },
    /** 更新字段依赖 */
    updateDependencies(target){
      let fieldMap = {};
      for(let i = 0; i < this.value.length; i++) {
        fieldMap[this.value[i].fieldName] = this.value[i];
      }
      
      // 合并数据
      target
        .filter(i => i.dependencies && Object.keys(i.dependencies).length > 0)
        .forEach(f => {
          let field = fieldMap[f.fieldName]
          
          if(null != field){
            this.$set(field, 'dependencies', f.dependencies)
          }
        })
    },
    /** 当field字段变动时，检测逻辑项 */
    checkLogicalField(){
      let value = this.value;
      let removeArr = [];
      let fieldMap = value.reduce((o, field, index) => (o[field.fieldName] = {field, index}) && o, {});
      
      for(let i = 0; i < value.length; i++){
        let field = value[i];
        let dependencies = field.dependencies || {};
        if(isEmpty(dependencies)) continue;
        
        Object.keys(dependencies).forEach(fieldName => {
          let fm = fieldMap[fieldName];
          if(fm == null) return delete dependencies[fieldName];
          
          // 在该字段下面需要去除逻辑项
          if(fm.index > i){
            let dep = dependencies[fieldName];
            if(Array.isArray(dep) && dep.length > 0) {
              removeArr.push([fm.field, field])
            }
            
            delete dependencies[fieldName];
          }
        })
      }
      
      if(removeArr.length > 0) this.showLogicalNotification(removeArr);
      this.emitInput(value);
    },
    /**
     * 删除与某字段关联的逻辑显示项
     * @param {Object} depField - 待删除依赖的字段
     * @param {boolean} clear - 是否是删除所有依赖。 true - 删除所有， false - 只删除option的依赖
     */
    deleteDependencies(depField, clear = true){
      this.$nextTick(() => {
        let allFields = this.value;
        let fieldName = depField.fieldName;
        let values = depField.options.map(i => i.value);
        let removeArr = []
        // 删除与该字段关联的字段
        allFields.forEach(field => {
          let dependencies = field.dependencies || {};
          if(isEmpty(dependencies) || null == dependencies[fieldName]) return;
          
          let dep = dependencies[fieldName];
          if(!Array.isArray(dep)) dep = [];
          
          // 删除所有依赖项
          if(clear) {
            if(dep.length > 0) removeArr.push([depField, field])
            return delete dependencies[fieldName]
          }
          
          dependencies[fieldName] = dep
            .map(val => {
              let newVal = values.indexOf(val) >= 0 ? val : null;
              if(newVal == null) removeArr.push([depField, field, val])
              
              return newVal;
            })
            .filter(i => i != null);
        })
        
        if(removeArr.length > 0) this.showLogicalNotification(removeArr);
      })
    },
    /** 显示逻辑显示变动提示 */
    showLogicalNotification(arr = []){
      Platform.notification({
        type: 'warning',
        title: '逻辑字段变动',
        duration: 0,
        message: (function(h){
          let fieldNodes = arr.map(arr => {
            let [p, r, v] = arr;
            let suffix = v == null ? null : <strong>[{v}]</strong>
            return <p><strong>{p.displayName}</strong> {suffix} -- <strong>{r.displayName}</strong></p>
          });
          
          return (
            <div class="form-design-notification">
              <p>因字段发生变动，以下字段之间的显示逻辑已被取消：</p>
              <div class="form-design-notification-content">{fieldNodes}</div>
            </div>
          );
        })(this.$createElement)
      })
    },
    /** 开始插入字段 */
    beginInsert(field, event) {
      // 禁止拖拽
      if (this.draggingDisable(field)) return;

      // 拖拽客户关联、产品关联字段
      if(field.formType == 'relationCustomer' || field.formType == 'relationProduct') {
        this.$eventBus.$emit('task_form_design_relation_options_set', field);
        return;
      }

      // 屏蔽非鼠标左键的点击事件
      if(event.button !== 0) return;

      // 限制字段数量
      if (this.value.length >= this.max) {
        return Platform.alert(`单个表单最多支持${ this.max }个字段`)
      }

      // 限制电子签名字段数量
      let autographFields = this.value.filter(field => field.formType == 'autograph');
      if(autographFields.length >= this.autographMax) {
        return Platform.alert(`电子签名自定义字段暂时不予许超过${ this.autographMax }个`);
      }
      
      let dragEvent = this.$data.$dragEvent;
      let target = event.target.closest('.form-design-field');
      let dragRect = target.getBoundingClientRect();
      
      dragEvent.target = target;
      dragEvent.offsetY = event.clientY - dragRect.top;
      dragEvent.offsetX = event.clientX - dragRect.left;
      dragEvent.prevClientY = event.clientY;
      dragEvent.mode = 'insert';
      dragEvent.insertFieldOption = field;
      dragEvent.initGhost = false;
      
      this.currField = null;
      this.insertedField = null;
      this.originValue = cloneDeep(this.value);
      
      // 监听鼠标移动事件
      document.addEventListener('mousemove', this.handleDragging)
      document.addEventListener('mouseup', this.handleDragEnd)
    },
    /** 开始拖拽 */
    beginSort(field, event) {
      // 屏蔽非鼠标左键的点击事件
      if(event.button !== 0) return;
      
      let dragEvent = this.$data.$dragEvent;
      let target = event.target.closest('.form-design-preview');
      let dragRect = target.getBoundingClientRect();
      
      dragEvent.target = target;
      dragEvent.offsetY = event.clientY - dragRect.top;
      dragEvent.offsetX = event.clientX - dragRect.left;
      dragEvent.prevClientY = event.clientY;
      dragEvent.mode = 'sort';
      dragEvent.initGhost = false;
      
      this.currField = field;
      
      // 监听鼠标移动事件
      document.addEventListener('mousemove', this.handleDragging)
      document.addEventListener('mouseup', this.handleDragEnd)
    },
    
    /** 处理拖拽 */
    handleDragging(event) {
      let dragEvent = this.$data.$dragEvent;
      let ghostEl = dragEvent.ghostEl;
      let containerEl = dragEvent.containerEl;
      let dragEl = dragEvent.target;
      
      // 初始化ghostEL
      if (!dragEvent.initGhost) {
        ghostEl.style.display = 'block';
        ghostEl.querySelector('.form-design__template').innerHTML = getTemplate(dragEl)
        ghostEl.style.width = `${ dragEl.offsetWidth }px`;
        
        if (this.currField) this.currField.dragging = true;
        dragEvent.initGhost = true;
        this.silence = true;
      }
      
      // 移动ghostEl
      let y = event.clientY - dragEvent.offsetY;
      let x = event.clientX - dragEvent.offsetX
      ghostEl.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      dragEvent.direction = event.clientY - dragEvent.prevClientY >= 0 ? 1 : -1;
      dragEvent.prevClientY = event.clientY;
      
      // 判断ghostEl是否在容器内
      let containerRect = containerEl.getBoundingClientRect();
      let ghostRect = ghostEl.getBoundingClientRect();
      let inContainer = isInContainer(ghostRect, containerRect);
      
      if (dragEvent.mode == 'sort') {
        if (inContainer) {
          let dragIndex = this.unHiddenFields.findIndex(item => item._id == this.currField._id);
          let enterIndex = this.calcIndex(y, dragIndex);
          this.sort(dragIndex, enterIndex);
        }
        return;
      }
      
      if (dragEvent.mode == 'insert') {
        // 已经插入但是当前拖拽元素不在容器内，删除该字段
        if (!inContainer && this.insertField) {
          this.insertedField = null;
          this.currField = null;
          this.emitInput(this.originValue);
          return;
        }
        
        if (inContainer) {
          // 如果已经插入，对字段进行排序
          if (this.insertedField) {
            let dragIndex = this.unHiddenFields.findIndex(item => item._id == this.insertedField._id);
            let enterIndex = this.calcIndex(y, dragIndex);
            this.sort(dragIndex, enterIndex);
            return;
          }
          
          // 插入字段
          dragEvent.direction = 0;
          let insertIndex = this.calcIndex(y);
          let newField = this.insertField(dragEvent.insertFieldOption, this.value, insertIndex)
          this.insertedField = newField;
        }
      }
    },
    /** 结束拖拽 */
    handleDragEnd() {
      // 清空鼠标事件
      document.removeEventListener('mousemove', this.handleDragging)
      document.removeEventListener('mouseup', this.handleDragEnd)
      
      let dragEvent = this.$data.$dragEvent;
      dragEvent.ghostEl.style.display = 'none';
      
      // 检查逻辑字段
      if(dragEvent.mode == 'sort' && dragEvent.initGhost){
        this.checkLogicalField()
      }
      
      if (this.currField) this.currField.dragging = false;
      this.silence = false;
    },
    /** 计算当前位置索引 */
    calcIndex(distance, currIndex = -1) {
      let dragEvent = this.$data.$dragEvent;
      let containerEl = dragEvent.containerEl;
      let previewDoms = Array.prototype.slice.call(dragEvent.containerEl.children);
      let containerRect = containerEl.getBoundingClientRect();
      
      let offsetTop = distance - containerRect.top + containerEl.scrollTop;
      let direction = dragEvent.direction;
      
      // 如果是向上移动 或 插入时
      if (direction <= 0) {
        for (let i = 0; i < previewDoms.length; i++) {
          let dom = previewDoms[i];
          if (dom.offsetTop + (dom.offsetHeight / 2) > offsetTop) {
            // 如果前一位置是当前位置，直接返回前一位置
            return i - 1 == currIndex ? currIndex : i;
          }
        }
      }
      
      // 如果是向下移动
      if (direction > 0) {
        let index = -1;
        let ghostEl = dragEvent.ghostEl;
        offsetTop += ghostEl.offsetHeight;
        
        for (let i = 0; i < previewDoms.length; i++) {
          let dom = previewDoms[i];
          if (dom.offsetTop + (dom.offsetHeight / 2) < offsetTop + dragEvent.offsetY) {
            index = i;
          }
        }
        // 如果后一位置是当前位置，直接返回后一位置
        return index + 1 == currIndex ? currIndex : index;
      }
      
      return -1;
    },
    /** 字段排序 */
    sort(dragIndex, enterIndex) {
      if (dragIndex < 0 || enterIndex < 0 || dragIndex == enterIndex) return;

      let arr = cloneDeep(this.unHiddenFields);
      
      let distance = dragIndex < enterIndex ? 1 : 0
      let dragField = arr[dragIndex]; // 拖拽的字段
      let enterField = arr[enterIndex]; // 目标字段
      
      arr.splice(dragIndex, 1);
      let insertIndex = arr.indexOf(enterField);
      arr.splice(insertIndex + distance, 0, dragField);
      
      let newArr = [...arr,...this.hiddenFields]
      this.emitInput(newArr)
      this.chooseField(dragField)
    },
    /** 选中字段 */
    chooseField(field) {
      this.currField = field;
      
      this.$nextTick(() => {
        let dragEvent = this.$data.$dragEvent;
        let containerEl = dragEvent.containerEl;
        let draggingEl = this.$el.querySelector('.form-design-selected');
        let visible = isVisibility.call(this, draggingEl, containerEl);
        
        if (!visible) {
          let scrollTop = draggingEl.offsetTop + draggingEl.offsetHeight - containerEl.offsetHeight;
          containerEl.scrollTop = scrollTop;
        }
      })
    },
    /** 删除字段 */
    async deleteField(item) {
      let tip = item.isSystem == 0 ? '删除该字段后，之前所有相关数据都会被删除且无法恢复，请确认是否删除？' : '该字段为系统内置字段，请确认是否删除？'
      if (!await Platform.confirm(tip)) return;

      let isNext = true;

      // 删除字段需与后端交互的模块
      const checkUserArr = [TableNameEnum.Task, TableNameEnum.TaskReceipt, TableNameEnum.Event, TableNameEnum.EventReceipt,TableNameEnum.TaskCard];
      // 排除新拖进来的公共字段
      if(checkUserArr.indexOf(this.mode) > -1 && item.id && !item.isDragCommon) {
        // item.id表明该字段已经在后端存储过，不是本次的新增字段
        if(this.mode == 'task_card') {
          isNext = await this.deleteCardFormField(item);
        }else{
          if(item.formType == 'user') {
            // 删除的是人员，先check是否在审批流程中
            isNext = await this.deleteUser(item, this.deleteFormField);
          }else{
            isNext = await this.deleteFormField(item);
          }
        }

      }

      if(!isNext) {
        return false;
      }

      let value = this.value;
      let index = value.indexOf(item);
      
      if (index >= 0) {
        // 如果是选中的字段，清除选中
        if (this.currField == item) this.currField = null;
        
        value.splice(index, 1);
        
        this.deleteDependencies(item);
        this.emitInput(value)
      }
    },
    /** 隐藏字段 */
    async hiddenField(item) {
      let tip = item.isSystem == 0 ? '隐藏后该字段将不在页面上展示，请确认是否隐藏？' : '该字段为系统内置字段，请确认是否隐藏？'
      if (!await Platform.confirm(tip)) return;

      let value = this.value;
      let index = value.indexOf(item);
      value[index].isHidden = value[index].isHidden == 1 ? 0 : 1;

      this.emitInput(value)
    },
    async deleteUser(item, callback) {
      let result = await checkUser({ id : item.id })
      let isSuccess = result.status == 0
      // 是否成功
      if (!isSuccess) {
        console.warn('Caused: checkUser Function result is fail')
        return false
      }
      // 是否需要审批
      let isNeedApproval = result.data && result.data.show == 1
      if (!isNeedApproval) return true

      // 是审批人
      let confirm = await this.$platform.confirm('该人员字段已在审批流程中选择，如果删除，对应的审批流程将设置为“无需审批”，确定要删除吗？');
      // 取消该id对应的人员字段必填后，指向该人员的审批流程变为“无需审批”
      if(confirm) return callback(item)
    },
    
    async deleteFormField(item) {
      let result = await deleteComponent({ id : item.id });
      if(result.code) {
        this.$platform.alert(result.message);
        return false;
      }
      
      return true;
    },
    // 附加组件删除表单
    async deleteCardFormField(item) {
      let result = await deleteCardField({ id : item.id });
      if(result.code) {
        this.$platform.alert(result.message);
        return false;
      }
      
      return true;
    },

    /** 添加新字段 */
    insertField(option = {}, value, index) {
      // 拖进来的是公共字段
      let isDragCommon = option.isCommon == 1;

      let newField = new FormField({
        ...option,
        formType: option.formType,
        displayName: option.name,
        fieldName: option.fieldName,
        isSystem: option.isSystem,
        isDragCommon: isDragCommon ? 1 : 0,
        setting: isDragCommon ? option.setting : {}
      });
      
      let arr = cloneDeep(value ? value : this.value);
      index == null ? arr.push(newField) : arr.splice(index, 0, newField);
      this.emitInput(arr)
      
      // 选中新添加的字段
      this.chooseField(newField);
      return newField;
    },
    /** 立即插入字段 */
    immediateInsert(field, event) {
      // 禁止拖拽
      if (this.draggingDisable(field)) return;

      let dragEvent = this.$data.$dragEvent;
      if (dragEvent) dragEvent.direction = 0;

      // 限制字段数量
      if (this.value.length >= this.max) return 
    
      let newField = this.insertField(field, this.value, this.value.length);
      this.insertedField = newField;
    },
    scrollPreviewList(e) {
      let containerEl = this.$data.$dragEvent.containerEl;
      
      let {pixelY} = normalizeWheel(e);
      containerEl.scrollTop += pixelY;
    },
    //获取角色列表
    getRoleListreq() {
      this.$http.get('/setting/role/list', {pageSize: 0 }).then(res => {
        const { list } = res;
        this.roleList = list;
      }).catch(err => console.error('err', err));
    },
    renderTabHeader(name){
      return (
        <div class="form-design-tabs">
          <div class="form-design-tab">{name}</div>
        </div>
      );

      // return (
      //   <div class="form-design-tabs form-design-withSys">
      //     <div class={['form-design-tab', this.fieldGroup == 0 ? 'form-design-tab-active' : null]} onClick={e => this.fieldGroup = 0}>基础控件</div>
      //     <div class={['form-design-tab', this.fieldGroup == 1 ? 'form-design-tab-active' : null]} onClick={e => this.fieldGroup = 1}>系统控件</div>
      //   </div>
      // )
    },
    renderFieldList(fields){
      if(fields.length == 0){
        return <div class="form-design-field-empty">暂无可添加的{this.fieldGroup == 0 ? '基础' : '系统'}控件</div>
      }

      return fields.map(field => {
        return (
          <div class={['form-design-field-wrap', {'disabled': this.draggingDisable(field)}]}
            onMousedown={e => this.beginInsert(field, e)}
            onClick={e => this.immediateInsert(field, e)}>
            <div class="form-design-field form-design__ghost"> 
              <span class="anticon"><i class={['iconfont', `icon-fdn-${field.formType}`]}></i></span>
              <span class="field-name">{field.name}</span>
            </div>
          </div>
        )
      });
    },
    renderPreviewList(h){
      if(this.isEmpty) return (
        <div class="form-design-tip">
          <p>选择左侧控件拖动到此处</p>
        </div>
      )

      return this.value.map(f => createPreviewComp.call(this, h, f))
    },
    renderSettingPanel(h){
      let fieldSetting = createSettingComp.call(this, h, this.currField);
      // if(null == fieldSetting) return null;

      return (
        <div
          class={['form-design-setting', this.isCommonField && 'form-design-setting-disabled']}
          key="form-design-setting">
          { this.renderFieldCommonSetting() }
          { fieldSetting }
        </div>
      )
    },
    //渲染已隐藏字段弹窗dom
    renderBaseModal(h){
      if(!this.show) return null;
      const scopedSlots = {
        default:({row,column})=>{
          return  <el-button type="text" size="small" onClick={()=>this.onRestoreField(row)}>恢复</el-button>
        }
      }
      return (
        <base-modal
         appendToBody={ true }
         class="base-hidden-modal"
         title="已隐藏字段" 
         show={ this.show } 
         onClose={ this.onCloseBaseModal }
         width="400px"
        >
          <el-table data={this.hiddenFields} header-row-class-name="base-table-header-v3" row-class-name="base-table-row-v3" border>
            <el-table-column prop="displayName" label="已隐藏字段"/>
            <el-table-column label="操作" width="100" scopedSlots={ scopedSlots }/> 
         </el-table>
        </base-modal>
      );
    },
    updateOptions(field, event) {
      if(!field.setting.customerOption) return;
      field.setting.customerOption[event.prop] = event.value;
    },
    /** 
     * @description 恢复已隐藏字段
    */
    async onRestoreField(row) {
      let value = this.value;
      let index = value.indexOf(row);
      value[index].isHidden = value[index].isHidden == 1 ? 0 : 1;

      this.emitInput(this.value)
      this.$platform.notification({
        title: '操作成功',
        type: 'success',
      }); 
    },
    /** 
     * @description 关闭弹窗
    */
    onCloseBaseModal() {
      this.show = false;
    },
    /** 
     * @description 显示弹窗
    */
    onShowBaseModal() {
      if(this.hiddenFields.length==0) return this.$platform.confirm('暂无隐藏字段');
      this.show = true;
    },
    /** 
    * @description 禁止拖拽
    */
    draggingDisable(field) {
      return this.value.findIndex(v => v.fieldName == field.fieldName) > 0;
    },
    /** 
    * @description 渲染公共字段特有的设置内容
    */
    renderFieldCommonSetting() {
      return this.isCommonField && (
        <div class="common-field-setting">
          <h4>公用字段</h4>
          <div class="common-field-setting-btn">
            <el-button onClick={this.cancelFieldCommonSetting}>取消“公用字段”属性</el-button>
            <el-button type="primary" onClick={this.openFieldSettingModal}>修改控件配置</el-button>
          </div>
        </div>
      )
    },
    /** 
    * @description 渲染公共字段修改控件配置弹窗
    */
    renderFieldCommonSettingModal(h) {
      let fieldSetting = createSettingComp.call(this, h, this.currField);

      return this.fieldSettingModal.visible && (
        <div class="field-setting-modal">
          <base-panel
            show={ this.fieldSettingModal.visible }
            onClose={ this.closeFieldSettingModal }
            title="修改控件配置"
            width="350px"
            re
          >
            <div class="base-panel-content">
              <div class="form-design-warning">
                <i class="iconfont icon-warning-circle-fill"></i>
                <span>“公用字段”编辑后将在所有已经被运用到该字段的表单中生效，请谨慎修改！</span>
              </div>
              { fieldSetting }
            </div>
            <div class="base-panel-footer" slot="footer">
              <el-button onClick={ this.closeFieldSettingModal }>取消</el-button>
              <el-button type="primary" onClick={ this.saveFieldSetting } disabled={ this.fieldSettingModal.pending }>保存</el-button>
            </div>
          </base-panel>
        </div>
      )
    },
    /** 
    * @description 取消当前字段公共字段属性
    */
    async cancelFieldCommonSetting() {
      let confirm = await this.$platform.confirm(`确定要取消「${this.currField.displayName}」的“公用字段”属性吗？`);
      if(!confirm) return;

      this.$emit('cancelPublicFieldSetting', this.currField);
    },
    /** 
    * @description 打开修改控件配置弹窗
    */
    openFieldSettingModal() {
      this.fieldSettingModal.backupField = cloneDeep(this.currField);
      this.fieldSettingModal.visible = true;
    },
    /** 
    * @description 取消修改控件配置
    */
    closeFieldSettingModal() {
      this.currField = cloneDeep(this.fieldSettingModal.backupField);
      this.fieldSettingModal.visible = false;
    },
    /** 
    * @description 修改公共字段配置
    */
    async saveFieldSetting() {
      let confirm = await this.$platform.confirm('“公用字段”编辑后将在所有已经被运用到该字段的表单中生效，请谨慎修改！');
      if(!confirm) return;

      this.fieldSettingModal.pending = true;

      this.$emit('updatePublicFieldSetting', this.currField);
    }
  },
  render(h){
    return (
      <div class="form-design">
        <div class="form-design-panel">
          <div class="form-design-left"> 
            {
              this.fieldControls.map(field => {
                return(
                <div class="form-design-widget">
                  { this.renderTabHeader(field.name) }
                  <div class="form-design-tabs-content">
                    { this.renderFieldList(field.field) }
                  </div>
                </div>
                )
              })
            }
          </div>
        </div>
        <div class="form-design-main">  
         <div class="form-design-box">
            <div class="form-design-hidden">
            { this.hiddenFields.length > 0 && (
              <p onClick={this.onShowBaseModal }><i class="iconfont icon-fdn-hidden"></i>查看已隐藏字段</p> )} 
            </div>
            <div class="form-design-center">
              <div class={['form-design-phone', this.silence ? 'form-design-silence' : null]}>
                { this.renderPreviewList(h) }
              </div>
            </div>
          </div>  
        </div>
        { this.renderSettingPanel(h) }
        <div class="form-design-ghost" key="form-design-ghost" onWheel={this.scrollPreviewList}>
          <div class="form-design__template"></div>
          <div class="form-design-cover"></div>
        </div>
        { this.renderBaseModal(h) }
        { this.renderFieldCommonSettingModal(h) }
      </div>
    );
  },
  mounted(){
    this.$data.$dragEvent.ghostEl = this.$el.querySelector('.form-design-ghost');
    this.$data.$dragEvent.containerEl = this.$el.querySelector('.form-design-phone');
    this.getRoleListreq();
  },
  components: {...PreviewComponents, ...SettingComponents}
};

export default FormDesign;
