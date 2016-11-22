const loader = new THREE.JSONLoader();
const aliases = [
  'xShipCloud',
  'xShipBody',
  'xShipRear',
  'xTriangle',
  'xChunk',
  'sphereBgGeo'
];
const urls = [
  'meshes/xShip-cloud.json',
  'meshes/xShip-body.json',
  'meshes/xShip-rear.json',
  'meshes/x-triangle.json',
  'meshes/x-chunk.json',
  'meshes/sphere-bg.json'
];

const promises = urls.map(loadAsset);
const parsedResults = Promise
  .all(promises)
  .then( results => parseResults(results, aliases) );

function loadAsset (url) {
  return new Promise(resolve => {
    loader.load( url, geometry => resolve(geometry) );
  });
}

function parseResults (results, aliases) {
  return results.reduce( (obj, result, index) => {
    obj[aliases[index]] = result;
    return obj;
  }, {});
}

export { promises, parsedResults };

