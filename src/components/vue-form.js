import { config } from '../config';
import { getClasses } from '../util';
import { vueFormConfig, vueFormState, vueFormParentForm } from '../providers';
import extend from 'extend';

export default {
  render(h) {
    return h(
      this.tag || this.vueFormConfig.formTag, {
        on: {
          submit: (event) => {
            this.state._submit();
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
    state: {
      type: Object,
      required: true
    },
    tag: String,
    showMessages: String
  },
  inject: { vueFormConfig },
  provide() {
    return {
      [vueFormState]: this.state,
      [vueFormParentForm]: this
    };
  },
  created() {
    if(!this.state) { return }
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
      $focus: false,
      $pending: false,
      $error: {},
      $submittedState: {},
      _id: '',
      _submit: () => {
        this.state.$submitted = true;
        this.state._cloneState();
      },
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
      _validate: () => {
        Object.keys(controls).forEach((key) => {
          controls[key]._validate();
        });
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
      let hasFocus = false;
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
        if (control.$focus) {
          hasFocus = true;
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
      state.$focus = hasFocus;
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
      const classes = getClasses(this.vueFormConfig.formClasses, this.state);
      return classes;
    }
  },
  methods: {
    reset() {
      this.state._reset();
    },
    validate() {
      this.state._validate();
    }
  }
}
