// http://plnkr.co/edit/iNWVNyuLM9ihOzlbuZvS?p=preview
; (function () {
    var vueForm = {};
    vueForm.install = function (Vue) {

        var emailRegExp = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
            urlRegExp = /^(http\:\/\/|https\:\/\/)(.{4,})$/,
            attrs = [
                'type',
                'required',
                'pattern',
                'multiple',
                'minlength',
                'maxlength',
                'min',
                'max',
                'custom-validator'
            ],
            attrsWithValue = [
                'minlength',
                'maxlength',
                'min',
                'max',
                'pattern'
            ];

        var validators = {
            required: function (value) {
                if (Vue.util.isArray(value)) {
                    return !!value.length;
                }
                return !!value;
            },
            email: function (value, multiple) {
                if (typeof value === 'undefined') {
                    return true;
                }
                if (!value.trim()) {
                    return true;
                }
                return emailRegExp.test(value);
            },
            number: function (value) {
                return !isNaN(value);
            },
            url: function (value) {
                return urlRegExp.test(value);
            },
            minlength: function (value, length) {
                return value.length >= length;
            },
            maxlength: function (value, length) {
                return length >= value.length;
            },
            pattern: function (value, pattern) {
                var patternRegExp = new RegExp('^' + pattern + '$');
                return patternRegExp.test(value);
            },
            min: function (value, min) {
                return value >= min;
            },
            max: function (value, max) {
                return max >= value;
            }
        };
        
        // check if an attribute exists, static or binding.
        // if it is a binding, watch it and re-validate on change
        function checkAttribute($this, attribute) {
            var formCtrlCtrl = $this._formCtrlCtrl;
            var binding = Vue.util.getBindAttr($this.el, attribute);
            if (binding) {
                $this.vm.$watch(binding, function (value, oldValue) {
                    formCtrlCtrl[attribute] = value;
                    if (attribute === 'type') {
                        delete formCtrlCtrl.validators[oldValue];
                        formCtrlCtrl.validators[value] = validators[value];
                    } else {
                        formCtrlCtrl.validators[attribute] = validators[attribute];
                        if (value === false) {
                            formCtrlCtrl.validators[attribute] = false;
                        }
                    }
                    formCtrlCtrl.validate($this._value);
                }, { immediate: true });
            }
            var staticAttr = $this.el.getAttribute(attribute);
            if (staticAttr !== null) {
                formCtrlCtrl[attribute] = staticAttr || true;
                if (attribute === 'type') {
                    formCtrlCtrl.validators[staticAttr] = validators[staticAttr];
                } else if (attribute === 'custom-validator') {
                    formCtrlCtrl.validators[attribute] = $this.vm[staticAttr];
                } else {
                    formCtrlCtrl.validators[attribute] = validators[attribute];
                }
            }

        }

        Vue.directive('form', {
            id: 'form',
            priority: 10001,
            bind: function () {
                var formName = this.el.getAttribute('name'),
                    vm = this.vm,
                    self = this,
                    controls = {};

                var state = this._state = {
                    $name: formName,
                    $dirty: false,
                    $pristine: true,
                    $valid: true,
                    $invalid: false,
                    $submitted: false,
                    $error: {}
                };

                vm.$set(formName, state);

                var formCtrl = {
                    name: formName,
                    state: state,
                    addControl: function (ctrl) {
                        controls[ctrl.name] = ctrl;
                    },
                    removeControl: function (ctrl) {
                        delete controls[ctrl.name];
                    },
                    setData: function (key, data) {
                        vm.$set(formName + '.' + key, data);
                    },
                    removeError: function (key) {
                        state.$error[key] = false;
                        delete state.$error[key];
                    },
                    checkValidity: function () {
                        var isValid = true;
                        Object.keys(controls).forEach(function (ctrl) {
                            if (controls[ctrl].state.$invalid) {
                                isValid = false;
                            }
                        });
                        this.setValidity(isValid);
                    },
                    setValidity: function (isValid) {
                        state.$valid = isValid;
                        state.$invalid = !isValid;
                    },
                    setDirty: function () {
                        state.$dirty = true;
                        state.$pristine = false;
                    },
                    setPristine: function () {
                        state.$dirty = false;
                        state.$pristine = true;
                        Object.keys(controls).forEach(function (ctrl) {
                            controls[ctrl].setPristine();
                        });
                        formCtrl.setSubmitted(false);
                    },
                    setSubmitted: function (isSubmitted) {
                        state.$submitted = isSubmitted;
                    }
                };

                vm.$on('vue-form.hook', function (el, cb) {
                    // make sure the element dispatching the event is inside this form
                    var found = false,
                        els = self.el.querySelectorAll('[name="' + el.getAttribute('name') + '"]');

                    for (var i = 0; i < els.length; i++) {
                        if (els[i] === el) {
                            found = true;
                        }
                    }

                    if (found) {
                        cb(formCtrl);
                    }
                });

                this._submitEvent = function () {
                    formCtrl.setSubmitted(true);
                };
                Vue.util.on(this.el, 'submit', this._submitEvent);
            },
            update: function () {

            },
            unbind: function () {
                Vue.util.off(this.el, 'submit', this._submitEvent);
            }
        });

        Vue.directive('formCtrl', {
            id: 'formCtrl',
            priority: 10000,
            bind: function () {
                var inputName = this.el.getAttribute('name'),
                    vModel = this.el.getAttribute('v-model'),
                    vm = this.vm,
                    self = this,
                    formCtrl;

                if (!inputName) {
                    console.warn('Name attribute must be populated');
                    return;
                }

                this.vm.$dispatch('vue-form.hook', this.el, function (ctrl) {
                    formCtrl = ctrl;
                });

                if (!formCtrl) {
                    console.warn('Parent form not found');
                    return;
                }

                var state = this._state = {
                    $name: inputName,
                    $dirty: false,
                    $pristine: true,
                    $valid: true,
                    $invalid: false,
                    $error: {}
                };

                var formCtrlCtrl = this._formCtrlCtrl = {
                    el: this.el,
                    name: inputName,
                    state: state,
                    setVadility: function (key, isValid) {
                        state.$valid = isValid;
                        state.$invalid = !isValid;
                        if (isValid) {
                            formCtrl.setData(inputName + '.$error.' + key, false);
                            delete state.$error[key];
                            formCtrl.removeError(inputName);
                        } else {
                            formCtrl.setData(inputName + '.$error.' + key, true);
                            formCtrl.setData('$error.' + inputName, state);
                        }
                        formCtrl.checkValidity();
                    },
                    setDirty: function () {
                        state.$dirty = true;
                        state.$pristine = false;
                        formCtrl.setDirty();
                    },
                    setPristine: function () {
                        state.$dirty = false;
                        state.$pristine = true;
                    },
                    validators: {},
                    error: {},
                    validate: function (value) {
                        var isValid = true,
                            self = this;

                        Object.keys(this.validators).forEach(function (validator) {
                            var args = [value];

                            if (self.validators[validator] === false) {
                                self.setVadility(validator, true);
                                return;
                            }

                            if (!self.validators[validator]) {
                                return;
                            }

                            if (validator === 'email') {
                                args.push(self.multiple);
                            } else if (attrsWithValue.indexOf(validator) !== -1) {
                                args.push(self[validator]);
                            }

                            if (!self.validators[validator].apply(this, args)) {
                                isValid = false;
                                self.setVadility(validator, false);
                            } else {
                                self.setVadility(validator, true);
                            }

                        });

                        return isValid;
                    }
                };
                
                // register the form control
                formCtrl.addControl(formCtrlCtrl);
                                
                // add to validators depending on element attributes 
                attrs.forEach(function (attr) {
                    checkAttribute(self, attr);
                });
                                                                        
                // set inital state
                formCtrl.setData(inputName, state);

                if (vModel) {
                    this.vm.$watch(vModel, function (value, oldValue) {
                        if (typeof oldValue !== 'undefined') {
                            formCtrlCtrl.setDirty();
                        }
                        formCtrlCtrl.validate(value);
                        self._value = value;
                    }, { immediate: true });
                }

                vm.$on('vue-form-ctrl.hook', function (cb) {
                    cb(formCtrlCtrl);
                });

            },
            update: function (value, oldValue) {
                if (typeof oldValue !== 'undefined') {
                    this._formCtrlCtrl.setDirty();
                }
                this._formCtrlCtrl.validate(value);
                this._value = value;
            },
            unbind: function () {

            }
        });
        
        /*
        Vue.component('form-ctrl', {
            replace: false,
            props: ['model'],
            template: '<slot></slot>',
            beforeCompile: function () {
                this.$el.setAttribute('v-form-ctrl', this.model);
            }
        });
        */

    }

    if (typeof exports == "object") {
        module.exports = vueForm;
    } else if (typeof define == "function" && define.amd) {
        define([], function () { return vueForm });
    } else if (window.Vue) {
        window.vueForm = vueForm;
        Vue.use(vueForm);
    }

})();

/*
this.vm.$set(formName + '.' + inputName, {
    $dirty: false,
    $valid: true,
    $invalid: false,
    $error: {},
    $name: inputName,
});
*/

/*
{
  "$error": {},
  "$name": "myForm",
  "$dirty": false,
  "$pristine": true,
  "$valid": true,
  "$invalid": false,
  "$submitted": false,
  "input": {
    "$viewValue": "guest",
    "$modelValue": "guest",
    "$validators": {},
    "$asyncValidators": {},
    "$parsers": [],
    "$formatters": [
      null
    ],
    "$viewChangeListeners": [],
    "$untouched": true,
    "$touched": false,
    "$pristine": true,
    "$dirty": false,
    "$valid": true,
    "$invalid": false,
    "$error": {},
    "$name": "input",
    "$options": null
  }
}
*/