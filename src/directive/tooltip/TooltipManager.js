export default class TooltipManager{
  constructor(){
    this.contexts = {};
  }

  getContext(id){
    return this.contexts[id];
  }

  saveContext(id, context){
    this.contexts[id] = context;
  }

  removeComponent(id){
    let ctx = this.getContext(id);
    delete ctx.component;
  }

  saveComponent(id, component){
    let ctx = this.getContext(id);
    ctx.component = component;
  }
}