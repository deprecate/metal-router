'use strict';

import core from 'metal/src/core';
import CancellablePromise from 'metal-promise/src/promise/Promise';
import ComponentRegistry from 'metal/src/component/ComponentRegistry';
import App from 'senna/src/app/App';
import Route from 'senna/src/route/Route';
import RequestScreen from 'senna/src/screen/RequestScreen';
import RouterBase from './Router.soy';

class Router extends RouterBase {

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
	 * Router class responsible for routing links to components.
	 * @constructor
	 */
	constructor(opt_config) {
		super(opt_config);
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
	 * @param  {?object=} opt_config
	 * @return {Component}
	 */
	createComponent(opt_config) {
		return new (this.resolveComponentConstructor())(opt_config);
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


/**
 * Router attributes definition.
 * @type {!Object}
 * @static
 */
Router.ATTRS = {
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
	 * Defines the path which will trigger the route handler responsible for
	 * rendering the metal component.
	 * @type {!string|RegExp|Function}
	 * @protected
	 */
	path: {
	},

	/**
	 * If set to true component will be decorated instead of rendered.
	 * @type {boolean}
	 * @default false
	 */
	progressiveEnhancement: {
		validator: core.isBoolean,
		value: false
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
	},

	/**
	 * Holds the load state value, function or deferred function that
	 * resolves the component configurations.
	 * @type {?Object|function(?string=)=}
	 */
	state: {
		setter: (val) => val ? (core.isFunction(val) ? val : () => val) : null
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
	}

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

		if (this.router.reuseActiveComponent && Router.isRoutingToSameActiveComponent(router)) {
			Router.activeComponent.setAttrs(Router.activeState);
		} else {
			if (Router.activeComponent) {
				Router.activeComponent.dispose();
			}
			Router.activeComponent = router.createComponent(Router.activeState);
			if (router.progressiveEnhancement) {
				Router.activeComponent.decorate();
			} else {
				Router.activeComponent.render();
			}
		}
	}

	/**
	 * @inheritDoc
	 */
	load(path) {
		this.setCacheable(this.router.cacheable);
		var deferred = CancellablePromise.resolve();
		if (core.isNull(this.router.state)) {
			deferred = deferred.then(() => super.load(path));
		} else {
			deferred = deferred.then(() => this.router.state(path));
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
