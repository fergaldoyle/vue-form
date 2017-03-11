describe('vue-form', function() {
  let vm;

  Vue.use(vueForm);

  console.log('Vue version', Vue.version);

  function setValid() {
    vm.model.b = '123456';
    vm.model.c = '12346';
    vm.model.multicheck = ['Jack'];
  }

  beforeEach(function(done) {
    const div = document.createElement('div');
    document.body.appendChild(div);
    vm = new Vue({
      el: div,
      template: `
        <vue-form :state="formstate" @submit.prevent="onSubmit">

          <validate>
            <input v-model="model.a" name="a" required type="text" />
          </validate>

          <validate :state="formstate">
            <input v-model="model.b" name="b" required type="text" minlength="6" />
            <form-errors field="b" show="$dirty && $touched">
              <span id="error-message-b" slot="required">required error</span>
            </form-errors>
            <form-error field="b" error="required" show="$touched"><span id="error-message-b-2"></span></form-error>
          </validate>

          <div v-if="isCEnabled">
            <validate>
              <input v-model="model.c" name="c" :required="isRequired" :minlength="minlength" type="text" />
            </validate>
            <form-errors field="c">
              <span id="error-message" slot="required">required error</span>
              <span id="minlength-message" slot="minlength">minlength error</span>
            </form-errors>
            <form-error field="c" error="required"><span id="error-message2"></span></form-error>
            <form-error field="c" error="minlength"><span id="minlength-message2"></span></form-error>
          </div>

          <validate>
            <input v-model="model.email" name="email" type="email" />
          </validate>

          <validate>
            <input v-model="model.number" name="number" type="number" required />
          </validate>

          <validate>
            <input v-model="model.url" name="url" type="url" />
          </validate>

          <validate>
            <input v-model="model.length" name="length" type="text" minlength="4" maxlength="8" />
          </validate>

          <validate>
            <input v-model="model.minmax" name="minmax" type="number" min="4" max="8" />
          </validate>

          <validate>
            <input v-model="model.pattern" name="pattern" type="text" pattern="\\d\\d\\d\\d" />
          </validate>

          <validate :custom="{ customKey: customValidator }">
            <input v-model="model.custom" name="custom" type="text"  />
          </validate>

          <validate v-if="asyncEnabled" :custom="{ customAsync: customValidatorAsync }">
            <input v-model="model.custom2" name="custom2" type="text"  />
          </validate>

          <validate>
            <input type="checkbox" value="Jack" v-model="model.multicheck" required name="multicheck"/>
            <input type="checkbox" value="John" v-model="model.multicheck" required name="multicheck"/>
            <input type="checkbox" value="Mike" v-model="model.multicheck" required name="multicheck"/>
          </validate>

          <button id="submit" type="submit"></button>

        </vue-form>
      `,
      data: {
        hasSubmitted: false,
        formstate: {},
        isRequired: true,
        minlength: 5,
        isCEnabled: true,
        asyncEnabled: false,
        model: {
          a: 'aaa',
          b: '',
          c: null,
          email: 'joe.doe@foo.com',
          number: 1,
          url: 'https://foo.bar.com',
          length: '12345',
          minmax: 5,
          pattern: '1234',
          custom: 'custom',
          custom2: 'custom2',
          multicheck: []
        }
      },
      methods: {
        onSubmit() {
          this.hasSubmitted = true;
        },
        customValidator(value) {
          return value === 'custom';
        },
        customValidatorAsync(value) {
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              resolve(value === 'custom2');
            }, 100);
          });
        }
      }
    });
    Vue.nextTick(done);
  });

  afterEach(function(done) {
    vm.$destroy();
    Vue.nextTick(done);
  });

  it('should create a form tag and listen to submit event', () => {
    expect(vm.$el.tagName).toBe('FORM');
    vm.$el.querySelector('button[type=submit]').click();
    expect(vm.hasSubmitted).toBe(true);
  });

  it('should populate formstate', () => {
    expect(vm.formstate.$valid).toBeDefined();
  });

  it('should automatically find parent formstate and also work by passing state as a prop', () => {
    expect(vm.formstate.a).toBeDefined(true);
    expect(vm.formstate.b).toBeDefined(true);
  });

  it('should validate required fields', (done) => {
    expect(vm.formstate.a.$valid).toBe(true);
    expect(vm.formstate.a.$error.required).toBeUndefined();
    vm.model.a = '';
    vm.$nextTick(() => {
      expect(vm.formstate.a.$valid).toBe(false);
      expect(vm.formstate.a.$error.required).toBe(true);
      done();
    });
  });

  it('should not show other validators if required validator fails', (done) => {
    expect(vm.formstate.b.$error.required).toBe(true);
    expect(vm.formstate.b.$error.minlength).toBeUndefined();
    vm.model.b = 'acb';
    vm.$nextTick(() => {
      expect(vm.formstate.b.$error.required).toBeUndefined();
      expect(vm.formstate.b.$error.minlength).toBe(true);
      done();
    });
  });

  it('should react to bound validators', (done) => {
    expect(vm.formstate.c.$error.required).toBe(true);
    vm.isRequired = false;
    vm.$nextTick(() => {
      expect(vm.formstate.c.$error.required).toBeUndefined();
      vm.model.c = '1234';
      vm.$nextTick(() => {
        expect(vm.formstate.c.$error.minlength).toBe(true);
        vm.minlength = 2;
        vm.$nextTick(() => {
          expect(vm.formstate.c.$error.minlength).toBeUndefined();
          done();
        });
      });
    });
  });

  it('should validate [type=email]', (done) => {
    expect(vm.formstate.email.$valid).toBe(true);
    expect(vm.formstate.email.$error.email).toBeUndefined();
    vm.model.email = 'not a real email';
    vm.$nextTick(() => {
      expect(vm.formstate.email.$valid).toBe(false);
      expect(vm.formstate.email.$error.email).toBe(true);
      done();
    });
  });

  it('should validate [type=number]', (done) => {
    expect(vm.formstate.number.$valid).toBe(true);
    expect(vm.formstate.number.$error.number).toBeUndefined();
    vm.model.number = 'a string';
    vm.$nextTick(() => {
      expect(vm.formstate.number.$valid).toBe(false);
      expect(vm.formstate.number.$error.number).toBe(true);
      done();
    });
  });

  it('should validate required [type=number] === 0', (done) => {
    vm.model.number = 0;
    vm.$nextTick(() => {
      expect(vm.formstate.number.$valid).toBe(true);
      expect(vm.formstate.number.$error.number).toBeUndefined();
      expect(vm.formstate.number.$error.required).toBeUndefined();
      done();
    });
  });

  it('should validate [type=url]', (done) => {
    expect(vm.formstate.url.$valid).toBe(true);
    expect(vm.formstate.url.$error.url).toBeUndefined();
    vm.model.url = 'not a real url';
    vm.$nextTick(() => {
      expect(vm.formstate.url.$valid).toBe(false);
      expect(vm.formstate.url.$error.url).toBe(true);
      done();
    });
  });

  it('should validate [minlength]', (done) => {
    expect(vm.formstate.length.$valid).toBe(true);
    expect(vm.formstate.length.$error.minlength).toBeUndefined();
    vm.model.length = '1';
    vm.$nextTick(() => {
      expect(vm.formstate.length.$valid).toBe(false);
      expect(vm.formstate.length.$error.minlength).toBe(true);
      done();
    });
  });

  it('should validate [maxlength]', (done) => {
    expect(vm.formstate.length.$valid).toBe(true);
    expect(vm.formstate.length.$error.maxlength).toBeUndefined();
    vm.model.length = '1234567890';
    vm.$nextTick(() => {
      expect(vm.formstate.length.$valid).toBe(false);
      expect(vm.formstate.length.$error.maxlength).toBe(true);
      done();
    });
  });

  it('should validate [number][min]', (done) => {
    expect(vm.formstate.minmax.$valid).toBe(true);
    expect(vm.formstate.minmax.$error.min).toBeUndefined();
    vm.model.minmax = 1;
    vm.$nextTick(() => {
      expect(vm.formstate.minmax.$valid).toBe(false);
      expect(vm.formstate.minmax.$error.min).toBe(true);
      done();
    });
  });

  it('should validate [number][max]', (done) => {
    expect(vm.formstate.minmax.$valid).toBe(true);
    expect(vm.formstate.minmax.$error.max).toBeUndefined();
    vm.model.minmax = 100;
    vm.$nextTick(() => {
      expect(vm.formstate.minmax.$valid).toBe(false);
      expect(vm.formstate.minmax.$error.max).toBe(true);
      done();
    });
  });

  it('should validate [pattern]', (done) => {
    expect(vm.formstate.pattern.$valid).toBe(true);
    expect(vm.formstate.pattern.$error.pattern).toBeUndefined();
    vm.model.pattern = 'not four numbers';
    vm.$nextTick(() => {
      expect(vm.formstate.pattern.$valid).toBe(false);
      expect(vm.formstate.pattern.$error.pattern).toBe(true);
      done();
    });
  });

  it('should validate custom validators', function(done) {
    expect(vm.formstate.custom.$valid).toBe(true);
    expect(vm.formstate.custom.$error.customKey).toBeUndefined();
    vm.model.custom = 'custom invalid value';
    vm.$nextTick(function() {
      expect(vm.formstate.custom.$valid).toBe(false);
      expect(vm.formstate.custom.$error.customKey).toBe(true);
      done();
    });
  });

  it('should validate async validators', function(done) {
    vm.asyncEnabled = true;
    vm.$nextTick(() => {
      expect(vm.formstate.custom2.$pending).toBe(true);
      expect(vm.formstate.custom2.$valid).toBe(true);
      setTimeout(() => {
        expect(vm.formstate.custom2.$pending).toBe(false);
        expect(vm.formstate.custom2.$valid).toBe(true);
        vm.model.custom2 = 'foo';
        setTimeout(() => {
          expect(vm.formstate.custom2.$pending).toBe(false);
          expect(vm.formstate.custom2.$valid).toBe(false);
          done();
        }, 150);
      }, 150);
    });
  });

  it('should hyphenate camelcase validator names', function(done) {
    vm.model.custom = 'custom invalid value';
    vm.$nextTick(function() {
      expect(vm.$el.querySelector('[name="custom"]').classList.contains('vf-invalid-custom-key')).toBe(true);
      done();
    });
  });

  it('should validate checkbox array', (done) => {
    expect(vm.formstate.multicheck.$valid).toBe(false);
    expect(vm.formstate.multicheck.$error.required).toBe(true);
    vm.$el.querySelector('[name=multicheck]').click();
    vm.$nextTick(() => {
      expect(vm.formstate.multicheck.$valid).toBe(true);
      expect(vm.formstate.multicheck.$error.required).toBeUndefined();
      done();
    });
  });

  it('should set $dirty when model changed by user', (done) => {
    expect(vm.formstate.a.$dirty).toBe(false);
    // non user change
    vm.model.a = 'abc';

    vm.$nextTick(() => {
      expect(vm.formstate.a.$dirty).toBe(false);

      // user interacted with field then changed text
      vm.$el.querySelector('[name=a]').focus();
      vm.model.a = 'abcc';

      vm.$nextTick(() => {
        expect(vm.formstate.a._hasFocused).toBe(true);
        expect(vm.formstate.a.$dirty).toBe(true);
        done();
      });

    });

  });

  it('should set $touched on blur', (done) => {
    expect(vm.formstate.a.$touched).toBe(false);
    vm.$el.querySelector('[name=a]').focus();
    vm.$el.querySelector('[name=a]').blur();
    vm.$nextTick(() => {
      expect(vm.formstate.a.$touched).toBe(true);
      done();
    });
  });

  it('should set form properties when child properties change', (done) => {
    // starts off invalid
    expect(vm.formstate.$valid).toBe(false);
    expect(vm.formstate.$invalid).toBe(true);
    expect(vm.formstate.$dirty).toBe(false);
    expect(vm.formstate.$pristine).toBe(true);
    expect(vm.formstate.$touched).toBe(false);
    expect(vm.formstate.$untouched).toBe(true);
    expect(Object.keys(vm.formstate.$error).length).toBe(3);

    // emulate user interaction
    vm.$el.querySelector('[name=b]').focus();
    vm.$el.querySelector('[name=b]').blur();

    setValid();

    vm.$nextTick(() => {
      expect(vm.formstate.$valid).toBe(true);
      expect(vm.formstate.$invalid).toBe(false);
      expect(vm.formstate.$dirty).toBe(true);
      expect(vm.formstate.$pristine).toBe(false);
      expect(vm.formstate.$touched).toBe(true);
      expect(vm.formstate.$untouched).toBe(false);
      expect(Object.keys(vm.formstate.$error).length).toBe(0);
      done();
    });
  });

  it('should add and remove state classes', (done) => {

    // starts off invalid, pristine and untouched
    expect(vm.$el.classList.contains('vf-form-pristine')).toBe(true);
    expect(vm.$el.classList.contains('vf-form-invalid')).toBe(true);
    expect(vm.$el.classList.contains('vf-form-untouched')).toBe(true);

    const input = vm.$el.querySelector('[name=b]');

    expect(input.classList.contains('vf-pristine')).toBe(true);
    expect(input.classList.contains('vf-invalid')).toBe(true);
    expect(input.classList.contains('vf-untouched')).toBe(true);
    expect(input.classList.contains('vf-invalid-required')).toBe(true);

    // set valid and interacted
    input.focus();
    input.blur();
    setValid();

    vm.$nextTick(() => {
      expect(vm.$el.classList.contains('vf-form-dirty')).toBe(true);
      expect(vm.$el.classList.contains('vf-form-valid')).toBe(true);
      expect(vm.$el.classList.contains('vf-form-touched')).toBe(true);
      expect(input.classList.contains('vf-dirty')).toBe(true);
      expect(input.classList.contains('vf-valid')).toBe(true);
      expect(input.classList.contains('vf-touched')).toBe(true);
      expect(input.classList.contains('vf-invalid-required')).toBe(false);
      done();
    });
  });

  it('should add and remove a field from overall state when inside v-if', (done) => {
    setValid();
    vm.model.c = '';

    vm.$nextTick(() => {
      expect(vm.formstate.c).toBeDefined();
      expect(vm.formstate.c.$invalid).toBe(true);
      expect(vm.formstate.$invalid).toBe(true);

      vm.isCEnabled = false;

      vm.$nextTick(() => {
        expect(vm.formstate.c).toBeUndefined();
        expect(vm.formstate.$valid).toBe(true);
        done();
      });
    });
  });

  it('should show the correct form errors', (done) => {
    vm.$nextTick(() => {

      // field b
      expect(vm.$el.querySelector('#error-message-b')).toBe(null);
      expect(vm.$el.querySelector('#error-message-b-2')).toBe(null);
      vm.model.b = '123';

      // field c
      expect(vm.$el.querySelector('#error-message')).not.toBeNull(null);
      expect(vm.$el.querySelector('#minlength-message')).toBe(null);
      expect(vm.$el.querySelector('#error-message2')).not.toBeNull(null);
      expect(vm.$el.querySelector('#minlength-message2')).toBe(null);
      vm.model.c = '123';

      vm.$nextTick(() => {
        // field b could still be null
        expect(vm.$el.querySelector('#error-message-b')).toBe(null);
        expect(vm.$el.querySelector('#error-message-b-2')).toBe(null);
        vm.$el.querySelector('[name=b]').focus();
        vm.$el.querySelector('[name=b]').blur();
        vm.model.b = '';

        // field c
        expect(vm.$el.querySelector('#error-message')).toBe(null);
        expect(vm.$el.querySelector('#minlength-message')).not.toBeNull(null);
        expect(vm.$el.querySelector('#error-message2')).toBe(null);
        expect(vm.$el.querySelector('#minlength-message2')).not.toBeNull(null);
        vm.model.c = '123456';

        vm.$nextTick(() => {

          // field b
          expect(vm.$el.querySelector('#error-message-b')).not.toBeNull(null);
          expect(vm.$el.querySelector('#error-message-b-2')).not.toBeNull(null);

          // field c
          expect(vm.$el.querySelector('#error-message')).toBe(null);
          expect(vm.$el.querySelector('#minlength-message')).toBe(null);
          expect(vm.$el.querySelector('#error-message2')).toBe(null);
          expect(vm.$el.querySelector('#minlength-message2')).toBe(null);


          done();
        });
      });
    });
  });

  it('should work with v-for', function(done) {

    vm.$destroy();

    const div = document.createElement('div');
    document.body.appendChild(div);

    new Vue({
      el: div,
      template: `
        <vue-form :state="formstate">
          <validate tag="label" v-for="input in inputs" :key="input.name">
              {{input.label}} <br>
              <input type="text" :name="input.name" v-model="input.model" :required="input.required" />
          </validate>
        </vue-form>
      `,
      data: {
        inputs: [{
          label: 'Input A',
          name: 'a',
          model: '',
          required: true
        }, {
          label: 'Input B',
          name: 'b',
          model: '',
          required: false
        }, {
          label: 'Input C',
          name: 'c',
          model: 'abc',
          required: true
        }],
        formstate: {}
      },
      mounted: function() {
        this.$nextTick(() => {
          expect(this.formstate.a.$valid).toBe(false);
          expect(this.formstate.b.$valid).toBe(true);
          expect(this.formstate.c.$valid).toBe(true);
          done();
        });
      }
    });

  });

  it('should work with components, even if some validation attributes are also component props', function(done) {

    vm.$destroy();

    const div = document.createElement('div');
    document.body.appendChild(div);

    new Vue({
      el: div,
      components: {
        test: {
          props: ['value'],
          template: '<span></span>'
        },
        test2: {
          props: ['value', 'required', 'name'],
          template: '<span><input type="text" id="input" /></span>',
          mounted () {
            this.$el.querySelector('input').addEventListener('focus', this.$emit('focus'));
            this.$el.querySelector('input').addEventListener('blur', this.$emit('blur'));
          }
        }
      },
      template: `
        <vue-form :state="formstate">
          <validate>
              <test name="test" v-model="model.test" required ></test>
          </validate>
            <validate>
              <test2 name="test2" v-model="model.test2" required ></test2>
          </validate>
        </vue-form>
      `,
      data: {
        model: {
          test: '',
          test2: ''
        },
        formstate: {}
      },
      mounted: function() {
        expect(this.formstate.test).toBeDefined();
        expect(this.formstate.test.$error.required).toBe(true);
        expect(this.formstate.test2).toBeDefined();
        expect(this.formstate.test2.$error.required).toBe(true);
        expect(this.formstate.test2.$dirty).toBe(false);
        this.$el.querySelector('#input').focus();
        this.$el.querySelector('#input').blur();

        this.model.test = 'xxx';
        this.model.test2 = 'xxx';

        this.$nextTick(() => {
          expect(this.formstate.test.$error.required).toBeUndefined();
          expect(this.formstate.test.$dirty).toBe(false);
          expect(this.formstate.test2.$dirty).toBe(true);
          expect(this.formstate.test2.$touched).toBe(true);
          done();
        });
      }
    });

  });

});
