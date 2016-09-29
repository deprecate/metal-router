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
	 * Renders the router placeholder.
	 */
	render() {
		IncrementalDOM.elementVoid('link', null, [], 'rel', 'metal-route');
	}

	/**
	 * Creates a new `Router` instance without rendering its placeholder element.
	 * @param {string} path
	 * @param {!Function} component
	 * @param {Object|function()} initialState
	 * @return {!Router}
	 */
	static route(path, component, initialState, includeCurrentUrl) {
		return new Router({
			path,
			component,
			initialState,
			includeCurrentUrl
		}, false);
	}

	/**
	 * Singleton to initializes and retrieve Senna.js application.
	 * @return {App}
	 * @static
	 */
	static router() {
		if (!Router.routerInstance) {
			Router.routerInstance = new App();
		}
		return Router.routerInstance;
	}

	/**
	 * Checks if instance of router is being routed to the same active
	 * component.
	 * @param {Router} router
	 * @return {Boolean}
	 */
	static isRoutingToSameActiveComponent(router) {
		return Router.activeComponent instanceof router.resolveComponentConstructor();
	}

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
	 * Creates component instance.
	 * @param {Object=} opt_config
	 * @param {Element=} opt_container
	 * @return {Component}
	 */
	createComponent(opt_config, opt_container) {
		return new (this.resolveComponentConstructor())(opt_config, opt_container);
	}

	/**
	 * Resolves component constructor from class name or reference.
	 * @return {Component}
	 */
	resolveComponentConstructor() {
		var componentConstructor = this.component;
		if (core.isString(componentConstructor)) {
			componentConstructor = ComponentRegistry.getConstructor(componentConstructor);
		}
		return componentConstructor;
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
	 * Metal component to render when path is accessed.
	 * @type {Component}
	 */
	component: {
	},

	/**
	 * Defines the node that the component will be rendered at.
	 * @type {!string|Element}
	 * @protected
	 */
	container: {
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
	 * Flag indicating if the current url should be included in the component's
	 * state.
	 */
	includeCurrentUrl: {
		value: false
	},

	/**
	 * Holds the load initial state value, function or deferred function that
	 * resolves the component configurations.
	 * @type {?Object|function(?string=)=}
	 */
	initialState: {
		setter: (val) => val ? (core.isFunction(val) ? val : () => val) : null
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
 * Holds the active component.
 * @type {Component}
 * @static
 */
Router.activeComponent = null;

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
		if (router.includeCurrentUrl) {
			Router.activeState = object.mixin({}, Router.activeState, {
				currentUrl: router.path
			});
		}

		if (this.router.reuseActiveComponent && Router.isRoutingToSameActiveComponent(router)) {
			Router.activeComponent.setState(Router.activeState);
		} else {
			if (Router.activeComponent) {
				Router.activeComponent.dispose();
			}
			Router.activeComponent = router.createComponent(Router.activeState, router.container);
		}
	}

	/**
	 * @inheritDoc
	 */
	load(path) {
		this.setCacheable(this.router.cacheable);
		var deferred = CancellablePromise.resolve();
		if (core.isNull(this.router.initialState)) {
			deferred = deferred.then(() => super.load(path));
		} else {
			deferred = deferred.then(() => this.router.initialState(path));
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
