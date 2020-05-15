<template>
  <div class="base-cascader-container-v2">

    <div ref="input" :class="['input-container', value.length && 'input-container-hover']">
      <el-input v-model="keyword" @change="handleChange" @blur="keyword = value.map(({label}) => label).join('/')">
        <template slot="suffix">
          <i :class="['el-input__icon', 'el-icon-arrow-down', visible && 'is-reverse' ]" ></i>
          <i v-if="value.length" class="el-input__icon el-icon-circle-close" @click.stop="cleatVal"></i>
        </template>
      </el-input>
    </div>

    <div class="list" v-show="visible" ref="popper">
      <ul v-for="(options, index) in cOptions" :key="index">
        <li v-for="op in options" :key="op.value" @click.stop="select(op, index)" :class="{select: value[index] && op.value === value[index].value}">
          {{op.label}}
          <i v-if="op.children" class="iconfont el-icon-arrow-right"></i>
        </li>
      </ul>
    </div>

  </div>
</template>

<script>
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
    multiple: {
      type: Boolean,
      default: false,
    }
  },
  data() {
    return {
      keyword: '',
      visible: false,
    }
  },
  computed: {
    cOptions() {
      let op = [this.options];

      if (!this.value.length) return op;

      op = [this.options];

      for (let i = 1;i <= this.value.length;i++) {
        let tv = op[i - 1].filter(({value}) => value === this.value[i - 1].value)[0]
        if (tv.children) {
          op.push(tv.children)
        }
      }

      return op;
    }
  },
  mounted() {
    document.addEventListener('click', this.handleClickOutside, false);
  },
  methods: {
    select(op, index) {
      let newVal = [...this.value];

      if (!op.children) this.visible = false;
      if (this.value.some(key => key.value === op.value)) return;

      if (index < this.value.length) {
        newVal.splice(index, this.value.length - index, {value: op.value, label: op.label})
      } else {
        newVal = [...this.value, {value: op.value, label: op.label}]
      }

      this.$emit('input', newVal)
      this.keyword = newVal.map(({label}) => label).join('/');
    },
    handleClickOutside(e){
      this.$nextTick(() => {
        if(!this.$refs.input.contains(e.target) && !this.$refs.popper.contains(e.target)) {
          return this.visible = false;
        }

        this.visible = true;
      })
    },
    cleatVal() {
      this.$emit('input', [])
      this.keyword = '';
    },
    handleChange() {

    }
  },
}
</script>

<style lang="scss">

  .base-cascader-container-v2 {
    width: 200px;
    position: relative;

    .input-container {
      &:hover {
        cursor: pointer;
      }

      .el-icon-circle-close {
        display: none;
      }

      .is-reverse {
        transform: rotateZ(180deg);
      }
    }

    .input-container-hover:hover {

      .el-icon-circle-close {
        display: block;
      }

      .el-icon-arrow-down {
        display: none;
      }
    }

    .list {
      position: absolute;
      display: flex;
      ul {
        padding: 0;
        margin: 0;
        width: 200px;
        background: white;
      }

      li {
        list-style: none;
        padding: 0 20px 0 20px;
        height: 34px;
        line-height: 34px;


        font-size: 14px;
        cursor: pointer;

        display: flex;
        justify-content: space-between;

        &:hover {
          background: #F5F7FA;
        }

        .el-icon-arrow-right {
          top: 2px;
          right: 8px;
          padding: 10px;
          cursor: pointer;
        }

      }

      .select {

        color: #55B7B4;
      }
    }

  }

</style>