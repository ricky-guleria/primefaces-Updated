/*
 * Copyright 2009 Prime Technology.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.primefaces.resource.stream;

import static org.junit.Assert.*;

import org.junit.Test;
import org.primefaces.resource.ResourceUtils;

public class CSSResourceStreamerTest {

	@Test
	public void shouldReplaceRelativeURLsInCSSResources() {
		CSSResourceStreamer streamer = new CSSResourceStreamer();
		String version = ResourceUtils.VERSION_INFO;
		
		String input = "url(primefaces_resource:url:/yui/button/button.png)";
		
		String output = streamer.replaceRelativeUrl("/myapp", input);
		assertEquals("url(/myapp/primefaces_resource" + version + "/yui/button/button.png)", output);
	}
}