'use strict';

import templates from './Home.soy.js';
import Component from 'metal-component';
import Soy from 'metal-soy';

class Home extends Component {
	attached() {
		console.log('--> Home attached');
	}

	rendered() {
		console.log('--> Home rendered');
	}

	disposed() {
		console.log('--> Home disposed');
	}
}

Soy.register(Home, templates);

export default Home;
