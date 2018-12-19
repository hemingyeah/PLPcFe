import _ from 'lodash'
import FormField from './FormField';
import Platform from '../../platform';
import {
  Modes, 
  FormFieldMap,
  PreivewComponents, 
  SettingComponents
} from './components';

const MAX_FIELD_NUM = 100;

/** 创建字段预览组件 */
function createPreviewComp(h, field){
  let currFieldId = field._id;
  let previewComp = FormFieldMap.get(field.formType);

  //根据字段配置创建预览内容
  let fieldPreview = h(previewComp.preview, {
    'class': 'form-design__ghost',
    props: { field , setting: previewComp},
    on: { chooseField: this.chooseField }
  });

  let previewClass = {
    'form-design-preview': true,
    'form-design-selected': this.currField && (currFieldId == this.currField._id), //被选中
    'form-design-dragging': field.dragging
  }

  return (
    <div class={previewClass} key={currFieldId} 
      onMousedown={e => this.beginSort(field, e)}>
      {fieldPreview}
      {!field.isSystem && <button type="button" class="form-design-preview-delete"
        onClick={e => this.deleteField(field)}>
        <i class="iconfont icon-fe-close"></i>
      </button>}
      <div class="form-design-cover"></div>
    </div>
  )
}

/** 创建字段设置组件 */
function createSettingComp(h, field){
  if(null == field) return null;

  let formType = field.formType;
  let comp = FormFieldMap.get(formType);
  
  //TODO: 支持更新系统字段提示信息
  if (field.isSystem) return (
    <div class="form-setting-panel">
      <h3>系统字段 -- {field.displayName}</h3>
      <p class="form-design-warning">该字段为系统内置字段，暂不支持修改、删除。</p>
    </div>
  );

  return h(comp.setting, {
    key: field._id,
    props: { field , setting: comp},
    on: {
      input: event => field[event.prop] = event.value
    }
  });
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
    elRect.right < containerRect.left || // 检测是否在容器左边
    elRect.left > containerRect.right || // 检测是否在容器右边
    elRect.top > containerRect.bottom || // 检测是否在容器下边
    elRect.bottom < containerRect.top // 检测是否在容器上边
  );
}

