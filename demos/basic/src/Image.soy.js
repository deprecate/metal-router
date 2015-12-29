/* jshint ignore:start */
import Component from 'bower:metal/src/component/Component';
import SoyAop from 'bower:metal/src/soy/SoyAop';
import SoyRenderer from 'bower:metal/src/soy/SoyRenderer';
import SoyTemplates from 'bower:metal/src/soy/SoyTemplates';
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
Templates.Image.content = function(opt_data, opt_ignored, opt_ijData) {
  return soydata.VERY_UNSAFE.ordainSanitizedHtml('<img id="' + soy.$$escapeHtmlAttribute(opt_data.id) + '" width="' + soy.$$escapeHtmlAttribute(opt_data.width) + '" height="' + soy.$$escapeHtmlAttribute(opt_data.height) + '" src="' + soy.$$escapeHtmlAttribute(soy.$$filterNormalizeUri(opt_data.src)) + '">');
};
if (goog.DEBUG) {
  Templates.Image.content.soyTemplateName = 'Templates.Image.content';
}

Templates.Image.content.params = ["height","id","src","width"];

class Image extends Component {}
Image.RENDERER = SoyRenderer;
SoyAop.registerTemplates('Image');
export default Image;
/* jshint ignore:end */
