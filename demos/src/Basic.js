'use strict';

import { About } from './About.soy';
import Component from 'metal-component';
import { Home } from './Home.soy';
import Router from '../../src/all/router.js';
import './Image.soy';

// Routing from JavaScript -----------------------------------------------------

var Basic = {
	run() {
		Component.render(Router, {
			path: '/demos/basic',
			component: Home,
			data: {
				title: 'Home'
			}
		});

		Component.render(Router, {
			path: '/demos/basic/home-page',
			component: Home,
			data: {
				title: 'Home Page'
			}
		});

		Component.render(Router, {
			path: '/demos/basic/about/:name(\\w+)?',
			component: About,
			data: {
				title: 'About'
			}
		});

		Component.render(Router, {
			path: '/demos/basic/about-delayed',
			component: About,
			data: function() {
				return new Promise((resolve) => setTimeout(() => resolve({ title: 'About Delayed' }), 2000));
			}
		});

		// Dispatch router to the current browser url ----------------------------------

		Router.router().dispatch();
	}
};

export default Basic;
