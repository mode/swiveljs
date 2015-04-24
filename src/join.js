swivel.joins = {
  LEFT:  'LEFT',
  RIGHT: 'RIGHT',
  INNER: 'INNER',
  OUTER: 'OUTER'
};

swivel.join = function(type, lRel, rRel, onFields) {
  var _join = {
  };

  // Public

  // Private

  return _join;
};

swivel.join.left = function(lRel, rRel, onFields) {
  return swivel.join(swivel.joins.LEFT, lRel, rRel, onFields)
};

swivel.join.right = function(lRel, rRel, onFields) {
  return swivel.join(swivel.joins.RIGHT, lRel, rRel, onFields);
};

swivel.join.inner = function(lRel, rRel, onFields) {
  return swivel.join(swivel.joins.INNER, lRel, rRel, onFields);
};

swivel.join.outer = function(lRel, rRel, onFields) {
  return swivel.join(swivel.joins.OUTER, lRel, rRel, onFields)
};
