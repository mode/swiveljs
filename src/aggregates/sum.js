swivel.sum = function(field, fieldName) {
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
};
