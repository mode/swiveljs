swivel.sum = function(field) {
  return function(rows) {
    var sum = 0;

    for(var r = 0; r < rows.length; r++) {
      var value = +rows[r][field];

      if(value === NaN) {
        return NaN;
        break;
      } else if(typeof value !== 'number') {
        return NaN;
        break;
      } else {
        sum += value;
      }
    }

    return sum;
  };
};
