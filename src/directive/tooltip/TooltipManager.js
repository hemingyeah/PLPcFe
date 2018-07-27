export default class TooltipManager{
  constructor(){
    this.instances = {};
  }

  get(id){
    return this.instances[id]
  }

  save(id, instances){
    this.instances[id] = instances;
  }

  remove(id){
    delete this.instances[id];
  }
}