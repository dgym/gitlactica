var THREE = require('three'),
    TWEEN = require('tween');

module.exports = revealPlanet;

var duration = 2e3;
var panTime = 500;
var orbitRadius = 4000;
var orbitHeight = 1000;

function revealPlanet(camera, planetPosition) {
  var props = {
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z,
        panWeight: 0
      };
  var initialDirection = camera.quaternion.clone();
  var orbitPosition = new THREE.Vector3(),
      forward = new THREE.Vector3(),
      up = new THREE.Vector3(0, 0, 1),
      right = new THREE.Vector3();

  // Rotate the orbit position around the planet so we arrive
  // with the planet to our right.
  // The cross product of the forward and up vectors gives
  // us a perpendicular right vector.
  forward.subVectors(planetPosition, camera.position);
  forward.normalize();
  right.crossVectors(forward, up);
  orbitPosition.copy(right);
  orbitPosition.z = 0;
  orbitPosition.normalize();
  orbitPosition.x *= -orbitRadius;
  orbitPosition.y *= -orbitRadius;
  orbitPosition.z = orbitHeight;
  orbitPosition.add(planetPosition);

  // Pan the camera smoothly by slerping from
  // the initialDirection to the lookAt direction.
  new TWEEN.Tween(props)
    .to({ panWeight: 1 }, panTime)
    .easing(TWEEN.Easing.Circular.InOut)
    .start();

  return new TWEEN.Tween(props)
    .to({ x: orbitPosition.x, y: orbitPosition.y, z: orbitPosition.z }, duration)
    .onUpdate(function () {
      camera.position.set(this.x, this.y, this.z);
      if (this.panWeight < 1) {
        camera.lookAt(planetPosition);
        camera.quaternion.slerp(initialDirection, 1 - this.panWeight);
      } else {
          camera.lookAt(planetPosition);
      }
    })
    .start();
}
