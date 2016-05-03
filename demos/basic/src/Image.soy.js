/* jshint ignore:start */
import Component from 'metal-component/src/Component';
import Soy from 'metal-soy/src/Soy';
var templates;
goog.loadModule(function(exports) {

// This file was automatically generated from Image.soy.
// Please don't edit this file by hand.

/**
 * @fileoverview Templates in namespace Image.
 * @public
 */

goog.module('Image.incrementaldom');

/** @suppress {extraRequire} */
var soy = goog.require('soy');
/** @suppress {extraRequire} */
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
  ie_open('img', null, null,
      'id', opt_data.id,
      'width', opt_data.width,
      'height', opt_data.height,
      'src', opt_data.src);
  ie_close('img');
}
exports.render = $render;
if (goog.DEBUG) {
  $render.soyTemplateName = 'Image.render';
}

exports.render.params = ["height","id","src","width"];
exports.render.types = {"height":"any","id":"any","src":"any","width":"any"};
templates = exports;
return exports;

});

class Image extends Component {}
Soy.register(Image, templates);
export { Image, templates };
export default templates;
/* jshint ignore:end */
