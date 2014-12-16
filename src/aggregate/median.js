swivel.median = function(field) {
  return function(rows) {
    var values = [];
    for(var r = 0; r < rows.length; r++) {
      values.push(+rows[r][field]);
    }

    var value = NaN;

    values.sort( function(a,b) { return a - b; } );
    var midPoint = Math.floor(values.length / 2);

    if(values.length % 2) {
      value = values[midPoint];
    } else {
      value = values[midPoint - 1] + values[midPoint] / 2.0;
    }

    return value;
  };
};
