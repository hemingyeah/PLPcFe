const FormView = {
  props: {
    fields: {
      type: Array,
      default: () => []
    },
    value: {
      type: Object,
      default: () => ({})
    },
    mode: {
      type: String,
      default: ''
    }
  },
  // data() { return {}; },
  methods: {
    buildCommonDom({displayName, value}) {
      return <div class="form-row"><label>{displayName}</label>{value}</div>
    },
    buildAddressDom({displayName, value, formType}) {
      let val = '';
      let {adProvince, adCity, adDist, adAddress} = value;
      val = `${adProvince} ${adCity} ${adDist} ${adAddress}`;
      
      if (!this.$scopedSlots[formType]) {
        return this.buildCommonDom({displayName, value: val,});
      }
      
      return this.$scopedSlots[formType]({
        area: `${adProvince} ${adCity} ${adDist}`,
        address: adAddress,
      })
    },
    buildArrayDom({displayName, value, formType}) {
      let val = '';
      if (formType === 'attachment') {
        val = value.map(a => {
          return <base-file-item file={a} del={false} key={a.id}/>
        });
      } else if (formType === 'tags') {
        val = value.map(t => t.tagName).join(' ');
      } else {
        val = value.join(' ');
      }
      
      return this.buildCommonDom({displayName, value: val,});
    },
    buildObjectDom({displayName, value, formType, h}) {
      let val = '';
      if (formType === 'address') {
        return this.buildAddressDom({displayName, value, formType, h});
      }
      
      if (formType === 'user') {
        val = value.displayName;
      }
      return this.buildCommonDom({displayName, value: val,});
    },
    mapFieldToDom(h) {
      const originalObj = this.value;
      let params = {};
      let value = '';
      
      return this.fields.map(({formType, fieldName, displayName, isSystem}) => {
        value = isSystem ? originalObj[fieldName] : originalObj.attribute[fieldName];
        params = {displayName, value, formType, h};
        
        // value is array.
        if (Array.isArray(value)) {
          return this.buildArrayDom(params);
        }
        // value is object.
        if (typeof value === 'object') {
          return this.buildObjectDom(params);
        }
        return this.buildCommonDom(params);
      });
    },
  },
  render(h) {
    if (!this.fields.length || !Object.keys(this.value).length) return null;
    return (
      <div class="form-view">
        {this.mapFieldToDom(h)}
      </div>
    )
  },
  // mounted() {}
};

export default FormView;
