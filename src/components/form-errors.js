import { config } from '../config';

export default {
  name: '',
  render(h) {
    const children = [];
    const field = this.formstate[this.field];
    if (field && field.$error) {
      const isShow = this.showWhen ? field[this.showWhen] : true;
      if(isShow) {
        Object.keys(field.$error).forEach((key) => {
          children.push(this.$slots[key]);
        });
      }
    }
    return h(this.tag, children);
  },
  props: {
    state: Object,
    field: String,
    showWhen: {
      type: String,
      default: ''
    },
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
