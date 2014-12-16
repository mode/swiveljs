swivel.average = function(field) {
  return function(rows, group) {
    var value = NaN;

    if(rows.length > 0) {
      var sum = 0;
      for(var r = 0; r < rows.length; r++) {
        sum += rows[r][field];
      }

      value = sum / rows.length;
    }

    return value;
  };
};
