import { config } from '../config';
import { validators } from '../validators';

export default {
  render(h) {
    return h(
      'form', {
        on: {
          submit: (event) => {
            this.state.$submitted = true;
            this.$emit('submit', event);
          }
        },
        attrs: {
          'novalidate': '',
          'class': this.className
        }
      }, [this.$slots.default]
    );
  },
  props: {
    value: Object,
    state: Object
  },
  data() {
    return {};
  },
  created() {
    const controls = {};
    const state = this.state;
    const formstate = {
      $dirty: false,
      $pristine: true,
      $valid: true,
      $invalid: false,
      $submitted: false,
      $touched: false,
      $untouched: true,
      $error: {},
      _addControl: (ctrl) => {
        controls[ctrl.$name] = ctrl;
        this.$set(state, ctrl.$name, ctrl);
      },
      _removeControl: (ctrl) => {
        delete controls[ctrl.$name];
        this.$delete(this.state, ctrl.$name);
        this.$delete(this.state.$error, ctrl.$name);
      }
    }

    Object.keys(formstate).forEach((key) => {
      this.$set(this.state, key, formstate[key]);
    });

    this.$watch('state', () => {
      let isDirty = false;
      let isValid = true;
      let isTouched = false;
      Object.keys(controls).forEach((key) => {
        const control = controls[key];
        if (control.$dirty) {
          isDirty = true;
        }
        if (control.$touched) {
          isTouched = true;
        }
        if (!control.$valid) {
          isValid = false;
          // add control to errors
          this.$set(state.$error, control.$name, control);
        } else {
          this.$delete(state.$error, control.$name);
        }
      });

      state.$dirty = isDirty;
      state.$pristine = !isDirty;
      state.$touched = isTouched;
      state.$untouched = !isTouched;
      state.$valid = isValid;
      state.$invalid = !isValid;

    }, {
      deep: true,
      immediate: true
    });

    /* watch pristine? if set to true, set all children to pristine
    Object.keys(controls).forEach((ctrl) => {
      controls[ctrl].setPristine();
    });*/

  },
  computed: {
    className() {
      const out = [];
      if (this.state.$dirty) {
        out.push(config.dirtyClass);
      } else {
        out.push(config.pristineClass)
      }
      if (this.state.$valid) {
        out.push(config.validClass);
      } else {
        out.push(config.invalidClass)
      }
      if (this.state.$touched) {
        out.push(config.touchedClass);
      } else {
        out.push(config.untouchedClass)
      }
      if(this.state.$submitted) {
        out.push(config.submittedClass);
      }
      return out.join(' ');
    }
  }
}
