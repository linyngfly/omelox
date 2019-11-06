let omelox = require('../lib/index').omelox;
import * as should from 'should';
let mockBase = process.cwd() + '/test';
// import { describe, it } from "mocha-typescript"

describe('omelox', function () {
  describe('#createApp', function () {
    it('should create and get app, be the same instance', function (done: MochaDone) {
      let app = omelox.createApp({ base: mockBase });
      should.exist(app);

      let app2 = omelox.app;
      should.exist(app2);
      should.strictEqual(app, app2);
      done();
    });
  });
});
