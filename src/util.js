swivel.args = function(args) {
  return Array.prototype.slice.call(args, 0);
};

swivel.merge = function(target, source) {
  for (var attr in source) {
    target[attr] = source[attr];
  }
};
