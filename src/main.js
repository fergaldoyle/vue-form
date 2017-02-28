import { config } from './config';
import { validators } from './validators';
import { addClass, removeClass, removeClassWithPrefix } from './util';

//https://plnkr.co/edit/yfUBrLH3v29RmMCnsnlo?p=preview

function vModelValue(data) {
  return data.directives.filter(v => v.name === 'model')[0].value;
}

function getVModelNode(nodes) {
  let foundVnode;
  const vModelNode = nodes.filter((node) => {
    if (node.data && node.data.directives) {
      const match = node.data.directives.filter(v => v.name === 'model');
      if (match.length) {
        foundVnode = node;
      }
    }
  });
  return foundVnode;
}

function compareChanges(data, oldData) {
  let hasChanged = false;
  const attrs = data.attrs || {};
  const oldAttrs = oldData.attrs || {};
  const out = {};

  if (vModelValue(data) !== vModelValue(oldData)) {
    out.vModel = true; //vModelValue(data);
    hasChanged = true;
  }

  Object.keys(validators).forEach((validator) => {
    if (attrs[validator] !== oldAttrs[validator]) {
      out[validator] = true; //attrs[validator];
      hasChanged = true;
    }
  });

  if (hasChanged) {
    return out;
  }
}

export default {
  install(Vue) {
    /*
            Vue.directive('test', {
                bind (el, binding, vnode) {
                    console.log('test', vnode)
                },
                update () {
                    console.log('test update');
                }
            });
    */
    Vue.component(config.errorsComponent, {
      render(h) {
        const children = [];
        const field = this.formstate[this.field];
        if (field && field.$error) {
          Object.keys(field.$error).forEach((key) => {
            children.push(this.$slots[key]);
          });
        }
        return h(this.tag, children);
      },
      props: {
        state: Object,
        field: String,
        tag: {
          type: String,
          default: config.errorsTag
        }
      },
      data () {
        return {
          formstate: {}
        };
      },
      created () {
        this.formstate = this.state || this.$parent.state;
      }
    });

    Vue.component(config.errorComponent, {
      render(h) {
        const field = this.formstate[this.field];
        if (field && field.$error[this.error]) {
          return h(this.tag, [this.$slots.default]);
        }
      },
      props: {
        state: Object,
        field: String,
        error: String,
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
      created () {
        this.formstate = this.state || this.$parent.state;
      }
    });

    Vue.component(config.formComponent, {
      render(h) {
        return h(
          'form', { attrs: { 'novalidate': '' } }, [this.$slots.default]
        )
      },
      props: {
        value: Object,
        state: Object
      },
      data() {
        return {
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
          $error: {},
          _addControl(ctrl) {
            controls[ctrl.$name] = ctrl;
            Vue.set(state, ctrl.$name, ctrl);
          },
          _removeControl() {

          },
          _setDirty() {
            state.$dirty = true;
            state.$pristine = false;
            //addClass(el, config.dirtyClass);
            //removeClass(el, config.pristineClass);
          },
          _setPristine() {

          }
        }

        Object.keys(formstate).forEach((key) => {
          Vue.set(this.state, key, formstate[key]);
        });

        this.$watch('state', () => {
          let isDirty = false;
          let isValid = true;
          let isTouched = false;
          Object.keys(controls).forEach((key) => {
            const control = controls[key];
            if(control.$dirty) {
              isDirty = true;
            }
            if(control.$touched) {
              isTouched = true;
            }
            if(!control.$valid) {
              isValid = false;
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

      },
      mounted() {

        /*
        const state = this.$el.__vf_state = this.fieldstate;

        const el = this.$el;

        //this.$emit('input', state);
        Object.keys(state).forEach((key) => {
          //    Vue.set(this.state, key, state[key]);
        });

        const controls = {};
        const controller = this.$el.__vf_controller = {
          state,
          controls,
          addControl: (ctrl) => {
            ctrl._form = controller;
            controls[ctrl.name] = ctrl;
            Vue.set(this.state, ctrl.name, ctrl.state);
          },
          removeControl() {

          },
          setDirty: () => {
            this.state.$dirty = true;
            this.state.$pristine = false;
            addClass(el, config.dirtyClass);
            removeClass(el, config.pristineClass);
          },
          setPristine: function() {
            state.$dirty = false;
            state.$pristine = true;
            Object.keys(controls).forEach((ctrl) => {
              controls[ctrl].setPristine();
            });
            //vueForm.setSubmitted(false);
            removeClass(el, config.dirtyClass);
            addClass(el, config.pristineClass);
          }
        };

        this.$watch('state', () => {
          //console.log('calcuate overall state here');



        }, { deep: true });
        */
      }
    });

    Vue.directive('vue-form-validate', {
      name: 'vue-form-validate',
      bind(el, binding, vnode) {
        const state = binding.value;
        const attrs = (vnode.data.attrs || {});
        const inputName = attrs.name;

        if (!inputName) {
          console.warn('vue-form: name attribute missing');
          return;
        }

        Object.keys(attrs).forEach((attr) => {
          let prop;
          if (attr === 'type') {
            prop = attrs[attr];
          } else {
            prop = attr;
          }
          if (validators[prop]) {
            state._validators[prop] = validators[prop];
          }
        });

        state._validate(vnode);

        el.addEventListener('blur', () => {
          state._setTouched();
        }, false);
        el.addEventListener('focus', () => {
          state._setFocused();
        }, false);
      },

      update(el, binding, vnode, oldVNode) {
        const changes = compareChanges(vnode.data, oldVNode.data);
        const name = (vnode.data.attrs || {}).name;
        const state = binding.value;

        if (!changes) {
          return;
        }

        if (changes.vModel) {
          if (state._hasFocused) {
            state._setDirty();
          }
          state._validate(vnode);
        } else {
          // attributes have changed
          // loop through them and re-validate changed ones
          //console.log(name, 'some attribute rules has changed');
          state._validate(vnode);
        }

      }
    });

    Vue.component('validate', {
      render(h) {
        let foundVnode = getVModelNode(this.$slots.default);
        if (foundVnode) {
          this.name = foundVnode.data.attrs.name;
          foundVnode.data.directives.push({ name: 'vue-form-validate', value: this.fieldstate });
          foundVnode.data.attrs['vue-form-validate'] = '';
        } else {
          console.warn('Element with v-model not found');
        }
        return h(this.tag, {'class': this.className.map(v => 'container-' + v)}, this.$slots.default);
      },
      props: {
        state: {},
        tag: {
          type: String,
          default: 'span'
        }
      },
      data() {
        return {
          name: '',
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
          return out;
        }
      },
      mounted() {
        this.fieldstate.$name = this.name;
        this.$parent.state._addControl(this.fieldstate);

        const vModelEl = this.$el.querySelector('[vue-form-validate]');

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
              Vue.delete(this.$error, validator);
              //removeClassWithPrefix(el, config.invalidClass + '-');
            } else {
              Vue.set(this.$error, validator, true);
              //addClass(el, config.invalidClass + '-' + validator);
            }
          },
          _setVadility(isValid) {
            this.$valid = isValid;
            this.$invalid = !isValid;
          },
          _setDirty() {
            this.$dirty = true;
            this.$pristine = false;
            //controller._form.setDirty();
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
                this.setValidatorVadility(validator, true);
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
      }
    });

  }
};
