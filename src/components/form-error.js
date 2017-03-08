import { config } from '../config';
import errorMixin from './error-mixin';

export default {
  mixins: [errorMixin],
  render(h) {
    const field = this.formstate[this.field];
    if (field && field.$error[this.error] && this.isShown) {
      return h(this.tag, [this.$slots.default]);
    }
  },
  props: {
    state: Object,
    field: String,
    error: String,
    show: {
      type: String,
      default: ''
    },
    tag: {
      type: String,
      default: config.errorTag
    }
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
  }
}
