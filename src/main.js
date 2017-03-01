import { config } from './config';
import formErrors from './components/form-errors';
import formError from './components/form-error';
import vueForm from './components/vue-form';
import vueFormValidator from './directives/vue-form-validator';
import validate from './components/validate';

export default {
  install(Vue) {
    Vue.component(config.formComponent, vueForm);
    Vue.component(config.validateComponent, validate);
    Vue.component(config.errorsComponent, formErrors);
    Vue.component(config.errorComponent, formError);
    Vue.directive('vue-form-validator', vueFormValidator);
  }
};

//https://plnkr.co/edit/yfUBrLH3v29RmMCnsnlo?p=preview
