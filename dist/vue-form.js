(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.vueForm = factory());
}(this, (function () { 'use strict';

var config = {
    formComponent: 'vueForm',
    errorComponent: 'formError',
    errorsComponent: 'formErrors',
    validateComponent: 'validate',
    errorTag: 'span',
    errorsTag: 'div',
    classPrefix: 'vf-',
    dirtyClass: 'dirty',
    pristineClass: 'pristine',
    validClass: 'valid',
    invalidClass: 'invalid',
    submittedClass: 'submitted',
    touchedClass: 'touched',
    untouchedClass: 'untouched',
    pendingClass: 'pending',
    Promise: window.Promise
};

var errorMixin = {
  computed: {
    isShown: function isShown() {
      var field = this.formstate[this.field];

      if (!this.show || !field) {
        return true;
      }

      if (this.show.indexOf('&&') > -1) {
        // and logic - every
        var split = this.show.split('&&');
        return split.every(function (v) {
          return field[v.trim()];
        });
      } else if (this.show.indexOf('||') > -1) {
        // or logic - some
        var _split = this.show.split('||');
        return _split.some(function (v) {
          return field[v.trim()];
        });
      } else {
        // single
        return field[this.show];
      }
    }
  }
};

var formErrors = {
  mixins: [errorMixin],
  render: function render(h) {
    var _this = this;

    //console.log('errors render');
    var children = [];
    var field = this.formstate[this.field];
    if (field && field.$error && this.isShown) {
      Object.keys(field.$error).forEach(function (key) {
        children.push(_this.$slots[key]);
      });
    }
    return h(this.tag, children);
  },

  props: {
    state: Object,
    field: String,
    show: {
      type: String,
      default: ''
    },
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
  mounted: function mounted() {
    var _this2 = this;

    this.$nextTick(function () {
      _this2.formstate = _this2.state || _this2.$parent.formstate || _this2.$parent.state;
    });
  }
};

var formError = {
  mixins: [errorMixin],
  render: function render(h) {
    var field = this.formstate[this.field];
    if (field && field.$error[this.error] && this.isShown) {
      return h(this.tag, [this.$slots.default]);
    }
  },

  props: {
    state: Object,
    field: String,
    error: String,
    show: {
      type: String,
      default: ''
    },
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
  mounted: function mounted() {
    var _this = this;

    this.$nextTick(function () {
      _this.formstate = _this.state || _this.$parent.formstate || _this.$parent.state;
    });
  }
};

var emailRegExp = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i; // from angular
var urlRegExp = /^(http\:\/\/|https\:\/\/)(.{4,})$/;

var validators = {
  email: function email(value, attrValue, vnode) {
    return emailRegExp.test(value);
  },
  number: function number(value) {
    return !isNaN(value);
  },
  url: function url(value) {
    return urlRegExp.test(value);
  },
  required: function required(value, attrValue, vnode) {
    if (attrValue === false) {
      return true;
    }

    if (vnode.data.attrs.type === 'number' && value === 0) {
      return true;
    }

    if (Array.isArray(value)) {
      return !!value.length;
    }
    return !!value;
  },
  minlength: function minlength(value, length) {
    return value.length >= length;
  },
  maxlength: function maxlength(value, length) {
    return length >= value.length;
  },
  pattern: function pattern(value, _pattern) {
    var patternRegExp = new RegExp('^' + _pattern + '$');
    return patternRegExp.test(value);
  },
  min: function min(value, _min) {
    return value * 1 >= _min * 1;
  },
  max: function max(value, _max) {
    return _max * 1 >= value * 1;
  }
};

var vueForm = {
  render: function render(h) {
    var _this = this;

    return h('form', {
      on: {
        submit: function submit(event) {
          _this.state.$submitted = true;
          _this.$emit('submit', event);
        }
      },
      attrs: {
        'novalidate': '',
        'class': this.className
      }
    }, [this.$slots.default]);
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
      $pending: false,
      $error: {},
      _addControl: function _addControl(ctrl) {
        controls[ctrl.$name] = ctrl;
        _this2.$set(state, ctrl.$name, ctrl);
      },
      _removeControl: function _removeControl(ctrl) {
        delete controls[ctrl.$name];
        _this2.$delete(_this2.state, ctrl.$name);
        _this2.$delete(_this2.state.$error, ctrl.$name);
      }
    };

    Object.keys(formstate).forEach(function (key) {
      _this2.$set(_this2.state, key, formstate[key]);
    });

    this.$watch('state', function () {
      var isDirty = false;
      var isValid = true;
      var isTouched = false;
      var isPending = false;
      Object.keys(controls).forEach(function (key) {
        var control = controls[key];
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
          _this2.$set(state.$error, control.$name, control);
        } else {
          _this2.$delete(state.$error, control.$name);
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
    className: function className() {
      var out = [];
      if (this.state.$dirty) {
        out.push(config.dirtyClass);
      } else {
        out.push(config.pristineClass);
      }
      if (this.state.$valid) {
        out.push(config.validClass);
      } else {
        out.push(config.invalidClass);
      }
      if (this.state.$touched) {
        out.push(config.touchedClass);
      } else {
        out.push(config.untouchedClass);
      }
      if (this.state.$submitted) {
        out.push(config.submittedClass);
      }
      if (this.state.$pending) {
        out.push(config.pendingClass);
      }
      return out.map(function (v) {
        return config.classPrefix + 'form-' + v;
      }).join(' ');
    }
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



function vModelValue(data) {
  if (data.model) {
    return data.model.value;
  }
  return data.directives.filter(function (v) {
    return v.name === 'model';
  })[0].value;
}

function getVModelNode(nodes) {
  var foundVnodes = [];

  function traverse(nodes) {
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      if (node.data) {
        if (node.data.directives) {
          var match = node.data.directives.filter(function (v) {
            return v.name === 'model';
          });
          if (match.length) {
            foundVnodes.push(node);
          }
        } else if (node.data.model) {
          foundVnodes.push(node);
        }
      }
      if (node.children) {
        traverse(node.children);
      }
    }
  }

  traverse(nodes);

  return foundVnodes;
}

function getName(vnode) {
  if (vnode.data && vnode.data.attrs && vnode.data.attrs.name) {
    return vnode.data.attrs.name;
  } else if (vnode.componentOptions && vnode.componentOptions.propsData && vnode.componentOptions.propsData.name) {
    return vnode.componentOptions.propsData.name;
  }
}

function compareChanges(vnode, oldvnode) {

  var hasChanged = false;
  var attrs = vnode.data.attrs || {};
  var oldAttrs = oldvnode.data.attrs || {};
  var out = {};

  if (vModelValue(vnode.data) !== vModelValue(oldvnode.data)) {
    out.vModel = true;
    hasChanged = true;
  }

  Object.keys(validators).forEach(function (validator) {
    if (attrs[validator] !== oldAttrs[validator]) {
      out[validator] = true;
      hasChanged = true;
    }
  });

  // if is a component
  if (vnode.componentOptions && vnode.componentOptions.propsData) {
    (function () {
      var attrs = vnode.componentOptions.propsData;
      var oldAttrs = oldvnode.componentOptions.propsData;
      Object.keys(validators).forEach(function (validator) {
        if (attrs[validator] !== oldAttrs[validator]) {
          out[validator] = true;
          hasChanged = true;
        }
      });
    })();
  }

  if (hasChanged) {
    return out;
  }
}

var vueFormValidator = {
  name: 'vue-form-validator',
  bind: function bind(el, binding, vnode) {
    var fieldstate = binding.value;
    var attrs = vnode.data.attrs || {};
    var inputName = getName(vnode);

    if (!inputName) {
      console.warn('vue-form: name attribute missing');
      return;
    }

    // add validators
    Object.keys(attrs).forEach(function (attr) {
      var prop = void 0;
      if (attr === 'type') {
        prop = attrs[attr];
      } else {
        prop = attr;
      }
      if (validators[prop] && !fieldstate._validators[prop]) {
        fieldstate._validators[prop] = validators[prop];
      }
    });

    // if is a component, a validator attribute by be
    // a prop this component uses
    if (vnode.componentOptions && vnode.componentOptions.propsData) {
      Object.keys(vnode.componentOptions.propsData).forEach(function (prop) {
        if (validators[prop] && !fieldstate._validators[prop]) {
          fieldstate._validators[prop] = validators[prop];
        }
      });
    }

    fieldstate._validate(vnode);

    // native listeners
    el.addEventListener('blur', function () {
      fieldstate._setTouched();
    }, false);
    el.addEventListener('focus', function () {
      fieldstate._setFocused();
    }, false);

    // component listeners
    if (vnode.componentInstance) {
      vnode.componentInstance.$on('blur', function () {
        fieldstate._setTouched();
      });
      vnode.componentInstance.$on('focus', function () {
        fieldstate._setFocused();
      });
    }
  },
  update: function update(el, binding, vnode, oldVNode) {
    var changes = compareChanges(vnode, oldVNode);
    var name = (vnode.data.attrs || {}).name;
    var fieldstate = binding.value;

    if (!changes) {
      return;
    }

    if (changes.vModel) {
      // re-validate all
      if (fieldstate._hasFocused) {
        fieldstate._setDirty();
      }
      fieldstate._validate(vnode);
    } else {
      // attributes have changed
      // to do: loop through them and re-validate changed ones
      //for(let prop in changes) {
      //  fieldstate._validate(vnode, validator);
      //}
      // for now
      fieldstate._validate(vnode);
    }
  }
};

// todo: Make getVModelNode recursive

var validate = {
  render: function render(h) {
    var _this = this;

    var foundVnodes = getVModelNode(this.$slots.default);
    if (foundVnodes.length) {
      this.name = getName(foundVnodes[0]);
      foundVnodes.forEach(function (foundVnode) {
        if (!foundVnode.data.directives) {
          foundVnode.data.directives = [];
        }
        foundVnode.data.directives.push({ name: 'vue-form-validator', value: _this.fieldstate });
        foundVnode.data.attrs['vue-form-validator'] = '';
      });
    } else {
      console.warn('Element with v-model not found');
    }
    return h(this.tag, { 'class': this.className.map(function (v) {
        return config.classPrefix + 'container-' + v;
      }) }, this.$slots.default);
  },

  props: {
    state: Object,
    custom: null,
    tag: {
      type: String,
      default: 'span'
    }
  },
  data: function data() {
    return {
      name: '',
      formstate: {},
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
      if (this.fieldstate.$pending) {
        out.push(config.pendingClass);
      }
      Object.keys(this.fieldstate.$error).forEach(function (error) {
        out.push(config.invalidClass + '-' + error);
      });

      return out;
    }
  },
  mounted: function mounted() {
    this.fieldstate.$name = this.name;
    this.formstate = this.state || this.$parent.state;
    this.formstate._addControl(this.fieldstate);

    var vModelEls = this.$el.querySelectorAll('[vue-form-validator]');

    // add classes to the input element
    this.$watch('className', function (value, oldValue) {
      if (oldValue) {
        var _loop = function _loop(i) {
          oldValue.forEach(function (v) {
            return removeClass(vModelEls[i], config.classPrefix + v);
          });
        };

        for (var i = 0; i < vModelEls.length; i++) {
          _loop(i);
        }
      }

      var _loop2 = function _loop2(_i) {
        value.forEach(function (v) {
          return addClass(vModelEls[_i], config.classPrefix + v);
        });
      };

      for (var _i = 0; _i < vModelEls.length; _i++) {
        _loop2(_i);
      }
    }, {
      deep: true,
      immediate: true
    });
  },
  created: function created() {
    var _this3 = this;

    var vm = this;
    var pendingValidators = [];
    var _val = void 0;
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
      _setValidatorVadility: function _setValidatorVadility(validator, isValid) {
        if (isValid) {
          vm.$delete(this.$error, validator);
        } else {
          vm.$set(this.$error, validator, true);
        }
      },
      _setVadility: function _setVadility(isValid) {
        this.$valid = isValid;
        this.$invalid = !isValid;
      },
      _setDirty: function _setDirty() {
        this.$dirty = true;
        this.$pristine = false;
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
        var _this2 = this;

        this.$pending = true;
        var isValid = true;
        var emptyAndRequired = false;
        var value = vModelValue(vnode.data);
        _val = value;

        var pending = {
          promises: [],
          names: []
        };

        pendingValidators.push(pending);

        var attrs = vnode.data.attrs || {};
        var propsData = vnode.componentOptions && vnode.componentOptions.propsData ? vnode.componentOptions.propsData : {};

        Object.keys(this._validators).forEach(function (validator) {
          // when value is empty and not the required validator, the field is valid
          if ((value === '' || value === undefined || value === null) && validator !== 'required') {
            _this2._setValidatorVadility(validator, true);
            emptyAndRequired = true;
            // return early, required validator will
            // fall through if it is present
            return;
          }
          var attrValue = typeof attrs[validator] !== 'undefined' ? attrs[validator] : propsData[validator];
          var result = _this2._validators[validator](value, attrValue, vnode);
          if (typeof result === 'boolean') {
            if (result) {
              _this2._setValidatorVadility(validator, true);
            } else {
              isValid = false;
              _this2._setValidatorVadility(validator, false);
            }
          } else {
            pending.promises.push(result);
            pending.names.push(validator);
          }
        });

        if (pending.promises.length) {
          config.Promise.all(pending.promises).then(function (results) {

            // only concerned with the last promise results, in case
            // async responses return out of order
            if (pending !== pendingValidators[pendingValidators.length - 1]) {
              //console.log('ignoring old promise', pending.promises);
              return;
            }

            pendingValidators = [];

            results.forEach(function (result, i) {
              var name = pending.names[i];
              if (result) {
                _this2._setValidatorVadility(name, true);
              } else {
                isValid = false;
                _this2._setValidatorVadility(name, false);
              }
            });
            _this2._setVadility(isValid);
            _this2.$pending = false;
          });
        } else {
          this._setVadility(isValid);
          this.$pending = false;
        }
      }
    };

    // add custom validators
    if (this.custom) {
      Object.keys(this.custom).forEach(function (prop) {
        _this3.fieldstate._validators[prop] = _this3.custom[prop];
      });
    }
  },
  destroyed: function destroyed() {
    this.formstate._removeControl(this.fieldstate);
  }
};

var main = {
  install: function install(Vue) {
    Vue.component(config.formComponent, vueForm);
    Vue.component(config.validateComponent, validate);
    Vue.component(config.errorsComponent, formErrors);
    Vue.component(config.errorComponent, formError);
    Vue.directive('vue-form-validator', vueFormValidator);
  },

  config: config,
  addValidator: function addValidator(key, fn) {
    validators[key] = fn;
  },

  mixin: {
    components: {
      formErrors: formErrors,
      formError: formError,
      vueForm: vueForm,
      validate: validate
    },
    directives: {
      vueFormValidator: vueFormValidator
    }
  }
};

return main;

})));
//# sourceMappingURL=vue-form.js.map
