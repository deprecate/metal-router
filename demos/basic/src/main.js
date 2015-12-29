import './Image.soy';

import Home from './Home.soy';
import About from './About.soy';
import Router from '../../../src/Router';

// Routing from JavaScript -----------------------------------------------------

new Router({
	path: '/demos/basic/',
	component: Home,
	state: {
		title: 'Home'
	}
});

new Router({
	path: '/demos/basic/home-page',
	component: Home,
	state: {
		title: 'Home Page'
	}
});

new Router({
	path: '/demos/basic/about',
	component: About,
	state: {
		title: 'About'
	}
});

new Router({
	path: '/demos/basic/about-us',
	component: About,
	state: {
		title: 'About Us'
	}
});

new Router({
	path: '/demos/basic/about-delayed',
	component: About,
	state: function() {
		return new Promise((resolve) => setTimeout(() => resolve({ title: 'About Delayed' }), 2000));
	}
});

// Attach events on router -----------------------------------------------------

Router.router().on('startNavigate', function(event) {
	console.log('-> Navigating to ' + event.path);
});

Router.router().on('endNavigate', function(event) {
	console.log('-> Navigation done');
});

// Dispatch router to the current browser url ----------------------------------

Router.router().dispatch();