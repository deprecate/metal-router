/* jshint ignore:start */
import Component from 'metal-component';
import { SoyAop, SoyRenderer, SoyTemplates } from 'metal-soy';
var Templates = SoyTemplates.get();
// This file was automatically generated from Image.soy.
// Please don't edit this file by hand.

/**
 * @fileoverview Templates in namespace Templates.Image.
 */

if (typeof Templates.Image == 'undefined') { Templates.Image = {}; }


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @param {Object.<string, *>=} opt_ijData
 * @return {!soydata.SanitizedHtml}
 * @suppress {checkTypes}
 */
Templates.Image.render = function(opt_data, opt_ignored, opt_ijData) {
  return soydata.VERY_UNSAFE.ordainSanitizedHtml('<img id="' + soy.$$escapeHtmlAttribute(opt_data.id) + '" width="' + soy.$$escapeHtmlAttribute(opt_data.width) + '" height="' + soy.$$escapeHtmlAttribute(opt_data.height) + '" src="' + soy.$$escapeHtmlAttribute(soy.$$filterNormalizeUri(opt_data.src)) + '">');
};
if (goog.DEBUG) {
  Templates.Image.render.soyTemplateName = 'Templates.Image.render';
}

Templates.Image.render.params = ["height","id","src","width"];

class Image extends Component {}
Image.RENDERER = SoyRenderer;
SoyAop.registerTemplates('Image');
export default Image;
/* jshint ignore:end */
