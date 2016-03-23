/* jshint ignore:start */
import Component from 'metal-component/src/Component';
import Soy from 'metal-soy/src/Soy';
var templates;
goog.loadModule(function(exports) {

// This file was automatically generated from Router.soy.
// Please don't edit this file by hand.

/**
 * @fileoverview Templates in namespace Router.
 * @public
 */

goog.module('Router.incrementaldom');

var soy = goog.require('soy');
var soydata = goog.require('soydata');
/** @suppress {extraRequire} */
goog.require('goog.i18n.bidi');
/** @suppress {extraRequire} */
goog.require('goog.asserts');
var IncrementalDom = goog.require('incrementaldom');
var ie_open = IncrementalDom.elementOpen;
var ie_close = IncrementalDom.elementClose;
var ie_void = IncrementalDom.elementVoid;
var ie_open_start = IncrementalDom.elementOpenStart;
var ie_open_end = IncrementalDom.elementOpenEnd;
var itext = IncrementalDom.text;
var iattr = IncrementalDom.attr;


/**
 * @param {Object<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @param {Object<string, *>=} opt_ijData
 * @return {void}
 * @suppress {checkTypes}
 */
function $render(opt_data, opt_ignored, opt_ijData) {
  opt_data = opt_data || {};
  ie_void('link', null, null,
      'id', opt_data.id,
      'rel', 'metal-route');
}
exports.render = $render;
if (goog.DEBUG) {
  $render.soyTemplateName = 'Router.render';
}

exports.render.params = ["id"];
templates = exports;
return exports;

});

class Router extends Component {}
Soy.register(Router, templates);
export default templates;
export { Router, templates };
/* jshint ignore:end */
