swivel.args = function(args) {
  return Array.prototype.slice.call(args, 0);
};

swivel.merge = function(target, source) {
  for (var attr in source) {
    target[attr] = source[attr];
  }
};

swivel.uniq = function(arr) {
  u = {};

  for(var i = 0; i < arr.length; i++) {
    u[arr[i]] = 1
  }

  return Object.keys(u);
}
