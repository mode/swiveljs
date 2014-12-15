swivel.median = function(field, fieldName) {
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
};
