import { config } from '../config';
import { vModelValue, getName, debounce } from '../util';
import extend from 'extend';

const debouncedValidators = {};

function addValidators(attrs, validators, fieldValidators) {
  Object.keys(attrs).forEach(attr => {
    const prop = (attr === 'type') ? attrs[attr].toLowerCase() : attr.toLowerCase();

    if (validators[prop] && !fieldValidators[prop]) {
      fieldValidators[prop] = validators[prop];
    }
  });
}

export function compareChanges(vnode, oldvnode, validators) {

  let hasChanged = false;
  const attrs = vnode.data.attrs || {};
  const oldAttrs = oldvnode.data.attrs || {};
  const out = {};

  if (vModelValue(vnode.data) !== vModelValue(oldvnode.data)) {
    out.vModel = true;
    hasChanged = true;
  }

  Object.keys(validators).forEach((validator) => {
    if (attrs[validator] !== oldAttrs[validator]) {
      out[validator] = true;
      hasChanged = true;
    }
  });

  // if is a component
  if (vnode.componentOptions && vnode.componentOptions.propsData) {
    const attrs = vnode.componentOptions.propsData;
    const oldAttrs = oldvnode.componentOptions.propsData;
    Object.keys(validators).forEach((validator) => {
      if (attrs[validator] !== oldAttrs[validator]) {
        out[validator] = true;
        hasChanged = true;
      }
    });
  }

  if (hasChanged) {
    return out;
  }
}

export default {
  name: 'vue-form-validator',
  bind(el, binding, vnode) {
    const { fieldstate } = binding.value;
    const { validators } = binding.value.config;
    const attrs = (vnode.data.attrs || {});
    const inputName = getName(vnode);

    if (!inputName) {
      console.warn('vue-form: name attribute missing');
      return;
    }

    if(attrs.debounce) {
      debouncedValidators[fieldstate._id] = debounce(function(fieldstate, vnode) {
        if (fieldstate._hasFocused) {
          fieldstate._setDirty();
        }
        fieldstate._validate(vnode);
      }, attrs.debounce);
    }

    // add validators
    addValidators(attrs, validators, fieldstate._validators);

    // if is a component, a validator attribute could be a prop this component uses
    if (vnode.componentOptions && vnode.componentOptions.propsData) {
      addValidators(vnode.componentOptions.propsData, validators, fieldstate._validators);
    }

    fieldstate._validate(vnode);

    // native listeners
    el.addEventListener('blur', () => {
      fieldstate._setFocused(false);
    }, false);
    el.addEventListener('focus', () => {
      fieldstate._setFocused(true);
    }, false);

    // component listeners
    const vm = vnode.componentInstance;
    if (vm) {
      vm.$on('blur', () => {
        fieldstate._setFocused(false);
      });
      vm.$on('focus', () => {
        fieldstate._setFocused(true);
      });

      vm.$once('vf:addFocusListeners', () => {
        el.addEventListener('focusout', () => {
          fieldstate._setFocused(false);
        }, false);
        el.addEventListener('focusin', () => {
          fieldstate._setFocused(true);
        }, false);
      });

      vm.$on('vf:validate', data => {
        if(!vm._vfValidationData_) {
          addValidators(data, validators, fieldstate._validators);
        }
        vm._vfValidationData_ = data;
        fieldstate._validate(vm.$vnode);
      });
    }
  },

  update(el, binding, vnode, oldVNode) {
    const { validators } = binding.value.config;
    const changes = compareChanges(vnode, oldVNode, validators);
    const { fieldstate } = binding.value;

    let attrs = vnode.data.attrs || {};
    const vm = vnode.componentInstance;
    if(vm && vm._vfValidationData_) {
      attrs = extend({}, attrs, vm[vm._vfValidationData_]);
    }

    if(vnode.elm.className.indexOf(fieldstate._className[0]) === -1) {
      vnode.elm.className = vnode.elm.className + ' ' + fieldstate._className.join(' ');
    }

    if (!changes) {
      return;
    }

    if (changes.vModel) {
      // re-validate all
      if(attrs.debounce) {
        fieldstate.$pending = true;
        debouncedValidators[fieldstate._id](fieldstate, vnode);
      } else {
        if (fieldstate._hasFocused) {
          fieldstate._setDirty();
        }
        fieldstate._validate(vnode);
      }
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
}
