swivel.joins = {
  LEFT:  'LEFT',
  RIGHT: 'RIGHT',
  INNER: 'INNER',
  OUTER: 'OUTER'
};

swivel.join = function(type) {
  var conds = {};

  var _join = {
  };

  // Public

  // Private

  return _join;
};

// on is an array of pairs
swivel.join.left = function(lRel, rRel, on) {
  return swivel.join(swivel.joins.LEFT)
};

swivel.join.right = function(lRel, rRel, on) {
  return swivel.join(swivel.joins.RIGHT);
};

swivel.join.inner = function(lRel, rRel, on) {
  return swivel.join(swivel.joins.INNER);
};

swivel.join.outer = function(lRel, rRel, on) {
  return swivel.join(swivel.joins.OUTER)
};
