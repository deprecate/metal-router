'use strict';

import { Component, ComponentRegistry } from 'metal-component';
import RequestScreen from 'senna/src/screen/RequestScreen';
import Router from '../src/Router';
import Soy from 'metal-soy';

describe('Router', function() {

	beforeEach(function() {
		Router.activeComponent = null;
	});

	it('should create singleton instance of router', function() {
		var router = Router.router();
		assert.ok(router);
		assert.strictEqual(router, Router.router());
	});

	it('should add route to router from constructor', function() {
		assert.ok(!Router.router().hasRoutes());
		var router = new Router({
			path: '/path',
			component: CustomComponent
		});
		assert.ok(Router.router().hasRoutes());
		router.dispose();
	});

	it('should remove route from router from disposed router', function() {
		var router = new Router({
			path: '/path',
			component: CustomComponent
		});
		assert.ok(Router.router().hasRoutes());
		router.dispose();
		assert.ok(!Router.router().hasRoutes());
	});

	it('should resolve component constructor from name', function() {
		var router = new Router({
			path: '/path',
			component: 'CustomComponent'
		});
		assert.strictEqual(CustomComponent, router.resolveComponentConstructor());
		router.dispose();
	});

	it('should resolve component constructor from class', function() {
		var router = new Router({
			path: '/path',
			component: CustomComponent
		});
		assert.strictEqual(CustomComponent, router.resolveComponentConstructor());
		router.dispose();
	});

	it('should create component instance', function() {
		var router = new Router({
			path: '/path',
			component: CustomComponent
		});
		assert.ok(router.createComponent() instanceof CustomComponent);
		router.dispose();
	});

	it('should check if it\'s routing to the active component', function() {
		var router = new Router({
			path: '/path',
			component: CustomComponent
		});
		assert.ok(!Router.isRoutingToSameActiveComponent(router));
		Router.activeComponent = router.createComponent();
		assert.ok(Router.isRoutingToSameActiveComponent(router));
		router.dispose();
	});

	it('should router accept initial state as function', function() {
		var initialState = sinon.stub();
		var router = new Router({
			initialState: initialState,
			path: '/path',
			component: CustomComponent
		});
		assert.strictEqual(initialState, router.initialState);
		router.dispose();
	});

	it('should router wrap initial state object or deferred in a function', function() {
		var initialState = new Promise(function() {});
		var router = new Router({
			initialState: initialState,
			path: '/path',
			component: CustomComponent
		});
		assert.strictEqual(initialState, router.initialState());
		router.dispose();
	});

	it('should throw error when ComponentScreen router not specified', function() {
		assert.throws(function() {
			new Router.defaultScreen();
		}, Error);
	});

	it('should not throw error when ComponentScreen router specified', function() {
		assert.doesNotThrow(function() {
			var router = new Router({
				path: '/path',
				component: CustomComponent
			});
			new Router.defaultScreen(router);
			router.dispose();
		});
	});

	it('should load path url if initial state is null and stores as router lastLoadedState', function(done) {
		var stub = sinon.stub(RequestScreen.prototype, 'load', function() {
			return 'sentinel';
		});
		var router = new Router({
			path: '/path',
			component: CustomComponent
		});
		var screen = new Router.defaultScreen(router);
		screen.load('/path').then(() => {
			assert.strictEqual('sentinel', router.lastLoadedState);
			assert.strictEqual(1, RequestScreen.prototype.load.callCount);
			router.dispose();
			stub.restore();
			done();
		});
	});

	it('should load path url if initial state is null and stores as router lastLoadedState as Json', function(done) {
		var stub = sinon.stub(RequestScreen.prototype, 'load', function() {
			return '{"sentinel":true}';
		});
		var router = new Router({
			path: '/path',
			component: CustomComponent
		});
		var screen = new Router.defaultScreen(router);
		screen.load('/path').then(() => {
			assert.deepEqual({
				sentinel: true
			}, screen.maybeParseLastLoadedStateAsJson());
			assert.strictEqual(1, RequestScreen.prototype.load.callCount);
			router.dispose();
			stub.restore();
			done();
		});
	});

	it('should router set screen cacheability to true based on its cacheable state', function(done) {
		var router = new Router({
			path: '/path',
			component: CustomComponent,
			cacheable: true
		});
		var screen = new Router.defaultScreen(router);
		screen.isValidResponseStatusCode = function() {
			return true;
		};
		screen.load('/path').then(() => {
			assert.ok(screen.isCacheable());
			router.dispose();
			done();
		});
	});

	it('should router set screen cacheability to false based on its cacheable state', function(done) {
		var router = new Router({
			path: '/path',
			component: CustomComponent,
			cacheable: false
		});
		var screen = new Router.defaultScreen(router);
		screen.isValidResponseStatusCode = function() {
			return true;
		};
		screen.load('/path').then(() => {
			assert.ok(!screen.isCacheable());
			router.dispose();
			done();
		});
	});

	it('should load router initial state and store as router lastLoadedState', function(done) {
		var router = new Router({
			initialState: 'sentinel',
			path: '/path',
			component: CustomComponent
		});
		var screen = new Router.defaultScreen(router);
		screen.load('/path').then(() => {
			assert.strictEqual('sentinel', router.lastLoadedState);
			router.dispose();
			done();
		});
	});

	it('should load router initial state and store as json statically as Router active state', function(done) {
		var initialState = {};
		var router = new Router({
			initialState: initialState,
			path: '/path',
			component: CustomComponent
		});
		var screen = new Router.defaultScreen(router);
		screen.load('/path').then(() => {
			screen.flip();
			assert.strictEqual(initialState, Router.activeState);
			router.dispose();
			done();
		});
	});

	it('should render component when routing to path', function() {
		CustomComponent.prototype.render = sinon.stub();
		var router = new Router({
			path: '/path',
			component: CustomComponent
		});
		var screen = new Router.defaultScreen(router);
		screen.isValidResponseStatusCode = function() {
			return true;
		};
		screen.flip();
		assert.strictEqual(1, CustomComponent.prototype.render.callCount);
		router.dispose();
	});

	it('should render redirect component when routing to path that got redirected', function(done) {
		CustomComponent.prototype.render = sinon.stub();
		RedirectComponent.prototype.render = sinon.stub();
		var router = new Router({
			path: '/path',
			component: CustomComponent
		});
		var redirectRouter = new Router({
			path: '/redirect',
			component: RedirectComponent
		});
		var screen = new Router.defaultScreen(router);
		screen.isValidResponseStatusCode = function() {
			return true;
		};
		screen.beforeUpdateHistoryPath = function() {
			return '/redirect';
		};
		screen.load('/path').then(() => {
			screen.flip();
			assert.strictEqual(0, CustomComponent.prototype.render.callCount);
			assert.strictEqual(1, RedirectComponent.prototype.render.callCount);
			router.dispose();
			redirectRouter.dispose();
			done();
		});
	});

	it('should render original component when routing to path that got redirected without match route', function(done) {
		CustomComponent.prototype.render = sinon.stub();
		var router = new Router({
			path: '/path',
			component: CustomComponent
		});
		var screen = new Router.defaultScreen(router);
		screen.isValidResponseStatusCode = function() {
			return true;
		};
		screen.beforeUpdateHistoryPath = function() {
			return '/redirect';
		};
		screen.load('/path').then(() => {
			screen.flip();
			assert.strictEqual(1, CustomComponent.prototype.render.callCount);
			router.dispose();
			done();
		});
	});

	it.only('should render component inside container', function() {
		CustomComponent.prototype.render = sinon.stub();
		var router = new Router({
			path: '/path',
			container: '#container',
			component: CustomComponent
		});
		var screen = new Router.defaultScreen(router);
		screen.flip();
		assert.strictEqual('#container', CustomComponent.prototype.render.args[0][0]);
		router.dispose();
	});

	it('should dispose then render component when routing to new component path', function() {
		CustomComponent.prototype.render = sinon.stub();
		var router = new Router({
			path: '/path',
			component: CustomComponent
		});
		var screen = new Router.defaultScreen(router);
		screen.flip();
		var disposeStub = sinon.stub();
		Router.activeComponent = {
			dispose: disposeStub
		};
		screen.flip();
		assert.strictEqual(1, disposeStub.callCount);
		assert.strictEqual(2, CustomComponent.prototype.render.callCount);
		router.dispose();
	});

	it('should update component when routing to same component path', function() {
		var router = new Router({
			path: '/path',
			component: CustomComponent
		});
		var screen = new Router.defaultScreen(router);
		Router.activeComponent = router.createComponent();
		Router.activeComponent.setState = sinon.stub();
		screen.flip();
		assert.strictEqual(1, Router.activeComponent.setState.callCount);
		router.dispose();
	});

	it('should not reuse active component when routing to same component path if reuseActiveComponent is false', function() {
		CustomComponent.prototype.setState = sinon.stub();
		CustomComponent.prototype.render = sinon.stub();
		var router = new Router({
			path: '/path',
			component: CustomComponent,
			reuseActiveComponent: false
		});
		var screen = new Router.defaultScreen(router);
		Router.activeComponent = router.createComponent();
		screen.flip();
		assert.strictEqual(0, CustomComponent.prototype.setState.callCount);
		assert.strictEqual(1, CustomComponent.prototype.render.callCount);
		router.dispose();
	});

});

class CustomComponent extends Component {
}
CustomComponent.RENDERER = Soy;
ComponentRegistry.register(CustomComponent);

class RedirectComponent extends Component {
}
RedirectComponent.RENDERER = Soy;
