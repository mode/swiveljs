var should = require('should');

eval(require('fs').readFileSync('./test/test_helper.js', 'utf8'));

describe("Swivel", function () {
  it("passing an empty dataset", function() {
    var results = swivel([])
      .group('user')
      .sum('events')
      .all();

    results.data.length.should == 0;
  });

  it("passing data in constructor", function() {
    datasets.events(function(data) {
      var results = swivel(data)
        .group('user')
        .sum('events')
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
        .group('user')
        .sum('events')
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
