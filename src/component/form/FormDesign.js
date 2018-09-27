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
      enterEl: null,
      dragMode: null, //sort -- 排序 insert -- 添加字段
    }
  },
  methods: {
    /** 添加新字段 */
    addField(event, option){
      //TODO: 限制字段数量
      let fieldOptions = {
        formType: option.formType,
        displayName: option.name
      };
      let newField = new FormField(fieldOptions);

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
      let dragEl = event.target.closest('.form-design-drag');
      dragEl.draggable = true;
    },
    //记录被拖拽的元素
    dragStart(event, fieldId){
      event.dataTransfer.effectAllowed = 'move';

      this.dragEl = event.target.closest('.form-design-drag');
      this.dragEl._fd_fieldId = fieldId;
    },
    dragEnter(event, fieldId){
      event.preventDefault();
      let enterEl = event.target.closest('.form-design-drag');
      
      this.enterEl = enterEl;
      this.enterEl._fd_fieldId = fieldId;
    },
    dragEnd(event){
      event.dataTransfer.dropEffect = 'move';

      if(this.dragEl == null || this.enterEl == null || this.dragEl == this.enterEl) return;

      let arr = _.cloneDeep(this.value);

      let dragIndex = arr.findIndex(item => item._id == this.dragEl._fd_fieldId);
      let enterIndex = arr.findIndex(item => item._id == this.enterEl._fd_fieldId);
      let distance = dragIndex < enterIndex ? 1 : 0
      let dragField = arr[dragIndex]; //拖拽的字段
      let enterField = arr[enterIndex]; //目标字段

      arr.splice(dragIndex, 1);
      let insertIndex = arr.indexOf(enterField) ;
      arr.splice(insertIndex + distance, 0, dragField);

      this.$emit('input', arr);

      this.dragEl = null;
      this.enterEl = null;
      this.disableDrag(event.target)
    },
    //禁用拖拽
    disableDrag(el){
      let dragEl = el.closest('.form-design-drag');
      dragEl.draggable = false;
    },
    copyField(event, field){
      event.dataTransfer.effectAllowed = "copy";
      event.dataTransfer.setData('text/plain', JSON.stringify(field));
    },
    dropField(event){
      console.log('--- drop ---')
      let dropEl = event.target.closest('.form-design-drag');
      let data = event.dataTransfer.getData('text/plain');
      let newFieldOption = JSON.parse(data);
      console.log(newFieldOption)

      let fieldId = dropEl._fd_fieldId;
      console.log(fieldId);

      let fieldOptions = {
        formType: newFieldOption.formType,
        displayName: newFieldOption.name
      };
      let newField = new FormField(fieldOptions);

      let index = this.value.findIndex(item => item._id == fieldId);
      this.value.splice(index, 0, newField)
      
      console.log(event)
      console.log(event.dataTransfer.getData('text/plain'))
    }
  },
  mounted(){
  },
  render(h){
    //可用字段列表
    let fieldList = this.availableFields.map(field => {
      return (
        <div class="form-design-field" draggable
          onClick={e => this.addField(e, field)}
          onDragstart={e => this.copyField(e, field)}>
          {field.name}
        </div>)
    });
    
    //当前已选字段列表
    let previewList = this.value.map(currField => { 
      let currFieldId = currField._id;

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

      let dragClass = {
        'form-design-drag': true,
        'form-design-preview-enter': currFieldId == (this.enterEl ? this.enterEl._fd_fieldId : null)
      }

      //key
      return (
        <div class={previewClass}>
          <div class={dragClass}
            onDragstart={e => this.dragStart(e, currFieldId)}
            onDragenter={e => this.dragEnter(e, currFieldId)}
            onDragend={e => this.dragEnd(e)}
            onDragover={e => e.preventDefault()}
            onDrop={e => this.dropField(e)}
            >
            <div class="form-drag-handle" 
              onMousedown={e => this.initDrag(e)}
              onMouseup={e => this.disableDrag(e.target)}>::</div>
            {fieldPreview}
            <button type="button" onClick={e => this.deleteField(e, currField)}>删除</button>
          </div>
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