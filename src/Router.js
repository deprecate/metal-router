'use strict';

import core from 'bower:metal/src/core';
import CancellablePromise from 'bower:metal-promise/src/promise/Promise';
import ComponentRegistry from 'bower:metal/src/component/ComponentRegistry';
import App from 'bower:senna.js/src/app/App';
import Route from 'bower:senna.js/src/route/Route';
import RequestScreen from 'bower:senna.js/src/screen/RequestScreen';
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
		validator: core.isString
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
		var state = this.maybeParseLastStateAsJson();

		if (Router.isRoutingToSameActiveComponent(this.router)) {
			Router.activeComponent.setAttrs(state);
		} else {
			if (Router.activeComponent) {
				Router.activeComponent.dispose();
			}
			Router.activeComponent = this.router.createComponent(state).render();
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
		return deferred.then((loadedState) => this.router.lastState = loadedState);
	}

	/**
	 * Maybe parses last state as Json, if not able to parse an object is
	 * returned.
	 * @return {object}
	 */
	maybeParseLastStateAsJson() {
		var state = this.router.lastState;
		try {
			return JSON.parse(state);
		} catch (err) {
			return state;
		}
	}

}

/**
 * Default screen used for handling components.
 * @type {ComponentScreen}
 */
Router.defaultScreen = ComponentScreen;

export default Router;
