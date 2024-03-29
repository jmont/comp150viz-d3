// Generated by CoffeeScript 1.4.0
(function() {
  var addChild, addData, addNode, cell, createLeaf, createNode, exists, getMaxVal, getValue, howSquare, squarify, squarifyD3, treemap;

  createNode = function(id) {
    return {
      id: id,
      children: []
    };
  };

  createLeaf = function(id, data) {
    return createNode(id).data = data;
  };

  exists = function(id, ns) {
    var found, n, _i, _len;
    found = false;
    for (_i = 0, _len = ns.length; _i < _len; _i++) {
      n = ns[_i];
      if (n.id === id) {
        found = true;
      } else {
        found = exists(id, n.children);
      }
    }
    return found;
  };

  addData = function(id, data, ns) {
    var n, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = ns.length; _i < _len; _i++) {
      n = ns[_i];
      if (n.id === id) {
        _results.push(n.data = data);
      } else {
        _results.push(addData(id, data, n.children));
      }
    }
    return _results;
  };

  addNode = function(node, ns) {
    if (!exists(node.id, ns)) {
      return ns.push(node);
    }
  };

  addChild = function(pid, child, ns) {
    var n, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = ns.length; _i < _len; _i++) {
      n = ns[_i];
      if (n.id === pid) {
        _results.push(n.children.push(child));
      } else {
        _results.push(addChild(pid, child, n.children));
      }
    }
    return _results;
  };

  getValue = function(n) {
    if (n && n.children.length > 0) {
      return n.children.map(function(c) {
        return getValue(c);
      }).reduce(function(c, sum) {
        return c + sum;
      });
    } else {
      return n.data;
    }
  };

  getMaxVal = function(ns) {
    var max, n, nsP, _i, _len, _ref;
    if (ns && ns.children.length < 1) {
      return ns.data;
    }
    if (!ns) {
      return null;
    }
    nsP = [];
    max = ns.children.splice(0, 1)[0];
    _ref = ns.children;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      n = _ref[_i];
      if (getValue(n) > getValue(max)) {
        nsP.push(max);
        max = n;
      } else {
        nsP.push(n);
      }
    }
    ns.children = nsP;
    return {
      max: max,
      ns: ns
    };
  };

  howSquare = function(ratio, value, shortLength) {
    var area, aspectRatio, dist, side;
    area = value / ratio;
    side = area / shortLength;
    aspectRatio = side / shortLength;
    dist = aspectRatio - 1;
    if (dist < 0) {
      return dist * -1;
    } else {
      return dist;
    }
  };

  treemap = function(canvas, color, ns, x, y, w, h) {
    var c1, c2, canvasArea, dimensions, isWShort, node, nsNew, nsNewNew, result, shrtLen, totalValue, vaRatio;
    if (ns.children.length < 1) {
      return;
    }
    canvasArea = w * h;
    totalValue = getValue(ns);
    vaRatio = totalValue / canvasArea;
    result = getMaxVal(ns);
    c1 = result.max;
    nsNew = result.ns;
    if (nsNew && nsNew.children.length > 1) {
      result = getMaxVal(nsNew);
      c2 = result.max;
      nsNewNew = result.ns;
      isWShort = w < h;
      shrtLen = isWShort ? w : h;
      if (howSquare(vaRatio, c1.data, shrtLen) < howSquare(vaRatio, c2.data, shrtLen)) {
        dimensions = isWShort ? {
          w: shrtLen,
          h: (c1.data * canvasArea) / totalValue / shrtLen
        } : {
          w: (c1.data * canvasArea) / totalValue / shrtLen,
          h: shrtLen
        };
        node = {
          n: c1,
          size: dimensions
        };
        nsNewNew.children.push(c2);
      } else {
        dimensions = isWShort ? {
          w: shrtLen,
          h: (c2.data * canvasArea) / totalValue / shrtLen
        } : {
          w: (c2.data * canvasArea) / totalValue / shrtLen,
          h: shrtLen
        };
        node = {
          n: c2,
          size: dimensions
        };
        nsNewNew.children.push(c1);
      }
    } else {
      isWShort = w < h;
      shrtLen = isWShort ? w : h;
      dimensions = isWShort ? {
        w: shrtLen,
        h: (c1.data * canvasArea) / totalValue / shrtLen
      } : {
        w: (c1.data * canvasArea) / totalValue / shrtLen,
        h: shrtLen
      };
      node = {
        n: c1,
        size: dimensions
      };
      nsNewNew = nsNew;
    }
    canvas.selectAll('rect' + node.n.id).data([node]).enter().append('rect').attr('x', x).attr('y', y).attr('width', function(n) {
      return n.size.w;
    }).attr('height', function(n) {
      return n.size.h;
    }).style('fill', function(n) {
      if (n.n.data) {
        return color(n.n.data);
      } else {
        return 'none';
      }
    });
    if (isWShort) {
      return treemap(canvas, color, nsNewNew, x, y + node.size.h, w, h - node.size.h);
    } else {
      return treemap(canvas, color, nsNewNew, x + node.size.w, y, w - node.size.w, h);
    }
  };

  squarify = function(json) {
    var canvas, h, w;
    w = 800;
    h = 600;
    canvas = d3.select('body').append('svg:svg').style('position', 'relative').style('width', w + 'px').style('height', h + 'px').style('background', '#edf3ff');
    return treemap(canvas, d3.scale.category20c(), json[0], 0, 0, w, h);
  };

  cell = function() {
    return this.style('left', function(d) {
      return d.x + "px";
    }).style('top', function(d) {
      return d.y + "px";
    }).style('width', function(d) {
      return d.dx - 1 + "px";
    }).style('height', function(d) {
      return d.dy - 1 + "px";
    });
  };

  squarifyD3 = function(json) {
    var canvas, color, h, w;
    console.log(json);
    w = 800;
    h = 600;
    color = d3.scale.category20c();
    treemap = d3.layout.treemap().size([w, h]).sticky(true).value(function(d) {
      return d.data;
    });
    canvas = d3.select('#canvas').style('position', 'relative').style('width', w + 'px').style('height', h + 'px');
    return canvas.data(json).selectAll('.cell').data(treemap.nodes).enter().append('div').attr('class', 'cell').style('background', function(d) {
      if (d.children.length < 1) {
        return color(d.data);
      } else {
        return null;
      }
    }).call(cell).text(function(d) {
      if (d.children.length > 0) {
        return null;
      } else {
        return String(d.data);
      }
    });
  };

  $(function() {
    var toJSON;
    toJSON = function(csvPath, success) {
      var dataStr;
      return dataStr = $.get(csvPath, false, function(data) {
        var cid, i, k, l, leafIdData, leafIdDataTemp, n, node, nodeIdChildId, nodeIdChildIdTemp, strLines, tree, _i, _j, _k, _l, _len, _len1, _ref, _ref1;
        strLines = data.split('\n');
        k = Number(strLines.splice(0, 1)[0]);
        leafIdDataTemp = strLines.splice(0, k);
        leafIdData = [];
        for (i = _i = 0, _ref = leafIdDataTemp.length - 1; _i <= _ref; i = _i += 1) {
          leafIdData[i] = leafIdDataTemp[i].split(',').map(function(x) {
            return Number(x);
          });
        }
        n = Number(strLines.splice(0, 1)[0]);
        nodeIdChildIdTemp = strLines.splice(0, n);
        nodeIdChildId = [];
        for (i = _j = 0, _ref1 = nodeIdChildIdTemp.length - 1; _j <= _ref1; i = _j += 1) {
          nodeIdChildId[i] = nodeIdChildIdTemp[i].split(',').map(function(x) {
            return Number(x);
          });
        }
        tree = [];
        for (_k = 0, _len = nodeIdChildId.length; _k < _len; _k++) {
          n = nodeIdChildId[_k];
          node = createNode(n[0]);
          cid = n[1];
          addNode(node, tree);
          addChild(node.id, createNode(cid), tree);
        }
        for (_l = 0, _len1 = leafIdData.length; _l < _len1; _l++) {
          l = leafIdData[_l];
          addData(l[0], l[1], tree);
        }
        return success(tree);
      });
    };
    return toJSON("basic.csv", squarify);
  });

}).call(this);
