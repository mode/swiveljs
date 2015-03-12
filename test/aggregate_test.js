var should = require('should');
var swivel = require('../dist/swivel');

eval(require('fs').readFileSync('./test/test_helper.js', 'utf8'));

describe("Swivel", function () {
  it("should sum values", function() {
    var rows = [
      {'v': 1}, {'v': 2}, {'v': 3}, {'v': 10}
    ];

    should(swivel.sum('v')(rows)).eql(16)
  });

  it("should average values", function() {
    var rows = [
      {'v': 1}, {'v': 2}, {'v': 3}, {'v': 10}
    ];

    should(swivel.average('v')(rows)).eql(4)
  });

  it("should count values", function() {
    var rows = [
      {'v': 1}, {'v': 2}, {'v': 3}, {'v': 10}
    ];

    should(swivel.count('v')(rows)).eql(4)
  });

  it("should count unique values", function() {
    var rows = [
      {'v': 1}, {'v': 3}, {'v': 3}, {'v': 10}
    ];

    should(swivel.countUnique('v')(rows)).eql(3)
  });

  it("should find the median of an even number of values", function() {
    var rows = [
      {'v': 1}, {'v': 3}, {'v': 4}, {'v': 10}
    ];

    should(swivel.median('v')(rows)).eql(3.5)
  });

  it("should find the median of an odd number of values", function() {
    var rows = [
      {'v': 1}, {'v': 3}, {'v': 4}, {'v': 10}, {'v': 12}
    ];

    should(swivel.median('v')(rows)).eql(4)
  });

  it("should find the standard deviation of values", function() {
    var rows = [
      {'v': 1}, {'v': 3}, {'v': 4}, {'v': 10}
    ];

    should(swivel.stdDev('v')(rows)).approximately(3.35410196625, 10)
  });
});
