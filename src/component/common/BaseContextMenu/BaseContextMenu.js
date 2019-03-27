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
      opacity: 0,
      show: false,
      $target: null,

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
      this.top = event.clientY;
      this.left = event.clientX;
      this.opacity = 0;
      this.show = true;
      this.$data.$target = target;
      
      this.$nextTick(this.updatePosition)
    },
    updatePosition(){
      // TODO: 更新位置
      let viewportHeight = window.innerHeight;
      let viewportWidth = window.innerWidth;
      let height = this.$el.offsetHeight;
      let width = this.$el.offsetWidth;

      if(viewportWidth - this.left < width) {
        this.left = viewportWidth - width - 5;
      }
      if(viewportHeight - this.top < height) {
        this.top = viewportHeight - height - 5;
      }

      this.opacity = 1;
    },
    closeMenu(event){
      if (event.button === 0) {//兼容firefox
        this.show = false;
      }
    }
  },
  render(h){   
    let menus = [];
    if (typeof this.menuRender == 'function') {
      let menuArray = this.menuRender(h, this.$data.$target);

      if (Array.isArray(menuArray)) {
        menus = menus.concat(menuArray)
      }
    }

    return (
      <div class="base-context-menu" style={this.style} onClick={e => e.stopPropagation()}>
        {menus}
        {this.$slots.default}
      </div>
    )
    
  }
};

export default BaseContextMenu;
