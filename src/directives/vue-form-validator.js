import { config } from '../config';
import { vModelValue, getName, debounce } from '../util';

const debouncedValidators = {};

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
    Object.keys(attrs).forEach((attr) => {
      let prop;
      if (attr === 'type') {
        prop = attrs[attr].toLowerCase();
      } else {
        prop = attr.toLowerCase();
      }
      if (validators[prop] && !fieldstate._validators[prop]) {
        fieldstate._validators[prop] = validators[prop];
      }
    });

    // if is a component, a validator attribute by be
    // a prop this component uses
    if (vnode.componentOptions && vnode.componentOptions.propsData) {
      Object.keys(vnode.componentOptions.propsData).forEach((prop) => {
        if (validators[prop] && !fieldstate._validators[prop]) {
          fieldstate._validators[prop] = validators[prop];
        }
      });
    }

    fieldstate._validate(vnode);

    // native listeners
    el.addEventListener('blur', () => {
      fieldstate._setTouched();
    }, false);
    el.addEventListener('focus', () => {
      fieldstate._setFocused();
    }, false);

    // component listeners
    if (vnode.componentInstance) {
      vnode.componentInstance.$on('blur', () => {
        fieldstate._setTouched();
      });
      vnode.componentInstance.$on('focus', () => {
        fieldstate._setFocused();
      });
      el.addEventListener('focusout', () => {
        fieldstate._setTouched();
      }, false);
      el.addEventListener('focusin', () => {
        fieldstate._setFocused();
      }, false);
    }
  },

  update(el, binding, vnode, oldVNode) {
    const { validators } = binding.value.config;
    const changes = compareChanges(vnode, oldVNode, validators);
    const { fieldstate } = binding.value;
    const attrs = (vnode.data.attrs || {});

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
