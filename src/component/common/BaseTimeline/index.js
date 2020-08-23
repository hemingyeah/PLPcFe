import './BaseTimeline.scss'
import {toArray} from '@src/util/lang'

const BaseTimeline = {
  name: 'base-timeline',
  props: {
    data: Array,
    recordRender: Function,
    loading: Boolean,
    loadmore: Boolean
  },
  render(h){
    let items = toArray(this.data).map(item => {
      // 呼叫中心时间取content.ring
      let time = item.module == 'callCenter' ? item.content.ring : item.createTime
      let content = this.recordRender(h, item);
      return (
        <div class="base-timeline-item">
          <div class="base-timeline-head"></div>
          <div class="base-timeline-main">
            <div class="base-timeline-content">{content}</div>
            <p class="base-timeline-time">{time}</p>
          </div>
        </div>
      )
    });

    if(items.length > 0 && this.loadmore){
      let lastItem = items[items.length - 1];
      lastItem.data['class'] = ['base-timeline-item', 'base-timeline-item-dotted']

      let loadmoreItem = (
        <div class="base-timeline-item">
          <div class={['base-timeline-head', this.loading ? 'base-timeline-loading' : '']}></div>
          <div class="base-timeline-main">
            <div class="base-timeline-content">
              {
                this.loading 
                  ? <span class="base-timeline-loadmore">正在加载...</span>
                  : <button type="button" class="btn-text base-timeline-loadmore" onClick={e => this.$emit('load')}>加载更多</button>
              }
            </div>
          </div>
        </div>
      )
      items.push(loadmoreItem);
    }

    return <div class="base-timeline">{items}</div>
  }
};

BaseTimeline.install = function(Vue){
  Vue.component(BaseTimeline.name, BaseTimeline);
};

export default BaseTimeline;