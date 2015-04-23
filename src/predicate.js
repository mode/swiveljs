swivel.predicate = function() {
  var left  = {};
  var right = {};

  // this could be a function as well as a built-in op

  var _predicate = {
    evaluate: evaluate
  };

  // Public

  // TRUE, FALSE, or UNDEFINED
  function evaluate(lTuple, rTuple) {
    // how do we evaluate this?
  };

  // Private

  return _predicate;
};
