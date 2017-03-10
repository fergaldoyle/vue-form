export default {
  computed: {
    isShown() {
      const field = this.formstate[this.field];

      if (!this.show || !field) {
        return true;
      }

      if (this.show.indexOf('&&') > -1) {
        // and logic - every
        const split = this.show.split('&&');
        return split.every(v => field[v.trim()]);
      } else if (this.show.indexOf('||') > -1) {
        // or logic - some
        const split = this.show.split('||');
        return split.some(v => field[v.trim()]);
      } else {
        // single
        return field[this.show];
      }
    }
  }
};
