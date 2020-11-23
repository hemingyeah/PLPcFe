import './LogicalFieldModal.scss';
import { cloneDeep } from 'lodash';

const LogicalFieldModal = {
  name: 'logical-field-modal',
  data(){
    return {
      show: false,
      currValue: null,
      fieldName: null,
      options: [],
      // 可用逻辑字段
      logicalFields: []
    }
  },
  methods: {
    showModal(field, allFields){
      // 只能选择该字段之后的非系统字段
      this.logicalFields = this.filterLogicalFields(field, allFields)
      this.fieldName = field.fieldName;
      this.options = field.options;
      this.currValue = this.options[0].value;
      this.show = true;
    },
    filterLogicalFields(field, allFields){
      let currIndex = allFields.findIndex(i => field == i);
      let logicalFields = allFields.filter((f, i) => {
        return (
          i > currIndex 
          && f.isSystem == 0 
        )
      })

      return cloneDeep(logicalFields)
    },
    cancel(){
      this.show = false;
    },
    submit(){
      this.$emit('submit', this.logicalFields)
      this.show = false;
    },
    choose(option){
      this.currValue = option.value;
    },
    bindDep(target){
      let fieldName = this.fieldName;
      let dependencies = target.dependencies;
      if(!Array.isArray(dependencies[fieldName])) this.$set(dependencies, fieldName, [])
      
      let depValues = dependencies[fieldName];
      let index = depValues.indexOf(this.currValue);

      index < 0 ? depValues.push(this.currValue) : depValues.splice(index, 1)
    },
    isCheck(target){
      let fieldName = this.fieldName;
      let dependencies = target.dependencies;
      let depValues = dependencies[fieldName];

      return Array.isArray(depValues) && depValues.indexOf(this.currValue) >= 0;
    },
    renderValueItem(option){    
      const className = ['logical-field-value', option.value == this.currValue ? 'logical-field-selected' : null];
      
      return <div class={className} key={option.value} onClick={() => this.choose(option)}>{option.value}</div>
    },
    renderTargetItem(field){
      const attrs = {
        nativeOn: {
          click: e => e.stopPropagation()
        }
      }

      if(field.formType == 'separator'){
        return (
          <div class="logical-field-target">
            <div class="logical-field-separator">{field.displayName}</div>
          </div>
        )
      }

      return (
        <div class="logical-field-target" key={field.fieldName} onClick={(e) => this.bindDep(field)}>
          <el-checkbox value={this.isCheck(field)} onInput={() => this.bindDep(field)} {...attrs}/>
          <p>{field.displayName}</p>
        </div>
      )
    }
  },
  render(h){
    const attrs = {
      props: {
        show: this.show,
        maskCloseable: false
      },
      on: {
        'update:show': val => this.show = val
      }
    }
    
    const tooltip = {
      directives: [{name: 'tooltip'}],
      domProps: {
        title: '在表单中，可以根据单选项的值决定表单中其他字段(位于该字段下方的非系统字段)的显示与隐藏。'
      }
    }

    return (
      <base-modal class="logical-field-modal" width="640px" {...attrs}>
        <h3 slot="title">配置显示逻辑 <i class="iconfont icon-question" {...tooltip}></i></h3>
        <div class="logical-field-panel">
          <h4 class="logical-field-panel-header">如果该字段值为：</h4>
          <div class="logical-field-panel-body">{ this.options.map(o => this.renderValueItem(o)) }</div>
        </div>
        <div class="logical-field-panel">
          <h4 class="logical-field-panel-header">那么显示以下字段：</h4>
          <div class="logical-field-panel-body">{ this.logicalFields.map(f => this.renderTargetItem(f)) }</div>
        </div>
        <div slot="footer" class="dialog-footer">
          <el-button  onClick={this.cancel}>取 消</el-button>
          <el-button type="primary" onClick={this.submit}>保 存</el-button>
        </div>
      </base-modal>
    )
  }
}

export default LogicalFieldModal;