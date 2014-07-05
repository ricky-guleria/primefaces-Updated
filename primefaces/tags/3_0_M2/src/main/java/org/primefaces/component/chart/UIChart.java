/*
 * Copyright 2009-2011 Prime Technology.
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
package org.primefaces.component.chart;

import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.Map;
import javax.faces.component.UIComponentBase;
import javax.faces.component.behavior.AjaxBehavior;
import javax.faces.component.behavior.ClientBehaviorHolder;
import javax.faces.context.FacesContext;
import javax.faces.event.AjaxBehaviorEvent;
import javax.faces.event.BehaviorEvent;
import javax.faces.event.FacesEvent;
import org.primefaces.event.ItemSelectEvent;

public abstract class UIChart extends UIComponentBase implements ClientBehaviorHolder {

    private final static String DEFAULT_EVENT = "itemSelect";

    private static final Collection<String> EVENT_NAMES = Collections.unmodifiableCollection(Arrays.asList(DEFAULT_EVENT));

    protected enum PropertyKeys {
        widgetVar
		,value
        ,styleClass
        ,style
        ,title
        ,legendPosition;

		String toString;

		PropertyKeys(String toString) {
			this.toString = toString;
		}

		PropertyKeys() {}

        @Override
		public String toString() {
			return ((this.toString != null) ? this.toString : super.toString());
        }
    }
	
	public String getWidgetVar() {
		return (String) getStateHelper().eval(PropertyKeys.widgetVar, null);
	}
	public void setWidgetVar(String _widgetVar) {
		getStateHelper().put(PropertyKeys.widgetVar, _widgetVar);
	}

	public Object getValue() {
		return getStateHelper().eval(PropertyKeys.value, null);
	}
	public void setValue(Object _value) {
		getStateHelper().put(PropertyKeys.value, _value);
	}

	public String getStyleClass() {
		return (String) getStateHelper().eval(PropertyKeys.styleClass, null);
	}
	public void setStyleClass(String _styleClass) {
		getStateHelper().put(PropertyKeys.styleClass, _styleClass);
	}

	public String getStyle() {
		return (String) getStateHelper().eval(PropertyKeys.style, null);
	}
	public void setStyle(String _style) {
		getStateHelper().put(PropertyKeys.style, _style);
	}
	
    public String getTitle() {
		return (String) getStateHelper().eval(PropertyKeys.title, "");
	}
	public void setTitle(String _title) {
		getStateHelper().put(PropertyKeys.title, _title);
	}

    public String getLegendPosition() {
		return (String) getStateHelper().eval(PropertyKeys.legendPosition, null);
	}
	public void setLegendPosition(String _legendPosition) {
		getStateHelper().put(PropertyKeys.legendPosition, _legendPosition);
	}
	
    @Override
    public Collection<String> getEventNames() {
        return EVENT_NAMES;
    }

    @Override
    public String getDefaultEventName() {
        return DEFAULT_EVENT;
    }
    
    @Override
    public void queueEvent(FacesEvent event) {
        if(event instanceof AjaxBehaviorEvent) {
            BehaviorEvent behaviorEvent = (AjaxBehaviorEvent) event;
            Map<String,String> map = FacesContext.getCurrentInstance().getExternalContext().getRequestParameterMap();
            int itemIndex = Integer.parseInt(map.get("itemIndex"));
            int seriesIndex = Integer.parseInt(map.get("seriesIndex"));

            ItemSelectEvent itemSelectEvent = new ItemSelectEvent(this, behaviorEvent.getBehavior(), itemIndex, seriesIndex);

            super.queueEvent(itemSelectEvent);
        }
    }
}