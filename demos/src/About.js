'use strict';

import templates from './About.soy.js';
import Component from 'metal-component';
import Soy from 'metal-soy';

class About extends Component {
	attached() {
		console.log('--> About attached');
	}

	rendered() {
		console.log('--> About rendered');
	}

	disposed() {
		console.log('--> About disposed');
	}
}

Soy.register(About, templates);

export default About;
