var should = require('should');

eval(require('fs').readFileSync('./test/test_helper.js', 'utf8'));

describe("Swivel", function () {
  it("passing data in constructor", function() {
    datasets.events(function(data) {
      var results = swivel(data)
        .fields(['user'])
        .select(swivel.sum('events'), 'events')
        .all();

      should(results.data).eql([
        { user: 'A', events: 4 },
        { user: 'B', events: 6 },
        { user: 'C', events: 2 },
        { user: 'D', events: 2 }
      ]);
    });
  });

  it("passing data after construction", function() {
    datasets.events(function(data) {
      var results = swivel()
        .data(data)
        .fields(['user'])
        .select(swivel.sum('events'), 'events')
        .all();

      should(results.data).eql([
        { user: 'A', events: 4 },
        { user: 'B', events: 6 },
        { user: 'C', events: 2 },
        { user: 'D', events: 2 }
      ]);
    });
  })
});
