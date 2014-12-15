swivel.data = function(data) {
  var _data = {
    fields: fields
  };

  // Public

  function fields() {
    var fields = swivel.args(arguments);

    var map  = swivel.map(fields);
    var tree = swivel.tree(fields);

    return swivel.traveler(tree, map).data(data);
  };

  return _data;
}
