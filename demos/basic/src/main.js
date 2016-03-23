'use strict';

import { About } from './About.soy';
import { Home } from './Home.soy';
import Router from '../../../src/Router';
import './Image.soy';

// Routing from JavaScript -----------------------------------------------------

new Router({
	path: '/demos/basic',
	component: Home,
	initialState: {
		title: 'Home'
	}
});

new Router({
	path: '/demos/basic/home-page',
	component: Home,
	initialState: {
		title: 'Home Page'
	}
});

new Router({
	path: '/demos/basic/about',
	component: About,
	initialState: {
		title: 'About'
	}
});

new Router({
	path: '/demos/basic/about-us',
	component: About,
	initialState: {
		title: 'About Us'
	}
});

new Router({
	path: '/demos/basic/about-delayed',
	component: About,
	initialState: function() {
		return new Promise((resolve) => setTimeout(() => resolve({ title: 'About Delayed' }), 2000));
	}
});

// Attach events on router -----------------------------------------------------

Router.router().on('startNavigate', function(event) {
	console.log('-> Navigating to ' + event.path);
});

Router.router().on('endNavigate', function() {
	console.log('-> Navigation done');
});

// Dispatch router to the current browser url ----------------------------------

Router.router().dispatch();
