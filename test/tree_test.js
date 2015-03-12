var should = require('should');
var swivel = require('../dist/swivel');

eval(require('fs').readFileSync('./test/test_helper.js', 'utf8'));

describe("Tree", function () {
  it("#getValues", function() {
    datasets.events(function(data) {
      var tree = swivel.tree();

      tree.field('user');
      tree.field('event_name');
      tree.field('device');

      for(var i = 0; i < data.length; i++) {
        tree.insert(data[i], i);
      }

      tree.isEmpty().should.eql(false);

      var users       = tree.getValues('user');
      var devices     = tree.getValues('device');
      var event_names = tree.getValues('event_name');

      users.should.have.property('A', true);
      users.should.have.property('B', true);
      users.should.have.property('C', true);
      users.should.have.property('D', true);

      devices.should.have.property('iphone6', true);
      devices.should.have.property('macbookpro', true);
      devices.should.have.property('surface', true);

      event_names.should.have.property('signup', true);
      event_names.should.have.property('login', true);
      event_names.should.have.property('like_message', true);
      event_names.should.have.property('send_message', true);
      event_names.should.have.property('view_inbox', true);
    });
  });

  it("#eachBranch", function() {
    datasets.events(function(data) {
      var tree = swivel.tree()

      tree.field('user');
      tree.field('event_name');
      tree.field('device');

      for(var i = 0; i < data.length; i++) {
        tree.insert(data[i], i);
      }

      should(tree.isEmpty()).eql(false);

      // Generated from the CSV file

      var branches = [
        { user: 'A', event_name: 'signup', device: 'iphone6' },
        { user: 'A', event_name: 'login', device: 'iphone6' },
        { user: 'A', event_name: 'send_message', device: 'iphone6' },
        { user: 'B', event_name: 'signup', device: 'macbookpro' },
        { user: 'B', event_name: 'login', device: 'macbookpro' },
        { user: 'B', event_name: 'like_message', device: 'macbookpro' },
        { user: 'C', event_name: 'signup', device: 'surface' },
        { user: 'C', event_name: 'login', device: 'surface' },
        { user: 'D', event_name: 'send_message', device: 'macbookpro' },
        { user: 'D', event_name: 'view_inbox', device: 'macbookpro' }
      ];

      var branchCount = 0;
      var root = tree.getRoot();
      tree.eachBranch({}, root, ['user', 'event_name', 'device'], 0, function(node, branch) {
        should(branches[branchCount++]).eql(branch);
      });
    });
  });
});
