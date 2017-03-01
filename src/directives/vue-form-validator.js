import { validators } from '../validators';
import { getVModelNode, vModelValue } from '../util';

export function compareChanges(data, oldData) {
  let hasChanged = false;
  const attrs = data.attrs || {};
  const oldAttrs = oldData.attrs || {};
  const out = {};

  if (vModelValue(data) !== vModelValue(oldData)) {
    out.vModel = true; //vModelValue(data);
    hasChanged = true;
  }

  Object.keys(validators).forEach((validator) => {
    if (attrs[validator] !== oldAttrs[validator]) {
      out[validator] = true; //attrs[validator];
      hasChanged = true;
    }
  });

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

    fieldstate._validate(vnode);

    el.addEventListener('blur', () => {
      fieldstate._setTouched();
    }, false);
    el.addEventListener('focus', () => {
      fieldstate._setFocused();
    }, false);
  },

  update(el, binding, vnode, oldVNode) {
    const changes = compareChanges(vnode.data, oldVNode.data);
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
      //console.log(name, 'some attribute rules has changed');
      fieldstate._validate(vnode);
    }

  }
}
