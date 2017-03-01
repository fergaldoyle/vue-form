import { config } from '../config';
import { getVModelNode, vModelValue, addClass, removeClass } from '../util';
import { validators } from '../validators';

export default {
  render(h) {
    let foundVnode = getVModelNode(this.$slots.default);
    if (foundVnode) {
      this.name = foundVnode.data.attrs.name;
      foundVnode.data.directives.push({ name: 'vue-form-validator', value: this.fieldstate });
      foundVnode.data.attrs['vue-form-validator'] = '';
    } else {
      console.warn('Element with v-model not found');
    }
    return h(this.tag, { 'class': this.className.map(v => 'container-' + v) }, this.$slots.default);
  },
  props: {
    state: Object,
    tag: {
      type: String,
      default: 'span'
    }
  },
  data() {
    return {
      name: '',
      formstate: {},
      fieldstate: {}
    };
  },
  computed: {
    className() {
      const out = [];
      if (this.fieldstate.$dirty) {
        out.push(config.dirtyClass);
      } else {
        out.push(config.pristineClass)
      }
      if (this.fieldstate.$valid) {
        out.push(config.validClass);
      } else {
        out.push(config.invalidClass)
      }
      if (this.fieldstate.$touched) {
        out.push(config.touchedClass);
      } else {
        out.push(config.untouchedClass)
      }

      Object.keys(this.fieldstate.$error).forEach((error) => {
        out.push(config.invalidClass + '-' + error);
      });

      return out;
    }
  },
  mounted() {
    this.fieldstate.$name = this.name;
    this.formstate = this.state || this.$parent.state;
    this.formstate._addControl(this.fieldstate);

    const vModelEl = this.$el.querySelector('[vue-form-validator]');

    // add classes to the input element
    this.$watch('className', (value, oldValue) => {
      if (oldValue) {
        oldValue.forEach(v => removeClass(vModelEl, v));
      }
      value.forEach(v => addClass(vModelEl, v));
    }, {
      deep: true,
      immediate: true
    });

  },
  created() {
    const vm = this;
    this.fieldstate = {
      $name: '',
      $dirty: false,
      $pristine: true,
      $valid: true,
      $invalid: false,
      $touched: false,
      $untouched: true,
      $error: {},
      _setValidatorVadility(validator, isValid) {
        if (isValid) {
          vm.$delete(this.$error, validator);
        } else {
          vm.$set(this.$error, validator, true);
        }
      },
      _setVadility(isValid) {
        this.$valid = isValid;
        this.$invalid = !isValid;
      },
      _setDirty() {
        this.$dirty = true;
        this.$pristine = false;
      },
      _setPristine() {
        this.$dirty = false;
        this.$pristine = true;
      },
      _setTouched() {
        this.$touched = true;
        this.$untouched = false;
      },
      _setUntouched() {
        this.$touched = false;
        this.$untouched = true;
      },
      _setFocused() {
        this._hasFocused = true;
      },
      _hasFocused: false,
      _validators: {},
      _validate(vnode) {
        let isValid = true;
        let value = vModelValue(vnode.data);
        const attrs = (vnode.data.attrs || {});

        Object.keys(this._validators).forEach((validator) => {

          if (validator !== 'required' && !value && typeof value !== 'number') {
            this._setValidatorVadility(validator, true);
            return;
          }

          if (!validators[validator](value, attrs[validator], vnode)) {
            isValid = false;
            this._setValidatorVadility(validator, false);
          } else {
            this._setValidatorVadility(validator, true);
          }
        });

        this._setVadility(isValid);
        return isValid;
      }
    }
  },
  destroyed () {
    this.formstate._removeControl(this.fieldstate);
    console.log('destroyed')
  }
};
