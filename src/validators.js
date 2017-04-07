const emailRegExp = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i; // from angular
const urlRegExp = /^(http\:\/\/|https\:\/\/)(.{4,})$/;

export const validators = {
  email(value, attrValue, vnode) {
    return emailRegExp.test(value);
  },
  number(value) {
    return !isNaN(value);
  },
  url(value) {
    return urlRegExp.test(value);
  },
  required(value, attrValue, vnode) {
    if (attrValue === false) {
      return true;
    }

    if (value === 0) {
      return true;
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
    if ((vnode.data.attrs.type || '').toLowerCase() == 'number') {
      return +value >= +min;
    }
    return value >= min;
  },
  max(value, max, vnode) {
    if ((vnode.data.attrs.type || '').toLowerCase() == 'number') {
      return +max >= +value;
    }
    return max >= value;
  }
};
