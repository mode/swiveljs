```
Faceting

Grouped Facet

swivel(dataset.content)
.facet('team')
.group('season')
.sum('yards')

[
{
  key: 'ARI',
  values: [
  {season: 1970, yards: 1079}
  ]
}
]

Pivoted Facet

swivel(dataset.content)
.facet('team')
.pivot('season')
.sum('yards')

[
{
  key: 'ARI',
  values: { 1970: 1079, 1971: 1600 }
}
]

swivel(dataset.content)
.group('quarter')
.facet('team', { as: 'teams', scales: true, } )
.group('season')
.sum('yards')

OUTPUT

[
{
  quarter: 1,
  teams: [{
    key: 'ARI',

    values: [
    {season: 1970, yards: 1079}
    ]
    }, ...]
    },
    ...
    ]

    swivel(dataset.content)
    .group('quarter')
    .facet('team', { as: 'teams'} )
    .sum('yards', { collapse: false })

    OUTPUT

    [
    {
      quarter: 1,
      teams: [{
        key: 'ARI',
        values: {yards: 1079}
        }, ...]
        },
        ...
        ]
        ```

        ```
        swivel(dataset.content)
        .group('season')
        .pivot('team')
        .sum('yards', { as: 'Total Yards' })
        .average('age', { as: 'Average Age' })
        ```
