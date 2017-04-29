import vueForm from './components/vue-form';
import messages from './components/messages';
import validate from './components/validate';
import field from './components/field';
import vueFormValidator from './directives/vue-form-validator';
import extend from 'extend';
import { config } from './config';
import { vueFormConfig } from './providers';

function VueFormBase (options) {
  const c = extend(true, {}, config, options);
  this.provide = {
    [vueFormConfig]: c
  }
  this.components = {
    [c.formComponent]: vueForm,
    [c.messagesComponent]: messages,
    [c.validateComponent]: validate,
    [c.fieldComponent]: field,
  };
  this.directives = { vueFormValidator };
}

export default class VueForm extends VueFormBase {
  static install(Vue, options) {
    Vue.mixin(new this(options));
  }
  static get installed() {
    return !!this.install.done;
  }
  static set installed(val) {
    this.install.done = val;
  }
}

VueFormBase.call(VueForm);
// temp fix for vue 2.3.0
VueForm.options = new VueForm();
