const emailRegExp = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i; // from angular
const urlRegExp = /^(http\:\/\/|https\:\/\/)(.{4,})$/;

export const validators = {
 /*   'type[email]' (model, value, vnode) {
        return emailRegExp.test(model);
    },
    'type[number]' (model) {
        return !isNaN(model);
    },
    'type[url]' (model) {
        return urlRegExp.test(model);
    },*/

    email (model, value, vnode) {
        return emailRegExp.test(model);
    },
    number (model) {
        return !isNaN(model);
    },
    url (model) {
        return urlRegExp.test(model);
    },
    required (model, value, vnode) {
        if(value === false) {
            return true;
        }

        if (Array.isArray(model)) {
            return !!model.length;
        }
        return !!model;
    },
    minlength (model, length) {
        return model.length >= length;
    },
    maxlength (model, length) {
        return length >= model.length;
    },
    pattern (model, pattern) {
        const patternRegExp = new RegExp('^' + pattern + '$');
        return patternRegExp.test(model);
    },
    min (model, min) {
        return model * 1 >= min * 1;
    },
    max (model, max) {
        return max * 1 >= model * 1;
    }
};