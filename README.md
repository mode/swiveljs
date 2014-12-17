```
{
  fields: [
    {type: 'group',   name: 'season'},
    {type: 'pivot',   name: 'team'},
    {type: 'sum',     name: 'yards', as: 'Total Yards'},
    {type: 'average', name: 'age', as: 'Total Yards'}
  ]
}

swivel(dataset.content)
  .group('quarter')
  .pivot('season')
  .sum('yards')
```
