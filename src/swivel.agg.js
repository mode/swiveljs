Swivel.Agg = {
  count: function() {
    return function(rows, group) {
      return {'count': rows.length};
    }
  },

  countUnique: function(field, fieldName) {
    if(typeof fieldName === 'undefined') {
      fieldName = field;
    }

    return function(rows, group) {
      var values = {};
      for(var r = 0; r < rows.length; r++) {
        var value = rows[r][field];

        if(!(value in values)) {
          values[value] = true
        }
      }

      var value = {};
      value[fieldName] = Object.keys(values).length;
      return value;
    };
  },

  sum: function(field, fieldName) {
    if(typeof fieldName === 'undefined') {
      fieldName = field;
    }

    return function(rows, group) {
      var sum = 0;
      for(var r = 0; r < rows.length; r++) {
        var value = rows[r][field];

        if(value === NaN) {
          sum = NaN;
          break;
        } else if(typeof value !== 'number') {
          sum = NaN;
          break;
        } else {
          sum += value;
        }
      }

      var value = {}
      value[fieldName] = sum;
      return value;
    };
  },

  average: function(field, fieldName) {
    if(typeof fieldName === 'undefined') {
      fieldName = field;
    }

    return function(rows, group) {
      var value = {}

      if(rows.length == 0) {
        value[fieldName] = NaN;
      } else {
        var sum = 0;
        for(var r = 0; r < rows.length; r++) {
          sum += rows[r][field];
        }

        value[fieldName] = sum / rows.length;
      }

      return value;
    };
  },

  median: function(field, fieldName) {
    if(typeof fieldName === 'undefined') {
      fieldName = field;
    }

    return function(rows, group) {
      var values = [];
      for(var r = 0; r < rows.length; r++) {
        values.push(rows[r][field]);
      }

      var value = {};

      values.sort( function(a,b) { return a - b; } );
      var midPoint = Math.floor(values.length / 2);

      if(values.length % 2) {
        value[fieldName] = values[midPoint];
      } else {
        value[fieldName] = values[midPoint - 1] + values[midPoint] / 2.0;
      }

      return value;
    };
  },

  stdDev: function(field, fieldName) {
    if(typeof fieldName === 'undefined') {
      fieldName = field;
    }

    var average = function(rows) {
      var sum = 0;
      for(var i = 0; i < rows.length; i++) {
        sum += rows[i][field];
      }
      return sum / rows.length;
    };

    var sqDiffs = function(avg, rows) {
      var diffs = []
      for(var i = 0; i < rows.length; i++) {
        var diff = rows[i][field] - avg;
        diffs.push(diff * diff);
      }
      return diffs;
    };

    return function(rows, group) {
      if(rows.length == 0) {
        return NaN;
      };

      var avg = average(rows);

      var diffs = sqDiffs(avg, rows);

      var sqDiffSum = 0;
      for(var i = 0; i < diffs.length; i++) {
        sqDiffSum += diffs[i];
      }
      var avgSqDiff = sqDiffSum / diffs.length;

      var value = {}
      value[fieldName] = Math.sqrt(avgSqDiff);
      return value;
    };
  }
};
