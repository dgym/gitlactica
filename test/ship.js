var three = require('three'),
    collada = sinon.stub(),
    config = { ship: { model: 'model.dae' } },
    weapon = sinon.stub(),
    location = sinon.stub(),
    jumpDriveInstance = sinon.stub(),
    jumpDrive = sinon.stub().returns(jumpDriveInstance),
    queue = sinon.stub().returns({ defer: function () {} }),
    scene = sinon.stub({ add: function () {} });

jumpDriveInstance.location = function () { return location; };

describe("Ship", function () {
  var Ship;

  before(function () {
    mockery.registerMock('queue-async', queue);
    mockery.registerMock('./weapon', weapon);
    mockery.registerMock('./jump_drive', jumpDrive);
    mockery.registerMock('../vendor/collada_loader', collada);
    mockery.registerMock('../config', config);
    mockery.registerMock('./shaders', { ship: {} });
    Ship = require('../lib/ship');
  });

  after(function () {
    mockery.deregisterMock('queue-async');
    mockery.deregisterMock('./weapon');
    mockery.deregisterMock('./jump_drive');
    mockery.deregisterMock('../vendor/collada_loader');
    mockery.deregisterMock('../config');
    mockery.deregisterMock('./shaders');
  });

  beforeEach(function () {
    weapon.returns({ fire: function () {} });
  });

  afterEach(function () {
    queue.reset();
  });

  describe("constructor", function () {
    it("creates a queue to run tasks in series", function () {
      new Ship(scene);

      queue.should.have.been.calledWith(1);
    });
  });

  // describe('#orbit', function () {
  //   it("adds a jump animation to the queue", function () {
  //     var planetStub = sinon.stub(),
  //         deferStub = sinon.stub();
  //     queue.returns({
  //       defer: deferStub
  //     });
  //     var ship = new Ship(scene);
  //     ship.orbit(planetStub);

  //     deferStub.should.have.been.calledWith(jumpDriveInstance, planetStub);
  //   });
  // });
});
