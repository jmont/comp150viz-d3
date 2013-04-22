createNode = (id) -> { id: id, children: []}
createLeaf = (id, data) -> createNode(id).data = data

exists = (id, ns) ->
  found = false
  for n in ns
    if n.id == id
      found = true
    else
      found = exists id, n.children
  found

addData = (id, data, ns) ->
  for n in ns
    if n.id == id
      n.data = data
    else
      addData id, data, n.children

addNode = (node, ns) -> ns.push node if !exists(node.id, ns)

addChild = (pid, child, ns) ->
  for n in ns
    if n.id == pid
      n.children.push child
    else
      addChild pid, child, n.children

getValue = (n) ->
  if n and n.children.length > 0
    n.children.map((c) -> getValue c).reduce((c, sum) -> c + sum)
  else
    n.data

getMaxVal = (ns) ->
  return ns.data if ns and ns.children.length < 1
  return null if !ns
  nsP = []
  max = ns.children.splice(0,1)[0]
  for n in ns.children
    if getValue(n) > getValue(max)
      nsP.push max
      max = n
    else
      nsP.push n
  ns.children = nsP
  {max: max, ns: ns}

# the closer to zero the better
howSquare = (ratio, value, shortLength) ->
  area = value / ratio
  side = area / shortLength
  aspectRatio = side / shortLength
  dist = (aspectRatio - 1)
  if dist < 0 then dist*-1 else dist

treemap = (canvas, color, ns, x, y, w, h) ->
  return if ns.children.length < 1

  canvasArea = w*h
  totalValue = getValue ns
  vaRatio = totalValue / canvasArea
  result = getMaxVal ns; c1 = result.max; nsNew = result.ns;
  if nsNew and nsNew.children.length > 1
    result = getMaxVal nsNew; c2 = result.max; nsNewNew = result.ns;

    isWShort = w < h
    shrtLen = if isWShort then w else h

    if howSquare(vaRatio, c1.data, shrtLen) < howSquare(vaRatio, c2.data, shrtLen)
      dimensions = if isWShort then {w: shrtLen, h: (c1.data * canvasArea) / totalValue / shrtLen} else {w: (c1.data * canvasArea) / totalValue / shrtLen, h: shrtLen}
      node = {n: c1, size: dimensions}
      nsNewNew.children.push c2
    else
      dimensions = if isWShort then {w: shrtLen, h: (c2.data * canvasArea) / totalValue / shrtLen} else {w: (c2.data * canvasArea) / totalValue / shrtLen, h: shrtLen}
      node = {n: c2, size: dimensions}
      nsNewNew.children.push c1
  else
    isWShort = w < h
    shrtLen = if isWShort then w else h
    dimensions = if isWShort then {w: shrtLen, h: (c1.data * canvasArea) / totalValue / shrtLen} else {w: (c1.data * canvasArea) / totalValue / shrtLen, h: shrtLen}
    node = {n: c1, size: dimensions}
    nsNewNew = nsNew

  canvas.selectAll('rect'+node.n.id).data([node]).enter()
        .append('rect')
        .attr('x', x)
        .attr('y', y)
        .attr('width', (n) -> n.size.w)
        .attr('height', (n) -> n.size.h)
        .style('fill', (n) -> if n.n.data then color(n.n.data) else 'none')

  if isWShort
    treemap canvas, color, nsNewNew, x, (y + node.size.h), w, (h - node.size.h)
  else
    treemap canvas, color, nsNewNew, (x + node.size.w), y, (w - node.size.w), h

squarify = (json) ->
  w = 800
  h = 600

  canvas = d3.select('body').append('svg:svg')
             .style('position', 'relative')
             .style('width', w + 'px')
             .style('height', h + 'px')
             .style('background', '#edf3ff')

  treemap canvas, d3.scale.category20c(), json[0], 0, 0, w, h

cell = ->
  this.style('left', (d) -> d.x + "px")
      .style('top', (d) -> d.y + "px")
      .style('width', (d) -> d.dx - 1 + "px")
      .style('height', (d) -> d.dy - 1 + "px")

squarifyD3 = (json) ->
  console.log json
  w = 800
  h = 600
  color = d3.scale.category20c()

  treemap = d3.layout.treemap()
              .size([w, h])
              .sticky(true)
              .value((d) -> d.data)

  canvas = d3.select('#canvas')
             .style('position', 'relative')
             .style('width', w + 'px')
             .style('height', h + 'px')

  # d3.json(json, function(json) {
  canvas.data(json).selectAll('.cell')
        .data(treemap.nodes)
        .enter().append('div')
        .attr('class', 'cell')
        .style('background', (d) -> if d.children.length < 1 then color(d.data) else null)
        .call(cell)
        .text((d) -> if d.children.length > 0 then null else String(d.data))

$ ->
  toJSON = (csvPath, success) ->
    dataStr = $.get csvPath, false, (data) ->
      strLines = data.split('\n')
      k = Number strLines.splice(0,1)[0]

      leafIdDataTemp = strLines.splice(0,k)
      leafIdData = []
      for i in [0..leafIdDataTemp.length-1] by 1
        leafIdData[i] = leafIdDataTemp[i].split(',').map((x) -> Number x)

      n = Number strLines.splice(0,1)[0]

      nodeIdChildIdTemp = strLines.splice(0,n)
      nodeIdChildId = []
      for i in [0..nodeIdChildIdTemp.length-1] by 1
        nodeIdChildId[i] = nodeIdChildIdTemp[i].split(',').map((x) -> Number x)

      tree = []
      for n in nodeIdChildId
        node = createNode n[0]
        cid = n[1]

        addNode node, tree
        addChild node.id, (createNode cid), tree

      for l in leafIdData
        addData l[0], l[1], tree

      success tree

  toJSON "basic.csv", squarify
