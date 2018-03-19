import { vueFormConfig, vueFormState, vueFormParentForm } from '../providers';
import scopeEval from 'scope-eval';

function findLabel (nodes) {
  if(!nodes) {
    return;
  }
  for (let i = 0; i < nodes.length; i++) {
    let vnode = nodes[i];
    if(vnode.tag === 'label') {
      return nodes[i];
    } else if (nodes[i].children) {
      return findLabel(nodes[i].children);
    }
  }
}

export default {
  inject: {vueFormConfig, vueFormState, vueFormParentForm},
  render(h) {
    const children = [];
    const field = this.formstate[this.fieldname];
    if (field && field.$error && this.isShown) {
      Object.keys(field.$error).forEach((key) => {
        if(this.$slots[key] || this.$scopedSlots[key]) {
          const out = this.$slots[key] || this.$scopedSlots[key](field);
          if(this.autoLabel) {
            const label = findLabel(out);
            if(label) {
              label.data = label.data || {};
              label.data.attrs = label.data.attrs || {};
              label.data.attrs.for = field._id;
            }
          }
          children.push(out);
        }
      });
      if(!children.length && field.$valid) {
        if(this.$slots.default || this.$scopedSlots.default) {
          const out = this.$slots.default || this.$scopedSlots.default(field);
          if(this.autoLabel) {
            const label = findLabel(out);
            if(label) {
              label.data = label.data || {};
              label.data.attrs = label.data.attrs || {};
              label.data.attrs.for = field._id;
            }
          }
          children.push(out);
        }
      }
    }
    return h(this.tag || this.vueFormConfig.messagesTag, children);
  },
  props: {
    state: Object,
    name: String,
    show: {
      type: String,
      default: ''
    },
    tag: {
      type: String
    },
    autoLabel: Boolean,
  },
  data () {
    return {
      formstate: null,
      fieldname: ''
    };
  },
  created () {
    this.fieldname = this.name;
    this.formstate = this.state || this.vueFormState;
  },
  computed: {
    isShown() {
      const field = this.formstate[this.fieldname];
      const show = this.show || this.vueFormParentForm.showMessages || this.vueFormConfig.showMessages;

      if (!show || !field) {
        return true;
      }

      return scopeEval(show,field);
    }
  }
};
