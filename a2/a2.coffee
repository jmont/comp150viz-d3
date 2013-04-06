$ ->
  rows = []

  printRows = ->
    for r in rows
      console.log r.L1

  succ = (data) ->
    rows = data
    printRows()

  d3.csv("viz.csv", succ)
