describe('vue-form', function () {
  var vm;

  beforeEach(function (done) {
    vm = new Vue({
      el: 'body',
      replace: false,
      template: `
        <form v-form name="myform">
          <input v-model="model.a" v-form-ctrl name="a" required type="text" />
          <input v-model="model.b" v-form-ctrl name="b" required type="text" />
          <input v-model="model.c" v-form-ctrl name="c" type="text" />
          <input v-model="model.d" v-form-ctrl name="d" :required="isRequired" type="text" />
          <input v-model="model.e" v-form-ctrl name="e" :required="isRequired" type="text" />
          <input v-model="model.f" v-form-ctrl name="f" type="email" />
          <input v-model="model.g" v-form-ctrl name="g" type="number" />
          <input v-model="model.h" v-form-ctrl name="h" type="text" minlength="6" />
          <input v-model="model.i" v-form-ctrl name="i" type="text" maxlength="10" />
          <input v-model="model.j" v-form-ctrl name="j" type="number" min="10" />
          <input v-model="model.k" v-form-ctrl name="k" type="number" max="10" />
          <input v-model="model.l" v-form-ctrl name="l" type="url" />
          <input v-model="model.m" v-form-ctrl name="m" type="text" :pattern="'[A-Za-z]{3}'" />
          <input v-model="model.n" v-form-ctrl name="n" type="email" required minlength="8" />
          <input v-model="model.o" v-form-ctrl name="o" type="text" custom-validator="customValidator" />
          
          <input type="checkbox" value="Jack" v-model="multicheck" v-form-ctrl required name="multicheck"/>
          <input type="checkbox" value="John" v-model="multicheck" v-form-ctrl required name="multicheck"/>
          <input type="checkbox" value="Mike" v-model="multicheck" v-form-ctrl required name="multicheck"/>

        </form>
      `,
      data: {
        isRequired: true,
        model: {
          a: 'aaa',
          b: '',
          c: null,
          d: '',
          e: 'eee',
          f: 'foo.bar@com.com',
          g: '3',
          h: '12',
          i: '',
          j: 11,
          k: 5,
          l: 'non url',
          m: 'x',
          n: '',
          o: 'abc',
          multicheck: []
        }
      },
      methods: {
        customValidator: function (value) {
          return value === 'custom';
        }
      }
    });
    Vue.nextTick(done);
  });

  afterEach(function (done) {
    vm.$destroy();
    Vue.nextTick(done);
  });

  it('should create an object in the current vm', function () {
    expect(vm.myform).toBeDefined();
  });

  it('should work on an element with no validation attributes', function () {
    expect(vm.myform.c).toBeDefined();
  });

  it('should validate against static attributes', function () {
    expect(vm.myform.a.$valid).toBe(true);
    expect(vm.myform.b.$invalid).toBe(true);
  });

  it('should validate against binding attributes', function () {
    expect(vm.myform.d.$invalid).toBe(true);
    expect(vm.myform.e.$valid).toBe(true);
  });

  it('should react to model changes', function (done) {
    expect(vm.myform.a.$valid).toBe(true);
    vm.model.a = '';
    Vue.nextTick(function () {
      expect(vm.myform.a.$valid).toBe(false);
      Vue.nextTick(done);
    });
  });

  it('should react to attribue binding changes', function (done) {
    expect(vm.myform.d.$valid).toBe(false);
    vm.isRequired = false;
    Vue.nextTick(function () {
      expect(vm.myform.d.$valid).toBe(true);
      Vue.nextTick(done);
    });
  });

  it('should validate [type=email]', function (done) {
    expect(vm.myform.f.$valid).toBe(true);
    vm.model.f = 'not a real email';
    Vue.nextTick(function () {
      expect(vm.myform.f.$valid).toBe(false);
      Vue.nextTick(done);
    });
  });

  it('should validate [type=number]', function (done) {
    expect(vm.myform.g.$valid).toBe(true);
    vm.model.g = 'not a real email';
    Vue.nextTick(function () {
      expect(vm.myform.g.$valid).toBe(false);
      Vue.nextTick(done);
    });
  });

  it('should validate [type=url]', function (done) {
    expect(vm.myform.l.$valid).toBe(false);
    vm.model.l = 'http://foo.bar/baz';
    Vue.nextTick(function () {
      expect(vm.myform.l.$valid).toBe(true);
      Vue.nextTick(done);
    });
  });

  it('should validate [required]', function (done) {
    expect(vm.myform.a.$valid).toBe(true);
    vm.model.a = '';
    Vue.nextTick(function () {
      expect(vm.myform.a.$valid).toBe(false);
      Vue.nextTick(done);
    });
  });

  it('should validate [minlength]', function (done) {
    expect(vm.myform.h.$valid).toBe(false);
    vm.model.h = '123456';
    Vue.nextTick(function () {
      expect(vm.myform.h.$valid).toBe(true);
      Vue.nextTick(done);
    });
  });

  it('should validate [maxlength]', function (done) {
    expect(vm.myform.i.$valid).toBe(true);
    vm.model.i = '123456789100';
    Vue.nextTick(function () {
      expect(vm.myform.i.$valid).toBe(false);
      Vue.nextTick(done);
    });
  });

  it('should validate [number][min]', function (done) {
    expect(vm.myform.j.$valid).toBe(true);
    vm.model.j = 9;
    Vue.nextTick(function () {
      expect(vm.myform.j.$valid).toBe(false);
      Vue.nextTick(done);
    });
  });

  it('should validate [number][max]', function (done) {
    expect(vm.myform.k.$valid).toBe(true);
    vm.model.k = 15;
    Vue.nextTick(function () {
      expect(vm.myform.k.$valid).toBe(false);
      Vue.nextTick(done);
    });
  });

  it('should validate [pattern]', function (done) {
    expect(vm.myform.m.$valid).toBe(false);
    vm.model.m = 'abc';
    Vue.nextTick(function () {
      expect(vm.myform.m.$valid).toBe(true);
      Vue.nextTick(done);
    });
  });
  
  it('should validate multiple validators', function (done) {
    expect(vm.myform.n.$valid).toBe(false);
    // pass required
    vm.model.n = 'abc';
    Vue.nextTick(function () {
      // email will be invalid
      expect(vm.myform.n.$valid).toBe(false);
      // pass email
      vm.model.n = 'a@b.c';
      Vue.nextTick(function () {
        // minlength will be invalid
        expect(vm.myform.n.$valid).toBe(false);
        // pass minlength
        vm.model.n = 'aa@bb.xxxx';
        Vue.nextTick(function () {
          expect(vm.myform.n.$valid).toBe(true);
          Vue.nextTick(done);
        });
      });
    });
  });  

  it('should validate custom-validator', function (done) {
    expect(vm.myform.o.$valid).toBe(false);
    vm.model.o = 'custom';
    Vue.nextTick(function () {
      expect(vm.myform.o.$valid).toBe(true);
      Vue.nextTick(done);
    });
  });


  it('should validate checkbox array', function (done) {
    expect(vm.myform.multicheck.$valid).toBe(false);
    vm.$el.querySelector('[name=multicheck]').click();
    Vue.nextTick(function () {
      expect(vm.myform.multicheck.$valid).toBe(true);
      Vue.nextTick(done);
    });
  });

 it('should set input dirty when changed', function (done) {
    expect(vm.myform.d.$dirty).toBe(false);
    vm.model.d = 'abc';
    Vue.nextTick(function () {
      expect(vm.myform.d.$dirty).toBe(true);
      Vue.nextTick(done);
    });
  });

  it('should set form dirty when child changed', function (done) {
    expect(vm.myform.$dirty).toBe(false);
    vm.model.d = 'abc';
    Vue.nextTick(function () {
      expect(vm.myform.$dirty).toBe(true);
      Vue.nextTick(done);
    });
  });

  it('should set form invalid when child is invald', function () {
    expect(vm.myform.$invalid).toBe(true);
  });
   
  it('should add and remove state classes from inputs', function (done) {
    var classes = vm.$el.querySelector('[name=b]').className;
    expect(classes.indexOf('vf-pristine')).not.toBe(-1);
    expect(classes.indexOf('vf-invalid')).not.toBe(-1);
    expect(classes.indexOf('vf-invalid-required')).not.toBe(-1);
    vm.model.b = 'abc';
    Vue.nextTick(function () {
      classes = vm.$el.querySelector('[name=b]').className;
      expect(classes.indexOf('vf-pristine')).toBe(-1);
      expect(classes.indexOf('vf-invalid')).toBe(-1);
      expect(classes.indexOf('vf-invalid-required')).toBe(-1);
      expect(classes.indexOf('vf-valid')).not.toBe(-1);
      Vue.nextTick(done);
    });
  }); 
  
  it('should add and remove state classes from form', function (done) {
    var classes = vm.$el.querySelector('[name="myform"]').className;
    expect(classes.indexOf('vf-invalid')).not.toBe(-1);
    expect(classes.indexOf('vf-pristine')).not.toBe(-1);
    vm.model.b = 'abc';
    Vue.nextTick(function () {
      classes = vm.$el.querySelector('[name="myform"]').className;
      //expect(classes.indexOf('vf-pristine')).toBe(-1);
      //expect(classes.indexOf('vf-invalid')).toBe(-1);
      //expect(classes.indexOf('vf-valid')).not.toBe(-1);
      Vue.nextTick(done);
    });
  });   

  it('should work with v-for scope', function (done) {
    
     vm.$destroy();    

     var vmx = new Vue({
      el: 'body',
      replace: false,
      template: `
        <form v-form name="myform">
          <label v-for="input in inputs">
              <label> {{input.label}} <br>   
              <input v-form-ctrl type="text" :name="input.name" v-model="input.model" :required="input.required" />      
              </label>
          </label>
        </form>
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
        myform: {}
      },
      ready: function () {
        setTimeout(function () {
          expect(vmx.myform.a.$valid).toBe(false);
          expect(vmx.myform.b.$valid).toBe(true);
          expect(vmx.myform.c.$valid).toBe(true);      
          done();
        }, 100);       
      }
    });

  }); 

  it('should work with v-bind object syntax', function (done) {
    
     vm.$destroy();
    
     var vmx = new Vue({
      el: 'body',
      replace: false,
      template: `
        <form v-form name="myform">
          <input v-model="model.a" v-form-ctrl v-bind="{'name': 'a', required: true}" />
          <input v-model="model.b" v-form-ctrl :="{'name': 'b', required: false}" />         
        </form>
      `,
      data: { 
        model: {
          b: 'xxx'
        },
        myform: {}
      },
      ready: function () {
        this.$nextTick(function () {
          expect(vmx.myform.a.$valid).toBe(false);
          expect(vmx.myform.b.$valid).toBe(true);  
          
          /*vmx.model.a = 'aaa';
          vmx.model.b = 'aa';
          this.$nextTick(function () {
            console.log(vmx.model);
            expect(vmx.myform.a.$valid).toBe(true);
            expect(vmx.myform.b.$valid).toBe(false);             
            done();          
          });*/
          done();
        });
      }
    });

  }); 

});
