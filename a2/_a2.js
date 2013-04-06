function DataStore(csv, dataWasLoaded) {
  this.rows = []
  d3.csv(csv, function(rows) {
    this.rows = rows;
    dataWasLoaded(this);
  });
}

DataStore.prototype.printData = function () {
  for (r in this.rows) {
    console.log(r);
  }
}

$(function () {

  var dataWasLoaded = function (dataStore) {
    dataStore.printData();
  }

  var ds = new DataStore("viz.csv", dataWasLoaded);
});