/* jshint ignore:start */
import Component from 'bower:metal/src/component/Component';
import SoyAop from 'bower:metal/src/soy/SoyAop';
import SoyRenderer from 'bower:metal/src/soy/SoyRenderer';
import SoyTemplates from 'bower:metal/src/soy/SoyTemplates';
var Templates = SoyTemplates.get();
// This file was automatically generated from Router.soy.
// Please don't edit this file by hand.

/**
 * @fileoverview Templates in namespace Templates.Router.
 */

if (typeof Templates.Router == 'undefined') { Templates.Router = {}; }


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @param {Object.<string, *>=} opt_ijData
 * @return {!soydata.SanitizedHtml}
 * @suppress {checkTypes}
 */
Templates.Router.render = function(opt_data, opt_ignored, opt_ijData) {
  return soydata.VERY_UNSAFE.ordainSanitizedHtml('<link id="' + soy.$$escapeHtmlAttribute(opt_data.id) + '" rel="metal-route"></link>');
};
if (goog.DEBUG) {
  Templates.Router.render.soyTemplateName = 'Templates.Router.render';
}

Templates.Router.render.params = ["id"];

class Router extends Component {}
Router.RENDERER = SoyRenderer;
SoyAop.registerTemplates('Router');
export default Router;
/* jshint ignore:end */
