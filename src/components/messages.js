import { config } from '../config';

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
  render(h) {
    const children = [];
    const field = this.formstate[this.name];
    if (field && field.$error && this.isShown) {
      Object.keys(field.$error).forEach((key) => {
        if(this.autoLabel) {
          const label = findLabel(this.$slots[key]);
          if(label) {
            label.data = label.data || {};
            label.data.attrs = label.data.attrs || {};
            label.data.attrs.for = field._id;
          }
        }
        children.push(this.$slots[key]);
      });
      if(!children.length) {
        if(this.autoLabel) {
          const label = findLabel(this.$slots.default);
          if(label) {
            label.data = label.data || {};
            label.data.attrs = label.data.attrs || {};
            label.data.attrs.for = field._id;
          }
        }
        children.push(this.$slots.default);
      }
    }
    return h(this.tag, children);
  },
  props: {
    state: Object,
    name: String,
    show: {
      type: String,
      default: ''
    },
    tag: {
      type: String,
      default: config.messagesTag
    },
    autoLabel: Boolean,
  },
  data() {
    return {
      formstate: {}
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.formstate = this.state || this.$parent.formstate || this.$parent.state;
    });
  },
  computed: {
    isShown() {
      const field = this.formstate[this.name];

      if (!this.show || !field) {
        return true;
      }

      const compare = (v) => {
        return field[v.trim()];
      };

      if (this.show.indexOf('&&') > -1) {
        // and logic - every
        const split = this.show.split('&&');
        return split.every(compare);
      } else if (this.show.indexOf('||') > -1) {
        // or logic - some
        const split = this.show.split('||');
        return split.some(compare);
      } else {
        // single
        return field[this.show];
      }
    }
  }
};
