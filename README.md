# DocumentOutline.js

This is a script that will expose information about a document’s outline. It was built for diagnostic purposes, but you can feel free to adapt it to your own needs.

## The HTML Document Outline

Well-authored HTML documents are consistent and organized. The headings (`h1`–`h6`) you use create a natural [document outline](http://www.w3.org/TR/2002/REC-UAAG10-20021217/guidelines#tech-provide-outline-view). This outline is useful for assistive technology (AT) in that it allows quick traversal of a document via headings. It is also useful from an SEO standpoint as headings generally contain important information and tend to be weighted more heavily by indexing programs.

## HTML4 vs. HTML5

Under the traditional document outlining algorithm, `h1` elements created unique sections for the document, with `h2` elements being nested below them, `h3` elements below the `h2` elements, and so on. Consider this markup:

	<h1>Main heading</h1>
	<p>Some content</p>
	<h2>A section</h2>
	<p>Some content</p>
	<h2>Another section</h2>
	<p>Some content</p>
	<h3>A sub-section</h3>
	<p>Some content</p>

The document outline resulting from this HTML would be

1. Main heading
	1. A section
	2. Another section
		1. A sub-section

This is an example of *implicit* sectioning. 

HTML5 introduced a new class of elements called *sectioning* elements. In theory, these elements—`article`, `aside`, `nav`, and `section`—create explicit sections within a document (or other sections). The upside to their introduction is that heading levels beyond `h6` are achievable because each section can begin with `h1` again. The downside is no browser has implemented this yet for numerous reasons.

So, theoretically, the following markup should result in the same outline:

	<h1>Main heading</h1>
	<p>Some content</p>
	<section>
	  <h1>A section</h1>
	  <p>Some content</p>
	</section>
	<section>
	  <h1>Another section</h1>
	  <p>Some content</p>
	  <section>
	    <h1>A sub-section</h1>
	    <p>Some content</p>
	  </section>
	</section>

Interestingly, so would this:

	<h1>Main heading</h1>
	<p>Some content</p>
	<section>
	  <h2>A section</h2>
	  <p>Some content</p>
	</section>
	<section>
	  <h2>Another section</h2>
	  <p>Some content</p>
	  <section>
	    <h3>A sub-section</h3>
	    <p>Some content</p>
	  </section>
	</section>

The latter is the recommended best practice.

See [HTML5 Doctor](http://html5doctor.com/) for [a complete overview of HTML document outlining](http://html5doctor.com/outlines/).

## What this Script Does

This script parses the document and collects information about the document outline. It then logs it to the console. It does so in two ways:

1. **The HTML5 Document Outline** - The first log is a JavaScript object containing the HTML5 document outline as it should theoretically exist. It will insert "MISSING HEADING" for any gaps in the outline caused by empty sectioning elements or skipped heading levels.
2. **Heading Level Collection** - The second log is a JavaScript object containing the following keys:
	* `legacy` - A count of each level of heading in the traditional outlining algorithm.
	* `html5` - A count of each level of heading in the HTML5 outlining algorithm.
	* `coerced` - A count of each level of heading under a theoretical "coerced" model where heading levels beyond `h6` would be exposed as `h6` in order to avoid breaking legacy AT.