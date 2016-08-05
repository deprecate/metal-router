'use strict';

import Router from '../../src/RouterSoy';
import templates from './BasicSoy.soy.js';
import Component from 'metal-component';
import Soy from 'metal-soy';

class BasicSoy extends Component {
	attached() {
		// Dispatch router to the current browser url ----------------------------------
		Router.router().dispatch();
	}
	
	loadDelayedData() {
		return new Promise(resolve => {
			setTimeout(() => resolve({ title: 'About Delayed' }), 2000);
		});
	}
}

Soy.register(BasicSoy, templates);

export default BasicSoy;
