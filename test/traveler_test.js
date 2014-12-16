var should = require('should');

eval(require('fs').readFileSync('./test/test_helper.js', 'utf8'));

describe("Traveler", function () {
  it("single field with no pivots", function() {
    datasets.events(function(data) {
      var fields   = ['user'];
      var map      = swivel.map(fields);
      var tree     = swivel.tree(fields);
      var traveler = swivel.traveler(tree, map);

      var results = traveler.data(data)
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

  it("multiple field with no pivots", function() {
    datasets.events(function(data) {
      var fields   = ['user', 'device'];
      var map      = swivel.map(fields);
      var tree     = swivel.tree(fields);
      var traveler = swivel.traveler(tree, map);

      var results = traveler.data(data)
        .select(swivel.sum('events'), 'events')
        .all();

      should(results.data).eql([
        { device: 'iphone6', events: 4, user: 'A' },
        { device: 'macbookpro', events: 6, user: 'B' },
        { device: 'surface', events: 2, user: 'C' },
        { device: 'macbookpro', events: 2, user: 'D' }
      ]);
    });
  });

  it("one field with one pivot", function() {
    datasets.events(function(data) {
      var fields   = ['device'];
      var map      = swivel.map(fields);
      var tree     = swivel.tree(fields);
      var traveler = swivel.traveler(tree, map);

      var results = traveler.data(data)
        .pivots('device')
        .select(swivel.sum('events'), 'events')
        .all();

      should(results.data).eql({ iphone6: 4, macbookpro: 8, surface: 2 });
    });
  });

  it("multiple fields with last field pivot", function() {
    datasets.events(function(data) {
      var fields   = ['user','device'];
      var map      = swivel.map(fields);
      var tree     = swivel.tree(fields);
      var traveler = swivel.traveler(tree, map);

      var results = traveler.data(data)
        .pivots('device')
        .select(swivel.sum('events'), 'events')
        .all();

      should(results.data).eql([
        { user: 'A', iphone6: 4, macbookpro: null, surface: null },
        { user: 'B', iphone6: null, macbookpro: 6, surface: null },
        { user: 'C', iphone6: null, macbookpro: null, surface: 2 },
        { user: 'D', iphone6: null, macbookpro: 2, surface: null }
      ]);
    });
  });

  it("multiple fields with first field pivot", function() {
    datasets.events(function(data) {
      var fields   = ['user','device'];
      var map      = swivel.map(fields);
      var tree     = swivel.tree(fields);
      var traveler = swivel.traveler(tree, map);

      var results = traveler.data(data)
      .pivots('user')
      .select(swivel.sum('events'), 'events')
      .all();

      should(results.data).eql({
        A: [ { device: 'iphone6', events: 4 } ],
        B: [ { device: 'macbookpro', events: 6 } ],
        C: [ { device: 'surface', events: 2 } ],
        D: [ { device: 'macbookpro', events: 2 } ]
      });
    });
  });

  it("multiple fields with all fields pivotted", function() {
    datasets.events(function(data) {
      var fields   = ['user','device'];
      var map      = swivel.map(fields);
      var tree     = swivel.tree(fields);
      var traveler = swivel.traveler(tree, map);

      var results = traveler.data(data)
      .pivots('user', 'device')
      .select(swivel.sum('events'), 'events')
      .all();

      should(results.data).eql({
        A: { iphone6: 4, macbookpro: null, surface: null },
        B: { iphone6: null, macbookpro: 6, surface: null },
        C: { iphone6: null, macbookpro: null, surface: 2 },
        D: { iphone6: null, macbookpro: 2, surface: null }
      });
    });
  });

  it("multiple fields with center field pivot", function() {
    datasets.events(function(data) {
      var fields   = ['user','device', 'event_name'];
      var map      = swivel.map(fields);
      var tree     = swivel.tree(fields);
      var traveler = swivel.traveler(tree, map);

      var results = traveler.data(data)
        .pivots('device')
        .select(swivel.sum('events'), 'events')
        .all();

      should(results.data).eql([
        {
          iphone6: [
            { event_name: 'signup', events: 1 },
            { event_name: 'login', events: 1 },
            { event_name: 'send_message', events: 2 }
          ],
          macbookpro: null,
          surface: null,
          user: 'A'
        },
        {
          iphone6: null,
          macbookpro: [
            { event_name: 'signup', events: 1 },
            { event_name: 'login', events: 1 },
            { event_name: 'like_message', events: 4 }
          ],
          surface: null,
          user: 'B'
        },
        {
          iphone6: null,
          macbookpro: null,
          surface: [
            { event_name: 'signup', events: 1 },
            { event_name: 'login', events: 1 }
          ],
          user: 'C'
        },
        {
          iphone6: null,
          macbookpro: [
            { event_name: 'send_message', events: 1 },
            { event_name: 'view_inbox', events: 1 }
          ],
          surface: null,
          user: 'D'
        }
      ]);
    });
  });
});
