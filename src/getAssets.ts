import { values } from 'lodash';

export interface IGeometriesDictionary {
  [key: string]: THREE.Geometry;
}

const objectLoader = new THREE.ObjectLoader();

const gameScenePromise = new Promise(resolve => {
  objectLoader.load('meshes/gameScene.json', scene => {
    const xShip = scene.getObjectByName('xShip');
    const asteroidA = scene.getObjectByName('asteroidA');

    const xShipGeo = values(
      objectLoader.parseGeometries(xShip.toJSON().geometries)
    )[0];
    const asteroidAGeo = values(
      objectLoader.parseGeometries(asteroidA.toJSON().geometries)
    )[0];

    resolve({ xShipGeo, asteroidAGeo });
  });
});

export { gameScenePromise };
