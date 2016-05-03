'use strict';

import Component from 'metal-component';
import IncrementalDomRenderer from 'metal-incremental-dom';
import Router from '../src/Router';
import RouterSoy from '../src/RouterSoy';

describe('RouterSoy', function() {
	var component;

	afterEach(function() {
		if (component) {
			component.dispose();
		}
	});

	it('should create instances of Router', function() {
		component = new RouterSoy({
			path: '/path',
			component: CustomComponent
		});
		assert.ok(component instanceof Router);
	});
});

class CustomComponent extends Component {
}
CustomComponent.RENDERER = IncrementalDomRenderer;
