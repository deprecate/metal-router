'use strict';

import { Component, ComponentRegistry } from 'metal-component';
import IncrementalDomRenderer from 'metal-incremental-dom';
import RequestScreen from 'senna/src/screen/RequestScreen';
import Router from '../src/Router';

describe('Router', function() {

	beforeEach(function() {
		Router.activeRouter = null;
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

	it('should return "Router.defaultScreen" instance from route handler', function() {
		var router = new Router({
			path: '/path',
			component: CustomComponent
		});
		assert.ok(router.route);
		assert.ok(router.route.getHandler()() instanceof Router.defaultScreen);
	});

	it('should return null when no component is active yet', function() {
		assert.strictEqual(null, Router.getActiveComponent());
	});

	it('should create component instance from constructor name', function() {
		var router = new Router({
			path: '/path',
			component: 'CustomComponent',
			isActive_: true
		});
		var keys = Object.keys(router.components);
		var child = router.components[keys[0]];
		assert.ok(child instanceof CustomComponent);
		router.dispose();
	});

	it('should create component instance from constructor function', function() {
		var router = new Router({
			path: '/path',
			component: CustomComponent,
			isActive_: true
		});
		var keys = Object.keys(router.components);
		var child = router.components[keys[0]];
		assert.ok(child instanceof CustomComponent);
		router.dispose();
	});

	it('should router accept data as function', function() {
		var data = sinon.stub();
		var router = new Router({
			data: data,
			path: '/path',
			component: CustomComponent
		});
		assert.strictEqual(data, router.data);
		router.dispose();
	});

	it('should router wrap data object or deferred in a function', function() {
		var data = new Promise(function() {});
		var router = new Router({
			data: data,
			path: '/path',
			component: CustomComponent
		});
		assert.strictEqual(data, router.data());
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

	it('should set screen timeout to value specified by router', function() {
		var router = new Router({
			path: '/path',
			component: CustomComponent,
			fetchTimeout: 100
		});
		var screen = new Router.defaultScreen(router);
		assert.strictEqual(100, screen.timeout);
	});

	it('should set screen timeout to null if specified by router', function() {
		var router = new Router({
			path: '/path',
			component: CustomComponent,
			fetchTimeout: null
		});
		var screen = new Router.defaultScreen(router);
		assert.strictEqual(null, screen.timeout);
	});

	it('should not change screen timeout if value specified by router is invalid', function() {
		var router = new Router({
			path: '/path',
			component: CustomComponent,
			fetchTimeout: 'foo'
		});
		var screen = new Router.defaultScreen(router);
		assert.strictEqual(30000, screen.timeout);
	});

	it('should load path url if data is null and stores as router lastLoadedState', function(done) {
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

	it('should load path url if data is null and stores as router lastLoadedState as Json', function(done) {
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

	it('should load router data and store as router lastLoadedState', function(done) {
		var router = new Router({
			data: 'sentinel',
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

	it('should load router data and store as json statically as Router active state', function(done) {
		var data = {};
		var router = new Router({
			data: data,
			path: '/path',
			component: CustomComponent
		});
		var screen = new Router.defaultScreen(router);
		screen.load('/path').then(() => {
			screen.flip();
			assert.strictEqual(data, Router.activeState);
			router.dispose();
			done();
		});
	});

	it('should render component when routing to path', function(done) {
		var router = new Router({
			path: '/path',
			component: CustomComponent
		});
		var screen = new Router.defaultScreen(router);
		screen.isValidResponseStatusCode = function() {
			return true;
		};
		screen.flip();

		router.once('stateSynced', function() {
			assert.ok(Router.getActiveComponent() instanceof CustomComponent);
			assert.ok(Router.getActiveComponent().wasRendered);
			router.dispose();
			done();
		});
	});

	it('should render redirect component when routing to path that got redirected', function(done) {
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
			redirectRouter.once('stateSynced', function() {
				assert.ok(Router.getActiveComponent() instanceof RedirectComponent);
				assert.ok(Router.getActiveComponent().wasRendered);
				router.dispose();
				redirectRouter.dispose();
				done();
			});
		});
	});

	it('should render original component when routing to path that got redirected without match route', function(done) {
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
			router.once('stateSynced', function() {
				assert.ok(Router.getActiveComponent() instanceof CustomComponent);
				assert.ok(Router.getActiveComponent().wasRendered);
				router.dispose();
				done();
			});
		});
	});

	it('should render component as the router element', function(done) {
		var router = new Router({
			path: '/path',
			component: CustomComponent
		});
		var screen = new Router.defaultScreen(router);
		screen.flip();
		router.once('stateSynced', function() {
			var comp = router.components.comp;
			assert.strictEqual(comp.element, router.element);
			router.dispose();
			done();
		});
	});

	it('should dispose then render component when routing to new component path', function(done) {
		var router = new Router({
			path: '/path',
			component: CustomComponent
		});
		var router2 = new Router({
			path: '/path2',
			component: CustomComponent2
		});

		var screen2 = new Router.defaultScreen(router2);
		screen2.flip();
		router2.once('stateSynced', function() {
			var prevComponent = router2.getRouteComponent();
			assert.strictEqual(prevComponent.element, router2.element);

			var screen = new Router.defaultScreen(router);
			screen.flip();

			router.once('stateSynced', function() {
				assert.ok(!router2.element);
				assert.ok(prevComponent.isDisposed());
				assert.ok(Router.getActiveComponent() instanceof CustomComponent);
				assert.ok(Router.getActiveComponent().wasRendered);
				assert.ok(!Router.getActiveComponent().isDisposed());
				router.dispose();
				router2.dispose();
				done();
			});
		});
	});

	it('should reuse component when routing to path that uses same constructor', function(done) {
		var router = new Router({
			path: '/path',
			component: CustomComponent
		});
		var router2 = new Router({
			path: '/path2',
			component: CustomComponent
		});

		var screen2 = new Router.defaultScreen(router2);
		screen2.flip();
		router2.once('stateSynced', function() {
			var prevComponent = router2.getRouteComponent();
			sinon.spy(prevComponent, 'dispose');

			var screen = new Router.defaultScreen(router);
			screen.flip();
			assert.strictEqual(0, prevComponent.dispose.callCount);

			router.once('stateSynced', function() {
				assert.strictEqual(0, prevComponent.dispose.callCount);
				assert.strictEqual(prevComponent, Router.getActiveComponent());
				router.dispose();
				router2.dispose();
				done();
			});
		});
	});

	it('should reuse component when routing to path that uses same constructor name', function(done) {
		var router = new Router({
			path: '/path',
			component: 'CustomComponent'
		});
		var router2 = new Router({
			path: '/path2',
			component: CustomComponent
		});

		var screen2 = new Router.defaultScreen(router2);
		screen2.flip();
		router2.once('stateSynced', function() {
			var prevComponent = router2.getRouteComponent();
			sinon.spy(prevComponent, 'dispose');

			var screen = new Router.defaultScreen(router);
			screen.flip();
			assert.strictEqual(0, prevComponent.dispose.callCount);

			router.once('stateSynced', function() {
			assert.strictEqual(0, prevComponent.dispose.callCount);
				assert.strictEqual(prevComponent, Router.getActiveComponent());
				router.dispose();
				router2.dispose();
				done();
			});
		});
	});

	it('should not reuse active component when routing to same component path if reuseActiveComponent is false', function(done) {
		var router = new Router({
			path: '/path',
			component: CustomComponent,
			reuseActiveComponent: false
		});
		var router2 = new Router({
			path: '/path2',
			component: CustomComponent
		});

		var screen2 = new Router.defaultScreen(router2);
		screen2.flip();
		router2.once('stateSynced', function() {
			var prevComponent = router2.getRouteComponent();
			var screen = new Router.defaultScreen(router);
			screen.flip();

			router.once('stateSynced', function() {
				assert.ok(prevComponent.isDisposed());
				assert.notStrictEqual(prevComponent, Router.getActiveComponent());
				router.dispose();
				router2.dispose();
				done();
			});
		});
	});

	it('should create router instance through Router.route method', function() {
		var stateFn = () => {};
		var router = Router.route('/path', CustomComponent, stateFn);

		assert.ok(router instanceof Router);
		assert.strictEqual('/path', router.path);
		assert.strictEqual(CustomComponent, router.component);
		assert.strictEqual(stateFn, router.data);
	});

	it('should include the current url in the active state if requested', function(done) {
		var data = {
			foo: 'foo'
		};
		var router = new Router({
			data: data,
			path: '/path',
			component: CustomComponent,
			includeCurrentUrl: true
		});
		var screen = new Router.defaultScreen(router);
		screen.load('/path').then(() => {
			screen.flip();
			assert.notStrictEqual(data, Router.activeState);
			assert.strictEqual('foo', Router.activeState.foo);
			assert.strictEqual('/path', Router.activeState.currentUrl);
			router.dispose();
			done();
		});
	});
});

class CustomComponent extends Component {
}
CustomComponent.RENDERER = IncrementalDomRenderer;
ComponentRegistry.register(CustomComponent);

class CustomComponent2 extends Component {
}
CustomComponent2.RENDERER = IncrementalDomRenderer;

class RedirectComponent extends Component {
}
RedirectComponent.RENDERER = IncrementalDomRenderer;
