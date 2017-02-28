import { config } from './config';
import { validators } from './validators';
import { addClass, removeClass, removeClassWithPrefix } from './util';

//https://plnkr.co/edit/yfUBrLH3v29RmMCnsnlo?p=preview

function vModelValue(data) {
    return data.directives.filter(v => v.name === 'model')[0].value;
}

function getVModelNode (nodes) {
    let foundVnode;
    const vModelNode = nodes.filter((node)=>{                            
        if(node.data && node.data.directives) {
            const match = node.data.directives.filter(v => v.name === 'model');
            if(match.length) {
                foundVnode = node;
            }
        }
    });
    return foundVnode;
}

function compareChanges (data, oldData) {
    let hasChanged = false;
    const attrs = data.attrs || {};
    const oldAttrs = oldData.attrs || {};
    const out = {};

    if(vModelValue(data) !== vModelValue(oldData)) {
        out.vModel = true;//vModelValue(data);
        hasChanged = true;
    }

    Object.keys(validators).forEach((validator) => {
        if(attrs[validator] !== oldAttrs[validator]) {
            out[validator] = true;//attrs[validator];
            hasChanged = true;
        }
    });

    if(hasChanged) {
        return out;
    }
}

export default {
    install (Vue) {
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
            render (h) {
                const children = [];
                if(this.field && this.field.$error) {
                    Object.keys(this.field.$error).forEach((key) => {
                        children.push(this.$slots[key]);
                    });
                }
                return h(this.tag, children);
            },
            props: {
                field: Object,
                tag: {
                    type: String,
                    default: config.errorsTag
                }
            }
        });

        Vue.component(config.errorComponent, {
            render (h) {
                if(this.field && this.field.$error[this.error]) {
                    return h(this.tag, [this.$slots.default]);
                }
            },
            props: {
                field: Object,
                error: String,
                tag: {
                    type: String,
                    default: config.errorTag
                }
            }
        });

        Vue.component(config.formComponent, {
            render (h) {
                return h(
                    'form', 
                    {attrs: {'novalidate':''}},
                    [this.$slots.default]
                )
            },
            props: {
                value: Object,
                state: Object
            },
            data() {
                return {
                    internalState: {
                        $dirty: false,
                        $pristine: true,
                        $valid: true,
                        $invalid: false,
                        $submitted: false,
                        $touched: false,
                        $untouched: true,
                        $error: {},
                        func (){}
                    }
                };
            },
            created() {

            },
            mounted () {
                const state = this.$el.__vf_state = this.internalState;

                const el = this.$el;

                //this.$emit('input', state);
                Object.keys(state).forEach((key) => {
                    Vue.set(this.state, key, state[key]);
                });

                const controls = {};
                const controller = this.$el.__vf_controller = {
                    state,
                    controls,
                    addControl: (ctrl) => {
                        //console.log('here', ctrl)
                        ctrl._form = controller;
                        controls[ctrl.name] = ctrl;
                        Vue.set(this.state, ctrl.name, ctrl.state);
                    },
                    removeControl () {

                    },
                    setDirty: () => {
                        this.state.$dirty = true;
                        this.state.$pristine = false;
                        addClass(el, config.dirtyClass);
                        removeClass(el, config.pristineClass);
                    },
                    setPristine: function () {
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



                }, { deep: true});
            }
        });

        Vue.directive('vue-form-validate', {
        //const vueFormValidate = {
            name: 'vue-form-validate',
            bind (el, binding, vnode) {

                const attrs = (vnode.data.attrs || {});
                const inputName = attrs.name;
                let hasFocused = false;

                if(!inputName) {
                    console.warn('vue-form: name attribute missing');
                    return;
                }

                const state = el.__vf_state = {
                    $name: inputName,
                    $dirty: false,
                    $pristine: true,
                    $valid: true,
                    $invalid: false,
                    $touched: false,
                    $untouched: true,
                    $error: {}
                };

                const thisValidators = {};
                Object.keys(attrs).forEach((attr) => {
                    let prop;

                    if(attr === 'type') {
                        prop = attrs[attr];//`type[${attrs[attr]}]`;
                    } else {
                        prop = attr;
                    }

                    if(validators[prop]) {
                        thisValidators[prop] = validators[prop];
                    }
                });

                const controller = el.__vf_controller = {
                    el: el,
                    name: inputName,
                    state: state,
                    setValidatorVadility (validator, isValid) {
                        if(isValid) {
                            Vue.delete(state.$error, validator);
                            removeClassWithPrefix(el, config.invalidClass + '-');
                        } else {
                            Vue.set(state.$error, validator, true);
                            addClass(el, config.invalidClass + '-' + validator);
                        }
                    },
                    setVadility(isValid) {
                        state.$valid = isValid;
                        state.$invalid = !isValid;

                        if (isValid) {
                            addClass(el, config.validClass);
                            removeClass(el, config.invalidClass);
                        } else {
                            removeClass(el, config.validClass);
                            addClass(el, config.invalidClass);
                        }
                        /*
                        var vueForm = this._vueForm;

                        if (!vueForm) {
                            return;
                        }

                        if (typeof key === 'boolean') {
                            // when key is boolean, we are setting 
                            // overall field vadility
                            state.$valid = isValid;
                            state.$invalid = !isValid;

                            if (isValid) {
                                vueForm.removeError(inputName);
                                addClass(el, validClass);
                                removeClass(el, invalidClass);
                            } else {
                                removeClass(el, validClass);
                                addClass(el, invalidClass);
                            }
                            vueForm.checkValidity();
                            return;
                        }

                        key = Vue.util.camelize(key);
                        if (isValid) {
                            vueForm.setData(inputName + '.$error.' + key, false);
                            delete state.$error[key];
                            removeClassWithPrefix(el, invalidClass + '-');
                        } else {
                            vueForm.setData(inputName + '.$error.' + key, true);
                            vueForm.setData('$error.' + inputName, state);
                            addClass(el, invalidClass + '-' + key);
                        }
                        */
                    },
                    setDirty () {
                        state.$dirty = true;
                        state.$pristine = false;
                        addClass(el, config.dirtyClass);
                        removeClass(el, config.pristineClass);
                        controller._form.setDirty();
                    },
                    setPristine () {
                        state.$dirty = false;
                        state.$pristine = true;
                        removeClass(el, config.dirtyClass);
                        addClass(el, config.pristineClass);
                    },
                    setTouched (isTouched) {                        
                        state.$touched = true;
                        state.$untouched = false;
                        addClass(el, config.touchedClass);
                        removeClass(el, config.untouchedClass); 
                    },       
                    setUntouched (isTouched) {                        
                        state.$touched = false;
                        state.$untouched = true;
                        removeClass(el, config.touchedClass);
                        addClass(el, config.untouchedClass);
                    },
                    setFocused () {                        
                        controller.hasFocused = true;
                    },
                    hasFocused: false,                    
                    validators: thisValidators,
                    error: {},
                    validate (vnode) {
                        let isValid = true;
                        let value = vModelValue(vnode.data);
                        const attrs = (vnode.data.attrs || {});

                        Object.keys(this.validators).forEach((validator) => {

                            if (validator !== 'required' && !value && typeof value !== 'number') {
                                this.setValidatorVadility(validator, true);
                                return;
                            }

                            if(!validators[validator](value, attrs[validator], vnode)) {
                                isValid = false;
                                this.setValidatorVadility(validator, false);
                            } else {
                                this.setValidatorVadility(validator, true);
                            }
                        });

                        this.setVadility(isValid);
                        return isValid;
                    }
                };

                el.addEventListener('blur', controller.setTouched, false);
                el.addEventListener('focus', controller.setFocused, false);
                
                Vue.nextTick(() => {
                    el.form.__vf_controller.addControl(controller);
                    controller.validate(vnode);
                });
            },

            update (el, binding, vnode, oldVNode) {
                const changes = compareChanges(vnode.data, oldVNode.data);
                const name = (vnode.data.attrs || {}).name;
                const controller = el.__vf_controller;

                if(!changes) {
                    return;
                }
              
                if(changes.vModel) {
                    if(controller.hasFocused) {
                        controller.setDirty();
                    }
                    controller.validate(vnode);
                } else {
                    // attributes have changed
                    // loop through them and re-validate changed ones
                    //console.log(name, 'some attribute rules has changed');
                    controller.validate(vnode);
                }
                 
            },

            componentUpdated (el, binding, vnode, oldVNode) {
                //console.log('componentUpdated');
            },

            unbind (el, binding, vnode) { }
        });

        Vue.component('validate', {
            props: {
                state: {},
                tag: {
                    type: String,
                    default: 'span'
                }
            },
            data () {
                return {
                    foo: { prop: 'sdf'}
                };
            },
            render (h) {     
                let foundVnode = getVModelNode(this.$slots.default);
                if(foundVnode) {
                    foundVnode.data.directives.push({ name: 'vue-form-validate', value: this.foo})
                } else {
                    console.warn('Element with v-model not found');
                }        
                return h(this.tag, this.$slots.default);
            },
            mounted () {
               //console.log(this.state);
            },
            created () {
                console.log(this.$parent.state);
                //console.log(this.$parent);
                //console.log(this.state);
            }
        });

    }
};

// todo
// async validators
//