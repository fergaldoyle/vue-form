import { config } from '../config';
import { getClasses } from '../util';
import { vueFormConfig, vueFormState } from '../providers';
import extend from 'extend';

export default {
  render(h) {
    return h(
      this.tag || this.vueFormConfig.formTag, {
        on: {
          submit: (event) => {
            this.state.$submitted = true;
            this.state._cloneState();
            this.$emit('submit', event);
          },
          reset: (event) => {
            this.state._reset();
            this.$emit('reset', event);
          }
        },
        class: this.className,
        attrs: {
          'novalidate': '',
        }
      }, [this.$slots.default]
    );
  },
  props: {
    state: Object,
    tag: String
  },
  inject: { vueFormConfig },
  provide() {
    return {
      [vueFormState]: this.state
    };
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
      },
      _reset: () => {
        state.$submitted = false;
        state.$pending = false;
        state.$submittedState = {};
        Object.keys(controls).forEach((key) => {
          const control = controls[key];
          control._hasFocused = false;
          control._setUntouched();
          control._setPristine();
          control.$submitted = false;
          control.$pending = false;
        });
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
      const c = this.vueFormConfig.formClasses;
      const s = this.state;
      const classes = getClasses(c, s);
      classes[c.submitted] = s.$submitted;
      return classes;
    }
  },
  methods: {
    reset() {
      this.state._reset();
    }
  }
}
