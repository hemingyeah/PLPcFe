<template>
  <div ref="reference" class="base-cascader">
    <div 
      :class="['base-cascader-input', clearable && inputValue && 'base-cascader-input-hover']"
      ref="input" 
      @click="toggleDropDownVisible">
      <el-input
        v-model="inputValue"
        :size="size"
        :readonly="readonly"
        :disabled="disabled"
        :validate-event="false"
        :placeholder="placeholder"
        @focus="handleFocus"
        @blur="handleBlur"
        @input="handleInput">
        <template slot="suffix">
          <i key="clear" class="el-input__icon el-icon-circle-close" @click.stop="handleClear"></i>
          <i key="arrow-down" :class="['el-input__icon', 'el-icon-arrow-down', dropDownVisible && 'is-reverse']" @click.stop="toggleDropDownVisible"></i>
        </template>
      </el-input>
    </div>

    <transition name="el-zoom-in-top" @after-leave="handleDropdownLeave">
      <div v-show="dropDownVisible" ref="popper" :class="['base-popper', popperClass]">
        <div class="popper__arrow"></div>
        <div class="base-cascader__dropdown" v-if="!isEmpty">
          <ul
            class="base-cascader-panel"
            v-for="(options, indexList) in opl"
            :key="indexList"
            v-show="!filtering">
            <li
              class="base-cascader-menu"
              :class="{'is-active': selfValue.indexOf(item.value) != -1}"
              v-for="(item, index) in options"
              :key="index"
              @click="chooseItem(item, indexList)">
              <slot :data = 'item'>
                <span>{{ item.label }}</span>
              </slot>
              <i key="clear" v-if="item.children" class="el-icon-arrow-right"></i>
            </li>
          </ul>

          <ul class="base-cascader-panel" v-show="filtering">
            <li class="base-cascader-menu" v-for="(item, index) in opl" :key="index" @click="chooseFilterItem(item)">
              {{item.label}}
            </li>
          </ul>
        </div>

        <div class="base-cascader-empty" v-else>
          暂无数据
        </div>

        <div class="base-cascader-footer">
          <slot name="footer"></slot>
        </div>
      </div>
    </transition>

  </div>
</template>

<script>
import _ from 'lodash';

/**
 * value: v-model绑定的值，[暂时仅支持数组]
 * disable: 是否禁用
 * popperClass: 下拉框类名
 * options: type的数据结构（label value(必选), children(可选)）
 * filterable: 是否支持搜索
 * clearable: 是否可清空
 * placeholder: 提示语
 * checkStrictly: 是否支持每一级可选 
 * multiple: 是否支持多选[暂未实现]
 * size: el-input的size参数，可选值：medium / small / mini
 */

