import draggable from 'vuedraggable'

import './BizSelectColumnSort.scss'

import { uuid } from '@src/util/string'

const NestedDraggable = {
  name: 'nested-draggable',
  props: {
    lists: {
      required: true,
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      drag: false
    }
  },
  methods: {
    sortListDragStartEventHandler(event) {
      this.drag = true
    },
    sortListDragEndEventHandler(event) {
      this.drag = false
    }
  },
  render(h) {
    return (
      <draggable 
        animation="180"
        class="nested-draggable"
        tag="div" 
        list={ this.lists }
        onStart={ (event) => this.sortListDragStartEventHandler(event) }
        onEnd={ (event) => this.sortListDragEndEventHandler(event) }
      >
        {
          this.lists.map(item => {
            return (
              <div key={ uuid() } class="nested-draggable-block">
                <div class="nested-draggable-name">
                  <span class="nested-draggable-name-label"><i class="iconfont icon-paixu"></i></span>
                  <span class="nested-draggable-name-text">{ item.name }</span>
                </div>
                <nested-draggable lists={ item.lists }></nested-draggable>
              </div>
            )
          })
        }
      </draggable>
    )
  },
  components: {
    draggable
  },
}

const BizSelectColumnSort = {
  name: 'biz-select-column-sort',
  props: {
    lists: {
      required: true,
      type: Array,
      default: () => [],
    }
  },
  render(h) {
    return (
      <div class="biz-select-column-sort">
        { this.$slots.title }
        <div class="biz-select-column-sort-row">
          <span class="biz-select-column-sort-row-label">排序</span>
          <span class="biz-select-column-sort-row-text">列名</span>
        </div>
        <nested-draggable lists={ this.lists }>
        </nested-draggable>
      </div>
    )
  },
  components: {
    draggable,
    [NestedDraggable.name]: NestedDraggable
  }
}

export default BizSelectColumnSort;