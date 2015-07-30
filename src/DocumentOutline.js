(function(document){
	
	var outline = [],
		// Heading levels
		re_headings = /h([1-6])/,
		// Sectioning Elements
		re_sections = /section|article|aside|nav/,
		// Sectioning Roots (have their own outline)
		re_roots = /blockquote|details|fieldset|figure|td/,
		// Void elements and others we can safely ignore
		re_ignore = /img|meta|link|input|select|textarea|option|hr|br|script|style|iframe/,
		// counters for where we’re at in the outline
		level_counters = [],
		// tracking the current depth
		depth_offset = 0,
		// tracking the impact of headings on the current depth
		current_heading_depth = 0,
		// data collection object
		data = {
			legacy: {},
			html5: {},
			coerced: {}
		};

	// Adds an element’s children to the outline as appropriate
	function addToOutline( element, in_section, outer_heading_offset )
	{
		var // are we in a section?
			is_section = element.nodeName.toLowerCase().match( re_sections ),

			// does this section have a heading?
			has_heading = true,
			
			// for correcting for sections starting with a non-h1
			inner_heading_offset,
			
			// keep the initial values so we can reset them if we need to
			original_depth_offset = depth_offset,
			original_heading_depth = outer_heading_offset,
			
			// for looping the children
			children = element.children,
			children_count = children.length,
			i = 0;

		// headings are reset per section
		if ( is_section )
		{
			// console.log('Entering a sectioning element');
			
			// Noting that we are in a section as well (if se didn’t already know that)
			in_section = true;

			// Sections come in a level below the headings they follow
			depth_offset = outer_heading_offset + 1;
			// console.log('The outer heading set the depth as', depth_offset);

			// we’re gonna assume no heading until we find one
			has_heading = false;

			// Keep track of the depth (just in case there’s no heading)
			current_heading_depth = depth_offset;
			// console.log('Tracking the current heading depth for the section', current_heading_depth);
		}
		
		// loop the kids
		for ( ; i < children_count; i++ )
		{
			var child = children[i];
				match = child.nodeName.toLowerCase().match( re_headings ),
				this_depth = 0,
				this_tag = 0,
				infill = 0,
				html_mapping = '',
				html5_mapping = '',
				coerced_mapping = '';
				
			if ( match )
			{
				// Phew, should be an ok outline
				has_heading = true;

				// Getting the heading info
				this_tag = match[0];
				this_depth = parseInt( match[1], 10 );
				// console.log('Found a heading (', this_tag, ') with a natural depth of', this_depth);

				// console.log('Are we in a section?', in_section );
				if ( in_section )
				{
					// Account for the section having an explicit level
					this_depth--;
					// console.log('This is a heading inside a section, need to reduce its depth by one to', this_depth);
				}

				// Do we need an offset correction?
				if ( is_section &&
					 typeof( inner_heading_offset ) != "number" )
				{
					inner_heading_offset = 0 - this_depth;
					if ( inner_heading_offset )
					{
						// console.log('We’ll need to offset headings within this section by', inner_heading_offset);
					}
				}

				// Calculate the heading depth
				this_depth = depth_offset + ( inner_heading_offset || 0 ) + this_depth;
				// console.log('Calculated depth is', this_depth);

				// Do we need to fill any gaps?
				if ( ! level_counters[this_depth] )
				{
					// console.log('No counter at', this_depth, 'let’s create one');
					level_counters[this_depth] = 0;
					
					// Needed if a heading jumps several levels at once
					if ( this_depth > 1 )
					{
						// console.log('We may need to infill');
						infill = 1;
						while ( infill < this_depth )
						{
							if ( ! level_counters[infill] )
							{
								// Insert the counter
								// console.log('Adding a counter for level', infill);
								level_counters[infill] = 0;
							
								// Adding in the outline level
								insertHeading( 'MISSING HEADING', infill );
							}
							else
							{
								// console.log('We already have a counter for level', infill);
							}
							infill++;
						}
					}
				}

				// Add to the outline
				insertHeading( child.innerText, this_depth );

				// Keep track of the depth
				current_heading_depth = this_depth;
				// console.log('Tracking the current heading depth as', current_heading_depth);

				// Setting the fake A11y API mappings
				//child.setAttribute( 'data-html_heading_level', this_depth > 6 ? 6 : this_depth );
				//child.setAttribute( 'data-html5_heading_level', this_depth );

				// Tracking legacy mapping
				html_mapping = this_tag  + 's';
				if ( ! data.legacy[html_mapping] )
				{
					data.legacy[html_mapping] = 0;
				}
				data.legacy[html_mapping]++;
				
				// Tracking HTML5 mapping
				html5_mapping = 'h' + this_depth + 's';
				if ( ! data.html5[html5_mapping] )
				{
					data.html5[html5_mapping] = 0;
				}
				data.html5[html5_mapping]++;

				// Tracking coerced mapping
				coerced_mapping = 'h' + ( this_depth > 6 ? 6 : this_depth ) + 's';
				if ( ! data.coerced[coerced_mapping] )
				{
					data.coerced[coerced_mapping] = 0;
				}
				data.coerced[coerced_mapping]++;

			}
			else if ( child.nodeName.toLowerCase().match( re_sections ) )
			{
				// Catch if a section has no heading
				if ( ! has_heading )
				{
					// Adding in the outline level
					// console.log('No heading found, adding one')
					insertHeading( 'MISSING HEADING', current_heading_depth );
					
					// only do this once
					has_heading = true;
				}

				addToOutline( child, true, current_heading_depth );
			}
			else if ( ! child.nodeName.toLowerCase().match( re_roots ) &&
					  ! child.nodeName.toLowerCase().match( re_ignore ) )
			{
				addToOutline(
					child,
					( is_section ? true : false ),
					( is_section ? current_heading_depth : 0 )
				);
			}
			
		}
		
		// leaving the section, go up a level
		if ( is_section )
		{
			// console.log('Leaving the sectioning element');
			
			// console.log('Returning to a depth offset of', original_depth_offset);
			depth_offset = original_depth_offset;

			// console.log('Returning the heading offset to', original_heading_depth);
			current_heading_depth = original_heading_depth;
		}
		
	}

	// pushes to the outline stack
	function insertHeading( text, depth )
	{
		// console.log('Inserting a heading');
		// console.log('Counter Check!', level_counters);

		var level = level_counters.length,
			level_bits = [],
			counter;
		
		// increment the count at this level
		level_counters[depth]++;
		// console.log('Incremented the counter at', depth, 'to', level_counters[depth]);

		// Reset all sub-counters
		while ( --level > depth )
		{
			level_counters[level] = 0;
		}
		// console.log('Reset subcounters', level_counters);

		// build the counter
		level = 0;
		while ( level++ < depth )
		{
			level_bits.push( level_counters[level] );
		}
		counter = level_bits.join('.');

		// push to the outline
		outline[counter] = text;
		// console.log('Added', text, 'to the outline at position', counter);
	}
	
	// run it on the body
	addToOutline( document.body );
	
	// log the outline!
	console.log( outline );

	// log the mapping counts
	console.log( data );
	
}(this.document));