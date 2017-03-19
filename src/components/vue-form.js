import { config } from '../config';
import { validators } from '../validators';

export default {
  render(h) {
    return h(
      'form', {
        on: {
          submit: (event) => {
            this.state.$submitted = true;
            this.state._cloneState();
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
      $pending: false,
      $error: {},
      $submittedState: {},
      _id: '',
      _cloneState: () => {
        const cloned = JSON.parse(JSON.stringify(state));
        delete cloned.$submittedState;
        Object.keys(cloned).forEach((key) => {
          this.$set(this.state.$submittedState, key, cloned[key]);
        });
      },
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
      let isPending = false;
      Object.keys(controls).forEach((key) => {
        const control = controls[key];

        control.$submitted = state.$submitted;

        if (control.$dirty) {
          isDirty = true;
        }
        if (control.$touched) {
          isTouched = true;
        }
        if (control.$pending) {
          isPending = true;
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
      state.$pending = isPending;

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
      const c = config.classes.form;
      if (this.state.$dirty) {
        out.push(c.dirty);
      } else {
        out.push(c.pristine);
      }
      if (this.state.$valid) {
        out.push(c.valid);
      } else {
        out.push(c.invalid);
      }
      if (this.state.$touched) {
        out.push(c.touched);
      } else {
        out.push(c.untouched);
      }
      if (this.state.$submitted) {
        out.push(c.submitted);
      }
      if (this.state.$pending) {
        out.push(c.pending);
      }
      return out.join(' ');
    }
  }
}
