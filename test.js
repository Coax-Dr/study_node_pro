var fibonacci = require("./fibonacci");
var should = require("should");

describe("test.js", function () {
  it("should equal 0 when n === 0", function () {
    fibonacci(0).should.equal(0);
  });
  it("should equal 55 when n === 10", function () {
    fibonacci(10).should.equal(55);
  });
  it('should throw when n > 10', function () {
    (function () {
      fibonacci(11);
      throw new Error("n should <= 10");
    }).should.throw('n should <= 10');
  });
})