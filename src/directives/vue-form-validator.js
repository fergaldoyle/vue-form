import { validators } from '../validators';
import { getVModelNode, vModelValue } from '../util';

export function compareChanges(vnode, oldvnode) {

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
  if(vnode.componentOptions && vnode.componentOptions.propsData) {
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
    const fieldstate = binding.value;
    const attrs = (vnode.data.attrs || {});
    const inputName = attrs.name;

    if (!inputName) {
      console.warn('vue-form: name attribute missing');
      return;
    }

    // add validators
    Object.keys(attrs).forEach((attr) => {
      let prop;
      if (attr === 'type') {
        prop = attrs[attr];
      } else {
        prop = attr;
      }
      if (validators[prop]) {
        fieldstate._validators[prop] = validators[prop];
      }
    });

    // if is a component, a validator attribute by be
    // a prop this component uses
    if(vnode.componentOptions && vnode.componentOptions.propsData) {
      Object.keys(vnode.componentOptions.propsData).forEach((prop) => {
        if (validators[prop]) {
          fieldstate._validators[prop] = validators[prop];
        }
      });
    }

    fieldstate._validate(vnode);

    el.addEventListener('blur', () => {
      fieldstate._setTouched();
    }, false);
    el.addEventListener('focus', () => {
      fieldstate._setFocused();
    }, false);
  },

  update(el, binding, vnode, oldVNode) {
    const changes = compareChanges(vnode, oldVNode);
    const name = (vnode.data.attrs || {}).name;
    const fieldstate = binding.value;

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
      fieldstate._validate(vnode);
    }

  }
}