export default {
  name: 'base-cascader',
  props: {
    value: {
      type: Array,
      default: () => ([])
    },
    options: {
      type: Array,
      default: () => ([])
    },
    disabled: {
      type: Boolean,
      default: false
    },
    filterable: {
      type: Boolean,
      default: false,
    },
    clearable: {
      type: Boolean,
      default: false,
    },
    placeholder: {
      type: String,
      default: '请选择'
    },
    checkStrictly: {
      type: Boolean,
      default: false,
    },
    size: {
      type: String,
      default: 'small',
    },
    popperClass: {
      type: String,
      default: ''
    },
  },

  data () {
    return {
      selfValue: [],
      dropDownVisible: false, // 下拉框是否显示
      inputValue: null, // 单选或搜索时input框的绑定值
      filtering: false, // 是否正在搜索
    }
  },
  
  mounted () {
    document.addEventListener('click', this.handleClickOutside, false);
  },

  computed: {
    // input是否只读，目前在搜索时该值为false
    readonly() {
      return !this.filterable;
    },
    opl() {
      const {filtering, options, selfValue} = this;
      let op = [options];

      if (!filtering) {
        if(!selfValue || !selfValue.length) return op;
        for (let i = 1;i <= selfValue.length;i++) {
          let tv = op[i - 1].filter(({value}) => value === this.selfValue[i - 1])[0];
          if (tv.children) {
            op.push(tv.children)
          }
        }
        return op;
      }

      let newOpl = this.filterTypes(_.cloneDeep(options), [])

      return newOpl.filter(item => item.label.indexOf(this.inputValue) !== -1)
    },
    isEmpty() {
      const {opl} = this;
      return !opl || !opl.length
    }
  },

  methods: {
    /** 监听文档的点击事件，如果点击组件外的元素，关闭组件 */
    handleClickOutside(e){
      this.$nextTick(() => {
        if(!this.$refs.input.contains(e.target) && !this.$refs.popper.contains(e.target)) {
          if(this.dropDownVisible) this.toggleDropDownVisible(false);
        }
      })
    },

    // 搜索时val不为空时进行搜索操作
    handleInput(val, event) {
      this.dropDownVisible = true;
      this.filtering = !!val;
    },

    // 无限级拼接：初始化搜索时的分类数据结构，即对父级和子级的分类做了一个拼接
    filterTypes(options, newOp) {
      for (let i = 0; i < options.length; i++) {
        newOp.push({
          label: options[i].parent ? `${options[i].parent.label}/${options[i].label}` : options[i].label,
          value: options[i].parent ? `${options[i].parent.value}/${options[i].value}` : options[i].value,
        });

        if (options[i].children) {
          for (let j = 0; j < options[i].children.length; j++) {
            options[i].children[j].parent = {
              label: options[i].parent ? `${options[i].parent.label}/${options[i].label}` : options[i].label,
              value: options[i].parent ? `${options[i].parent.value}/${options[i].value}` : options[i].value,
            };
          }
          this.filterTypes(options[i].children, newOp)
        }
      }
      return newOp;
    },

    // 清除操作
    handleClear() {
      this.inputValue = '';
      this.selfValue = [];
      this.$emit('input', []);
    },
    
    // 下拉框的展开和关闭
    toggleDropDownVisible(visible) {
      if (this.disabled) return;
      this.dropDownVisible = visible || !this.dropDownVisible;
      if(this.dropDownVisible) {
        this.$refs.input.focus();
      }
      this.$emit('visible-change', visible);
    },

    // 动画结束时
    handleDropdownLeave() {
      this.filtering = false;
    },

    // 点击分类时
    handleMenu (item) {
      this.chooseItem(item);
      this.openChild(item);
    },

    // 平时选中
    // TODO: 不可以每一级都选择时，选择到最后一级关闭
    chooseItem (item, index) {
      let op = this.options;
      let newInputVal = [];
      let newVal = this.selfValue.map(val => val);

      newVal.splice(index);
      newVal.push(item.value);
      this.selfValue = newVal;

      for (let i = 0;i <= newVal.length;i++) {
        op = op.filter(({value}) => value === newVal[i])[0];
        if (!op) break;
        newInputVal.push(op.label);
        op = op.children || [];
      }

      // 每次选择都会更新父组件的value
      if (this.checkStrictly) {
        this.inputValue = newInputVal.join('/');
        this.$emit('input', newVal);
        this.$emit('change', newVal);
        return;
      }

      // 没有子选项，就是选到最后一级才更新父组件中真正的value
      if (!item.children) {
        this.$emit('change', newVal);
        this.$emit('input', newVal);
        this.inputValue = newInputVal.join('/');
      }
    },

    // 搜索时选中
    chooseFilterItem (item) {
      this.dropDownVisible = false;
      this.inputValue = item.label;

      let newVal = item.value.split('/');
      this.selfValue = newVal;
      this.$emit('input', newVal);
      this.$emit('change', newVal);
    },

    // input获得焦点
    handleFocus (e) {
      this.$emit('focus', e);
    },

    // input失去焦点
    handleBlur(e) {
      this.$emit('blur', e);
    },
  },
}
</script>

<style lang="scss">
.base-cascader {
  margin-bottom: 20px;
  position: relative;

  .base-cascader-input {
    width: 194px;
    cursor: pointer;

    .is-reverse {
      transform: rotateZ(180deg);
    }

    .el-input__inner {
      cursor: pointer;
    }

    .el-icon-circle-close {
      display: none;
    }
  }

  .base-cascader-input-hover:hover {
    .el-icon-circle-close {
      display: block;
    }

    .el-icon-arrow-down {
      display: none;
    }
  }

  .base-popper {
    position: absolute;
    left: 8px;
    z-index: 9999;

    margin-top: 15px;

    color: #606266;
    background: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,.2);

    .popper__arrow {
      position: absolute;
      top: -10px;
      left: 30px;
      border: 5px solid;
      border-color: transparent transparent #fff;
    }

    .base-cascader__dropdown {
      display: flex;
      min-height: 200px;
      max-height: 300px;
      overflow: hidden;
    }

    .base-cascader-panel {
      margin: 0;
      padding: 6px 0;
      border-right: 1px solid #E4E7ED;
      overflow: auto;
      min-width: 170px;

      .base-cascader-menu {
        position: relative;
        list-style: none;
        padding: 0 40px 0 20px;
        height: 34px;
        line-height: 34px;

        font-size: 14px;
        cursor: pointer;

        &:hover {
          background: #F5F7FA;
        }

        .el-icon-arrow-right {
          position: absolute;
          top: 2px;
          right: 8px;
          padding: 10px;
          cursor: pointer;
        }
      }

      .is-active {
        color: #55b7b4;
      }
    }

    .base-cascader-empty {
      width: 170px;
      height: 40px;
      line-height: 40px;
      text-align: center;
      color: #ccc;
    }

    .base-cascader-footer {
      // height: 40px;
      border-top: 10px solid #f0f0f0;
      color: #55b7b4;
      cursor: pointer;
      line-height: 40px;
      text-align: center;
      font-size: 14px;
    }
  }
}
</style>