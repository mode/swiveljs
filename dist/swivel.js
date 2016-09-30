function swivel(initData) {
  var path    = [];
  var aggs    = [];
  var filters = [];
  var tree    = swivel.tree();
  var data    = initData || [];

  // Return Object
  var _swivel = {
    all: all,
    group: group,
    pivot: pivot,
    filter: filter,
    config: config,
    concat: concat,
    aggregate: aggregate,
    sum: sum,
    count: count,
    countUnique: countUnique,
    average: average,
    median: median,
    stdDev: stdDev
  };

  // Public

  function concat(rows) {
    data = data.concat(rows);

    return this;
  };

  function config(config) {
    if(typeof config['fields'] === 'undefined') {
      var cFields = [];
    } else {
      var cFields = config['fields'];
    }

    if(typeof config['transforms'] === 'undefined') {
      var cTransforms = [];
    } else {
      var cTransforms = config['transforms'];
    }

    if(typeof config['aggregates'] === 'undefined') {
      var cAggregates = [];
    } else {
      var cAggregates = config['aggregates'];
    }

    for(var i = 0; i < cFields.length; i++) {
      var f = cFields[i];

      this[f['type']](f['name']);
    }

    for(var i = 0; i < cTransforms.length; i++) {
      var t = cTransforms[i];

      if(t['type'] == 'filter') {
        filter(t['test']);
      }
    }

    for(var i = 0; i < cAggregates.length; i++) {
      var a = cAggregates[i];

      aggregate(a['type'], a['field'], { 'as': a['as'] });
    }

    return this;
  };

  function group() {
    var fields = [].concat(swivel.args(arguments));

    for(var i = 0; i < fields.length; i++) {
      tree.field(fields[i]);
      path.push({'type': 'group', 'name': fields[i]});
    }

    return this;
  }

  function pivot() {
    var fields = [].concat(swivel.args(arguments));

    for(var i = 0; i < fields.length; i++) {
      tree.field(fields[i]);
      path.push({'type': 'pivot', 'name': fields[i]});
    }

    return this;
  };

  function filter(expr) {
    filters.push(Function("row", "return " + expr + ";"));

    return this;
  };

  function aggregate(type, field, opts) {
    if(typeof opts === 'undefined') {
      opts = {};
    }

    aggs.push({
      'as': opts['as'] || field,
      'callback': swivel.aggregate(type, field, opts)
    });

    return this;
  };

  function count(field, opts) {
    return aggregate.call(this, 'count', field, opts);
  };

  function countUnique(field, opts) {
    return aggregate.call(this, 'countUnique', field, opts);
  };

  function sum(field, opts) {
    return aggregate.call(this, 'sum', field, opts);
  };

  function average(field, opts) {
    return aggregate.call(this, 'average', field, opts);
  };

  function median(field, opts) {
    return aggregate.call(this, 'median', field, opts);
  };

  function stdDev(field, opts) {
    return aggregate.call(this, 'stdDev', field, opts);
  };

  function all() {
    insertAll();

    var allFieldValues = function(fieldName) {
      if(tree.isEmpty()) {
        return [];
      } else {
        return Object.keys(tree.getValues(fieldName));
      }
    };

    var traverseFields = function(fieldType, tOrder, callback) {
      var stack = [];

      if(typeof(fieldType) === 'undefined')
        fieldType = 'all'

      if(typeof(tOrder) === 'undefined')
        tOrder = 'dfs'

      var initStack = function() {
        stack.push({
          depth: -1, path: [],
          node: tree.getRoot()
        });
      }

      var fieldValues = {}
      for(var i = 0; i < path.length; i++) {
        var fieldName = path[i].name;
        fieldValues[fieldName] = allFieldValues(fieldName).sort();
      }

      initStack();
      while(stack.length > 0) {
        if(tOrder === 'dfs') {
          var currElem = stack.pop();
        } else if(tOrder === 'bfs') {
          var currElem = stack.shift();
        } else {
          throw "Unknown Traversal Order " + tOrder
        }

        var currNode  = currElem.node;
        var currPath  = currElem.path;
        var currDepth = currElem.depth;

        var pIndex = currDepth + 1;
        if(pIndex >= path.length) {
          callback(currPath, currNode);
        } else {
          var fValues = fieldValues[path[pIndex].name];

          for(var j = 0; j < fValues.length; j++) {
            var fieldValue = fValues[j];
            var nextPath = currPath.slice();
            if(fieldType === 'all' || path[pIndex].type === fieldType) {
              nextPath.push(fieldValue);
            }

            if(!(fieldValue in currNode)) {
              callback(nextPath, [])
            } else {
              stack.push({ depth: pIndex, path: nextPath, node: currNode[fieldValue] });
            }
          }
        }
      }
    }

    var result = {
      values: function(fieldName) {
        if(tree.isEmpty()) {
          return [];
        } else {
          return Object.keys(tree.getValues(fieldName));
        }
      },

      pivotFieldValues: function() {
        var fieldValues = [];

        for(var i = 0; i < path.length; i++) {
          if(path[i].type === 'pivot')
            fieldValues[i] = this.values(path[i].name).sort();
        }

        return fieldValues;
      },

      /*
       * @param fType  Field Type either 'group', 'pivot', or 'all'
       * @param tOrder Traversal order either 'depth' or 'breadth'
       */
      pathValues: function(fieldType, tOrder) {
        var pathValues = {};

        traverseFields(fieldType, tOrder, function(pathKey, values) {
          if(pathKey in pathValues) {
            pathValues[pathKey].values.concat(values);
          } else {
            pathValues[pathKey] = { path: pathKey, values: values };
          }
        });

        return pathValues;
      },

      subTree: function(fieldType, tOrder) {
        var subTree = { depth: -1, name: 'root', counter: 0, children: {} };

        var incrPathCounters = function(pathKey) {
          var currNode = subTree;
        }

        traverseFields(fieldType, tOrder, function(pathKey, values) {
          var currNode = subTree;

          for(var i = 0; i < pathKey.length; i++) {
            var pathVal = pathKey[i];

            if(!(pathVal in currNode.children)) {
              if(i == pathKey.length - 1) { // Turning over a new leaf
                console.log("NEW LEAF AT", pathKey);
                var prevNode = currNode;
                while(parent in prevNode) {
                  prevNode.counter += 1;
                  prevNode = prevNode.parent;
                }
              }

              currNode.children[pathVal] = { depth: i, name: pathVal, parent: currNode, children: {}, counter: 0, visited: false };
            }

            if(i == pathKey.length - 1) {
              currNode.children[pathVal].values = values;
            }

            currNode = currNode.children[pathVal];
          }
        });

        return subTree;
      },

      prefixValues: function(fieldType, tOrder) {
        var prefixVals = {};

        // build a prefix trie with counts here

        traverseFields(fieldType, tOrder, function(pathKey, values) {
          for(var i = 0; i < pathKey.length; i++) {
            var prefixLen = i + 1;
            var prefixKey = pathKey.slice(0, prefixLen);

            if(!(prefixLen in prefixVals)) {
              prefixVals[prefixLen] = {};
            }

            if(prefixKey in prefixVals) {
              prefixVals[prefixLen][prefixKey].values.concat(values);
            } else {
              prefixVals[prefixLen][prefixKey] = { prefix: prefixKey, values: values };
            }
          }
        });

        for(prefixLen in prefixVals) {
          for(prefixKey in prefixVals[prefixLen]) {
            var values = prefixVals[prefixLen][prefixKey].values;
            prefixVals[prefixLen][prefixKey].values = swivel.uniq(values);
          }
        }

        return prefixVals;
      }
    };

    // this isn't right, should be if the *first* field is a row

    if(tree.isEmpty()) {
      result['data'] = [];
    } else {
      if(path[0]['type'] == 'group') {
        result['data'] = visitRows(tree.getRoot(), 0);
      } else {
        result['data'] = visitColumn(tree.getRoot(), 0);
      }
    }

    return result;
  }

  // Private

  function insertAll() {
    for(var rowIdx = 0; rowIdx < data.length; rowIdx++) {
      var row = data[rowIdx];

      var included = true;
      for(var i = 0; i < filters.length; i++) {
        if(filters[i](row) == false) {
          included = false;
          break;
        }
      }

      if(included) {
        tree.insert(row, rowIdx);
      }
    }

    console.log(tree.getRoot())
  }

  function getPathFields() {
    var names = [];
    for(var i = 0; i < path.length; i++) {
      names.push(path[i]['name']);
    }
    return names;
  };

  function visitValues(node) {
    var nodeRows = [];
    for(var i = 0; i < node.length; i++) {
      nodeRows.push(data[node[i]]);
    }

    var values  = {};
    for(var i = 0; i < aggs.length; i++) {
      var agg = aggs[i];
      values[agg['as']] = agg['callback'](nodeRows);
    }

    return values;
  };

  function visitRows(node, fieldIdx) {
    var rows = [];

    var currFields   = [];
    var nextFieldIdx = fieldIdx;
    var fieldNames   = getPathFields();

    for(var i = fieldIdx; i < fieldNames.length; i++) {
      if(path[i]['type'] == 'group') {
        nextFieldIdx += 1;
        currFields.push(fieldNames[i]);
      } else {
        break;
      }
    }

    var nextField = path[nextFieldIdx];
    tree.eachBranch({}, node, currFields, 0, function(node, branch) {
      var row = {};
      swivel.merge(row, branch);

      // no more fields available
      if(nextFieldIdx == fieldNames.length) {
        swivel.merge(row, visitValues(node));
      } else if(nextField['type'] == 'pivot') {
        swivel.merge(row, visitColumn(node, nextFieldIdx));
      }

      rows.push(row);
    });

    return rows;
  };

  function visitColumn(node, fieldIdx) {
    var row = {};

    var nextFieldIdx = fieldIdx + 1;
    var fieldNames   = getPathFields();
    var nextField    = path[nextFieldIdx];

    tree.eachValue(node, fieldIdx, function(node, value) {
      var colValue = {};

      if(typeof(node) === 'undefined') { // No branch at this value
        colValue[value] = null;
      } else if(nextFieldIdx == fieldNames.length) { // No more fields
         var values = visitValues(node);

        // Lift single values up to the higher level (make optional)
        var valueKeys = Object.keys(values);
        if(valueKeys.length == 1) {
          colValue[value] = values[valueKeys[0]];
        } else {
          colValue[value] = values;
        }

      } else if(nextField['type'] == 'group') {
        colValue[value] = visitRows(node, nextFieldIdx);
      } else if(nextField['type'] == 'pivot') {
        colValue[value] = visitColumn(node, nextFieldIdx);
      }

      swivel.merge(row, colValue);
    });

    return row;
  };


  return _swivel;
};

