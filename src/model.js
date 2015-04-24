swivel.model = function() {
  var rels  = {};
  var joins = [];

  var _model = {
    relation: relation,
    join: join,
    inner: inner,
  };

  // Public

  function relation(name, dataset) {
    rels[name] = dataset;
  };

  function join(lRel, rRel, onFields) {
    inner(lRel, rRel, onFields);
  };

  function inner(lRel, rRel, onFields) {
    joins.push(swivel.join.inner(lRel, rRel, onFields));
  };

  // Private

  return _model;
};
