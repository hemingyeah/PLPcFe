import { createPreviewComp } from "./FormDesign";

import {
    PreviewComponents,
} from './components';

const FormPreview = {
    name: 'form-preview',
    data() {
        return {}
    },
    props: {
        fields: {
            type: Array,
            default: () => []
        }
    },
    methods: {
        renderPreviewList(h){
            if(this.isEmpty) return (
              <div class="form-design-tip">
                <p>点击下方设置按钮进行设置</p>
              </div>
            )

            return this.fields.map(f => createPreviewComp.call(this, h, f))
        },
    },
    render(h) {
        return (
            <div class="form-design-main">
                <div class="form-design-center" style="position: relative">
                    <div class='form-design-phone'>
                        <div style="pointer-events: none;margin-bottom: 40px">
                            { this.renderPreviewList(h) }
                        </div>
                    </div>
                    {this.$slots.default}
                </div>
            </div>
            
        );
    },
    components: {...PreviewComponents}
}


export default FormPreview;