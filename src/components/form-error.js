import { config } from '../config';

export default {
  render(h) {
    const field = this.formstate[this.field];
    if (field && field.$error[this.error]) {
      return h(this.tag, [this.$slots.default]);
    }
  },
  props: {
    state: Object,
    field: String,
    error: String,
    tag: {
      type: String,
      default: config.errorTag
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
}
