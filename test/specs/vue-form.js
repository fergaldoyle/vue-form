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
        </form>
      `,
      data: {
        isRequired: true,
        model: {
          a: 'aaa',
          b: '',
          c: null,
          d: '',
          e: 'eee'
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

});
