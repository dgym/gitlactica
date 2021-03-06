module.exports = {
  host: 'ws://localhost:8080',
  orbit: {
    duration: 5e3,
    radius: 2000
  },
  github: {
    username: 'carlmw'
  },
  languages: {
    Unknown: {
      texture: 'textures/unknown.jpg'
    },
    JavaScript: {
      texture: 'textures/javascript.jpg'
    },
    Python: {
      texture: 'textures/python.jpg'
    },
    Ruby: {
      texture: 'textures/ruby.jpg'
    },
    PHP: {
      texture: 'textures/php.jpg'
    }
  },
  sky_box: 'textures/stars.jpg',
  label: {
    width: 300,
    height: 100,
    font: '40pt ostrich',
    fillStyle: '#ffffff'
  },
  ship: {
    model: 'assets/freighter/models/freighter.dae'
  }
};
