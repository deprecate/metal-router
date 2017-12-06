'use strict';

import CancellablePromise from 'metal-promise';
import {App} from 'senna';
import {isBoolean, isPromise} from 'metal';

/**
 * RouterApp class.
 */
class RouterApp extends App {
	/**
	 * Cancels next navigation with cancellation error.
	 * @return {!CancellablePromise}
	 */
	cancelNext_() {
		this.pendingNavigate = CancellablePromise.reject(
			new CancellablePromise.CancellationError('Cancelled by next screen')
		);
		return this.pendingNavigate;
	}

	/**
	 * @inheritdoc
	 */
	doNavigate_(...args) {
		let navigateDeferred = this.maybePreventDeactivate_(...args);

		if (!navigateDeferred) {
			navigateDeferred = this.maybePreventActivate_(...args);
		}

		if (navigateDeferred) {
			return navigateDeferred;
		}

		return super.doNavigate_(...args);
	}

	/**
	 * Invokes the next screen's `beforeRouterActivate` method which can
	 * return either a boolean or a promise that resolves to a boolean which
	 * can prevent the next navigation.
	 * @param {!string} path
	 * @param {*} ...args
	 * @return {?CancellablePromise}
	 */
	maybePreventActivate_(path, ...args) {
		const route = this.findRoute(path);
		const nextScreen = this.createScreenInstance(path, route);

		if (nextScreen) {
			const preventActivate = nextScreen.beforeRouterActivate();

			if (isBoolean(preventActivate) && preventActivate) {
				return this.cancelNext_();
			} else if (isPromise(preventActivate)) {
				return preventActivate.then(prevent => {
					if (prevent) {
						return this.cancelNext_();
					}

					this.pendingNavigate = null;
					return super.doNavigate_(path, ...args);
				});
			}
		}
	}

	/**
	 * Invokes the active screen's `beforeRouterDeactivate` method which can
	 * return either a boolean or a promise that resolves to a boolean which
	 * can prevent the next navigation.
	 * @param {*} ...args
	 * @return {?CancellablePromise}
	 */
	maybePreventDeactivate_(...args) {
		if (this.activeScreen) {
			const preventDeactivate = this.activeScreen.beforeRouterDeactivate(); // eslint-disable-line

			if (isBoolean(preventDeactivate) && preventDeactivate) {
				this.activeScreen.setDeactivate(true);
			} else if (isPromise(preventDeactivate)) {
				return preventDeactivate.then(prevent => {
					if (prevent) {
						this.activeScreen.setDeactivate(true);
					}

					this.pendingNavigate = null;
					return super.doNavigate_(...args);
				});
			}
		}
	}
}

export default RouterApp;
