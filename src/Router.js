'use strict';

import { core, getFunctionName, object } from 'metal';
import { App, RequestScreen, Route } from 'senna';
import CancellablePromise from 'metal-promise';
import { Component, ComponentRegistry } from 'metal-component';
import IncrementalDomRenderer from 'metal-incremental-dom';
import Uri from 'metal-uri';

/**
 * Router class responsible for routing links to components.
 */
class Router extends Component {
	/**
	 * @inheritDoc
	 */
	created() {
		this.route = new Route(this.path, this.createScreen_.bind(this));
		this.route.router = this;
		Router.router().addRoutes(this.route);

		// Router is never active on the first render, since it needs to wait for
		// any async data to load first. This code is to make sure it won't lose
		// the reference to its `element` and cause it to be removed from the dom
		// (which would be bad for progressive enhancement) due to not rendering
		// anything. It will be set back in `attached`.
		this.firstRenderElement = this.element;
		this.element = null;
	}

	/**
	 * Adds routing data to the given state object.
	 * @param {string} path
	 * @param {!Object} state
	 * @return {!Object}
	 */
	addRoutingData(path, state) {
		if (this.includeRoutingData) {
			const params = this.lastExtractedParams || this.extractParams(path);
			const query = this.extractQuery(path);
			return object.mixin({}, state, {
				router: {
					currentUrl: path,
					params,
					query
				}
			});
		}
		return state;
	}

	/**
	 * @inheritDoc
	 */
	attached() {
		if (!this.wasRendered) {
			this.element = this.firstRenderElement;
		}
	}

	/**
	 * Creates the screen to be used by this router.
	 * @protected
	 */
	createScreen_() {
		this.screen_ = new Router.defaultScreen(this);
		return this.screen_;
	}

	/**
	 * @inheritDoc
	 */
	disposeInternal() {
		if (Router.activeRouter === this) {
			Router.activeRouter = null;
		}
		Router.router().removeRoute(this.route);
		super.disposeInternal();
	}

	/**
	 * Extracts any params present in the given path.
	 * @param {string} path
	 * @return {Object}
	 */
	extractParams(path) {
		return Router.router().extractParams(this.route, path);
	}

	/**
	 * Extracts any query params present in the given path.
	 * @param {string} path
	 * @return {Object}
	 */
	extractQuery(path) {
		const uri = new Uri(path);
		const queryStrings = {};

		const parameterNames = uri.getParameterNames();

		for (let i = 0; i < parameterNames.length; i++) {
			const name = parameterNames[i];

			queryStrings[name] = uri.getParameterValue(name);
		}

		return queryStrings;
	}

	/**
	 * Gets the currently active component from the current router.
	 * @return {Component}
	 */
	static getActiveComponent() {
		return Router.activeRouter ? Router.activeRouter.getRouteComponent() : null;
	}

	/**
	 * Gets the state for the currently active component.
	 * @return {Object}
	 */
	static getActiveState() {
		return Router.activeState;
	}

	/**
	 * Gets this router's component, if there is one.
	 * @return {Component}
	 */
	getRouteComponent() {
		return this.components.comp;
	}

	/**
	 * Gets the screen that is being used by this router.
	 */
	getScreen() {
		return this.screen_;
	}

	/**
	 * Renders the component, if the current path is active, or nothing otherwise.
	 */
	render() {
		if (this.isActive_) {
			IncrementalDOM.elementVoid(
				this.component,
				null,
				null,
				'ref',
				'comp',
				...this.toArray_(Router.activeState)
			);
		}
	}

	/**
	 * Returns the single Senna.js application that handles all `Router`
	 * instances, creating it if it hasn't been built yet.
	 * @return {!App}
	 * @static
	 */
	static router() {
		if (!Router.routerInstance) {
			const app = new App();
			app.setIgnoreQueryStringFromRoutePath(true);
			Router.routerInstance = app;
		}
		return Router.routerInstance;
	}

	/**
	 * Setter for the "component" state property.
	 * @param {!Function|string} ctor
	 * @return {!Function}
	 * @protected
	 */
	setterComponentFn_(ctor) {
		if (core.isString(ctor)) {
			ctor = ComponentRegistry.getConstructor(ctor);
		}
		return ctor;
	}

	/**
	 * Makes sure that the `Router` is only rerendered if either `isActive_` or
	 * `component` has changed. The other state properties are not used for
	 * rendering.
	 */
	shouldUpdate(changes) {
		return changes.isActive_ || changes.component;
	}

