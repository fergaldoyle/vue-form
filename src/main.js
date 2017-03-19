import { config } from './config';
import messages from './components/messages';
import vueForm from './components/vue-form';
import vueFormValidator from './directives/vue-form-validator';
import validate from './components/validate';
import field from './components/field';
import { validators } from './validators';

export default {
  install(Vue) {
    Vue.component(config.formComponent, vueForm);
    Vue.component(config.validateComponent, validate);
    Vue.component(config.messagesComponent, messages);
    Vue.component(config.fieldComponent, field);
    Vue.directive('vue-form-validator', vueFormValidator);
  },
  config,
  addValidator(key, fn) {
    validators[key] = fn;
  },
  mixin: {
    components: {
      [config.formComponent]: vueForm,
      [config.validateComponent]: validate,
      [config.messagesComponent]: messages,
      [config.fieldComponent]: field
    },
    directives: {
      vueFormValidator
    }
  }
};
