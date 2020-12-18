/*
    Copyright 2014 OCAD University
    Copyright 2017 Raising the Floor, International

    Licensed under the Educational Community License (ECL), Version 2.0 or the New
    BSD license. You may not use this file except in compliance with one these
    Licenses.`

    You may obtain a copy of the ECL 2.0 License and BSD License at
    https://github.com/fluid-project/infusion/raw/main/Infusion-LICENSE.txt
*/
require('./index')
var hljs = require('highlight.js');
var fs   = require("fs-extra");
var path = require("path");

var rootPath = process.cwd();
var docsVersion = "development";

module.exports = function (eleventyConfig) {
    var markdownit = require('markdown-it')({
		html: true,
		highlight: function (str, lang) {
			if (lang && hljs.getLanguage(lang)) {
			  try {
				return '<pre class="highlight"><code class="hljs ' + lang + '">' +
					   hljs.highlight(lang, str, true).value +
					   '</code></pre>';
			  } catch (__) {}
			}
			return '<pre class="highlight"><code class="hljs ' + lang + '">' + markdownit.utils.escapeHtml(str) + '</code></pre>';
		}
    });
    var markdownItAnchor = require("markdown-it-anchor");
    var markdownItLibrary = markdownit.use(markdownItAnchor);

	eleventyConfig.setLibrary("md", markdownItLibrary);
    eleventyConfig.addPassthroughCopy({
        "node_modules/infusion/dist": "lib/infusion/dist",
        "node_modules/infusion/src": "lib/infusion/src",
        "node_modules/foundation-sites/css": "lib/foundation",
        "node_modules/octicons/octicons": "lib/octicons",
        "node_modules/lunr": "lib/lunr",
        "node_modules/gpii-express/src/js/lib": "lib/gpii-express",
        "node_modules/gpii-binder/src/js": "lib/gpii-binder",
        "node_modules/gpii-location-bar-relay/src/js": "lib/gpii-location-bar-relay",
        "src/static/css": "css",
        "src/static/fonts": "fonts",
        "src/static/js": "js",
        "src/static/images": "images",
        "src/scripts": "js",
        "src/documents/images": "images"
    });

    eleventyConfig.addHandlebarsHelper("ifEqual", function(a, b, options) {
        if (a === b) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    });
    eleventyConfig.addHandlebarsHelper("rewriteMdLinks", function(content) {
        return content.replace(/(<a\s[^>]*href="[\w-/\.]+)\.md(["#])/gm, "$1.html$2");
    });
    eleventyConfig.on("beforeBuild", () => {
        fs.removeSync("out");
        fs.removeSync("tmp-out");
    });
    eleventyConfig.on('afterBuild', () => {
        fs.moveSync("out", "tmp-out");
        fs.copySync("tmp-out", "out/infusion/" + docsVersion);
        fs.removeSync("tmp-out");
        require('./src/scripts/create-search-digest');
        fs.copySync(path.join(rootPath, "src", "ghpages-files"), "out");
    });

    return {
        dir: {
            input: "./src/documents",
            output: "./out",
            includes: "../layouts",
            data: "../_data"
        }
    }
}
