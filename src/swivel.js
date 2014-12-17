function swivel(rows) {
  var tree     = swivel.tree();
  var traveler = swivel.traveler(tree);

  if(typeof rows !== 'undefined') {
    traveler.data(rows);
  }

  return traveler;
};
