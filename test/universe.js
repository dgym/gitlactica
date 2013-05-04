var emitter = require('emitter');

describe('Universe', function () {
  var Universe,
      scene = sinon.stub(),
      camera = sinon.stub(),
      config = {
        host: 'sockethost:80',
        github: {
          username: 'terry'
        }
      },
      planet = sinon.stub(),
      orbitAllocator = sinon.stub(),
      shipYard = sinon.stub(),
      system = sinon.stub(),
      subspace = sinon.stub(),
      client,
      clientConstructor = sinon.stub(),
      clientModule = function (host) {
        clientConstructor(host);
        this.send = sinon.stub();
        emitter(this);
        client = this;
      },
      hud = sinon.stub().returns({ render: function () {} }),
      cameraController = sinon.stub(),
      keyboardNav = sinon.stub();

  before(function () {
    mockery.registerMock('./client', clientModule);
    mockery.registerMock('./planet', planet);
    mockery.registerMock('./ship_yard', shipYard);
    mockery.registerMock('./subspace_channel', subspace);
    mockery.registerMock('../config', config);
    mockery.registerMock('./orbit_allocator', orbitAllocator);
    mockery.registerMock('./system', system);
    mockery.registerMock('./keyboard_navigation', keyboardNav);
    mockery.registerMock('./camera_controller', cameraController);
    mockery.registerMock('./hud', hud);
    Universe = require('../lib/universe');
  });

  after(function () {
    mockery.deregisterMock('./client');
    mockery.deregisterMock('./planet');
    mockery.deregisterMock('./ship_yard');
    mockery.deregisterMock('./subspace_channel');
    mockery.deregisterMock('../config');
    mockery.deregisterMock('./orbit_allocator');
    mockery.deregisterMock('./system');
    mockery.deregisterMock('./keyboard_navigation');
    mockery.deregisterMock('./camera_controller');
    mockery.deregisterMock('./hud');
  });

  beforeEach(function () {
    subspace.returns({ emit: function () {} });
    shipYard.returns({ commision: function () {}, dispatch: function () {} });
    system.returns({ form: function () {}, layout: function () {} });
  });

  it("creates a websocket client", function () {
    new Universe(scene, camera);

    clientConstructor.should.have.been.calledWith('sockethost:80');
  });

  it("creates a keyboard navigator", function () {
    keyboardNav.reset();
    new Universe(scene, camera);

    keyboardNav.should.have.been.calledWith(subspace.returnValue);
  });

  it("creates a camera controller with the camera and broker", function () {
    var subspaceInstance = sinon.stub();
    subspace.returns(subspaceInstance);
    cameraController.reset();
    new Universe(scene, camera);

    cameraController.should.have.been.calledWith(camera, subspaceInstance);
  });

  it("creates a hud", function () {
    var subspaceInstance = sinon.stub();
    subspace.returns(subspaceInstance);
    hud.reset();
    new Universe(scene, camera);

    hud.should.have.been.calledWith(subspaceInstance);
  });

  describe("client messages", function () {
    it("sends a login message to the client when it connects", function () {
      new Universe(scene, camera);
      client.emit('open');

      client.send.should.have.been.calledWith('login', { login: 'terry' });
    });

    it("subscribes to repos", function () {
      new Universe(scene, camera);
      var sendMock = client.send = sinon.mock();
      sendMock.withArgs('subscribe', { repos: ['bob/repo'] });
      client.emit('repos', {
        login: 'bob',
        repos: [{ full_name: 'bob/repo' }]
      });

      sendMock.verify();
    });
  });

  describe("ship yard", function () {
    it("passes a subspace channel", function () {
      new Universe(scene, camera);

      shipYard.should.have.been.calledWith(scene, subspace.returnValue);
    });

    it("notified of new committers", function () {
      var commisionMock = sinon.mock();
      shipYard.returns({
        commision: commisionMock,
        dispatch: function () {}
      });
      commisionMock.withArgs(['bob']);
      new Universe(scene, camera);
      client.emit('committers', { repo: 'bob/repo', committers: [{ login: 'bob' }] });

      commisionMock.verify();
    });

    it("dispatches ships to a planet after notification", function () {
      var dispatch = sinon.spy();
      shipYard.returns({
        commision: function () {},
        dispatch: dispatch
      });
      new Universe(scene, camera);
      client.emit('committers', {
        repo: 'bob/repo',
        committers: [{ login: 'bob' }]
      });

      dispatch.should.have.been.calledWith('bob', 'bob/repo');
    });
  });

  describe("system", function () {
    it("passes the subspace channel", function () {
      new Universe(scene, camera);

      system.should.have.been.calledWith(scene, subspace.returnValue);
    });

    it("notified of new repos", function () {
      var form = sinon.spy();
      system.returns({
        form: form,
        layout: function () {}
      });
      new Universe(scene);
      client.emit('repos', {
        repos: [{ full_name: 'bob/repo' }]
      });

      form.should.have.been.calledWith({ full_name: 'bob/repo' });
    });

    it("performs a layout after it is notified of new repos", function () {
      var layout = sinon.spy();
      system.returns({
        form: function () {},
        layout: layout
      });
      new Universe(scene, camera);
      client.emit('repos', { repos: [{ full_name: 'bob/repo' }] });

      layout.should.have.been.called;
    });

    it("calls reform when client receives a complexity message", function () {
      var reformMock = sinon.mock();
      system.returns({ reform: reformMock });
      new Universe(scene, camera);
      reformMock
        .withArgs('terry/repo', 2000);
      client.emit('complexity', { repo: 'terry/repo', complexity: 2000 });

      reformMock.verify();
    });
  });

  describe("when a set of commits is received", function () {
    it("dispatches ships to the repo's planet", function () {
      var dispatchMock = sinon.mock();
      dispatchMock.withArgs('bob', 'bob/repo');
      shipYard.returns({
        commision: function () {},
        attack: function () {},
        dispatch: dispatchMock
      });
      new Universe(scene, camera);
      client.emit('commits', {
        repo: 'bob/repo',
        commits: [{
          committer: 'bob',
          added: {},
          modified: {},
          removed: {}
        }]
      });

      dispatchMock.verify();
    });

    it("orders the ship to fire it's weapons on arrival", function () {
      var attackMock = sinon.mock();
      attackMock.withArgs('bob', 3, 2);
      shipYard.returns({
        commision: function () {},
        dispatch: function () {},
        attack: attackMock
      });
      new Universe(scene, camera);
      client.emit('commits', {
        repo: 'bob/repo',
        commits: [
          {
            committer: 'bob',
            added: { JavaScript: ["foo.js", "bar.js"] },
            modified: { JavaScript: ["baz.js"] },
            removed: { JavaScript: ["bin.js"] }
          }
        ]
      });

      attackMock.verify();
    });
  });
});
