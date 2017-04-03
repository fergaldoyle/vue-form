const root = (function(){ return this || (0,eval)('this'); }());
export const config = {
    formComponent: 'vueForm',
    messagesComponent: 'fieldMessages',
    validateComponent: 'validate',
    fieldComponent: 'field',
    messagesTag: 'div',
    fieldTag: 'div',
    classes: {
      form: {
        dirty: 'vf-form-dirty',
        pristine: 'vf-form-pristine',
        valid: 'vf-form-valid',
        invalid: 'vf-form-invalid',
        touched: 'vf-form-touched',
        untouched: 'vf-form-untouched',
        submitted: 'vf-form-submitted',
        pending: 'vf-form-pending'
      },
      validate: {
        dirty: 'vf-field-dirty',
        pristine: 'vf-field-pristine',
        valid: 'vf-field-valid',
        invalid: 'vf-field-invalid',
        touched: 'vf-field-touched',
        untouched: 'vf-field-untouched',
        submitted: 'vf-field-submitted',
        pending: 'vf-field-pending'
      },
      input: {
        dirty: 'vf-dirty',
        pristine: 'vf-pristine',
        valid: 'vf-valid',
        invalid: 'vf-invalid',
        touched: 'vf-touched',
        untouched: 'vf-untouched',
        submitted: 'vf-submitted',
        pending: 'vf-pending'
      }
    },
    Promise: root.Promise
};
