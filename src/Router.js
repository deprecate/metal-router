'use strict';

import { core, object } from 'metal';
import { App, RequestScreen, Route } from 'senna';
import CancellablePromise from 'metal-promise';
import { Component, ComponentRegistry } from 'metal-component';
import IncrementalDomRenderer from 'metal-incremental-dom';

/**
 * Router class responsible for routing links to components.
 */
class Router extends Component {
	/**
	 * @inheritDoc
	 */
	created() {
		this.route = new Route(this.path, () => new Router.defaultScreen(this));
		this.route.router = this;
		Router.router().addRoutes(this.route);
	}

	/**
	 * @inheritDoc
	 */
	disposeInternal() {
		Router.router().removeRoute(this.route);
		super.disposeInternal();
	}

	/**
	 * Gets the currently active component from the current router.
	 * @return {Component}
	 */
	static getActiveComponent() {
		return Router.activeRouter ? Router.activeRouter.getRouteComponent() : null;
	}

	/**
	 * Gets this router's component, if there is one.
	 * @return {Component}
	 */
	getRouteComponent() {
		return this.components.comp;
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
			Router.routerInstance = new App();
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
	},

	/**
	 * If set to true active component will be used when routing to same
	 * component type.
	 * @type {boolean}
	 * @default true
	 */
	reuseActiveComponent: {
		validator: core.isBoolean,
		value: true
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
		var router = this.router;
		var redirectRouter = this.maybeFindRedirectRouter();
		if (redirectRouter) {
			router = redirectRouter;
		}

		Router.activeState = this.maybeParseLastLoadedStateAsJson();
		if (router.includeRoutingData) {
			Router.activeState = object.mixin({}, Router.activeState, {
				currentUrl: router.path
			});
		}

		if (Router.activeRouter) {
			var activeRouter = Router.activeRouter;
			activeRouter.isActive_ = false;

			var activeComponent = Router.getActiveComponent();
			if (router.reuseActiveComponent && (activeComponent instanceof router.component)) {
				// This call is important, as otherwise the component will be disposed
				// after `activeRouter` is updated, since the router won't render
				// anything this time. We want to reuse it in another router though.
				activeRouter.getRenderer().skipNextChildrenDisposal();
				delete activeRouter.components.comp;
				activeRouter.element = null;

				activeComponent.getRenderer().owner_ = router;
				activeComponent.getRenderer().parent_ = router;
				router.components.comp = activeComponent;
				router.element = activeComponent.element;
			}
		}

		Router.activeRouter = router;
		router.isActive_ = true;
	}

	/**
	 * @inheritDoc
	 */
	load(path) {
		this.setCacheable(this.router.cacheable);
		var deferred = CancellablePromise.resolve();
		if (this.router.fetch) {
			deferred = deferred.then(() => super.load(path));
		} else {
			deferred = deferred.then(() => this.router.data(path));
		}
		return deferred.then((loadedState) => {
			this.router.lastPath = path;
			this.router.lastLoadedState = loadedState;
			return loadedState;
		});
	}

	/**
	 * Some responses made by superclass performs a 302 redirect which will be
	 * reflected into the browser history path. When redirected, make sure to
	 * render the best component match to new path. If not found any, it will
	 * use current router component.
	 * @return {Router}
	 */
	maybeFindRedirectRouter() {
		var redirectPath = this.beforeUpdateHistoryPath(this.router.lastPath);
		if (redirectPath !== this.router.lastPath) {
			var redirectRoute = Router.router().findRoute(redirectPath);
			if (redirectRoute) {
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
}

/**
 * Default screen used for handling components.
 * @type {ComponentScreen}
 */
Router.defaultScreen = ComponentScreen;

export default Router;
