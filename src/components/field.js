import { getVModelAndLabel, randomId } from '../util';
import { vueFormConfig } from '../providers';

export default {
  inject: {vueFormConfig},
  render(h) {
    let foundVnodes = getVModelAndLabel(this.$slots.default, this.vueFormConfig);
    const vModelnodes = foundVnodes.vModel;
    const attrs = {
      for: null
    };
    if (vModelnodes.length) {
      if(this.autoLabel) {
        const id = (vModelnodes[0].data.attrs && vModelnodes[0].data.attrs.id) || 'vf' + randomId();
        vModelnodes[0].data.attrs.id = id;
        if(foundVnodes.label) {
          foundVnodes.label.data = foundVnodes.label.data || {};
          foundVnodes.label.data.attrs = foundVnodes.label.data.attrs = {};
          foundVnodes.label.data.attrs.for = id;
        } else if (this.tag === 'label') {
          attrs.for = id;
        }
      }
    }
    return h(this.tag || this.vueFormConfig.fieldTag , { attrs }, this.$slots.default);
  },
  props: {
    tag: {
      type: String
    },
    autoLabel: {
      type: Boolean,
      default: true
    }
  }
}
