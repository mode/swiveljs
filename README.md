![status](https://travis-ci.org/mode/swiveljs.svg?branch=master)
[![Coverage Status](https://coveralls.io/repos/mode/swiveljs/badge.svg?branch=master)](https://coveralls.io/r/mode/swiveljs?branch=master)

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
