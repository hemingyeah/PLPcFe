const ITEM_WIDTH = 150;
const ITEM_HEIGHT = 32;

const BaseContextMenu = {
  name: 'base-context-menu',
  props: {
    menuRender: Function,
    for: {
      type: String,
      required: true,
    }
  },
  data () {
    return {
      top: 0,
      left: 0,
      opacity: 1,
      show: false,
      $target: null,
      $event: null,

      menuHandler: e => this.showMenu(e),
      closeHandler: e => this.closeMenu(e)
    }
  },
  computed: {
    style () {
      return {
        left: `${this.left}px`,
        top: `${this.top}px`,
        opacity: this.opacity,
        display: this.show ? 'block' : 'none'
      }
    }
  },
  mounted(){
    document.addEventListener('contextmenu', this.menuHandler)
    document.addEventListener('click', this.closeHandler)

  },
  destroyed(){
    document.removeEventListener('contextmenu', this.menuHandler)
    document.removeEventListener('click', this.closeHandler)
  },
  methods: {
    exec(command){
      let event = {target: this.$data.$target, command}
      this.$emit('command', event)
    },
    close(){
      this.show = false;
    },
    showMenu(event){
      if(this.$el.contains(event.target)) return event.preventDefault();

      let target = event.target.closest(this.for);
      if(null == target) return this.show = false;

      event.preventDefault();
      this.$data.$event = event;
      this.$data.$target = target;

      this.$nextTick(() => {
        this.show = true;
      })
    },
    closeMenu(event){
      if (event.button === 0) {//兼容firefox
        this.show = false;
        this.$data.$event = null;
      }
    }
  },
  render(h){   
    if(!this.show) return null;

    let menus = [];
    let length = 0;

    if (typeof this.menuRender == 'function') {
      let menuArray = this.menuRender(h, this.$data.$target);

      if (Array.isArray(menuArray)) {
        menus = menus.concat(menuArray)
      }
    }

    if(this.$slots.default) {
      length += this.$slots.default.length;
    }
    if(menus) {
      length += menus.length;
    }

    let viewportHeight = window.innerHeight;
    let viewportWidth = window.innerWidth;
    let height = (length * ITEM_HEIGHT) + 10;
    let width = ITEM_WIDTH;

    this.top = (viewportHeight - this.$data.$event.clientY < height) ? (viewportHeight - height - 5) : this.$data.$event.clientY;
    this.left = (viewportWidth - this.$data.$event.clientX < width) ? (viewportWidth - width - 5) : this.$data.$event.clientX;

    return (
      <div class="base-context-menu" style={this.style} onClick={e => e.stopPropagation()}>
        {menus}
        {this.$slots.default}
      </div>
    )  
  }
};

export default BaseContextMenu;