//Export to CommonJS/Node format
if (typeof exports !== 'undefined') {
  if (typeof module !== 'undefined' && module.exports) {
    exports = module.exports = swivel;
  }
  exports.swivel = swivel;
} else if (typeof define === 'function' && define.amd) {
  define('swivel', function() {
    return swivel;
  });
} else {
  // no exports so attach to global
  this['swivel'] = swivel;
}

swivel.tree = function() {
  var root   = {};
  var values = {};
  var fields = [];
  var empty  = true;

  var _tree = {
    field: field,
    insert: insert,
    isEmpty: isEmpty,
    getRoot: getRoot,
    getValues: getValues,
    eachValue: eachValue,
    eachBranch: eachBranch
  };

  // Public

  function field(name) {
    fields.push(name);
  };

  function isEmpty() {
    return empty;
  };

  function getRoot() {
    return root;
  };

  function getValues(fieldName) {
    if(typeof values[fieldName] === 'undefined') {
      return [];
    } else {
      return values[fieldName];
    }
  };

  function insert(row, rowIdx) {
    empty = false;
    insertOne(root, row, rowIdx, fields, 0);
  };

  function eachValue(node, fieldIdx, callback) {
    var field     = fields[fieldIdx];
    var counts    = values[field];
    var valueKeys = Object.keys(counts);

    for(var v = 0; v < valueKeys.length; v++) {
      var valueKey = valueKeys[v];
      var childNode = node[valueKey];

      callback(childNode, valueKey);
    }
  };

  function eachBranch(branch, node, path, depth, callback) {
    if(depth == path.length) {
      return callback(node, branch);
    }

    var field     = path[depth];
    var fValues   = values[field];
    var valueKeys = Object.keys(fValues);

    // add to group and recurse
    for(var v = 0; v < valueKeys.length; v++) {
      var valueKey = valueKeys[v];
      var childNode = node[valueKey];

      if(typeof childNode !== "undefined") {
        branch[field] = valueKey;
        eachBranch(branch, childNode, path, depth + 1, callback);
        delete branch[field];
      }
    }
  };

  // Private

  function insertOne(node, row, rowIdx, path, depth) {
    var field      = path[depth];
    var value      = row[field];
    var isLeafNode = (depth + 1 == path.length);

    // Insert Field

    if(!(field in values)) {
      values[field] = {};
    }

    // Update Field Count

    if(!(value in values[field])) {
      values[field][value] = true;
    }

    // Insert Group

    if(!(value in node)) {
      if(isLeafNode) {
        node[value] = [];
      } else {
        node[value] = {};
      }
    }

    // Terminate: Insert Row Index
    // Continue:  Recurse Into Field List

    if(isLeafNode) {
      node[value].push(rowIdx);
    } else {
      insertOne(node[value], row, rowIdx, path, depth + 1);
    }
  };

  return _tree;
}

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

