# vue-form

[![Build Status](https://travis-ci.org/fergaldoyle/vue-form.svg?branch=master)](https://travis-ci.org/fergaldoyle/vue-form)

Form validation for Vue.js 2.2+

### Install

Available through npm as `vue-form`.

``` js
import VueForm from 'vue-form';

// install globally
Vue.use(VueForm);
Vue.use(VueForm, options);

// or use the mixin
...
mixins: [VueForm]
...
mixins: [new VueForm(options)]
...
```

### Usage

Once installed you have access to four components (`vue-form`, `validate`, `field`, `field-messages`) for managing form state, validating form fields and displaying validation messages.

Live examples
* Configured to work with Bootstrap styles: https://jsfiddle.net/fergal_doyle/zfqt4yhq/
* Matching passwords and password strength: https://jsfiddle.net/fergal_doyle/9rn5kLkw/

Example

```html
<div id="app">
  <vue-form :state="formstate" @submit.prevent="onSubmit">

    <validate tag="label">
      <span>Name *</span>
      <input v-model="model.name" required name="name" />

      <field-messages name="name">
        <div>Success!</div>
        <div slot="required">Name is a required field</div>
      </field-messages>
    </validate>

    <validate tag="label">
      <span>Email</span>
      <input v-model="model.email" name="email" type="email" required />

      <field-messages name="email">
        <div slot="required">Email is a required field</div>
        <div slot="email">Email is not valid</div>
      </field-messages>
    </validate>

    <button type="submit">Submit</button>
  </vue-form>
  <pre>{{ formstate }}</pre>
</div>
```

```js
Vue.use(VueForm);

new Vue({
  el: '#app',
  data: {
    formstate: {},
    model: {
      name: '',
      email: 'invalid-email'
    }
  },
  methods: {
    onSubmit: function () {
      if(this.formstate.$invalid) {
        // alert user and exit early
        return;
      }
      // otherwise submit form
    }
  }
});
```

The output of `formstate` will be:
```js
{
  "$dirty": false,
  "$pristine": true,
  "$valid": false,
  "$invalid": true,
  "$submitted": false,
  "$touched": false,
  "$untouched": true,
  "$pending": false,
  "$error": {
    // fields with errors are copied into this object
  },
  "$submittedState": {
    // each form sumbit, state is cloned into this object
  },
  "name": {
    "$name": "name",
    "$dirty": false,
    "$pristine": true,
    "$valid": false,
    "$invalid": true,
    "$touched": false,
    "$untouched": true,
    "$pending": false,
    "$error": {
      "required": true
    }
  },
  "email": {
    "$name": "email",
    "$dirty": false,
    "$pristine": true,
    "$valid": false,
    "$invalid": true,
    "$touched": false,
    "$untouched": true,
    "$pending": false,
    "$error": {
      "email": true
    }
  }
}
```

### Displaying messages
Display validation errors or success messages with `field-messages`.

The `show` prop supports simple expressions which specifiy when messages should be displayed based on the current state of the field, e.g: `$dirty`, `$dirty && $touched`, `$dirty || $touched`, `$touched || $submitted`

```html
<field-messages name="name" show="$dirty && $touched">
  <div slot="errorKeyA">Error message A</div>
  <div slot="errorKeyB">Error message B</div>
</field-messages>
```

Or use scoped templates:
```html
<field-messages name="fieldName">
  <span>Success</span>
  <template slot="required" scope="state">
    <span v-if="state.$touched || state.$submitted">Name is a required field</span>
  </template>
  <template slot="errorKeyB" scope="state">
    <span v-if="state.$touched || state.$dirty">Error message B</span>
  </template>
</field-messages>
```

### Validators

```
type="email"
type="url"
type="number"
required
minlength
maxlength
pattern
min (for type="number")
max (for type="number")

```

You can use static validation attributes or bindings. If it is a binding, the input will be re-validated every binding update meaning you can have inputs which are conditionally required etc.
```html
<!-- static validators -->
<validate>
  <input type="email" name="email" v-model="model.email" required />
</validate>
<validate>
  <input type="text" name="name" v-model="model.name" maxlength="25" minlength="5" />
</validate>

<!-- bound validators -->
<validate>
  <input type="email" name="email" v-model="model.email" :required="isRequired" />
</validate>
<validate>
  <input type="text" name="name" v-model="model.name" :maxlength="maxLen" :minlength="minLen" />
</validate>
```

#### Custom validators
You can register global and local custom validators.

Global custom validator
```js

var options = {
  validators: {
    'my-custom-validator': function (value, attrValue, vnode) {
      // return true to set input as $valid, false to set as $invalid
      return value === 'custom';
    }
  }
}

Vue.use(VueForm, options);
// or
// mixins: [new VueForm(options)]
```

```html
<validate>
  <input v-model="something" name="something" my-custom-validator />
</validate>
```

Local custom validator
```html
<validate :custom="{customValidator: customValidator}">
  <input v-model="something" name="something" />
</validate>
```

```js
// ...
methods: {
	customValidator: function (value) {
		// return true to set input as $valid, false to set as $invalid
		return value === 'custom';
	}
}
// ...
```

#### Async validators:

Async validators are custom validators which return a Promise. `resolve()` `true` or `false` to set field validity.
```js
// ...
methods: {
  customValidator (value) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(value === 'ajax');
      }, 100);
    });
  }
}
// ...
```

Async validator with debounce (example uses lodash debounce)
```js
methods: {
  debounced: _.debounce(function (value, resolve, reject) {
    fetch('https://httpbin.org/get').then(function(response){
      resolve(response.isValid);
    });
  }, 500),
  customValidator (value) {
    return new Promise((resolve, reject) => {
      this.debounced(value, resolve, reject);
    });
  }
}
```

### Reset state
```
<vue-form ref="form" :state="formstate">

resetState: function () {
  this.formstate._reset();
  // or
  this.$refs.form.reset();
}
```

### State classes
As form and input validation states change, state classes are added and removed

Possible form classes:
```
vf-form-dirty, vf-form-pristine, vf-form-valid, vf-form-invalid, vf-form-submitted
```

Possible input classes:
```
vf-dirty, vf-pristine, vf-valid, vf-invalid

// also for every validation error, a class will be added, e.g.
vf-invalid-required, vf-invalid-minlength, vf-invalid-max, etc
```

Input wrappers (e.g. the tag the `validate` component renders) will also get state classes, but with the `field` prefix, e.g.
```
vf-field-dirty, vf-field-pristine, vf-field-valid, vf-field-invalid
```

### Custom components

When writing custom form field components, e.g. `<my-checkbox v-model="foo"></my-checkbox>` you should trigger the `focus` and `blur` events after user interaction either by triggering native dom events on the root node of your component, or emitting Vue events (`this.$emit('focus)`) so the `validate` component can detect and set the `$dirty` and `$touched` states on the field.

### Component props

#### vue-form
* `state` Object on which form state is set
* `tag` String, defaults to `form`

#### validate
* `state` Optional way of passing in the form state. If omitted form state will be found in the $parent
* `custom` Object containing one or many custom validators. `{validatorName: validatorFunction}`
* `tag` String which specifies what element tag should be rendered by the `validate` component, defaults to `span`
* `auto-label`: Boolean, defaults to false. Automatically set `for` and `id` attributes of label and input elements found inside the `validate` component
* `debounce` Number, defaults to none, which specifies the delay (milliseconds) before validation takes place.

#### field-messages
* `state` Optional way of passing in the form state. If omitted form state will be found in the $parent
* `name` String which specifies the related field name
* `tag` String, defaults to `div`
* `show` String, show error dependant on form field state e.g. `$touched`, `$dirty || $touched`, '$touched || $submitted'
* `auto-label` Boolean, defaults to false. Automatically set the `for` attribute of labels found inside the `field-messages` component

#### field
* `tag` String, defaults to `div`
* `auto-label` Boolean, defaults to true. Automatically set `for` and `id` attributes of label and input elements found inside the `validate` component

### Config
Set config options when using `Vue.use(VueForm, options)`, or when using a mixin `mixins: [new VueForm(options)]` defaults:

```js
{
    validators: {},
    formComponent: 'vueForm',
    formTag: 'form',
    messagesComponent: 'fieldMessages',
    messagesTag: 'div',
    validateComponent: 'validate',
    validateTag: 'div',
    fieldComponent: 'field',
    fieldTag: 'div',
    formClasses: {
      dirty: 'vf-form-dirty',
      pristine: 'vf-form-pristine',
      valid: 'vf-form-valid',
      invalid: 'vf-form-invalid',
      touched: 'vf-form-touched',
      untouched: 'vf-form-untouched',
      submitted: 'vf-form-submitted',
      pending: 'vf-form-pending'
    },
    validateClasses: {
      dirty: 'vf-field-dirty',
      pristine: 'vf-field-pristine',
      valid: 'vf-field-valid',
      invalid: 'vf-field-invalid',
      touched: 'vf-field-touched',
      untouched: 'vf-field-untouched',
      submitted: 'vf-field-submitted',
      pending: 'vf-field-pending'
    },
    inputClasses: {
      dirty: 'vf-dirty',
      pristine: 'vf-pristine',
      valid: 'vf-valid',
      invalid: 'vf-invalid',
      touched: 'vf-touched',
      untouched: 'vf-untouched',
      submitted: 'vf-submitted',
      pending: 'vf-pending'
    },
    Promise: typeof Promise === 'function' ? Promise : null
}
```
