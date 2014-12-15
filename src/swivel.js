/*

  Usage:

  1. Create a new swivel

    var swizzle = swivel(dataset);

  2. Group the swivel by a subset of available fields

    var byFields = swizzle.groupBy(<fieldName1>[, <fieldName2>, ...]);

  3. Pivot the grouping by a given field by flattening all fields to the left

    var pivotByField = byFields.pivotLeft(<fieldName>[, <callback>]);

    <callback>(rows)
      A function that takes as its arguments an array of rows for each distinct
      group of field values in the grouping. Second parameter is an object with
      the group fields and values for those fields.

      Returns a javascript object representing the set of values to be included
      in the flattened row.

      Defaults to swivel.count

  Example:

    d3.json('dataset.json', function(dataset) {
      var swizzle = swivel(dataset.content);
      var byTeamSeason = swizzle.groupBy('team', 'season');
      var pivotByTeamSeason = byTeamSeason.pivotLeft('season');

      console.log("pivotByTeamSeason", pivotByTeamSeason);
    });

  Built-in Aggregates:

    swivel.count()
    swivel.countUnique(<field>[, <alias>])

    swivel.sum(<field>[, <alias>])
    swivel.average(<field>[, <alias>])
    swivel.median(<field>[, <alias>])
    swivel.stdDev(<field>[, <alias>])

    <field>
      the field in the dataset that you want to aggregate over

    <alias>
      The name of the field in the swivelled result, defaults to <field>
*/

// swivel.data = function(rows) {
//   // this is the traveler then?.. Then traveler should just have data
// }

function swivel(rows) {
  var swizzle = {
    group: group
  };
  
  function group() {
    var fields = swivel.util.argArray(arguments);

    var map  = swivel.map(fields);
    var tree = swivel.tree(fields);
    return swivel.traveler(tree, map).data(rows);
  };

  return swizzle;
};
