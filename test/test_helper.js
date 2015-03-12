var fs  = require('fs');
var csv = require('csv');

//eval(fs.readFileSync('./dist/swivel.js', 'utf8'));

var datasets = {
  events: function(callback) {
    fs.readFile('./test/datasets/events.csv', 'utf8', function(err, data) {
      csv.parse(data, {columns: true}, function(err, data) {
        callback(data);
      });
    });
  }
};
