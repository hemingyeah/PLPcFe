//TODO: 数据转换工具
import _ from 'lodash'
import FormField from './FormField';
import Platform from '../../platform';
import {
  Modes, 
  FormFieldMap,
  PreivewComponents, 
  SettingComponents
} from './components';

//创建字段预览组件
function createPreviewComp(h, field){
  let currFieldId = field._id;
  let previewComp = FormFieldMap.get(field.formType);
  
  //根据字段配置创建预览内容
  let fieldPreview = h(previewComp.preview, {
    props: { field },
    on: { chooseField: this.chooseField }
  });

  let previewClass = {
    'form-design-preview': true,
    'form-design-ghost': field.dragging, //正在被拖拽
    'form-design-selected': field == this.currField, //被选中
    'form-design-enter': currFieldId == (this.enterEl ? this.enterEl._fd_fieldId : null) //进入该元素
  }

  return (
    <div class={previewClass} key={currFieldId}>
      <div class="form-design-drag"
        onDragstart={e => this.dragStart(e, field)}
        onDragenter={e => this.dragEnter(e, currFieldId)}
        onDragend={e => this.dragEnd(e)}
        onDragover={e => this.dragOver(e)}>
        <div class="form-design-drag-handle" 
          onMousedown={e => this.enableDrag(e)}
          onMouseup={e => this.disableDrag(e.target)}>::</div>
        {fieldPreview}
        <button type="button" class="form-design-preview-delete" onClick={e => this.deleteField(field)}>删除</button>
      </div>
    </div>
  )
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
      
      insertFieldOption: null, //待插入字段的选项
      originValue: null, //插入前的值
      insertField: null //插入的字段
    }
  },
  methods: {
    //允许字段可拖拽
    enableDrag(event){
      let dragEl = event.target.closest('.form-design-drag');
      dragEl.draggable = true;
    },
    //禁止字段拖拽
    disableDrag(el){
      let dragEl = el.closest('.form-design-drag');
      let dragFieldId = dragEl._fd_fieldId;
      let dragField = this.value.find(item => item._id == dragFieldId);

      dragEl.draggable = false;
      dragField.dragging = false;

      this.dragEl = null;
      this.enterEl = null;
      this.dragMode = null;
    },
    //记录被拖拽的元素，用于字段排序
    dragStart(event, field){
      event.dataTransfer.effectAllowed = 'copyMove';
      
      this.dragMode = 'sort';
      this.dragEl = event.target.closest('.form-design-drag');
      this.dragEl._fd_fieldId = field._id;

      field.dragging = true;
    },
    //处理拖拽元素的默认行为
    dragOver(event){
      event.preventDefault();
    },
    //用于记录进入的元素，用于字段排序
    dragEnter(event, fieldId){
      event.preventDefault();

      let enterEl = event.target.closest('.form-design-drag');
      enterEl._fd_fieldId = fieldId;
      this.enterEl = enterEl;
      let enterIndex = this.value.findIndex(item => item._id == fieldId);

      if(this.dragMode == 'sort'){
        let dragIndex = this.value.findIndex(item => item._id == this.dragEl._fd_fieldId);
      
        return this.sort(dragIndex, enterIndex);
      }

      if(this.dragMode == 'insert'){
        if(this.insertField){//已经插入，对数字进行排序
          let dragIndex = this.value.findIndex(item => item._id == this.insertField._id);
          this.sort(dragIndex, enterIndex);
          return;
        }
        let value = this.originValue;
        this.addField(this.insertFieldOption, value, value.findIndex(item => item._id == fieldId))
      }
    },
    //禁用拖拽
    dragEnd(event){
      event.preventDefault()
      this.disableDrag(event.target);
    },
    //字段排序
    sort(dragIndex, enterIndex){
      if(dragIndex < 0 || enterIndex < 0 || dragIndex == enterIndex) return;
      
      let arr = _.cloneDeep(this.value);

      let distance = dragIndex < enterIndex ? 1 : 0
      let dragField = arr[dragIndex]; //拖拽的字段
      let enterField = arr[enterIndex]; //目标字段

      arr.splice(dragIndex, 1);
      let insertIndex = arr.indexOf(enterField) ;
      arr.splice(insertIndex + distance, 0, dragField);

      this.$emit('input', arr);
      this.chooseField(dragField)
    },
    //选中字段
    chooseField(field){
      this.currField = field;
    },
    //添加新字段 
    addField(option = {}, value, index){
      let newField = new FormField({
        formType: option.formType,
        displayName: option.name
      });
      
      let arr = _.cloneDeep(value ? value : this.value);
      index == null ? arr.push(newField) : arr.splice(index, 0, newField);
      this.insertField = newField;
      this.$emit('input', arr); 

      //选中新添加的字段
      this.chooseField(newField)
    },
    //拖拽字段，用于拖拽添加字段
    dragField(event, option){
      this.dragMode = 'insert';
      this.insertFieldOption = option;
      this.originValue = _.cloneDeep(this.value);
    },
    //拖拽添加，处理样式
    dragFieldEnd(event, field){
      this.enterEl = null;
      this.insertFieldOption = null;
      this.insertField = null;
      this.dragMode = null;
    },
    //拖拽添加字段至指定位置
    // dropField(event){
    //   console.log( event.dataTransfer.getData('text/plain'))
    //   return;
    //   if(this.dragMode != 'insert') return;
    //   let dropEl = event.target.closest('.form-design-drag');
    //   let data = event.dataTransfer.getData('text/plain');
    //   let newFieldOption = {};
    //   try {
    //     newFieldOption = JSON.parse(data);
    //   } catch (error) {
    //     newFieldOption = {};
    //     console.error('非法字段');
    //   }
      
    //   if(!newFieldOption.formType || !dropEl || !dropEl._fd_fieldId) return;

    //   let fieldId = dropEl._fd_fieldId;
    //   this.addField(newFieldOption, this.value.findIndex(item => item._id == fieldId));
    // },
    //删除字段
    async deleteField(item){
      if(!await Platform.confirm('确定要删除该字段？')) return;

      let value = this.value; 
      let index = value.indexOf(item);

      if(index >= 0){
        value.splice(index, 1);
        this.$emit('input', value)
      }
    }
  },
  render(h){
    //可用字段列表
    let fieldList = this.availableFields.map(field => {
      return (
        <div class="form-design-field" draggable
          onClick={e => this.addField(field)}
          onDragstart={e => this.dragField(e, field)}
          onDragend={e => this.dragFieldEnd(e, field)}>
          {field.name}
        </div>)
    });
    
    //当前已选字段列表
    let previewList = this.value.map(currField => createPreviewComp.call(this, h, currField));
    
    //字段设置
    let fieldSetting = null;
    if(this.currField){
      let formType = this.currField.formType;
      let comp = FormFieldMap.get(formType);

      let data = {
        key: this.currField._id,
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

    let designListClass = {
      "form-design-list": true,
      "form-design-dragging": this.dragMode
    };

    return (
      <div class="form-design">
        <div class="form-design-panel">{fieldList}</div>
        <div class="form-design-main">
          <div class={designListClass}>{previewList}</div>
        </div>
        <div class="form-design-setting">{fieldSetting}</div>
      </div>
    );
  },
  components: {...PreivewComponents, ...SettingComponents}
};

export default FormDesign;