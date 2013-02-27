var threeStub = {
      ShaderMaterial: function () {},
      CubeGeometry: function () {},
      Mesh: function () {},
      Object3D: function () {
        this.add = function () {};
      },
      Vector3: function () {}
    },
    weaponStub = sinon.stub(),
    jumpDriveInstanceStub = sinon.stub(),
    jumpDriveStub = sinon.stub().returns(jumpDriveInstanceStub),
    queueStub = sinon.stub(),
    sceneStub = sinon.stub({ add: function () {} });

describe("Ship", function () {
  var Ship;

  before(function () {
    mockery.enable();

    mockery.registerMock('three', threeStub);
    mockery.registerMock('queue-async', queueStub);
    mockery.registerMock('./weapon', weaponStub);
    mockery.registerMock('./jump_drive', jumpDriveStub);
    mockery.registerMock('./shaders', { ship: {} });

    mockery.registerAllowable('../lib/ship');

    Ship = require('../lib/ship');
  });

  beforeEach(function () {
    weaponStub.returns({
      fire: function () {}
    });
  });

  afterEach(function () {
    queueStub.reset();
  });

  after(function () {
    mockery.deregisterAll();
  });

  describe("constructor", function () {
    it("creates a queue to run tasks in series", function () {
      new Ship(sceneStub);

      queueStub.should.have.been.calledWith(1);
      queueStub.reset();
    });
  });

  describe('#orbit', function () {
    it("adds a jump animation to the queue", function () {
      var planetStub = sinon.stub(),
          deferStub = sinon.stub();

        queueStub.returns({
          defer: deferStub
        });

      var ship = new Ship(sceneStub);

      ship.orbit(planetStub);

      deferStub.should.have.been.calledWith(jumpDriveInstanceStub, planetStub);
    });
  });

  describe('#fire', function () {
    it("fires the ships weapons", function () {
      var planetStub = sinon.stub(),
          fireMock = sinon.mock();

      fireMock.withArgs(100, 50, planetStub);

      weaponStub.returns({
        fire: fireMock
      });

      jumpDriveStub.returns({
        location: function () {
          return planetStub;
        }
      });

      var ship = new Ship(sceneStub);

      ship.fire(100, 50);

      fireMock.verify();
    });
  });
});
