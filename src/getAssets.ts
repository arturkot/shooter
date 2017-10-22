import { values } from 'lodash';

export interface IGeometriesDictionary {
  [key: string]: THREE.Geometry;
}

const jsonLoader = new THREE.JSONLoader();
const objectLoader = new THREE.ObjectLoader();

const gameScenePromise = new Promise(resolve => {
  objectLoader.load('meshes/gameScene.json', scene => {
    const xShip = scene.getObjectByName('xShip');

    resolve(values(objectLoader.parseGeometries(xShip.toJSON().geometries))[0]);
  });
});

const aliases = ['xShip', 'xTriangle', 'xChunk', 'sphereBgGeo'];
const urls = [
  'meshes/x-triangle.json',
  'meshes/x-chunk.json',
  'meshes/sphere-bg.json',
];

const promises = urls.map(loadAsset);
const parsedResults = Promise.all([
  gameScenePromise,
  ...promises,
]).then((results: THREE.Geometry[]) => parseResults(results));

function loadAsset(url: string) {
  return new Promise(resolve => {
    jsonLoader.load(url, geometry => resolve(geometry));
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
