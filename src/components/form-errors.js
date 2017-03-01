import { config } from '../config';

export default {
  name: '',
  render(h) {
    const children = [];
    const field = this.formstate[this.field];
    if (field && field.$error) {
      Object.keys(field.$error).forEach((key) => {
        children.push(this.$slots[key]);
      });
    }
    return h(this.tag, children);
  },
  props: {
    state: Object,
    field: String,
    tag: {
      type: String,
      default: config.errorsTag
    }
  },
  data () {
    return {
      formstate: {}
    };
  },
  created () {
    this.formstate = this.state || this.$parent.state;
  }
};
