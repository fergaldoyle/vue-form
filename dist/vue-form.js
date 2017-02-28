(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.vueForm = factory());
}(this, (function () { 'use strict';

var config = {
    formComponent: 'vueForm',
    errorComponent: 'formError',
    errorsComponent: 'formErrors',
    validateDirective: 'form',
    errorTag: 'span',
    errorsTag: 'div',
    dirtyClass: 'vf-dirty',
    pristineClass: 'vf-pristine',
    validClass: 'vf-valid',
    invalidClass: 'vf-invalid',
    submittedClass: 'vf-submitted',
    touchedClass: 'vf-touched',
    untouchedClass: 'vf-untouched'
};

var emailRegExp = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i; // from angular
var urlRegExp = /^(http\:\/\/|https\:\/\/)(.{4,})$/;

var validators = {
    /*   'type[email]' (model, value, vnode) {
           return emailRegExp.test(model);
       },
       'type[number]' (model) {
           return !isNaN(model);
       },
       'type[url]' (model) {
           return urlRegExp.test(model);
       },*/

    email: function email(model, value, vnode) {
        return emailRegExp.test(model);
    },
    number: function number(model) {
        return !isNaN(model);
    },
    url: function url(model) {
        return urlRegExp.test(model);
    },
    required: function required(model, value, vnode) {
        if (value === false) {
            return true;
        }

        if (Array.isArray(model)) {
            return !!model.length;
        }
        return !!model;
    },
    minlength: function minlength(model, length) {
        return model.length >= length;
    },
    maxlength: function maxlength(model, length) {
        return length >= model.length;
    },
    pattern: function pattern(model, _pattern) {
        var patternRegExp = new RegExp('^' + _pattern + '$');
        return patternRegExp.test(model);
    },
    min: function min(model, _min) {
        return model * 1 >= _min * 1;
    },
    max: function max(model, _max) {
        return _max * 1 >= model * 1;
    }
};

function addClass(el, className) {
    if (el.classList) {
        el.classList.add(className);
    } else {
        el.className += ' ' + className;
    }
}

function removeClass(el, className) {
    if (el.classList) {
        el.classList.remove(className);
    } else {
        el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
    }
}

//https://plnkr.co/edit/yfUBrLH3v29RmMCnsnlo?p=preview

function vModelValue(data) {
  return data.directives.filter(function (v) {
    return v.name === 'model';
  })[0].value;
}

function getVModelNode(nodes) {
  var foundVnode = void 0;
  var vModelNode = nodes.filter(function (node) {
    if (node.data && node.data.directives) {
      var match = node.data.directives.filter(function (v) {
        return v.name === 'model';
      });
      if (match.length) {
        foundVnode = node;
      }
    }
  });
  return foundVnode;
}

function compareChanges(data, oldData) {
  var hasChanged = false;
  var attrs = data.attrs || {};
  var oldAttrs = oldData.attrs || {};
  var out = {};

  if (vModelValue(data) !== vModelValue(oldData)) {
    out.vModel = true; //vModelValue(data);
    hasChanged = true;
  }

  Object.keys(validators).forEach(function (validator) {
    if (attrs[validator] !== oldAttrs[validator]) {
      out[validator] = true; //attrs[validator];
      hasChanged = true;
    }
  });

  if (hasChanged) {
    return out;
  }
}

var main = {
  install: function install(Vue) {
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
      render: function render(h) {
        var _this = this;

        var children = [];
        var field = this.formstate[this.field];
        if (field && field.$error) {
          Object.keys(field.$error).forEach(function (key) {
            children.push(_this.$slots[key]);
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
      data: function data() {
        return {
          formstate: {}
        };
      },
      created: function created() {
        this.formstate = this.state || this.$parent.state;
      }
    });

    Vue.component(config.errorComponent, {
      render: function render(h) {
        var field = this.formstate[this.field];
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
      data: function data() {
        return {
          formstate: {}
        };
      },
      created: function created() {
        this.formstate = this.state || this.$parent.state;
      }
    });

    Vue.component(config.formComponent, {
      render: function render(h) {
        return h('form', { attrs: { 'novalidate': '' } }, [this.$slots.default]);
      },

      props: {
        value: Object,
        state: Object
      },
      data: function data() {
        return {};
      },
      created: function created() {
        var _this2 = this;

        var controls = {};
        var state = this.state;
        var formstate = {
          $dirty: false,
          $pristine: true,
          $valid: true,
          $invalid: false,
          $submitted: false,
          $touched: false,
          $untouched: true,
          $error: {},
          _addControl: function _addControl(ctrl) {
            controls[ctrl.$name] = ctrl;
            Vue.set(state, ctrl.$name, ctrl);
          },
          _removeControl: function _removeControl() {},
          _setDirty: function _setDirty() {
            state.$dirty = true;
            state.$pristine = false;
            //addClass(el, config.dirtyClass);
            //removeClass(el, config.pristineClass);
          },
          _setPristine: function _setPristine() {}
        };

        Object.keys(formstate).forEach(function (key) {
          Vue.set(_this2.state, key, formstate[key]);
        });

        this.$watch('state', function () {
          var isDirty = false;
          var isValid = true;
          var isTouched = false;
          Object.keys(controls).forEach(function (key) {
            var control = controls[key];
            if (control.$dirty) {
              isDirty = true;
            }
            if (control.$touched) {
              isTouched = true;
            }
            if (!control.$valid) {
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
      mounted: function mounted() {

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
      bind: function bind(el, binding, vnode) {
        var state = binding.value;
        var attrs = vnode.data.attrs || {};
        var inputName = attrs.name;

        if (!inputName) {
          console.warn('vue-form: name attribute missing');
          return;
        }

        Object.keys(attrs).forEach(function (attr) {
          var prop = void 0;
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

        el.addEventListener('blur', function () {
          state._setTouched();
        }, false);
        el.addEventListener('focus', function () {
          state._setFocused();
        }, false);
      },
      update: function update(el, binding, vnode, oldVNode) {
        var changes = compareChanges(vnode.data, oldVNode.data);
        var name = (vnode.data.attrs || {}).name;
        var state = binding.value;

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
      render: function render(h) {
        var foundVnode = getVModelNode(this.$slots.default);
        if (foundVnode) {
          this.name = foundVnode.data.attrs.name;
          foundVnode.data.directives.push({ name: 'vue-form-validate', value: this.fieldstate });
          foundVnode.data.attrs['vue-form-validate'] = '';
        } else {
          console.warn('Element with v-model not found');
        }
        return h(this.tag, { 'class': this.className.map(function (v) {
            return 'container-' + v;
          }) }, this.$slots.default);
      },

      props: {
        state: {},
        tag: {
          type: String,
          default: 'span'
        }
      },
      data: function data() {
        return {
          name: '',
          fieldstate: {}
        };
      },

      computed: {
        className: function className() {
          var out = [];
          if (this.fieldstate.$dirty) {
            out.push(config.dirtyClass);
          } else {
            out.push(config.pristineClass);
          }
          if (this.fieldstate.$valid) {
            out.push(config.validClass);
          } else {
            out.push(config.invalidClass);
          }
          if (this.fieldstate.$touched) {
            out.push(config.touchedClass);
          } else {
            out.push(config.untouchedClass);
          }
          return out;
        }
      },
      mounted: function mounted() {
        this.fieldstate.$name = this.name;
        this.$parent.state._addControl(this.fieldstate);

        var vModelEl = this.$el.querySelector('[vue-form-validate]');

        // add classes to the input element
        this.$watch('className', function (value, oldValue) {
          if (oldValue) {
            oldValue.forEach(function (v) {
              return removeClass(vModelEl, v);
            });
          }
          value.forEach(function (v) {
            return addClass(vModelEl, v);
          });
        }, {
          deep: true,
          immediate: true
        });
      },
      created: function created() {
        this.fieldstate = {
          $name: '',
          $dirty: false,
          $pristine: true,
          $valid: true,
          $invalid: false,
          $touched: false,
          $untouched: true,
          $error: {},
          _setValidatorVadility: function _setValidatorVadility(validator, isValid) {
            if (isValid) {
              Vue.delete(this.$error, validator);
              //removeClassWithPrefix(el, config.invalidClass + '-');
            } else {
              Vue.set(this.$error, validator, true);
              //addClass(el, config.invalidClass + '-' + validator);
            }
          },
          _setVadility: function _setVadility(isValid) {
            this.$valid = isValid;
            this.$invalid = !isValid;
          },
          _setDirty: function _setDirty() {
            this.$dirty = true;
            this.$pristine = false;
            //controller._form.setDirty();
          },
          _setPristine: function _setPristine() {
            this.$dirty = false;
            this.$pristine = true;
          },
          _setTouched: function _setTouched() {
            this.$touched = true;
            this.$untouched = false;
          },
          _setUntouched: function _setUntouched() {
            this.$touched = false;
            this.$untouched = true;
          },
          _setFocused: function _setFocused() {
            this._hasFocused = true;
          },

          _hasFocused: false,
          _validators: {},
          _validate: function _validate(vnode) {
            var _this3 = this;

            var isValid = true;
            var value = vModelValue(vnode.data);
            var attrs = vnode.data.attrs || {};

            Object.keys(this._validators).forEach(function (validator) {

              if (validator !== 'required' && !value && typeof value !== 'number') {
                _this3.setValidatorVadility(validator, true);
                return;
              }

              if (!validators[validator](value, attrs[validator], vnode)) {
                isValid = false;
                _this3._setValidatorVadility(validator, false);
              } else {
                _this3._setValidatorVadility(validator, true);
              }
            });

            this._setVadility(isValid);
            return isValid;
          }
        };
      }
    });
  }
};

return main;

})));
