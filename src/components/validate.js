import { config } from '../config';
import { getVModelNode, vModelValue, addClass, removeClass, getName, hyphenate } from '../util';
import { validators } from '../validators';

// todo: Make getVModelNode recursive

export default {
  render(h) {
    let foundVnodes = getVModelNode(this.$slots.default);
    if (foundVnodes.length) {
      this.name = getName(foundVnodes[0]);
      foundVnodes.forEach((foundVnode) => {
        if (!foundVnode.data.directives) {
          foundVnode.data.directives = [];
        }
        foundVnode.data.directives.push({ name: 'vue-form-validator', value: this.fieldstate });
        foundVnode.data.attrs['vue-form-validator'] = '';
      });
    } else {
      console.warn('Element with v-model not found');
    }
    return h(this.tag, { 'class': this.className.map(v => config.classPrefix + 'container-' + v) }, this.$slots.default);
  },
  props: {
    state: Object,
    custom: null,
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
      if (this.fieldstate.$pending) {
        out.push(config.pendingClass);
      }
      Object.keys(this.fieldstate.$error).forEach((error) => {
        out.push(config.invalidClass + '-' + hyphenate(error));
      });

      return out;
    }
  },
  mounted() {
    this.fieldstate.$name = this.name;
    this.formstate = this.state || this.$parent.state;
    this.formstate._addControl(this.fieldstate);

    const vModelEls = this.$el.querySelectorAll('[vue-form-validator]');

    // add classes to the input element
    this.$watch('className', (value, oldValue) => {
      if (oldValue) {
        for (let i = 0; i < vModelEls.length; i++) {
          oldValue.forEach(v => removeClass(vModelEls[i], config.classPrefix + v));
        }
      }
      for (let i = 0; i < vModelEls.length; i++) {
        value.forEach(v => addClass(vModelEls[i], config.classPrefix + v));
      };
    }, {
      deep: true,
      immediate: true
    });

  },
  created() {
    const vm = this;
    let pendingValidators = [];
    let _val;
    this.fieldstate = {
      $name: '',
      $dirty: false,
      $pristine: true,
      $valid: true,
      $invalid: false,
      $touched: false,
      $untouched: true,
      $pending: false,
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
        this.$pending = true;
        let isValid = true;
        let emptyAndRequired = false;
        const value = vModelValue(vnode.data);
        _val = value;

        const pending = {
          promises: [],
          names: []
        };

        pendingValidators.push(pending);

        const attrs = (vnode.data.attrs || {});
        const propsData = (vnode.componentOptions && vnode.componentOptions.propsData ? vnode.componentOptions.propsData : {});

        Object.keys(this._validators).forEach((validator) => {
          // when value is empty and not the required validator, the field is valid
          if ((value === '' || value === undefined || value === null) && validator !== 'required') {
            this._setValidatorVadility(validator, true);
            emptyAndRequired = true;
            // return early, required validator will
            // fall through if it is present
            return;
          }
          const attrValue = typeof attrs[validator] !== 'undefined' ? attrs[validator] : propsData[validator];
          const result = this._validators[validator](value, attrValue, vnode);
          if (typeof result === 'boolean') {
            if (result) {
              this._setValidatorVadility(validator, true);
            } else {
              isValid = false;
              this._setValidatorVadility(validator, false);
            }
          } else {
            pending.promises.push(result);
            pending.names.push(validator);
          }
        });

        if (pending.promises.length) {
          config.Promise.all(pending.promises).then((results) => {

            // only concerned with the last promise results, in case
            // async responses return out of order
            if (pending !== pendingValidators[pendingValidators.length - 1]) {
              //console.log('ignoring old promise', pending.promises);
              return;
            }

            pendingValidators = [];

            results.forEach((result, i) => {
              const name = pending.names[i];
              if (result) {
                this._setValidatorVadility(name, true);
              } else {
                isValid = false;
                this._setValidatorVadility(name, false);
              }
            });
            this._setVadility(isValid);
            this.$pending = false;
          });
        } else {
          this._setVadility(isValid);
          this.$pending = false;
        }
      }
    }

    // add custom validators
    if (this.custom) {
      Object.keys(this.custom).forEach((prop) => {
        this.fieldstate._validators[prop] = this.custom[prop];
      });
    }

  },
  destroyed() {
    this.formstate._removeControl(this.fieldstate);
  }
};