/** 获取拖拽显示模板 */
function getTemplate(el){
  if(el.classList.contains('form-design__ghost')){
    return el.outerHTML;
  }

  let tmp = el.querySelector('.form-design__ghost');
  return tmp ? tmp.outerHTML : '';
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
    let modeFormTypes = mode.fields || [];

    let hasSystemField = false;
    let availableFields = [];

    modeFormTypes.forEach(item => {
      let field = FormFieldMap.get(item);
      if(null == field) return;

      if(field.isSystem == 1) hasSystemField = true;
      availableFields.push(field)
    })

    return {
      //当前模式下可用字段
      availableFields,
      //是否显示系统字段tab 
      hasSystemField,
      //当前显示的字段 0 -- 基础组件  1 -- 系统组件
      fieldGroup: 0,
      //拖拽相关
      $dragEvent: {
        target: null, //正在被拖拽的元素
        offsetX: 0, //鼠标与拖拽元素左边界距离
        offsetY: 0, //鼠标与拖拽元素上边界距离
        prevClientY: 0, //上一点的y坐标
        direction: 0, //移动的方向 1 -- 向下  -1 -- 向上
        ghostEl: null,
        containerEl: null, //字段容器
        mode: null, //拖拽模式 sort -- 排序 insert -- 添加字段
        insertFieldOption: null //待插入字段的选项
      },
      //当前选择的字段
      currField: null,
      //容器是否静默，不响应hover
      silence: false,
      //插入的字段 
      insertedField: null, 
      //插入前的值
      originValue: null
    }
  },
  computed: {
    //根据fieldMode筛选后的字段
    filterFields(){
      return this.availableFields.filter(item => item.isSystem == this.fieldGroup);
    },
    //是否为空
    isEmpty(){
      return !Array.isArray(this.value) || this.value.length == 0;
    }
  },
  methods: {
    /** 开始插入字段 */
    beginInsert(field, event){
      if(this.value.length >= MAX_FIELD_NUM) {
        return Platform.alert(`单个表单最多支持${MAX_FIELD_NUM}个字段`)
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
      this.originValue = _.cloneDeep(this.value);
      
      //监听鼠标移动事件
      document.addEventListener('mousemove', this.handleDragging)
      document.addEventListener('mouseup', this.handleDragEnd)
    },
    /** 开始拖拽 */
    beginSort(field, event){
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
      
      //监听鼠标移动事件
      document.addEventListener('mousemove', this.handleDragging)
      document.addEventListener('mouseup', this.handleDragEnd)
    },
    
    /** 处理拖拽 */
    handleDragging(event){
      let dragEvent = this.$data.$dragEvent;
      let ghostEl = dragEvent.ghostEl;
      let containerEl = dragEvent.containerEl;
      let dragEl = dragEvent.target;
      
      //初始化ghostEL
      if(!dragEvent.initGhost){
        ghostEl.style.display = 'block';
        ghostEl.querySelector('.form-design__template').innerHTML = getTemplate(dragEl)
        ghostEl.style.width = dragEl.offsetWidth + 'px';

        if(this.currField) this.currField.dragging = true;
        dragEvent.initGhost = true;
        this.silence = true;
      }

      //移动ghostEl
      let y = event.clientY - dragEvent.offsetY;
      let x = event.clientX - dragEvent.offsetX
      ghostEl.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      dragEvent.direction = event.clientY - dragEvent.prevClientY >= 0 ? 1 : -1;
      dragEvent.prevClientY = event.clientY;
      
      //判断ghostEl是否在容器内
      let containerRect = containerEl.getBoundingClientRect();
      let ghostRect = ghostEl.getBoundingClientRect();
      let inContainer = isInContainer(ghostRect, containerRect);

      if(dragEvent.mode == 'sort'){
        if(inContainer){
          let dragIndex = this.value.findIndex(item => item._id == this.currField._id);
          let enterIndex = this.calcIndex(y, dragIndex);
          this.sort(dragIndex, enterIndex);
        }
        return;
      }

      if(dragEvent.mode == 'insert'){
        //已经插入但是当前拖拽元素不在容器内，删除该字段
        if(!inContainer && this.insertField){
          this.insertedField = null;
          this.currField = null;
          this.$emit('input', this.originValue)
          return;
        }

        if(inContainer){
          //如果已经插入，对字段进行排序
          if(this.insertedField){
            let dragIndex = this.value.findIndex(item => item._id == this.insertedField._id);
            let enterIndex = this.calcIndex(y, dragIndex);
            this.sort(dragIndex, enterIndex);
            return;
          }

          //插入字段
          dragEvent.direction = 0;
          let insertIndex = this.calcIndex(y);
          let newField = this.insertField(dragEvent.insertFieldOption, this.value, insertIndex)
          this.insertedField = newField;
        }
      }
    },
    /** 结束拖拽 */
    handleDragEnd(){
      //清空鼠标事件
      document.removeEventListener('mousemove', this.handleDragging)
      document.removeEventListener('mouseup', this.handleDragEnd)

      let dragEvent = this.$data.$dragEvent;
      dragEvent.ghostEl.style.display = 'none';
      
      if(this.currField) this.currField.dragging = false;
      this.silence = false;
    },
    /** 计算当前位置索引 */
    calcIndex(distance, currIndex = -1){
      let dragEvent = this.$data.$dragEvent;
      let containerEl = dragEvent.containerEl;
      let previewDoms = Array.prototype.slice.call(dragEvent.containerEl.children);
      let containerRect = containerEl.getBoundingClientRect();

      let offsetTop = distance - containerRect.top + containerEl.scrollTop;
      let direction = dragEvent.direction;

      //如果是向上移动 或 插入时
      if(direction <= 0){
        for(let i = 0; i < previewDoms.length; i++){
          let dom = previewDoms[i];
          if(dom.offsetTop + dom.offsetHeight / 2 > offsetTop){
            //如果前一位置是当前位置，直接返回前一位置
            return i - 1 == currIndex ? currIndex : i;
          }
        }
      }

      //如果是向下移动
      if(direction > 0){
        let index = -1;
        let ghostEl = dragEvent.ghostEl;
        offsetTop += ghostEl.offsetHeight;

        for(let i = 0; i < previewDoms.length; i++){
          let dom = previewDoms[i];
          if(dom.offsetTop + dom.offsetHeight / 2 < offsetTop){
            index = i;
          }
        }
        //如果后一位置是当前位置，直接返回后一位置
        return index + 1 == currIndex ? currIndex : index;
      }
      
      return -1;
    },
    /** 字段排序 */
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
    /** 选中字段 */
    chooseField(field){
      this.currField = field;

      this.$nextTick(() => {
        let dragEvent = this.$data.$dragEvent;
        let containerEl = dragEvent.containerEl;
        let draggingEl = this.$el.querySelector('.form-design-selected');
        let visible = isVisibility.call(this, draggingEl, containerEl);

        if(!visible) {
          let scrollTop = draggingEl.offsetTop + draggingEl.offsetHeight - containerEl.offsetHeight;
          containerEl.scrollTop = scrollTop;
        }
      })
    },
    /** 删除字段 */
    async deleteField(item){
      if(!await Platform.confirm('确定要删除该字段？')) return;

      let value = this.value; 
      let index = value.indexOf(item);

      if(index >= 0){
        //如果是选中的字段，清除选中
        if(this.currField == item) this.currField = null;

        value.splice(index, 1);
        this.$emit('input', value)
      }
    },
    /** 添加新字段 */ 
    insertField(option = {}, value, index){
      let newField = new FormField({
        formType: option.formType,
        displayName: '标题'
      });
      
      let arr = _.cloneDeep(value ? value : this.value);
      index == null ? arr.push(newField) : arr.splice(index, 0, newField);
      this.$emit('input', arr); 

      //选中新添加的字段
      this.chooseField(newField)
      return newField;
    }
  },
  render(h){
    //可用字段列表
    let fieldList = this.filterFields.map(field => {
      return (
        <div class="form-design-field-wrap" 
          onMousedown={e => this.beginInsert(field, e)}>
          <div class="form-design-field form-design__ghost">
            {field.name} <i class={["iconfont", `icon-fd-${field.formType}`]}></i>
          </div>
        </div>
      )
    });
    
    //当前已选字段列表
    let previewList = this.value.map(currField => createPreviewComp.call(this, h, currField));
    //字段设置
    let fieldSetting = createSettingComp.call(this, h, this.currField);

    return (
      <div class="form-design">
        <div class="form-design-panel">
          <div class={["form-design-tabs", this.hasSystemField ? 'form-design-withSys' : '']}>
            <div class="form-design-tab" onClick={e => this.fieldGroup = 0}>基础组件</div>
            {this.hasSystemField && <div class="form-design-tab" onClick={e => this.fieldGroup = 1}>系统组件</div>}
          </div>
          <div class="form-design-tabs-content">{fieldList}</div>
          
          {/* <div>{this.value.length} <a href="javscript:;" onClick={e => {
            let copy = _.cloneDeep(this.value);
            copy.forEach(item => item._id = 'field_' + (Math.random() * 100000000 >> 0).toString(16))
            this.$emit('input',copy.concat(this.value))
          }}>复制</a></div> */}
          
        </div>
        <div class="form-design-main">
          <div class={["form-design-phone", this.silence ? 'form-design-silence' : null]}>
            {!this.isEmpty ? previewList : (
              <div class="form-design-tip">
                <p>选择左侧控件拖动到此处</p>
              </div>
            )}
          </div>
        </div>
        {fieldSetting ? <div class="form-design-setting" key="form-design-setting">{fieldSetting}</div> : null}
        <div class="form-design-ghost" key="form-design-ghost">
          <div class="form-design__template"></div>
          <div class="form-design-cover"></div>
        </div>
      </div>
    );
  },
  mounted(){
    this.$data.$dragEvent.ghostEl = this.$el.querySelector('.form-design-ghost');
    this.$data.$dragEvent.containerEl = this.$el.querySelector('.form-design-phone');
  },
  components: {...PreivewComponents, ...SettingComponents}
};

export default FormDesign;