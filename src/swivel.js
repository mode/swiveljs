/*

Usage:

1. Create a new swivel

var Swivel = new Swivel(dataset);

2. Group the swivel by a subset of available fields

var byFields = Swivel.groupBy(<field1>[, <field2>, ...]);

3. Pivot the grouping by a given field by flattening all fields to the left

var pivotByField = byFields.pivotLeft(<field>[, <callback>]);

<callback>(rows[, group])
A function that takes as its arguments an array of rows for each distinct
group of field values in the grouping. Second parameter is an object with
the group fields and values for those fields.

Returns a javascript object representing the set of values to be included
in the flattened row.

Defaults to Swivel.Grouping.Count

Example:

d3.json('dataset.json', function(dataset) {
var swivel = new Swivel(dataset.content);
var byTeamSeason = swivel.groupBy('team', 'season');
var pivotByTeamSeason = byTeamSeason.pivotLeft('season');

console.log("pivotByTeamSeason", pivotByTeamSeason);
});

Built-in Aggregates:

Swivel.Grouping.count()
Swivel.Grouping.countUnique(<field>[, <fieldName>])

Swivel.Grouping.sum(<field>[, <fieldName>])
Swivel.Grouping.average(<field>[, <fieldName>])
Swivel.Grouping.median(<field>[, <fieldName>])
Swivel.Grouping.stdDev(<field>[, <fieldName>])

<field>
the field in the dataset that you want to aggregate over

<fieldName>
The name of the field in the flattened row, defaults to <field>
*/

function swivel(rows) {
  var _swivel = {
    rows: rows,
    groupBy: groupBy
  };

  function groupBy() {
    var fields = swivel.util.argArray(arguments);
    // return swivel.grouping(this, fields)
    return (swivel.groupBy(_swivel, fields)).groupAll();
  }

  return _swivel;
};
