//TODO: 拖拽排序
//TODO: 拖拽添加

import _ from 'lodash'
import * as util from './util';
import FormField from './FormField';

export default class FormDesign{
  constructor(fieldSource = [], modes = {}){
    let source = _.cloneDeep(fieldSource);
    let components = {}; 
    let fieldMap = {};

    for(let i = 0; i < source.length; i++){
      let field = source[i]
      let settingComp = field.component.setting;
      let previewComp = field.component.preview;
      components[settingComp.name] = settingComp;
      components[previewComp.name] = previewComp;
      fieldMap[field.formType] = field;
    }

    this.name = 'form-design'; //组件名
    this.components = components; //所有依赖的组件，包含设置和预览
    this.fieldMap = fieldMap; //字段配置
    this.modes = modes; //模式配置，用于针对不同场景配置字段
    this.source = source; //字段数组
  }

  /** 导出FormDesign组件 */
  genComponent(){
    let ctx = this;
  
    //导出组件this指向组件本身，并不指向FormDesign实例
    return {
      name: ctx.name,
      props: {
        mode: {
          type: String,
          default: 'base'
        },
        value: {
          type: Array,
          default: () => []
        }
      },
      data(){
        let mode = ctx.modes[this.mode];
        let modeFields = mode.fields || [];
        let availableFields = ctx.source.filter(item => modeFields.indexOf(item.formType) >= 0);

        return {
          availableFields: availableFields, //当前模式下可用字段
          currField: null //当前选择的字段
        }
      },
      computed: {
       
      },
      methods: {
        addField(event, field){
          let newField = {
            formType: field.formType, 
            displayName: field.name
          };
          
          if(field.formType == 'select'){
            newField.options = [{value: '选项1', isDefault: false}];
          }

          let value = this.value; 
          value.push(FormField.as(newField));
          this.$emit('input', value)
        },
        editField(event, field){
          this.currField = field;
        },
        deleteField(event, item){
          let value = this.value; 
          let index = value.indexOf(item);

          if(index >= 0){
            value.splice(index, 1);
            this.$emit('input', value)
          }
        }
      },
      mounted(){
        //console.log(this.mode)
      },
      render(h){
        //可用字段列表
        let fieldList = this.availableFields.map(item => {
          return <div class="form-design-field" onClick={e => this.addField(e, item)}>{item.name}</div>
        });
        
        //当前已选字段列表
        let previewList = this.value.map(item => { 
          let formType = item.formType;
          let comp = ctx.fieldMap[formType].component.preview;

          let data = {
            props: {
              field: item
            },
            on: {
              chooseField: event => this.editField(event, item)
            }
          };
          let fieldPreview = h(comp.name, data)

          return (
            <div class="form-design-preview-item">
              {fieldPreview}
              <button type="button" onClick={e => this.deleteField(e, item)}>删除</button>
            </div>
          )
        });

        let fieldSetting = null;
        if(this.currField){
          let formType = this.currField.formType;
          let comp = ctx.fieldMap[formType].component.setting;
          let data = {
            key: util.genRandomKey(),
            props: {
              field: this.currField
            },
            on: {
              input: event => {
                let {prop, value} = event;
                this.currField[prop] = value;
              }
            }
          }

          fieldSetting = h(comp.name, data)
        }
    
        return (
          <div class="form-design">
            <div class="form-design-panel">{fieldList}</div>
            <div class="form-design-main">
              <div class="form-design-preview">{previewList}</div>
            </div>
            <div class="form-design-setting">{fieldSetting}</div>
          </div>
        );
      },
      components: ctx.components
    }
  }
}