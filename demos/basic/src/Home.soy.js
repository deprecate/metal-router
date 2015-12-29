/* jshint ignore:start */
import Component from 'bower:metal/src/component/Component';
import SoyAop from 'bower:metal/src/soy/SoyAop';
import SoyRenderer from 'bower:metal/src/soy/SoyRenderer';
import SoyTemplates from 'bower:metal/src/soy/SoyTemplates';
var Templates = SoyTemplates.get();
// This file was automatically generated from Home.soy.
// Please don't edit this file by hand.

/**
 * @fileoverview Templates in namespace Templates.Home.
 */

if (typeof Templates.Home == 'undefined') { Templates.Home = {}; }


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @param {Object.<string, *>=} opt_ijData
 * @return {!soydata.SanitizedHtml}
 * @suppress {checkTypes}
 */
Templates.Home.content = function(opt_data, opt_ignored, opt_ijData) {
  return soydata.VERY_UNSAFE.ordainSanitizedHtml('<a href="/demos/basic/">Home</a> | <a href="/demos/basic/home-page">Home Page</a> | <a href="/demos/basic/about">About</a> | <a href="/demos/basic/about-us">About Us</a> | <a href="/demos/basic/about-delayed">About Delayed</a>' + Templates.Home.body(opt_data, null, opt_ijData) + Templates.Home.footer(opt_data, null, opt_ijData));
};
if (goog.DEBUG) {
  Templates.Home.content.soyTemplateName = 'Templates.Home.content';
}


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @param {Object.<string, *>=} opt_ijData
 * @return {!soydata.SanitizedHtml}
 * @suppress {checkTypes}
 */
Templates.Home.body = function(opt_data, opt_ignored, opt_ijData) {
  return soydata.VERY_UNSAFE.ordainSanitizedHtml('<p id="' + soy.$$escapeHtmlAttribute(opt_data.id) + '-body">' + Templates.Image.content(soy.$$augmentMap(opt_data, {id: 'image', width: 512, height: 256, src: 'img/img1.jpg'}), null, opt_ijData) + '</p>');
};
if (goog.DEBUG) {
  Templates.Home.body.soyTemplateName = 'Templates.Home.body';
}


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @param {Object.<string, *>=} opt_ijData
 * @return {!soydata.SanitizedHtml}
 * @suppress {checkTypes}
 */
Templates.Home.footer = function(opt_data, opt_ignored, opt_ijData) {
  return soydata.VERY_UNSAFE.ordainSanitizedHtml('<p id="' + soy.$$escapeHtmlAttribute(opt_data.id) + '-footer">You are at page ' + soy.$$escapeHtml(opt_data.title) + '!</p>');
};
if (goog.DEBUG) {
  Templates.Home.footer.soyTemplateName = 'Templates.Home.footer';
}

Templates.Home.content.params = [];
Templates.Home.body.params = ["id"];
Templates.Home.footer.params = ["id","title"];

class Home extends Component {}
Home.RENDERER = SoyRenderer;
SoyAop.registerTemplates('Home');
export default Home;
/* jshint ignore:end */
