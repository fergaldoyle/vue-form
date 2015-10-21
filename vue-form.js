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
                'maxlength'
            ];

        var validators = {
            required: function (value) {
                return !!value;
            },
            email: function (value, multiple) {
                return emailRegExp.test(value);
            },
            number: function (value) {
                return !isNaN(value);
            },
            minlength: function (value, length) {
                return value.length >= (length * 1);
            },
            maxlength: function (value, length) {
                return (length * 1) >= value.length;
            },
            pattern: function () { }
        };
        
        // check if an attribute exists, static or binding.
        // if it is a binding, watch it and re-validate on change
        function checkAttribute($this, attribute) {
            var formModelCtrl = $this._formModelCtrl;
            var binding = Vue.util.getBindAttr($this.el, attribute);
            if (binding) {
                $this.vm.$watch(binding, function (value, oldValue) {
                    formModelCtrl[attribute] = value;
                    if (attribute === 'type') {
                        delete formModelCtrl.validators[oldValue];
                        formModelCtrl.validators[value] = validators[value];
                    } else {
                        formModelCtrl.validators[attribute] = validators[attribute];
                        if (value === false) {
                            formModelCtrl.validators[attribute] = false;
                        }
                    }
                    formModelCtrl.validate($this._value);
                }, { immediate: true });
            }
            var staticAttr = $this.el.getAttribute(attribute);
            if (staticAttr !== null) {
                formModelCtrl[attribute] = staticAttr || true;
                if (attribute === 'type') {
                    formModelCtrl.validators[staticAttr] = validators[staticAttr];
                } else {
                    formModelCtrl.validators[attribute] = validators[attribute];
                }
            }
        }

        Vue.directive('form', {
            id: 'form',
            priority: 10001,
            bind: function () {
                var formName = this.el.getAttribute('name'),
                    vm = this.vm;

                vm.$set(formName, {
                    $name: formName,
                    $dirty: false,
                    $pristine: true,
                    $valid: true,
                    $invalid: false,
                    $submitted: true
                });

                var formCtrl = {
                    setModelState: function (key, state) {
                        vm.$set(formName + '.' + key, state);
                    }
                };

                vm.$on('vue-form.hook', function (cb) {
                    cb(formCtrl);
                });
            },
            update: function () {

            },
            unbind: function () {

            }
        });

        Vue.directive('formModel', {
            id: 'formModel',
            priority: 10000,
            bind: function () {
                var inputName = this.el.getAttribute('name'),
                    self = this,
                    formCtrl;

                this.vm.$dispatch('vue-form.hook', function (ctrl) {
                    formCtrl = ctrl;
                });

                if (!formCtrl) {
                    console.warn('Parent form not found');
                    return;
                }

                var state = this._state = {
                    $dirty: false,
                    $valid: true,
                    $invalid: false,
                    $error: {},
                    $name: inputName,
                };

                var formModelCtrl = this._formModelCtrl = {
                    el: this.el,
                    setVadility: function (key, isValid) {
                        state.$valid = isValid;
                        state.$invalid = !isValid;
                        if (isValid) {
                            delete state.$error[key];
                        } else {
                            state.$error[key] = true;
                        }
                        formCtrl.setModelState(inputName, state);
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
                            } else if (validator === 'minlength' || validator === 'maxlength') {
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
                                
                // add to validators depending on element attributes 
                attrs.forEach(function (attr) {
                    checkAttribute(self, attr);
                });
                                                        
                // set inital state
                formCtrl.setModelState(inputName, state);

                this.vm.$on('vue-form-model.hook', function (cb) {
                    cb(formModelCtrl);
                });

            },
            update: function (value) {
                this._formModelCtrl.validate(value);
                this._value = value;
            },
            unbind: function () {

            }
        });

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