swivel.aggregate = function(fnName, fieldName) {
  switch(fnName) {
    case 'sum':
      return swivel.sum(fieldName);
    case 'count':
      return swivel.count(fieldName);
    case 'countUnique':
      return swivel.countUnique(fieldName);
    case 'average':
      return swivel.average(fieldName);
    case 'median':
      return swivel.median(fieldName);
    case 'stdDev':
      return swivel.stdDev(fieldName);
    default:
      return swivel.sum(fieldName);
    };
};
