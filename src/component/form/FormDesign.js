//TODO: 拖拽添加
//TODO: 数据转换工具
import _ from 'lodash'
import FormField from './FormField';
import {
  Modes, 
  FormFieldMap,
  PreivewComponents, 
  SettingComponents
} from './components';

/** 返回一个随机key */
function genRandomKey(){
  let random = Math.random() * 100000000 >> 0;
  return random.toString(16);
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
    }
  },
  data(){
    let mode = Modes[this.mode];
    let modeFields = mode.fields || [];

    return {
      availableFields: modeFields.map(formType => FormFieldMap.get(formType)), //当前模式下可用字段
      currField: null, //当前选择的字段
      dragEl: null,
      enterEl: null
    }
  },
  methods: {
    /** 添加新字段 */
    addField(event, option){
      //TODO: 限制字段数量
      let newField = new FormField(option.formType);

      this.currField = newField;
      this.value.push(newField);
      this.$emit('input', this.value); 
    },
    /** 编辑选择的字段 */
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
    },
    initDrag(event){
      let dragEl = event.target.closest('.form-design-preview');
      dragEl.draggable = true;
    },
    //记录被拖拽的元素
    dragStart(event, index){
      this.dragEl = event.target.closest('.form-design-preview');
      this.dragEl.__sortIndex = index;
    },
    dragEnter(event, index){
      let enterEl = event.target.closest('.form-design-preview');
      if(enterEl == this.dragEl) return;
      
      this.enterEl = enterEl;
      this.enterEl.__sortIndex = index;
    },
    dragEnd(event){
      if(this.dragEl == null || this.enterEl == null) return;

      let arr = _.cloneDeep(this.value);

      let dragIndex = this.dragEl.__sortIndex;
      let enterIndex = this.enterEl.__sortIndex;

      let distance = dragIndex < enterIndex ? 1 : 0

      let dragField = arr[dragIndex];
      let enterField = arr[enterIndex];

      arr.splice(dragIndex, 1);
      let insertIndex = arr.indexOf(enterField) ;
      arr.splice(insertIndex + distance, 0, dragField);

      //insertIndex < 0 ? arr.unshift(dragField) : arr.splice(insertIndex, 0, dragField);

      this.$emit('input', arr);

      this.dragEl = null;
      this.enterEl = null;
      this.disableDrag(event.target)
    },
    //禁用拖拽
    disableDrag(el){
      el.closest('.form-design-preview').draggable = false;
    }
  },
  mounted(){
  },
  render(h){
    //可用字段列表
    let fieldList = this.availableFields.map(field => {
      return <div class="form-design-field" onClick={e => this.addField(e, field)}>{field.name}</div>
    });
    
    //当前已选字段列表
    let previewList = this.value.map((currField, index) => { 
      let formType = currField.formType;
      let comp = FormFieldMap.get(formType);

      let fieldPreview = h(comp.preview, {
        props: {
          field: currField
        },
        on: {
          chooseField: event => this.editField(event, currField)
        }
      });

      let previewClass = {
        'form-design-preview': true,
        'form-design-preview-selected': currField == this.currField
      }

      //key
      return (
        <div class={previewClass}
          onDragstart={e => this.dragStart(e, index)}
          onDragenter={e => this.dragEnter(e, index)}
          onDragend={e => this.dragEnd(e)}>
          <div class="form-drag-handle" 
            onMousedown={e => this.initDrag(e)}
            onMouseup={e => this.disableDrag(e.target)}>::</div>
          {fieldPreview}
          <button type="button" onClick={e => this.deleteField(e, currField)}>删除</button>
        </div>
      )
    });
    
    //字段设置
    let fieldSetting = null;
    if(this.currField){
      let formType = this.currField.formType;
      let comp = FormFieldMap.get(formType);

      let data = {
        key: genRandomKey(),
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

      fieldSetting = h(comp.setting, data)
    }

    return (
      <div class="form-design">
        <div class="form-design-panel">{fieldList}</div>
        <div class="form-design-main">
          <div class="form-design-list">{previewList}</div>
        </div>
        <div class="form-design-setting">{fieldSetting}</div>
      </div>
    );
  },
  components: {...PreivewComponents, ...SettingComponents}
};

export default FormDesign;