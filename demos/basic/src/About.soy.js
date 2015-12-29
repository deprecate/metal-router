/* jshint ignore:start */
import Component from 'bower:metal/src/component/Component';
import SoyAop from 'bower:metal/src/soy/SoyAop';
import SoyRenderer from 'bower:metal/src/soy/SoyRenderer';
import SoyTemplates from 'bower:metal/src/soy/SoyTemplates';
var Templates = SoyTemplates.get();
// This file was automatically generated from About.soy.
// Please don't edit this file by hand.

/**
 * @fileoverview Templates in namespace Templates.About.
 */

if (typeof Templates.About == 'undefined') { Templates.About = {}; }


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @param {Object.<string, *>=} opt_ijData
 * @return {!soydata.SanitizedHtml}
 * @suppress {checkTypes}
 */
Templates.About.render = function(opt_data, opt_ignored, opt_ijData) {
  return soydata.VERY_UNSAFE.ordainSanitizedHtml('<a href="/demos/basic/">Home</a> | <a href="/demos/basic/home-page">Home Page</a> | <a href="/demos/basic/about">About</a> | <a href="/demos/basic/about-us">About Us</a> | <a href="/demos/basic/about-delayed">About Delayed</a>' + Templates.About.body(opt_data, null, opt_ijData) + Templates.About.footer(opt_data, null, opt_ijData));
};
if (goog.DEBUG) {
  Templates.About.render.soyTemplateName = 'Templates.About.render';
}


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @param {Object.<string, *>=} opt_ijData
 * @return {!soydata.SanitizedHtml}
 * @suppress {checkTypes}
 */
Templates.About.body = function(opt_data, opt_ignored, opt_ijData) {
  return soydata.VERY_UNSAFE.ordainSanitizedHtml('<p id="' + soy.$$escapeHtmlAttribute(opt_data.id) + '-body">' + Templates.Image.render(soy.$$augmentMap(opt_data, {id: 'image', width: 600, height: 383, src: 'img/img0.jpg'}), null, opt_ijData) + '</p>');
};
if (goog.DEBUG) {
  Templates.About.body.soyTemplateName = 'Templates.About.body';
}


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @param {Object.<string, *>=} opt_ijData
 * @return {!soydata.SanitizedHtml}
 * @suppress {checkTypes}
 */
Templates.About.footer = function(opt_data, opt_ignored, opt_ijData) {
  return soydata.VERY_UNSAFE.ordainSanitizedHtml('<p id="' + soy.$$escapeHtmlAttribute(opt_data.id) + '-footer">You are at page ' + soy.$$escapeHtml(opt_data.title) + '! Sub-route <a href="/demos/basic/about-subroute">click here</a>.' + soy.$$escapeHtml(Templates.Router.render({path: '/demos/basic/about-subroute', state: {title: 'About Sub-route'}, component: 'About'}, null, opt_ijData)) + '</p>');
};
if (goog.DEBUG) {
  Templates.About.footer.soyTemplateName = 'Templates.About.footer';
}

Templates.About.render.params = [];
Templates.About.body.params = ["id"];
Templates.About.footer.params = ["id","title"];

class About extends Component {}
About.RENDERER = SoyRenderer;
SoyAop.registerTemplates('About');
export default About;
/* jshint ignore:end */