	/**
	 * Converts the given object into an array to be passed to an incremental dom
	 * call.
	 * @param {!Object} config
	 * @return {!Array}
	 * @protected
	 */
	toArray_(config) {
		var arr = [];
		var keys = Object.keys(config || {});
		for (var i = 0; i < keys.length; i++) {
			arr.push(keys[i], config[keys[i]]);
		}
		return arr;
	}
}

Router.RENDERER = IncrementalDomRenderer;

/**
 * Router state definition.
 * @type {!Object}
 * @static
 */
Router.STATE = {
	/**
	 * Handler to be called before a router is deactivated. Can be given as a
	 * function reference directly, or as the name of a function to be called in
	 * the router's component instance.
	 * @type {!function()|string}
	 */
	beforeDeactivateHandler: {
		validator: val => core.isString(val) || core.isFunction(val)
	},

	/**
	 * If set to true navigation will cache component state deferred results.
	 * @type {boolean}
	 * @default true
	 */
	cacheable: {
		validator: core.isBoolean,
		value: true
	},

	/**
	 * The constructor of the component to render when path is accessed.
	 * @type {!Function|string}
	 */
	component: {
		setter: 'setterComponentFn_'
	},

	/**
	 * Holds the load data value, function or deferred function that
	 * resolves the component configurations.
	 * @type {!Object|function(?string=)}
	 */
	data: {
		setter: (val) => core.isFunction(val) ? val : () => (val || {})
	},

	/**
	 * Flag indicating if the component's data should be loaded via a request
	 * to the server. By default the data will come from `data` instead.
	 */
	fetch: {
		value: false
	},

	/**
	 * Url to be used when fetching data for this route. If nothing is given,
	 * the current path will be used by default. Note that this is only relevant
	 * if "fetch" is set to `true`.
	 * @type {?string|function()}
	 */
	fetchUrl: {
		validator: val => core.isString(val) || core.isFunction(val)
	},

	/**
	 * The timeout in ms used by `Router.defaultScreen` in ajax requests for
	 * fetching data.
	 * @type {?number}
	 */
	fetchTimeout: {
		validator: val => core.isNumber(val) || !core.isDefAndNotNull(val),
		value: 30000
	},

	/**
	 * Flag indicating if routing data (such as the current url) should be
	 * included in the component's data.
	 */
	includeRoutingData: {
		value: true
	},

	/**
	 * Internal flag indicating if the router's path is currently active.
	 * @type {boolean}
	 */
	isActive_: {
		internal: true,
		value: false
	},

	/**
	 * Defines the path which will trigger the route handler responsible for
	 * rendering the metal component.
	 * @type {!string|RegExp|Function}
	 */
	path: {
	}
};

/**
 * Holds the active router.
 * @type {Router}
 * @static
 */
Router.activeRouter = null;

/**
 * Holds the active render state.
 * @type {*}
 * @static
 */
Router.activeState = null;

class ComponentScreen extends RequestScreen {

	/**
	 * @inheritDoc
	 */
	constructor(router) {
		super();

		if (!router) {
			throw new Error('Router not specified for component screen.');
		}

		/**
		 * Router responsible for the screen.
		 * @type {Router}
		 */
		this.router = router;

		// Sets the timeout used by `RequestScreen` to be the one specified by
		// the router.
		this.timeout = router.fetchTimeout;
	}

	/**
	 * Calls the handler specified by the router's `beforeDeactivateHandler`
	 * state property.
	 * @return {?boolean}
	 */
	beforeDeactivate() {
		const handler = this.router.beforeDeactivateHandler;
		if (handler) {
			if (core.isString(handler)) {
				const comp = this.router.getRouteComponent();
				if (comp && core.isFunction(comp[handler])) {
					return comp[handler]();
				} else {
					const compName = getFunctionName(comp);
					throw new Error(
						`No function named "${handler}" exists inside ${compName}.`
					);
				}
			} else {
				return handler();
			}
		}
	}

	/**
	 * Returns the path that should be used to update navigation history. When
	 * `fetchUrl` is given we should make sure that the original path is used
	 * instead of the request one.
	 * @param {string}
	 */
	beforeUpdateHistoryPath(path) {
		return this.router.fetchUrl ? path : super.beforeUpdateHistoryPath(path);
	}

	/**
	 * @inheritDoc
	 */
	evaluateScripts() {}

	/**
	 * @inheritDoc
	 */
	evaluateStyles() {}

