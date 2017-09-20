export interface IGeometriesDictionary {
  [key: string]: THREE.Geometry;
}

const loader = new THREE.JSONLoader();
const aliases = [
  'xShipCloud',
  'xShipBody',
  'xShipRear',
  'xTriangle',
  'xChunk',
  'sphereBgGeo',
];
const urls = [
  'meshes/xShip-cloud.json',
  'meshes/xShip-body.json',
  'meshes/xShip-rear.json',
  'meshes/x-triangle.json',
  'meshes/x-chunk.json',
  'meshes/sphere-bg.json',
];

const promises = urls.map(loadAsset);
const parsedResults = Promise.all(promises).then((results: THREE.Geometry[]) =>
  parseResults(results)
);

function loadAsset(url: string) {
  return new Promise(resolve => {
    loader.load(url, geometry => resolve(geometry));
  });
}

function parseResults(results: THREE.Geometry[]): IGeometriesDictionary {
  return results.reduce((obj: IGeometriesDictionary, result, index) => {
    const alias = aliases[index];
    obj[alias] = result;
    return obj;
  }, {});
}

export { promises, parsedResults };
