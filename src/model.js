swivel.model = function() {
  var rels  = [];
  var joins = [];

  var _model = {

  };

  // Public

  function insert(rel) {
    rels.push(rel);
  };

  function join(joinType, lRel, lField, rRel, rField) {
    joins.push(swivel.join.left())
  };

  // Private

  return _model;
};