	/**
	 * @inheritDoc
	 */
	flip() {
		this.maybeRedirectRouter();

		Router.activeState = this.router.addRoutingData(
			this.router.lastPath, this.maybeParseLastLoadedStateAsJson());

		if (Router.activeRouter) {
			Router.activeRouter.isActive_ = false;
			this.reuseActiveRouterElementInNewRouter_(this.router);
		}

		const deferred = this.waitRouterRenderSubComponents(this.router);
		Router.activeRouter = this.router;
		Router.activeRouter.isActive_ = true;
		return deferred;
	}

	/**
	 * Gets the url that should be used to fetch data.
	 * @param {string} path
	 * @return {string}
	 * @protected
	 */
	getFetchUrl_(path) {
		let fetchPath = this.router.fetchUrl || path;
		if (core.isFunction(fetchPath)) {
			fetchPath = fetchPath(path);
		}
		return fetchPath;
	}

	/**
	 * @inheritDoc
	 */
	load(path) {
		this.setCacheable(this.router.cacheable);
		var deferred = CancellablePromise.resolve();
		let params;
		if (this.router.fetch) {
			deferred = deferred.then(() => super.load(this.getFetchUrl_(path)));
		} else {
			params = this.router.extractParams(path);
			deferred = deferred.then(() => this.router.data(path, params));
		}
		return deferred.then((loadedState) => {
			this.router.lastPath = path;
			this.router.lastRedirectPath = this.maybeFindRedirectPath();
			this.router.lastLoadedState = loadedState;
			this.router.lastExtractedParams = params;
			return loadedState;
		});
	}

	/**
	 * Some responses made by superclass performs a 302 redirect which will be
	 * reflected into the browser history path. When redirected, make sure to
	 * render the best component match to new path.
	 * @return {?String} Redirect path.
	 */
	maybeFindRedirectPath() {
		var redirectPath = this.beforeUpdateHistoryPath(this.router.lastPath);
		if (redirectPath !== this.router.lastPath) {
			return redirectPath;
		}
		return null;
	}

	/**
	 * Some responses made by superclass performs a 302 redirect which will be
	 * reflected into the browser history path. When redirected, make sure to
	 * render the best component match to new path. If not found any, it will
	 * use current router component.
	 * @return {Router}
	 */
	maybeFindRedirectRouter() {
		var redirectPath = this.maybeFindRedirectPath();
		if (redirectPath) {
			var redirectRoute = Router.router().findRoute(redirectPath);
			if (redirectRoute) {
				// The initiator component will load the render state and follow any
				// "302" redirect that may happen. Therefore, the data returned of the
				// redirect is used as "lastLoadedState" and the "lastRedirectPath" as
				// "lastPath" for redirect router.
				redirectRoute.router.lastPath = this.router.lastRedirectPath;
				redirectRoute.router.lastLoadedState = this.router.lastLoadedState;
				return redirectRoute.router;
			}
		}
		return null;
	}

	/**
	 * Maybe parses last state as Json, if not able to parse an object is
	 * returned.
	 * @return {object}
	 */
	maybeParseLastLoadedStateAsJson() {
		var state = this.router.lastLoadedState;
		try {
			return JSON.parse(state);
		} catch (err) {
			return core.isDefAndNotNull(state) ? state : {};
		}
	}

	/**
	 * @protected
	 */
	maybeRedirectRouter() {
		var redirectRouter = this.maybeFindRedirectRouter();
		if (redirectRouter) {
			// If performing a redirect use "redirectRouter" as "this.router". The
			// initiator "this.router" is completely ignored from now on.
			this.router = redirectRouter;

			// Schedule screen cache redirect on "endNavigate".
			const app = Router.router();
			app.once('endNavigate', () => {
				app.screens[app.redirectPath] = app.screens[app.activePath];
				delete app.screens[app.activePath];
			});
		}
	}

	/**
	 * If the routers were attached to the same element when created, then they
	 * should reuse the same element when active, so we can guarantee that they
	 * will be positioned correctly.
	 * @param {Router} router The new router.
	 * @protected
	 */
	reuseActiveRouterElementInNewRouter_(router) {
		const activeRouter = Router.activeRouter;
		if (activeRouter !== router) {
			if (activeRouter.firstRenderElement === router.firstRenderElement) {
				router.element = activeRouter.element;
				activeRouter.element = null;
			}
		}
	}

	/**
	 * @param {Router} router
	 * @return {Promise}
	 * @protected
	 */
	waitRouterRenderSubComponents(router) {
		return new Promise((res) => router.once('rendered', res));
	}
}

/**
 * Default screen used for handling components.
 * @type {ComponentScreen}
 */
Router.defaultScreen = ComponentScreen;

export default Router;
