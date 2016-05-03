'use strict';

import templates from './RouterSoy.soy.js';
import Router from './Router';
import Soy from 'metal-soy';

/**
 * Same as `Router`, but can also be called within soy templates.
 */
class RouterSoy extends Router {
	shouldUpdate() {
		return true;
	}
}

Soy.register(RouterSoy, templates);

export default RouterSoy;
