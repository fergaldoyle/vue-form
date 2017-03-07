import { config } from '../config';

export default {
  name: '',
  render(h) {
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
    if: {
      type: String,
      default: ''
    },
    tag: {
      type: String,
      default: config.errorsTag
    }
  },
  computed: {
    isShown () {
      const field = this.formstate[this.field];

      if(!this.if || !field) {
        return true;
      }

      if(this.if.indexOf('&&') > -1) {
        // and logic - every
        const split = this.if.split('&&');
        return split.every(v => field[v.trim()]);
      } else if(this.if.indexOf('||') > -1) {
        // or logic - some
        const split = this.if.split('||');
        return split.some(v => field[v.trim()]);
      } else {
        // single
        return field[this.if];
      }
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
};
