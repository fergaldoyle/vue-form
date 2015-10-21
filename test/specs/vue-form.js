describe('vue-form', function () {
  var vm;

  beforeEach(function (done) {
    vm = new Vue({
      el: 'body',
      replace: false,
      template: `
        <form v-form name="myform">
          <input v-model="model.a" v-form-model="model.a" name="a" required type="text" />
          <input v-model="model.b" v-form-model="model.b" name="b" required type="text" />
          <input v-model="model.c" v-form-model="model.c" name="c" type="text" />
          <input v-model="model.d" v-form-model="model.d" name="d" :required="isRequired" type="text" />
          <input v-model="model.e" v-form-model="model.e" name="e" :required="isRequired" type="text" />
          <input v-model="model.f" v-form-model="model.f" name="f" type="email" />        
          <input v-model="model.g" v-form-model="model.g" name="g" type="number" />        
          <input v-model="model.h" v-form-model="model.h" name="h" type="text" minlength="6" />        
          <input v-model="model.i" v-form-model="model.i" name="i" type="text" maxlength="10" />        
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
          h: '',
          i: ''
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

});
