'use strict';

import Ajax from 'metal-ajax';
import IncrementalDomRenderer from 'metal-incremental-dom';
import dom from 'metal-dom';
import CancellablePromise from 'metal-promise';
import {Component, ComponentRegistry} from 'metal-component';
import {RequestScreen} from 'senna';

import Router from '../src/Router';
import RouterSoy from '../src/Router';

const defaultScreen = Router.defaultScreen;

describe('Router', function() {
	let comp;
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
		if (comp) {
			comp.dispose();
		}
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
			component: CustomComponent,
		});
		assert.ok(Router.router().hasRoutes());
	});

	it('should remove route from router from disposed router', function() {
		router = new Router({
			path: '/path',
			component: CustomComponent,
		});
		assert.ok(Router.router().hasRoutes());
		router.dispose();
		assert.ok(!Router.router().hasRoutes());
	});

	it('should return "Router.defaultScreen" instance from route handler', function() {
		router = new Router({
			path: '/path',
			component: CustomComponent,
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
			isActive_: true,
		});
		let child = router.components.comp;
		assert.ok(child instanceof CustomComponent);
	});

	it('should create component instance from constructor function', function() {
		router = new Router({
			path: '/path',
			component: CustomComponent,
			isActive_: true,
		});
		let child = router.components.comp;
		assert.ok(child instanceof CustomComponent);
	});

	it('should router accept data as function', function() {
		let data = sinon.stub();
		router = new Router({
			data: data,
			path: '/path',
			component: CustomComponent,
		});
		assert.strictEqual(data, router.data);
	});

	it('should router wrap data object or deferred in a function', function() {
		let data = new CancellablePromise(function() {});
		router = new Router({
			data: data,
			path: '/path',
			component: CustomComponent,
		});
		assert.strictEqual(data, router.data());
	});

	it('should throw error when ComponentScreen router not specified', function() {
		assert.throws(function() {
			new Router.defaultScreen(); // eslint-disable-line
		}, Error);
	});

	it('should not throw error when ComponentScreen router specified', function() {
		assert.doesNotThrow(function() {
			router = new Router({
				path: '/path',
				component: CustomComponent,
			});
			new Router.defaultScreen(router); // eslint-disable-line
		});
	});

	it('should set screen timeout to value specified by router', function() {
		router = new Router({
			path: '/path',
			component: CustomComponent,
			fetchTimeout: 100,
		});
		let screen = new Router.defaultScreen(router); // eslint-disable-line
		assert.strictEqual(100, screen.timeout);
	});

	it('should set screen timeout to null if specified by router', function() {
		router = new Router({
			path: '/path',
			component: CustomComponent,
			fetchTimeout: null,
		});
		let screen = new Router.defaultScreen(router); // eslint-disable-line
		assert.strictEqual(null, screen.timeout);
	});

	it('should not change screen timeout if value specified by router is invalid', function() {
		router = new Router({
			path: '/path',
			component: CustomComponent,
			fetchTimeout: 'foo',
		});
		let screen = new Router.defaultScreen(router); // eslint-disable-line
		assert.strictEqual(30000, screen.timeout);
	});

	it('should load path url and stores as router lastLoadedState if "fetch" is true', function(done) {
		let stub = sinon
			.stub(RequestScreen.prototype, 'load')
			.callsFake(function() {
				return 'sentinel';
			});
		router = new Router({
			path: '/path',
			component: CustomComponent,
			fetch: true,
		});
		Router.router()
			.navigate('/path')
			.then(() => {
				assert.strictEqual('sentinel', router.lastLoadedState);
				assert.strictEqual(1, RequestScreen.prototype.load.callCount);
				stub.restore();
				done();
			});
	});

	it('should load path url and stores as router lastLoadedState as Json if "fetch" is true', function(done) {
		let stub = sinon
			.stub(RequestScreen.prototype, 'load')
			.callsFake(function() {
				return '{"sentinel":true}';
			});
		router = new Router({
			path: '/path',
			component: CustomComponent,
			fetch: true,
		});
		Router.router()
			.navigate('/path')
			.then(() => {
				assert.equal(true, Router.activeState.sentinel);
				assert.strictEqual(1, RequestScreen.prototype.load.callCount);
				stub.restore();
				done();
			});
	});

	it('should fetch data from url specified by "fetchUrl" when "fetch" is true', function(done) {
		let stub = sinon
			.stub(RequestScreen.prototype, 'load')
			.callsFake(function() {
				return 'sentinel';
			});
		router = new Router({
			path: '/path',
			component: CustomComponent,
			fetchUrl: '/fetch/path',
			fetch: true,
		});
		Router.router()
			.navigate('/path')
			.then(() => {
				assert.strictEqual('sentinel', router.lastLoadedState);
				assert.strictEqual(1, RequestScreen.prototype.load.callCount);
				assert.strictEqual(
					'/fetch/path',
					RequestScreen.prototype.load.args[0][0]
				);
				stub.restore();
				done();
			});
	});

	it('should fetch data from url specified by "fetchUrl" function when "fetch" is true', function(done) {
		let stub = sinon
			.stub(RequestScreen.prototype, 'load')
			.callsFake(function() {
				return 'sentinel';
			});
		router = new Router({
			path: '/path',
			component: CustomComponent,
			fetchUrl: path => path + '.json',
			fetch: true,
		});
		Router.router()
			.navigate('/path')
			.then(() => {
				assert.strictEqual('sentinel', router.lastLoadedState);
				assert.strictEqual(1, RequestScreen.prototype.load.callCount);
				assert.strictEqual(
					'/path.json',
					RequestScreen.prototype.load.args[0][0]
				);
				stub.restore();
				done();
			});
	});

	it('should not use fetch url as navigation url', function(done) {
		const stub = sinon.stub(Ajax, 'request').callsFake(function() {
			return new CancellablePromise(function(resolve) {
				resolve({
					getResponseHeader: () => null,
					status: 200,
				});
			});
		});

		router = new Router({
			path: '/path',
			component: CustomComponent,
			fetchUrl: '/fetchUrl',
			fetch: true,
		});

		Router.router()
			.navigate('/path')
			.then(() => {
				assert.notEqual('/fetchUrl', window.location.pathname);
				assert.equal('/path', window.location.pathname);
				stub.restore();
				done();
			});
	});

	it('should router set screen cacheability to true based on its cacheable state', function(done) {
		router = new Router({
			path: '/path',
			component: CustomComponent,
			cacheable: true,
		});
		Router.router()
			.navigate('/path')
			.then(() => {
				assert.ok(router.getScreen().isCacheable());
				done();
			});
	});

	it('should router set screen cacheability to false based on its cacheable state', function(done) {
		router = new Router({
			path: '/path',
			component: CustomComponent,
			cacheable: false,
		});
		Router.router()
			.navigate('/path')
			.then(() => {
				assert.ok(!router.getScreen().isCacheable());
				done();
			});
	});

	it('should load router data and store as router lastLoadedState', function(done) {
		router = new Router({
			data: 'sentinel',
			path: '/path',
			component: CustomComponent,
		});
		Router.router()
			.navigate('/path')
			.then(() => {
				assert.strictEqual('sentinel', router.lastLoadedState);
				done();
			});
	});

	it('should include the current url in the active state by default', function(done) {
		let data = {
			foo: 'foo',
		};
		router = new Router({
			data: data,
			path: '/path',
			component: CustomComponent,
		});
		Router.router()
			.navigate('/path')
			.then(() => {
				assert.notStrictEqual(data, Router.activeState);
				assert.strictEqual(Router.activeState, Router.getActiveState());
				assert.strictEqual('foo', Router.activeState.foo);
				assert.ok(Router.activeState.router);
				assert.strictEqual('/path', Router.activeState.router.currentUrl);
				done();
			});
	});

	it('should add extracted param data to the active state by default', function(done) {
		let data = {
			foo: 'foo',
		};
		router = new Router({
			data: data,
			path: '/path/:foo(\\d+)/:bar',
			component: CustomComponent,
		});
		Router.router()
			.navigate('/path/123/abc')
			.then(() => {
				assert.notStrictEqual(data, Router.activeState);
				assert.strictEqual('foo', Router.activeState.foo);
				assert.ok(Router.activeState.router);
				assert.strictEqual(
					'/path/123/abc',
					Router.activeState.router.currentUrl
				);

				let expectedParams = {
					foo: '123',
					bar: 'abc',
				};
				assert.deepEqual(expectedParams, Router.activeState.router.params);
				done();
			});
	});

	it('should add extracted param data to the active state when setBasePath is used', function(done) {
		let data = {
			foo: 'foo',
		};
		Router.router().setBasePath('/path');
		router = new Router({
			data: data,
			path: '/:foo(\\d+)/:bar',
			component: CustomComponent,
		});
		Router.router()
			.navigate('/path/123/abc')
			.then(() => {
				assert.notStrictEqual(data, Router.activeState);
				assert.strictEqual('foo', Router.activeState.foo);
				assert.ok(Router.activeState.router);
				assert.strictEqual(
					'/path/123/abc',
					Router.activeState.router.currentUrl
				);

				let expectedParams = {
					foo: '123',
					bar: 'abc',
				};
				assert.deepEqual(expectedParams, Router.activeState.router.params);
				done();
			});
	});

	it('should add extracted query data to the active state by default', function(done) {
		let data = {
			foo: 'foo',
		};
		router = new Router({
			data: data,
			path: '/path',
			component: CustomComponent,
		});
		Router.router()
			.navigate('/path?foo=bar&baz=qux')
			.then(() => {
				assert.ok(Router.activeState.router);

				let query = {
					foo: 'bar',
					baz: 'qux',
				};
				assert.deepEqual(query, Router.activeState.router.query);
				done();
			});
	});

	it('should not include data in the active state if "includeRoutingData" is set to false', function(done) {
		let data = {
			foo: 'foo',
		};
		router = new Router({
			data: data,
			path: '/path',
			component: CustomComponent,
			includeRoutingData: false,
		});
		Router.router()
			.navigate('/path')
			.then(() => {
				assert.strictEqual(data, Router.activeState);
				assert.strictEqual('foo', Router.activeState.foo);
				assert.ok(!Router.activeState.router);
				done();
			});
	});

	it('should pass path and extracted params to data function', function(done) {
		let data = sinon.stub();
		router = new Router({
			data: data,
			path: '/path/:foo(\\d+)/:bar',
			component: CustomComponent,
		});
		Router.router()
			.navigate('/path/123/abc')
			.then(() => {
				assert.equal(1, data.callCount);
				assert.strictEqual('/path/123/abc', data.args[0][0]);

				let expectedParams = {
					foo: '123',
					bar: 'abc',
				};
				assert.deepEqual(expectedParams, data.args[0][1]);
				done();
			});
	});

	it('should render component when routing to path', function(done) {
		router = new Router({
			path: '/path',
			component: CustomComponent,
		});

		Router.router()
			.navigate('/path')
			.then(() => {
				assert.ok(Router.getActiveComponent() instanceof CustomComponent);
				assert.ok(Router.getActiveComponent().wasRendered);
				done();
			});
	});

	it('should render component with right element when routing to path', function(done) {
		dom.append(document.body, '<div id="el"><div></div></div>');
		let element = document.querySelector('#el > div');
		router = new Router({
			element: '#el > div',
			path: '/path',
			component: CustomComponent,
		});

		Router.router()
			.navigate('/path')
			.then(() => {
				assert.strictEqual(element, router.element);
				assert.equal('el', element.parentNode.id);
				done();
			});
	});

	it('should not reset router element to initial value after reattached', function() {
		dom.append(document.body, '<div id="el"><div></div></div>');
		let element = document.querySelector('#el > div');
		router = new Router({
			element: '#el > div',
			path: '/path',
			component: CustomComponent,
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
			component: CustomComponent,
		});
		let redirectRouter = new Router({
			path: '/redirect',
			component: RedirectComponent,
		});
		Router.router()
			.navigate('/path')
			.then(() => {
				assert.ok(Router.getActiveComponent() instanceof RedirectComponent);
				assert.ok(Router.getActiveComponent().wasRendered);
				redirectRouter.dispose();
				done();
			});
	});

	it('should set redirect router as active router', function(done) {
		class TestScreen extends Router.defaultScreen {
			beforeUpdateHistoryPath() {
				return '/redirect';
			}
		}
		Router.defaultScreen = TestScreen;

		router = new Router({
			path: '/path',
			component: CustomComponent,
		});
		let redirectRouter = new Router({
			path: '/redirect',
			component: RedirectComponent,
		});
		Router.router()
			.navigate('/path')
			.then(() => {
				assert.strictEqual(redirectRouter, Router.activeRouter);
				assert.strictEqual(
					RedirectComponent,
					Router.router().screens['/redirect'].router.component
				);
				assert.ok(!Router.router().screens['/path']);
				assert.ok(Router.router().screens['/redirect']);
				redirectRouter.dispose();
				done();
			});
	});

	it('should store "lastPath" and "lastLoadedState" in redirect router when routing to path that got redirected', function(done) {
		class TestScreen extends Router.defaultScreen {
			beforeUpdateHistoryPath() {
				return '/redirect';
			}
		}
		Router.defaultScreen = TestScreen;

		router = new Router({
			path: '/path',
			component: CustomComponent,
		});
		let redirectRouter = new Router({
			path: '/redirect',
			component: RedirectComponent,
		});
		Router.router()
			.navigate('/path')
			.then(() => {
				assert.strictEqual('/redirect', Router.activeRouter.lastPath);
				assert.deepEqual({}, Router.activeRouter.lastLoadedState);
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
			component: CustomComponent,
		});
		Router.router()
			.navigate('/path')
			.then(() => {
				assert.ok(Router.getActiveComponent() instanceof CustomComponent);
				assert.ok(Router.getActiveComponent().wasRendered);
				done();
			});
	});

	it('should render component as the router element', function(done) {
		router = new Router({
			path: '/path',
			component: CustomComponent,
		});
		Router.router()
			.navigate('/path')
			.then(() => {
				let comp = router.components.comp;
				assert.strictEqual(comp.element, router.element);
				done();
			});
	});

	it('should rerender if component constructor changes', function(done) {
		router = new Router({
			path: '/path',
			component: CustomComponent,
		});
		Router.router()
			.navigate('/path')
			.then(() => {
				let listener = sinon.stub();
				router.on('rendered', listener);

				let comp = router.getRouteComponent();
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
			component: CustomComponent,
		});
		Router.router()
			.navigate('/path')
			.then(() => {
				let listener = sinon.stub();
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
			component: CustomComponent,
		});
		router2 = new Router({
			path: '/path/2',
			component: CustomComponent2,
		});

		Router.router()
			.navigate('/path/2')
			.then(() => {
				let prevComponent = router2.getRouteComponent();
				assert.strictEqual(prevComponent.element, router2.element);

				Router.router()
					.navigate('/path')
					.then(() => {
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
		let element = document.querySelector('#el > div');
		router = new Router({
			element,
			path: '/path',
			component: CustomComponent,
		});
		router2 = new Router({
			element,
			path: '/path/2',
			component: CustomComponent2,
		});

		Router.router()
			.navigate('/path/2')
			.then(() => {
				assert.strictEqual(element, router2.element);
				assert.equal('el', element.parentNode.id);

				Router.router()
					.navigate('/path')
					.then(() => {
						assert.strictEqual(element, router.element);
						assert.equal('el', element.parentNode.id);
						done();
					});
			});
	});

	it('should reuse component when routing to same router path pattern that uses same constructor', function(done) {
		router = new Router({
			path: '/path/:part',
			component: CustomComponent,
		});

		Router.router()
			.navigate('/path/part1')
			.then(() => {
				let prevComponent = router.getRouteComponent();
				sinon.spy(prevComponent, 'dispose');

				Router.router()
					.navigate('/path/part2')
					.then(() => {
						assert.strictEqual(0, prevComponent.dispose.callCount);
						assert.strictEqual(prevComponent, Router.getActiveComponent());
						done();
					});
			});
	});

	it('should reuse component when routing to same router path pattern that uses same constructor name', function(done) {
		router = new Router({
			path: '/path/:part',
			component: 'CustomComponent',
		});

		Router.router()
			.navigate('/path/part1')
			.then(() => {
				let prevComponent = router.getRouteComponent();
				sinon.spy(prevComponent, 'dispose');

				Router.router()
					.navigate('/path/part2')
					.then(() => {
						assert.strictEqual(0, prevComponent.dispose.callCount);
						assert.strictEqual(prevComponent, Router.getActiveComponent());
						done();
					});
			});
	});

	it('should not reuse component when routing to different path that uses same constructor', function(done) {
		router = new Router({
			path: '/path/1',
			component: CustomComponent,
		});
		router2 = new Router({
			path: '/path/2',
			component: CustomComponent,
		});

		Router.router()
			.navigate('/path/2')
			.then(() => {
				let prevComponent = router2.getRouteComponent();
				Router.router()
					.navigate('/path/1')
					.then(() => {
						assert.ok(prevComponent.isDisposed());
						assert.notStrictEqual(prevComponent, Router.getActiveComponent());
						done();
					});
			});
	});

	it('should not reuse component when routing to different path that uses same constructor name', function(done) {
		router = new Router({
			path: '/path/1',
			component: 'CustomComponent',
		});
		router2 = new Router({
			path: '/path/2',
			component: 'CustomComponent',
		});

		Router.router()
			.navigate('/path/2')
			.then(() => {
				let prevComponent = router2.getRouteComponent();
				Router.router()
					.navigate('/path/1')
					.then(() => {
						assert.ok(prevComponent.isDisposed());
						assert.notStrictEqual(prevComponent, Router.getActiveComponent());
						done();
					});
			});
	});

	it('should change router as usual if beforeDeactivateHandler returns nothing', function(done) {
		router = new Router({
			beforeDeactivateHandler: () => {},
			path: '/path/1',
			component: CustomComponent,
		});

		router2 = new Router({
			path: '/path/2',
			component: CustomComponent2,
		});

		Router.router()
			.navigate('/path/1')
			.then(() => {
				assert.ok(Router.getActiveComponent() instanceof CustomComponent);
				assert.equal('/path/1', window.location.pathname);

				Router.router()
					.navigate('/path/2')
					.then(() => {
						assert.ok(Router.getActiveComponent() instanceof CustomComponent2);
						assert.equal('/path/2', window.location.pathname);
						done();
					});
			});
	});

	it('should not change router if beforeDeactivateHandler returns "true"', function(done) {
		router = new Router({
			beforeDeactivateHandler: () => true,
			path: '/path/1',
			component: CustomComponent,
		});

		router2 = new Router({
			path: '/path/2',
			component: CustomComponent2,
		});

		Router.router()
			.navigate('/path/1')
			.then(() => {
				assert.ok(Router.getActiveComponent() instanceof CustomComponent);
				assert.equal('/path/1', window.location.pathname);

				Router.router()
					.navigate('/path/2')
					.catch(() => {
						assert.ok(Router.getActiveComponent() instanceof CustomComponent);
						assert.equal('/path/1', window.location.pathname);
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
			path: '/path/1',
			component: TestComponent,
		});

		router2 = new Router({
			path: '/path/2',
			component: CustomComponent,
		});

		Router.router()
			.navigate('/path/1')
			.then(() => {
				assert.ok(Router.getActiveComponent() instanceof TestComponent);
				assert.equal('/path/1', window.location.pathname);

				Router.router()
					.navigate('/path/2')
					.catch(() => {
						assert.ok(Router.getActiveComponent() instanceof TestComponent);
						assert.notEqual('/path/2', window.location.pathname);
						assert.equal('/path/1', window.location.pathname);
						done();
					});
			});
	});

	it('should not throw error if function name given for "beforeDeactivateHandler" can\'t be found', function(done) {
		router = new Router({
			beforeDeactivateHandler: 'handleDeactivate',
			path: '/path/1',
			component: CustomComponent,
		});

		router2 = new Router({
			path: '/path/2',
			component: CustomComponent,
		});

		Router.router()
			.navigate('/path/1')
			.then(() => {
				assert.ok(Router.getActiveComponent() instanceof CustomComponent);
				assert.equal('/path/1', window.location.pathname);

				assert.throws(() => Router.router().navigate('/path/2'));
				done();
			});
	});

	it('should clear active router and component when it\'s disposed', function(done) {
		router = new Router({
			path: '/path',
			component: CustomComponent,
		});
		Router.router()
			.navigate('/path')
			.then(() => {
				assert.strictEqual(router, Router.activeRouter);
				assert.ok(Router.getActiveComponent() instanceof CustomComponent);

				router.dispose();
				assert.ok(!Router.activeRouter);
				assert.ok(!Router.getActiveComponent());
				done();
			});
	});

	it('should defer screen flip until Router component render all children', function(done) {
		let activeComponent;
		class TestScreen extends Router.defaultScreen {
			flip() {
				return super
					.flip()
					.then(() => (activeComponent = Router.getActiveComponent()));
			}
		}
		Router.defaultScreen = TestScreen;

		router = new Router({
			path: '/path',
			component: CustomComponent,
		});
		Router.router()
			.navigate('/path')
			.then(() => {
				assert.ok(activeComponent);
				done();
			});
	});

	it('should create nested routes from IncrementalDOM calls', function() {
		class FirstComponent {}
		class SecondComponent {}
		class ThirdComponent {}

		class ParentComponent extends Component {
			render() {
				IncrementalDOM.elementOpen(
					Router,
					null,
					null,
					'component',
					FirstComponent,
					'path',
					'/path'
				);
				IncrementalDOM.elementOpen(
					Router,
					null,
					null,
					'component',
					SecondComponent,
					'path',
					'/first'
				);
				IncrementalDOM.elementVoid(
					Router,
					null,
					null,
					'component',
					ThirdComponent,
					'path',
					'/second'
				);
				IncrementalDOM.elementClose(Router);
				IncrementalDOM.elementClose(Router);
			}
		}
		ParentComponent.RENDERER = IncrementalDomRenderer;

		comp = new ParentComponent();

		const {routes} = Router.router();

		assert.equal(routes.length, 3);
		assert.equal(routes[0].path, '/path');
		assert.equal(routes[1].path, '/path/first');
		assert.equal(routes[2].path, '/path/first/second');
		assert.deepEqual(routes[0].router.component, FirstComponent);
		assert.deepEqual(routes[1].router.component, SecondComponent);
		assert.deepEqual(routes[2].router.component, ThirdComponent);
	});

	it('should throw error if nested Router does not pass path that is a string', function() {
		class FirstComponent {}

		class ParentComponent extends Component {
			render() {
				IncrementalDOM.elementOpen(
					Router,
					null,
					null,
					'component',
					FirstComponent,
					'path',
					'/path'
				);
				IncrementalDOM.elementVoid(
					Router,
					null,
					null,
					'component',
					FirstComponent,
					'path',
					/\/first/
				);
				IncrementalDOM.elementClose(Router);
			}
		}
		ParentComponent.RENDERER = IncrementalDomRenderer;

		assert.throws(() => {
			comp = new ParentComponent();
		}, 'When nesting Routers, both parent and child path values must be strings.');
	});

	it('should throw error if parent Router does not have path that is a string', function() {
		class FirstComponent {}

		class ParentComponent extends Component {
			render() {
				IncrementalDOM.elementOpen(
					Router,
					null,
					null,
					'component',
					FirstComponent,
					'path',
					/\/first/
				);
				IncrementalDOM.elementVoid(
					Router,
					null,
					null,
					'component',
					FirstComponent,
					'path',
					'/first'
				);
				IncrementalDOM.elementClose(Router);
			}
		}
		ParentComponent.RENDERER = IncrementalDomRenderer;

		assert.throws(() => {
			comp = new ParentComponent();
		}, 'When nesting Routers, both parent and child path values must be strings.');
	});

	it('should throw error if nested component is not an instance of Router', function() {
		class FirstComponent {}

		class ParentComponent extends Component {
			render() {
				IncrementalDOM.elementOpen(
					Router,
					null,
					null,
					'component',
					FirstComponent,
					'path',
					'/path'
				);
				IncrementalDOM.elementVoid(FirstComponent);
				IncrementalDOM.elementClose(Router);
			}
		}
		ParentComponent.RENDERER = IncrementalDomRenderer;

		assert.throws(() => {
			comp = new ParentComponent();
		}, 'Router can only receive additional Routers as children.');
	});
});

describe('RouterSoy', function() {
	let component;

	afterEach(function() {
		if (component) {
			component.dispose();
		}
	});

	it('should create instances of Router', function() {
		component = new RouterSoy({
			path: '/path',
			component: CustomComponent,
		});
		assert.ok(component instanceof Router);
	});
});

class CustomComponent extends Component {}
CustomComponent.RENDERER = IncrementalDomRenderer;
ComponentRegistry.register(CustomComponent);

class CustomComponent2 extends Component {}
CustomComponent2.RENDERER = IncrementalDomRenderer;

class RedirectComponent extends Component {}
RedirectComponent.RENDERER = IncrementalDomRenderer;
