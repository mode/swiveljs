swivel.relation = function() {
  var data   = [];
  var fields = {};
  var empty  = true;

  var _relation = {
    insert: insert,
    isEmpty: isEmpty
  };

  // Public

  function isEmpty() {
    return empty;
  };

  function insert(row, rowIdx) {
    empty = false;
    data.push(row);
  };

  // Private
  //

  return _relation;
}