swivel.average = function(field) {
  return function(rows, group) {
    var value = NaN;

    if(rows.length > 0) {
      var sum = 0;
      for(var r = 0; r < rows.length; r++) {
        sum += rows[r][field];
      }

      value = sum / rows.length;
    }

    return value;
  };
};

swivel.count = function() {
  return function(rows) {
    return rows.length;
  };
};

swivel.countUnique = function(field) {
  return function(rows) {
    var values = {};
    for(var r = 0; r < rows.length; r++) {
      var value = +rows[r][field];

      if(!(value in values)) {
        values[value] = true
      }
    }

    return Object.keys(values).length;
  };
};

swivel.median = function(field) {
  return function(rows) {
    var values = [];
    for(var r = 0; r < rows.length; r++) {
      values.push(+rows[r][field]);
    }

    var value = NaN;

    values.sort( function(a,b) { return a - b; } );
    var midPoint = Math.floor(values.length / 2);

    if(values.length % 2 == 0) {
      value = (values[midPoint - 1] + values[midPoint]) / 2.0;
    } else {
      value = values[midPoint];
    }

    return value;
  };
};

swivel.stdDev = function(field) {
  var average = function(rows) {
    var sum = 0;
    for(var i = 0; i < rows.length; i++) {
      sum += rows[i][field];
    }
    return sum / rows.length;
  };

  var sqDiffs = function(avg, rows) {
    var diffs = []
    for(var i = 0; i < rows.length; i++) {
      var diff = rows[i][field] - avg;
      diffs.push(diff * diff);
    }
    return diffs;
  };

  return function(rows, group) {
    if(rows.length == 0) {
      return NaN;
    };

    var avg = average(rows);

    var diffs = sqDiffs(avg, rows);

    var sqDiffSum = 0;
    for(var i = 0; i < diffs.length; i++) {
      sqDiffSum += diffs[i];
    }
    var avgSqDiff = sqDiffSum / diffs.length;

    return Math.sqrt(avgSqDiff);
  };
};

swivel.sum = function(field) {
  return function(rows) {
    var sum = 0;

    for(var r = 0; r < rows.length; r++) {
      var value = +rows[r][field];

      if(value === NaN) {
        return NaN;
        break;
      } else if(typeof value !== 'number') {
        return NaN;
        break;
      } else {
        sum += value;
      }
    }

    return sum;
  };
};
