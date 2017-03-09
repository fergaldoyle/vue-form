# vue-form  

[![Build Status](https://travis-ci.org/fergaldoyle/vue-form.svg?branch=0.2.2)](https://travis-ci.org/fergaldoyle/vue-form)

Form validation for Vue.js 2.0+

### Install

Available through npm as `vue-form`.

``` js
import vueForm from 'vue-form';
// install globally
Vue.use(vueForm);

// or use the mixin
...
mixins: [vueForm.mixin]
...
```

### Usage

Once installed you have access to four components (`vue-form`, `validate`, `form-errors`, `form-error`) for managing form state, validating form fields and displaying validation error messages.

Example

```html
<div id="app">
  <vue-form :state="formstate" @submit.prevent="onSubmit">
    <validate tag="label">
      <span>Name *</span>
      <input v-model="model.name" required name="name" />
    </validate>
    <validate tag="label">
      <span>Email</span>
      <input v-model="model.email" name="email" type="email" />
    </validate>
    <button type="submit">Submit</button>
  </vue-form>
  <pre>{{ formstate }}</pre>
</div>
```

```js
new Vue({
  el: '#app',
  data: {
    formstate: {}
  }
});
```

### Validators

#### Built in validators:

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
<input type="email" name="email" v-model="model.email" v-form-ctrl required />
<input type="text" name="name" v-model="model.name" v-form-ctrl maxlength="25" minlength="5" />

<!-- bound validators -->
<input type="email" name="email" v-model="model.email" v-form-ctrl :required="isRequired" />
<input type="text" name="name" v-model="model.name" v-form-ctrl :maxlength="maxLen" :minlength="minLen" />
```

#### State classes

As form and input validation states change, state classes are added and removed

Possible form classes:
```
vf-dirty, vf-pristine, vf-valid, vf-invalid, vf-submitted
```

Possible input classes:
```
vf-dirty, vf-pristine, vf-valid, vf-invalid

// also for every validation error, a class will be added, e.g.
vf-invalid-required, vf-invalid-minlength, vf-invalid-max, etc
```

#### Custom validator:

```html
<input v-model="something" v-form-ctrl name="something" custom-validator="customValidator" />
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


### Custom form control component

You can also use `vue-form` on your own form components. Simply wrap your component with an element with `v-form-ctrl`, `name` and any validation attributes. Set `v-form-ctrl` to the same property you will be updating via two-way binding in your component. You can also get a hook into the internals of `v-form-ctrl` to mange control state. 

[See custom tinymce component validation example ](https://github.com/fergaldoyle/vue-form/tree/master/example)

```html
<div>
    <span>Rich text *</span>
    <span v-form-ctrl="model.html" name="html" required>
        <tinymce id="inline-editor" :model.sync="model.html"></tinymce>
    </span>
</div>
```
