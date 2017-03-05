import { config } from './config';
import formErrors from './components/form-errors';
import formError from './components/form-error';
import vueForm from './components/vue-form';
import vueFormValidator from './directives/vue-form-validator';
import validate from './components/validate';
import { validators } from './validators';

export default {
  install(Vue) {
    Vue.component(config.formComponent, vueForm);
    Vue.component(config.validateComponent, validate);
    Vue.component(config.errorsComponent, formErrors);
    Vue.component(config.errorComponent, formError);
    Vue.directive('vue-form-validator', vueFormValidator);
  },
  config,
  addValidator(key, fn) {
    validators[key] = fn;
  },
  mixin: {
    components: {
      formErrors,
      formError,
      vueForm,
      validate
    },
    directives: {
      vueFormValidator
    }
  }
};

//https://plnkr.co/edit/yfUBrLH3v29RmMCnsnlo?p=preview
