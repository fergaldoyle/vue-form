# vue-form  

[![Build Status](https://travis-ci.org/fergaldoyle/vue-form.svg?branch=0.2.2)](https://travis-ci.org/fergaldoyle/vue-form)

Form validation for Vue.js 1.0+. Works along side `v-model` but can also be used on your custom form control components (tinymce, select2, tag-editor etc).

### Install

Available through npm as `vue-form`.

``` js
// es6: import * as vueForm from 'vue-form'; 
var vueForm = require('vue-form');
Vue.use(vueForm);
```
  
You can also directly include it with a `<script>` tag when you have Vue itself included globally. It will automatically install itself.

### Usage

This plugin registers two global directives, `v-form` and `v-form-ctrl`.  Apply the `v-form` directive to a `form` element, and set the `name` attribute. This `name` will hold the overall form state object and is created on the current vm.

Apply the `v-form-ctrl` directive to each of the form inputs. `v-form-ctrl` will watch `v-model` and validate on change. Use static or binding attributes to specify validators (`required`, `maxlength`, `type="email"`, `type="url"`, etc)

```html
<form v-form name="myform" @submit.prevent="onSubmit">
	<div class="errors" v-if="myform.$submitted">
		<p v-if="myform.name.$error.required">Name is required.</p>
		<p v-if="myform.email.$error.email">Email is not valid.</p>
	</div>
	<label>
		<span>Name *</span>
		<input v-model="model.name" v-form-ctrl required name="name" />
	</label>
	<label>
		<span>Email</span>
		<input v-model="model.email" v-form-ctrl name="email" type="email" />
	</label>
	<button type="submit">Submit</button>
</form>
<pre>{{ myform | json }}</pre>
```

`myform` will be an object with the following properties:
```js
{
  "$name": "myform",
  "$dirty": false,
  "$pristine": true,
  "$valid": false,
  "$invalid": true,
  "$submitted": false,
  "$error": {
    "name": {
      "$name": "name",
      "$dirty": false,
      "$pristine": true,
      "$valid": false,
      "$invalid": true,
      "$error": {
        "required": true
      }
    }
  },
  "name": {
    "$name": "name",
    "$dirty": false,
    "$pristine": true,
    "$valid": false,
    "$invalid": true,
    "$error": {
      "required": true
    }
  },
  "email": {
    "$name": "email",
    "$dirty": false,
    "$pristine": true,
    "$valid": true,
    "$invalid": false,
    "$error": {}
  }
}
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
