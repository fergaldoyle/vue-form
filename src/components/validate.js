import { getVModelAndLabel, vModelValue, addClass, removeClass, getName, hyphenate, randomId, getClasses, isShallowObjectDifferent } from '../util';
import { vueFormConfig, vueFormState, vueFormParentForm } from '../providers';
import { validators } from '../validators';
import extend from 'extend';

export default {
  render(h) {
    let foundVnodes = getVModelAndLabel(this.$slots.default, this.vueFormConfig);
    const vModelnodes = foundVnodes.vModel;
    const attrs = {
      for: null
    };
    if (vModelnodes.length) {
      this.name = getName(vModelnodes[0]);

      if (foundVnodes.messages) {
        this.$nextTick(() => {
          const messagesVm = foundVnodes.messages.componentInstance
          if (messagesVm) {
            messagesVm.fieldname = messagesVm.fieldname || this.name;
          }
        });
      }

      if (this.autoLabel) {
        const id = vModelnodes[0].data.attrs.id || this.fieldstate._id;
        this.fieldstate._id = id;
        vModelnodes[0].data.attrs.id = id;
        if (foundVnodes.label) {
          foundVnodes.label.data = foundVnodes.label.data || {};
          foundVnodes.label.data.attrs = foundVnodes.label.data.attrs || {};
          foundVnodes.label.data.attrs.for = id;
        } else if (this.tag === 'label') {
          attrs.for = id;
        }
      }
      vModelnodes.forEach((vnode) => {
        if (!vnode.data.directives) {
          vnode.data.directives = [];
        }
        vnode.data.directives.push({ name: 'vue-form-validator', value: { fieldstate: this.fieldstate, config: this.vueFormConfig } });
        vnode.data.attrs['vue-form-validator'] = '';
        vnode.data.attrs['debounce'] = this.debounce;
      });
    } else {
      //console.warn('Element with v-model not found');
    }
    return h(this.tag || this.vueFormConfig.validateTag, { 'class': this.className, attrs }, this.$slots.default);
  },
  props: {
    state: Object,
    custom: null,
    autoLabel: Boolean,
    tag: {
      type: String
    },
    debounce: Number
  },
  inject: { vueFormConfig, vueFormState, vueFormParentForm },
  data() {
    return {
      name: '',
      formstate: null,
      fieldstate: {}
    };
  },
  methods: {
    getClasses(classConfig) {
      var s = this.fieldstate;
      return Object.keys(s.$error).reduce((classes, error) => {
        classes[classConfig.invalid + '-' + hyphenate(error)] = true;
        return classes;
      }, getClasses(classConfig, s));
    }
  },
  computed: {
    className() {
      return this.getClasses(this.vueFormConfig.validateClasses);
    },
    inputClassName() {
      return this.getClasses(this.vueFormConfig.inputClasses);
    }
  },
  mounted() {
    this.fieldstate.$name = this.name;
    this.formstate._addControl(this.fieldstate);

    const vModelEls = this.$el.querySelectorAll('[vue-form-validator]');

    // add classes to the input element
    this.$watch('inputClassName', (value, oldValue) => {
      let out;
      for (let i = 0, el; el = vModelEls[i++];) {
        if (oldValue) {
          Object.keys(oldValue).filter(k => oldValue[k]).forEach(k => removeClass(el, k));
        }
        out = [];
        Object.keys(value).filter(k => value[k]).forEach((k) => {
          out.push(k);
          addClass(el, k)
        });
      }
      this.fieldstate._className = out;
    }, {
      deep: true,
      immediate: true
    });

    this.$watch('name', (value, oldValue) => {
      this.formstate._removeControl(this.fieldstate);
      this.fieldstate.$name = value;
      this.formstate._addControl(this.fieldstate);
    });

  },
  created() {
    this.formstate = this.state || this.vueFormState;
    const vm = this;
    let pendingValidators = [];
    let _val;
    let prevVnode;
    this.fieldstate = {
      $name: '',
      $dirty: false,
      $pristine: true,
      $valid: true,
      $invalid: false,
      $touched: false,
      $untouched: true,
      $focused: false,
      $pending: false,
      $submitted: false,
      $error: {},
      $attrs: {},
      _className: null,
      _id: 'vf' + randomId(),
      _setValidatorValidity(validator, isValid) {
        if (isValid) {
          vm.$delete(this.$error, validator);
        } else {
          vm.$set(this.$error, validator, true);
        }
      },
      _setValidity(isValid) {
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
      _setFocused(value) {
        this.$focused = typeof value === 'boolean' ? value : false;
        if (this.$focused) {
          this._setHasFocused();
        } else {
          this._setTouched();
        }
      },
      _setHasFocused() {
        this._hasFocused = true;
      },
      _hasFocused: false,
      _validators: {},
      _validate(vnode) {
        if(!vnode) {
          vnode = prevVnode;
        } else {
          prevVnode = vnode;
        }
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

        let attrs = vnode.data.attrs || {};
        const childvm = vnode.componentInstance;
        if(childvm && childvm._vfValidationData_) {
          attrs = extend({}, attrs, childvm._vfValidationData_);
        }

        const propsData = (vnode.componentOptions && vnode.componentOptions.propsData ? vnode.componentOptions.propsData : {});

        Object.keys(this._validators).forEach((validator) => {
          // when value is empty and current validator is not the required validator, the field is valid
          if ((value === '' || value === undefined || value === null) && validator !== 'required') {
            this._setValidatorValidity(validator, true);
            emptyAndRequired = true;
            // return early, required validator will
            // fall through if it is present
            return;
          }

          const attrValue = typeof attrs[validator] !== 'undefined' ? attrs[validator] : propsData[validator];
          const isFunction = typeof this._validators[validator] === 'function';

          // match vue behaviour, ignore if attribute is null or undefined. But for type=email|url|number and custom validators, the value will be null, so allow with _allowNulls
          if (isFunction && (attrValue === null || typeof attrValue === 'undefined') && !this._validators[validator]._allowNulls) {
            return;
          }

          if(attrValue) {
            this.$attrs[validator] = attrValue;
          }

          const result = isFunction ? this._validators[validator](value, attrValue, vnode) : vm.custom[validator];

          if (typeof result === 'boolean') {
            if (result) {
              this._setValidatorValidity(validator, true);
            } else {
              isValid = false;
              this._setValidatorValidity(validator, false);
            }
          } else {
            pending.promises.push(result);
            pending.names.push(validator);
            vm.vueFormParentForm.promises.push(result);
          }
        });

        if (pending.promises.length) {
          vm.vueFormConfig.Promise.all(pending.promises).then((results) => {

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
                this._setValidatorValidity(name, true);
              } else {
                isValid = false;
                this._setValidatorValidity(name, false);
              }
            });
            this._setValidity(isValid);
            this.$pending = false;
          });
        } else {
          this._setValidity(isValid);
          this.$pending = false;
        }
      }
    }

    // add custom validators
    if (this.custom) {
      Object.keys(this.custom).forEach((prop) => {
        if (typeof this.custom[prop] === 'function') {
          this.custom[prop]._allowNulls = true;
          this.fieldstate._validators[prop] = this.custom[prop];
        } else {
          this.fieldstate._validators[prop] = this.custom[prop];
        }
      });
    }

    this.$watch('custom', (v, oldV) => {
      if(!oldV) { return }
      if(isShallowObjectDifferent(v, oldV)){
        this.fieldstate._validate();
      }
    }, {
      deep: true
    });

  },
  destroyed() {
    this.formstate._removeControl(this.fieldstate);
  }
};
