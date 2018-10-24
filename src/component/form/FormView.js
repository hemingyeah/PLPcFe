const FormView = {
  name: 'form-view',
  props: {
    fields: {
      type: Array,
      default: () => []
    },
    value: {
      type: Object,
      default: () => ({})
    },
  },
  methods: {
    buildCommonDom({displayName, value}) {
      return (
        <div class="form-view-row">
          <label>{displayName}</label>
          <div>{value}</div>
        </div>
      )
    },
    mapFieldToDom() {
      const originalObj = this.value;
      let params = {};
      let value = '';
      
      return this.fields.map(({formType, fieldName, displayName, isSystem,}) => {
        
        value = isSystem ? originalObj[fieldName] : originalObj.attribute[fieldName];
        params = {displayName, value, formType};
        
        // return slot
        if (this.$scopedSlots[formType]) {
          return this.$scopedSlots[formType](params);
        }
        
        if (formType === 'attachment') {
          params = {
            ...params,
            value: value.map(a => <base-file-item file={a} del={false} key={a.id}/>),
          };
        }
        
        if (formType === 'selectMulti') {
          params = {
            ...params,
            value: value.join(' '),
          };
        }
  
        if (formType === 'tags') {
          params = {
            ...params,
            value: value.map(t => t.tagName).join(' '),
          };
        }
  
        if (formType === 'user') {
          params = {
            ...params,
            value: value.displayName,
          };
        }
  
        if (formType === 'address') {
          let {adProvince, adCity, adDist, adAddress} = value;
          params = {
            ...params,
            value: `${adProvince} ${adCity} ${adDist} ${adAddress}`,
          };
        }
        // other types: text textarea date number datetime phone
        return this.buildCommonDom(params);
      });
    },
  },
  render() {
    if (!this.fields.length || !Object.keys(this.value).length) return null;
    return (
      <div class="form-view">
        {this.mapFieldToDom()}
      </div>
    )
  },
  // mounted() {}
};

export default FormView;
