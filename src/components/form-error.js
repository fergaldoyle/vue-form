import { config } from '../config';

export default {
  render(h) {
    const field = this.formstate[this.field];
    if (field && field.$error[this.error]) {
      const isShow = this.showWhen ? field[this.showWhen] : true;
      if(isShow) {
        return h(this.tag, [this.$slots.default]);
      }
    }
  },
  props: {
    state: Object,
    field: String,
    error: String,
    if: {
      type: String,
      default: ''
    },
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
  mounted () {
    this.$nextTick(()=>{
      this.formstate = this.state || this.$parent.formstate || this.$parent.state;
    });
  }
}
