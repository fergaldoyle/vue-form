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
    dirtyClass: 'vf-dirty',
    pristineClass: 'vf-pristine',
    validClass: 'vf-valid',
    invalidClass: 'vf-invalid',
    submittedClass: 'vf-submitted',
    touchedClass: 'vf-touched',
    untouchedClass: 'vf-untouched'
};

var formErrors = {
  name: '',
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
};

var formError = {
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

var vueForm = {
  render: function render(h) {
    var _this = this;

    return h('form', {
      on: {
        submit: function submit(event) {
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
      return out.join(' ');
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

var vueFormValidator = {
  name: 'vue-form-validator',
  bind: function bind(el, binding, vnode) {
    var fieldstate = binding.value;
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
        fieldstate._validators[prop] = validators[prop];
      }
    });

    fieldstate._validate(vnode);

    el.addEventListener('blur', function () {
      fieldstate._setTouched();
    }, false);
    el.addEventListener('focus', function () {
      fieldstate._setFocused();
    }, false);
  },
  update: function update(el, binding, vnode, oldVNode) {
    var changes = compareChanges(vnode.data, oldVNode.data);
    var name = (vnode.data.attrs || {}).name;
    var fieldstate = binding.value;

    if (!changes) {
      return;
    }

    if (changes.vModel) {
      if (fieldstate._hasFocused) {
        fieldstate._setDirty();
      }
      fieldstate._validate(vnode);
    } else {
      // attributes have changed
      // loop through them and re-validate changed ones
      //console.log(name, 'some attribute rules has changed');
      fieldstate._validate(vnode);
    }
  }
};

var validate = {
  render: function render(h) {
    var foundVnode = getVModelNode(this.$slots.default);
    if (foundVnode) {
      this.name = foundVnode.data.attrs.name;
      foundVnode.data.directives.push({ name: 'vue-form-validator', value: this.fieldstate });
      foundVnode.data.attrs['vue-form-validator'] = '';
    } else {
      console.warn('Element with v-model not found');
    }
    return h(this.tag, { 'class': this.className.map(function (v) {
        return 'container-' + v;
      }) }, this.$slots.default);
  },

  props: {
    state: Object,
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

    var vModelEl = this.$el.querySelector('[vue-form-validator]');

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
    var vm = this;
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
        var _this = this;

        var isValid = true;
        var value = vModelValue(vnode.data);
        var attrs = vnode.data.attrs || {};

        Object.keys(this._validators).forEach(function (validator) {

          if (validator !== 'required' && !value && typeof value !== 'number') {
            _this._setValidatorVadility(validator, true);
            return;
          }

          if (!validators[validator](value, attrs[validator], vnode)) {
            isValid = false;
            _this._setValidatorVadility(validator, false);
          } else {
            _this._setValidatorVadility(validator, true);
          }
        });

        this._setVadility(isValid);
        return isValid;
      }
    };
  },
  destroyed: function destroyed() {
    this.formstate._removeControl(this.fieldstate);
    console.log('destroyed');
  }
};

var main = {
  install: function install(Vue) {
    Vue.component(config.formComponent, vueForm);
    Vue.component(config.validateComponent, validate);
    Vue.component(config.errorsComponent, formErrors);
    Vue.component(config.errorComponent, formError);
    Vue.directive('vue-form-validator', vueFormValidator);
  }
};

//https://plnkr.co/edit/yfUBrLH3v29RmMCnsnlo?p=preview

return main;

})));
//# sourceMappingURL=vue-form.js.map
