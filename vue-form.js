// http://plnkr.co/edit/iNWVNyuLM9ihOzlbuZvS?p=preview
; (function () {
    var vueForm = {};
    vueForm.install = function (Vue) {

        var globalValidators = {
            required: function (value) {
                return !!value;
            }
        };

        function checkAttribute($this, attribute, formModelCtrl) {
            var binding = Vue.util.getBindAttr($this.el, attribute);
            if (binding) {
                $this.vm.$watch(binding, function (value) {
                    console.log('value', value, attribute)
                    if (value) {
                        formModelCtrl.validators[attribute] = globalValidators[attribute];
                    } else {
                        formModelCtrl.validators[attribute] = false;
                    }
                    formModelCtrl.validate($this._value);
                }, {
                    immediate: true
                });
            }
            var staticAttr = $this.el.getAttribute(attribute);
            if (staticAttr !== null) {
                formModelCtrl.validators[attribute] = globalValidators[attribute];
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
                        var isValid = true;
                        for (var prop in this.validators) {
                            if (!this.validators.hasOwnProperty(prop)) {
                                continue;
                            }

                            if (this.validators[prop] === false) {
                                this.setVadility(prop, true);
                                continue;
                            }

                            if (!this.validators[prop](value)) {
                                isValid = false;
                                this.setVadility(prop, false);
                            } else {
                                this.setVadility(prop, true);
                            }
                        }
                        return isValid;
                    }
                };                
                
                // add to validators depending on element attributes 
                for (var validator in globalValidators) {
                    if (!globalValidators.hasOwnProperty(validator)) {
                        continue;
                    }
                    checkAttribute(this, validator, formModelCtrl)
                }
                
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