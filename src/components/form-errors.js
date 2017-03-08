import { config } from '../config';
import errorMixin from './error-mixin';

export default {
  mixins: [errorMixin],
  render(h) {
    //console.log('errors render');
    const children = [];
    const field = this.formstate[this.field];
    if (field && field.$error && this.isShown) {
      Object.keys(field.$error).forEach((key) => {
        children.push(this.$slots[key]);
      });
    }
    return h(this.tag, children);
  },
  props: {
    state: Object,
    field: String,
    show: {
      type: String,
      default: ''
    },
    tag: {
      type: String,
      default: config.errorsTag
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
};
