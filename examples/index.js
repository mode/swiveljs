
// Dataset Helpers

function datasets() {};

datasets.nfl = function(callback) {
  d3.json('datasets/nfl.json', callback);
}

datasets.events = function(callback) {
  var eventsMapper = function(row) {
    return {
      'date_trunc': Date.parse(row['date_trunc']),
      'event_name': row['event_name'],
      'location': row['location'],
      'device': row['device'],
      'user_id': row['user_id'],
      'events': +row['events']
    };
  };

  d3.csv("datasets/events.csv", eventsMapper, callback);
};
