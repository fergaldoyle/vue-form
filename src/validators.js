const emailRegExp = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i; // from angular
const urlRegExp = /^(http\:\/\/|https\:\/\/)(.{4,})$/;

const email = function (value, attrValue, vnode) {
  return emailRegExp.test(value);
}
email._allowNulls = true;

const number = function (value, attrValue, vnode) {
  return !isNaN(value);
}
number._allowNulls = true;

const url = function (value, attrValue, vnode) {
  return urlRegExp.test(value);
}
url._allowNulls = true;

export const validators = {
  email,
  number,
  url,
  required(value, attrValue, vnode) {
    if (attrValue === false) {
      return true;
    }

    if (value === 0) {
      return true;
    }

    if ((vnode.data.attrs && typeof vnode.data.attrs.bool !== 'undefined') || (vnode.componentOptions && vnode.componentOptions.propsData && typeof vnode.componentOptions.propsData.bool !== 'undefined')) {
      // bool attribute is present, allow false pass validation
      if (value === false) {
        return true;
      }
    }

    if (Array.isArray(value)) {
      return !!value.length;
    }
    return !!value;
  },
  minlength(value, length) {
    return value.length >= length;
  },
  maxlength(value, length) {
    return length >= value.length;
  },
  pattern(value, pattern) {
    const patternRegExp = new RegExp('^' + pattern + '$');
    return patternRegExp.test(value);
  },
  min(value, min, vnode) {
    if (getTypeAttribute(vnode).toLowerCase() == 'number') {
      // if value is not a number, return true since this case is handled by the number validator
      return !isNaN(value) ? (+value >= +min) : true;
    }
    return value >= min;
  },
  max(value, max, vnode) {
    if (getTypeAttribute(vnode).toLowerCase() == 'number') {
      // if value is not a number, return true since this case is handled by the number validator
      return !isNaN(value) ? (+max >= +value) : true;
    }
    return max >= value;
  }
};

function getTypeAttribute(vnode) {
  if (vnode.data && vnode.data.attrs && vnode.data.attrs.type) {
    return vnode.data.attrs.type;
  }

  if (vnode.componentOptions && vnode.componentOptions.propsData && vnode.componentOptions.propsData.type) {
    return vnode.componentOptions.propsData.type;
  }

  for (let i = 0; i < vnode.elm.attributes.length; i++) {
    const elemAttr = vnode.elm.attributes[i];
    if (elemAttr.name.toLowerCase() === 'type') {
      return elemAttr.value;
    }
  }

  return '';
}
