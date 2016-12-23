'use strict';

import dom from 'metal-dom';
import Ajax from 'metal-ajax';
import { Component, ComponentRegistry } from 'metal-component';
import IncrementalDomRenderer from 'metal-incremental-dom';
import RequestScreen from 'senna/src/screen/RequestScreen';
import Router from '../src/Router';

const defaultScreen = Router.defaultScreen;

describe('Router', function() {
	let router;
	let router2;

	before(function() {
		sinon.stub(console, 'log');
	});

	afterEach(function() {
		if (Router.routerInstance) {
			Router.routerInstance.dispose();
			Router.routerInstance = null;
		}
		Router.activeRouter = null;
		Router.defaultScreen = defaultScreen;
		if (router) {
			router.dispose();
		}
		if (router2) {
			router2.dispose();
		}
	});

	after(function() {
		console.log.restore();
	});

	it('should create singleton instance of router', function() {
		router = Router.router();
		assert.ok(router);
		assert.strictEqual(router, Router.router());
	});

	it('should instance of router ignore query string from route path', function() {
		router = Router.router();
		assert.ok(router.getIgnoreQueryStringFromRoutePath());
	});

	it('should add route to router from constructor', function() {
		assert.ok(!Router.router().hasRoutes());
		router = new Router({
			path: '/path',
			component: CustomComponent
		});
		assert.ok(Router.router().hasRoutes());
	});

	it('should remove route from router from disposed router', function() {
		router = new Router({
			path: '/path',
			component: CustomComponent
		});
		assert.ok(Router.router().hasRoutes());
		router.dispose();
		assert.ok(!Router.router().hasRoutes());
	});

	it('should return "Router.defaultScreen" instance from route handler', function() {
		router = new Router({
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
		router = new Router({
			path: '/path',
			component: 'CustomComponent',
			isActive_: true
		});
		var child = router.components.comp;
		assert.ok(child instanceof CustomComponent);
	});

	it('should create component instance from constructor function', function() {
		router = new Router({
			path: '/path',
			component: CustomComponent,
			isActive_: true
		});
		var child = router.components.comp;
		assert.ok(child instanceof CustomComponent);
	});

	it('should router accept data as function', function() {
		var data = sinon.stub();
		router = new Router({
			data: data,
			path: '/path',
			component: CustomComponent
		});
		assert.strictEqual(data, router.data);
	});

	it('should router wrap data object or deferred in a function', function() {
		var data = new Promise(function() {});
		router = new Router({
			data: data,
			path: '/path',
			component: CustomComponent
		});
		assert.strictEqual(data, router.data());
	});

	it('should throw error when ComponentScreen router not specified', function() {
		assert.throws(function() {
			new Router.defaultScreen();
		}, Error);
	});

	it('should not throw error when ComponentScreen router specified', function() {
		assert.doesNotThrow(function() {
			router = new Router({
				path: '/path',
				component: CustomComponent
			});
			new Router.defaultScreen(router);
		});
	});

	it('should set screen timeout to value specified by router', function() {
		router = new Router({
			path: '/path',
			component: CustomComponent,
			fetchTimeout: 100
		});
		var screen = new Router.defaultScreen(router);
		assert.strictEqual(100, screen.timeout);
	});

	it('should set screen timeout to null if specified by router', function() {
		router = new Router({
			path: '/path',
			component: CustomComponent,
			fetchTimeout: null
		});
		var screen = new Router.defaultScreen(router);
		assert.strictEqual(null, screen.timeout);
	});

	it('should not change screen timeout if value specified by router is invalid', function() {
		router = new Router({
			path: '/path',
			component: CustomComponent,
			fetchTimeout: 'foo'
		});
		var screen = new Router.defaultScreen(router);
		assert.strictEqual(30000, screen.timeout);
	});

	it('should load path url and stores as router lastLoadedState if "fetch" is true', function(done) {
		var stub = sinon.stub(RequestScreen.prototype, 'load', function() {
			return 'sentinel';
		});
		router = new Router({
			path: '/path',
			component: CustomComponent,
			fetch: true
		});
		Router.router().navigate('/path').then(() => {
			assert.strictEqual('sentinel', router.lastLoadedState);
			assert.strictEqual(1, RequestScreen.prototype.load.callCount);
			stub.restore();
			done();
		});
	});

	it('should load path url and stores as router lastLoadedState as Json if "fetch" is true', function(done) {
		var stub = sinon.stub(RequestScreen.prototype, 'load', function() {
			return '{"sentinel":true}';
		});
		router = new Router({
			path: '/path',
			component: CustomComponent,
			fetch: true
		});
		Router.router().navigate('/path').then(() => {
			assert.equal(true, Router.activeState.sentinel);
			assert.strictEqual(1, RequestScreen.prototype.load.callCount);
			stub.restore();
			done();
		});
	});

	it('should fetch data from url specified by "fetchUrl" when "fetch" is true', function(done) {
		var stub = sinon.stub(RequestScreen.prototype, 'load', function() {
			return 'sentinel';
		});
		router = new Router({
			path: '/path',
			component: CustomComponent,
			fetchUrl: '/fetch/path',
			fetch: true
		});
		Router.router().navigate('/path').then(() => {
			assert.strictEqual('sentinel', router.lastLoadedState);
			assert.strictEqual(1, RequestScreen.prototype.load.callCount);
			assert.strictEqual('/fetch/path', RequestScreen.prototype.load.args[0][0]);
			stub.restore();
			done();
		});
	});

	it('should fetch data from url specified by "fetchUrl" function when "fetch" is true', function(done) {
		var stub = sinon.stub(RequestScreen.prototype, 'load', function() {
			return 'sentinel';
		});
		router = new Router({
			path: '/path',
			component: CustomComponent,
			fetchUrl: path => path + '.json',
			fetch: true
		});
		Router.router().navigate('/path').then(() => {
			assert.strictEqual('sentinel', router.lastLoadedState);
			assert.strictEqual(1, RequestScreen.prototype.load.callCount);
			assert.strictEqual('/path.json', RequestScreen.prototype.load.args[0][0]);
			stub.restore();
			done();
		});
	});

	it('should not use fetch url as navigation url', function(done) {
		sinon.stub(Ajax, 'request', function() {
			return new Promise(function(resolve) {
				resolve({
					getResponseHeader: () => null,
					status: 200
				});
			});
		});

		router = new Router({
			path: '/path',
			component: CustomComponent,
			fetchUrl: '/fetchUrl',
			fetch: true
		});

		Router.router().navigate('/path').then(() => {
			assert.notEqual('/fetchUrl', window.location.pathname);
			assert.equal('/path', window.location.pathname);
			done();
		});
	});

	it('should router set screen cacheability to true based on its cacheable state', function(done) {
		router = new Router({
			path: '/path',
			component: CustomComponent,
			cacheable: true
		});
		Router.router().navigate('/path').then(() => {
			assert.ok(router.getScreen().isCacheable());
			done();
		});
	});

	it('should router set screen cacheability to false based on its cacheable state', function(done) {
		router = new Router({
			path: '/path',
			component: CustomComponent,
			cacheable: false
		});
		Router.router().navigate('/path').then(() => {
			assert.ok(!router.getScreen().isCacheable());
			done();
		});
	});

	it('should load router data and store as router lastLoadedState', function(done) {
		router = new Router({
			data: 'sentinel',
			path: '/path',
			component: CustomComponent
		});
		Router.router().navigate('/path').then(() => {
			assert.strictEqual('sentinel', router.lastLoadedState);
			done();
		});
	});

	it('should include the current url in the active state by default', function(done) {
		var data = {
			foo: 'foo'
		};
		router = new Router({
			data: data,
			path: '/path',
			component: CustomComponent
		});
		Router.router().navigate('/path').then(() => {
			assert.notStrictEqual(data, Router.activeState);
			assert.strictEqual(Router.activeState, Router.getActiveState());
			assert.strictEqual('foo', Router.activeState.foo);
			assert.ok(Router.activeState.router);
			assert.strictEqual('/path', Router.activeState.router.currentUrl);
			done();
		});
	});

	it('should add extracted param data to the active state by default', function(done) {
		var data = {
			foo: 'foo'
		};
		router = new Router({
			data: data,
			path: '/path/:foo(\\d+)/:bar',
			component: CustomComponent
		});
		Router.router().navigate('/path/123/abc').then(() => {
			assert.notStrictEqual(data, Router.activeState);
			assert.strictEqual('foo', Router.activeState.foo);
			assert.ok(Router.activeState.router);
			assert.strictEqual('/path/123/abc', Router.activeState.router.currentUrl);

			var expectedParams = {
				foo: '123',
				bar: 'abc'
			};
			assert.deepEqual(expectedParams, Router.activeState.router.params);
			done();
		});
	});

	it('should add extracted param data to the active state when setBasePath is used', function(done) {
		var data = {
			foo: 'foo'
		};
		Router.router().setBasePath('/path');
		router = new Router({
			data: data,
			path: '/:foo(\\d+)/:bar',
			component: CustomComponent
		});
		Router.router().navigate('/path/123/abc').then(() => {
			assert.notStrictEqual(data, Router.activeState);
			assert.strictEqual('foo', Router.activeState.foo);
			assert.ok(Router.activeState.router);
			assert.strictEqual('/path/123/abc', Router.activeState.router.currentUrl);

			var expectedParams = {
				foo: '123',
				bar: 'abc'
			};
			assert.deepEqual(expectedParams, Router.activeState.router.params);
			done();
		});
	});

	it('should not include data in the active state if "includeRoutingData" is set to false', function(done) {
		var data = {
			foo: 'foo'
		};
		router = new Router({
			data: data,
			path: '/path',
			component: CustomComponent,
			includeRoutingData: false
		});
		Router.router().navigate('/path').then(() => {
			assert.strictEqual(data, Router.activeState);
			assert.strictEqual('foo', Router.activeState.foo);
			assert.ok(!Router.activeState.router);
			done();
		});
	});

	it('should pass path and extracted params to data function', function(done) {
		var data = sinon.stub();
		router = new Router({
			data: data,
			path: '/path/:foo(\\d+)/:bar',
			component: CustomComponent
		});
		Router.router().navigate('/path/123/abc').then(() => {
			assert.equal(1, data.callCount);
			assert.strictEqual('/path/123/abc', data.args[0][0]);

			var expectedParams = {
				foo: '123',
				bar: 'abc'
			};
			assert.deepEqual(expectedParams, data.args[0][1]);
			done();
		});
	});

	it('should render component when routing to path', function(done) {
		router = new Router({
			path: '/path',
			component: CustomComponent
		});

		Router.router().navigate('/path').then(() => {
			assert.ok(Router.getActiveComponent() instanceof CustomComponent);
			assert.ok(Router.getActiveComponent().wasRendered);
			done();
		});
	});

	it('should render component with right element when routing to path', function(done) {
		dom.append(document.body, '<div id="el"><div></div></div>');
		var element = document.querySelector('#el > div');
		router = new Router({
			element: '#el > div',
			path: '/path',
			component: CustomComponent
		});

		Router.router().navigate('/path').then(() => {
			assert.strictEqual(element, router.element);
			assert.equal('el', element.parentNode.id);
			done();
		});
	});

	it('should not reset router element to initial value after reattached', function() {
		dom.append(document.body, '<div id="el"><div></div></div>');
		var element = document.querySelector('#el > div');
		router = new Router({
			element: '#el > div',
			path: '/path',
			component: CustomComponent
		});

		assert.strictEqual(element, router.element);
		assert.equal('el', element.parentNode.id);

		router.detach();
		const newElement = document.createElement('div');
		router.element = newElement;

		router.attach();
		assert.equal(newElement, router.element);
	});

	it('should render redirect component when routing to path that got redirected', function(done) {
		class TestScreen extends Router.defaultScreen {
			beforeUpdateHistoryPath() {
				return '/redirect';
			}
		}
		Router.defaultScreen = TestScreen;

		router = new Router({
			path: '/path',
			component: CustomComponent
		});
		var redirectRouter = new Router({
			path: '/redirect',
			component: RedirectComponent
		});
		Router.router().navigate('/path').then(() => {
			assert.ok(Router.getActiveComponent() instanceof RedirectComponent);
			assert.ok(Router.getActiveComponent().wasRendered);
			redirectRouter.dispose();
			done();
		});
	});

	it('should render original component when routing to path that got redirected without match route', function(done) {
		class TestScreen extends Router.defaultScreen {
			beforeUpdateHistoryPath() {
				return '/redirect';
			}
		}
		Router.defaultScreen = TestScreen;

		router = new Router({
			path: '/path',
			component: CustomComponent
		});
		Router.router().navigate('/path').then(() => {
			assert.ok(Router.getActiveComponent() instanceof CustomComponent);
			assert.ok(Router.getActiveComponent().wasRendered);
			done();
		});
	});

	it('should render component as the router element', function(done) {
		router = new Router({
			path: '/path',
			component: CustomComponent
		});
		Router.router().navigate('/path').then(() => {
			var comp = router.components.comp;
			assert.strictEqual(comp.element, router.element);
			done();
		});
	});

	it('should rerender if component constructor changes', function(done) {
		router = new Router({
			path: '/path',
			component: CustomComponent
		});
		Router.router().navigate('/path').then(() => {
			var listener = sinon.stub();
			router.on('rendered', listener);

			var comp = router.getRouteComponent();
			router.component = CustomComponent2;
			router.once('stateSynced', function() {
				assert.strictEqual(1, listener.callCount);
				assert.notStrictEqual(comp, router.getRouteComponent());
				assert.ok(router.getRouteComponent() instanceof CustomComponent2);
				done();
			});
		});
	});

	it('should not rerender if any state property other than "component" or "isActive_" changes', function(done) {
		router = new Router({
			path: '/path',
			component: CustomComponent
		});
		Router.router().navigate('/path').then(() => {
			var listener = sinon.stub();
			router.on('rendered', listener);
			router.fetch = true;

			router.once('stateSynced', function() {
				assert.strictEqual(0, listener.callCount);
				done();
			});
		});
	});

	it('should dispose then render component when routing to new component path', function(done) {
		router = new Router({
			path: '/path',
			component: CustomComponent
		});
		router2 = new Router({
			path: '/path2',
			component: CustomComponent2
		});

		Router.router().navigate('/path2').then(() => {
			var prevComponent = router2.getRouteComponent();
			assert.strictEqual(prevComponent.element, router2.element);

			Router.router().navigate('/path').then(() => {
				assert.ok(!router2.element);
				assert.ok(prevComponent.isDisposed());
				assert.ok(Router.getActiveComponent() instanceof CustomComponent);
				assert.ok(Router.getActiveComponent().wasRendered);
				assert.ok(!Router.getActiveComponent().isDisposed());
				done();
			});
		});
	});

	it('should reuse element when routing to different component that received same element', function(done) {
		dom.append(document.body, '<div id="el"><div></div></div>');
		var element = document.querySelector('#el > div');
		router = new Router({
			element,
			path: '/path',
			component: CustomComponent
		});
		router2 = new Router({
			element,
			path: '/path2',
			component: CustomComponent2
		});

		Router.router().navigate('/path2').then(() => {
			assert.strictEqual(element, router2.element);
			assert.equal('el', element.parentNode.id);

			Router.router().navigate('/path').then(() => {
				assert.strictEqual(element, router.element);
				assert.equal('el', element.parentNode.id);
				done();
			});
		});
	});

	it('should reuse component when routing to same router path pattern that uses same constructor', function(done) {
		router = new Router({
			path: '/path/:part',
			component: CustomComponent
		});

		Router.router().navigate('/path/part1').then(() => {
			var prevComponent = router.getRouteComponent();
			sinon.spy(prevComponent, 'dispose');

			Router.router().navigate('/path/part2').then(() => {
				assert.strictEqual(0, prevComponent.dispose.callCount);
				assert.strictEqual(prevComponent, Router.getActiveComponent());
				done();
			});
		});
	});

	it('should reuse component when routing to same router path pattern that uses same constructor name', function(done) {
		router = new Router({
			path: '/path/:part',
			component: 'CustomComponent'
		});

		Router.router().navigate('/path/part1').then(() => {
			var prevComponent = router.getRouteComponent();
			sinon.spy(prevComponent, 'dispose');

			Router.router().navigate('/path/part2').then(() => {
				assert.strictEqual(0, prevComponent.dispose.callCount);
				assert.strictEqual(prevComponent, Router.getActiveComponent());
				done();
			});
		});
	});

	it('should not reuse component when routing to different path that uses same constructor', function(done) {
		router = new Router({
			path: '/path/1',
			component: CustomComponent
		});
		router2 = new Router({
			path: '/path/2',
			component: CustomComponent
		});

		Router.router().navigate('/path/2').then(() => {
			var prevComponent = router2.getRouteComponent();
			Router.router().navigate('/path/1').then(() => {
				assert.ok(prevComponent.isDisposed());
				assert.notStrictEqual(prevComponent, Router.getActiveComponent());
				done();
			});
		});
	});

	it('should not reuse component when routing to different path that uses same constructor name', function(done) {
		router = new Router({
			path: '/path/1',
			component: 'CustomComponent'
		});
		router2 = new Router({
			path: '/path/2',
			component: 'CustomComponent'
		});

		Router.router().navigate('/path/2').then(() => {
			var prevComponent = router2.getRouteComponent();
			Router.router().navigate('/path/1').then(() => {
				assert.ok(prevComponent.isDisposed());
				assert.notStrictEqual(prevComponent, Router.getActiveComponent());
				done();
			});
		});
	});

	it('should change router as usual if beforeDeactivateHandler returns nothing', function(done) {
		router = new Router({
			beforeDeactivateHandler: () => {
			},
			path: '/path1',
			component: CustomComponent
		});

		router2 = new Router({
			path: '/path2',
			component: CustomComponent2
		});

		Router.router().navigate('/path1').then(() => {
			assert.ok(Router.getActiveComponent() instanceof CustomComponent);
			assert.equal('/path1', window.location.pathname);

			Router.router().navigate('/path2').then(() => {
				assert.ok(Router.getActiveComponent() instanceof CustomComponent2);
				assert.equal('/path2', window.location.pathname);
				done();
			});
		});
	});

	it('should not change router if beforeDeactivateHandler returns "true"', function(done) {
		router = new Router({
			beforeDeactivateHandler: () => true,
			path: '/path1',
			component: CustomComponent
		});

		router2 = new Router({
			path: '/path2',
			component: CustomComponent2
		});

		Router.router().navigate('/path1').then(() => {
			assert.ok(Router.getActiveComponent() instanceof CustomComponent);
			assert.equal('/path1', window.location.pathname);

			Router.router().navigate('/path2').catch(() => {
				assert.ok(Router.getActiveComponent() instanceof CustomComponent);
				assert.equal('/path1', window.location.pathname);
				done();
			});
		});
	});

	it('should not change router if beforeDeactivateHandler given by name returns "true"', function(done) {
		class TestComponent extends CustomComponent {
			handleDeactivate() {
				return true;
			}
		}

		router = new Router({
			beforeDeactivateHandler: 'handleDeactivate',
			path: '/path1',
			component: TestComponent
		});

		router2 = new Router({
			path: '/path2',
			component: CustomComponent
		});

		Router.router().navigate('/path1').then(() => {
			assert.ok(Router.getActiveComponent() instanceof TestComponent);
			assert.equal('/path1', window.location.pathname);

			Router.router().navigate('/path2').catch(() => {
				assert.ok(Router.getActiveComponent() instanceof TestComponent);
				assert.notEqual('/path2', window.location.pathname);
				assert.equal('/path1', window.location.pathname);
				done();
			});
		});
	});

	it('should not throw error if function name given for "beforeDeactivateHandler" can\'t be found', function(done) {
		router = new Router({
			beforeDeactivateHandler: 'handleDeactivate',
			path: '/path1',
			component: CustomComponent
		});

		router2 = new Router({
			path: '/path2',
			component: CustomComponent
		});

		Router.router().navigate('/path1').then(() => {
			assert.ok(Router.getActiveComponent() instanceof CustomComponent);
			assert.equal('/path1', window.location.pathname);

			assert.throws(() => Router.router().navigate('/path2'));
			done();
		});
	});

	it('should clear active router and component when it\'s disposed', function(done) {
		router = new Router({
			path: '/path',
			component: CustomComponent
		});
		Router.router().navigate('/path').then(() => {
			assert.strictEqual(router, Router.activeRouter);
			assert.ok(Router.getActiveComponent() instanceof CustomComponent);

			router.dispose();
			assert.ok(!Router.activeRouter);
			assert.ok(!Router.getActiveComponent());
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
