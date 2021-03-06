var THREE = require('three'),
    shaders = require('./shaders'),
    material;

material = new THREE.ShaderMaterial({
  uniforms: shaders.ship.uniforms,
  vertexShader: shaders.ship.vertex,
  fragmentShader: shaders.ship.fragment
});

module.exports = torpedo;

function torpedo() {
  var geometry = new THREE.SphereGeometry(25, 20, 15),
      mesh = new THREE.Mesh(geometry, material);

  return mesh;
}
