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
package org.primefaces.component.chart.bar;

import java.io.IOException;
import java.util.Iterator;
import java.util.List;
import javax.faces.component.UIComponent;
import javax.faces.context.FacesContext;
import javax.faces.context.ResponseWriter;
import org.primefaces.component.chart.BaseChartRenderer;
import org.primefaces.component.chart.UIChart;
import org.primefaces.model.chart.CartesianChartModel;
import org.primefaces.model.chart.ChartSeries;

public class BarChartRenderer extends BaseChartRenderer {

    @Override
	public void encodeEnd(FacesContext context, UIComponent component) throws IOException {
		BarChart chart = (BarChart) component;

        encodeMarkup(context, chart);
        encodeScript(context, chart);
	}

    protected void encodeScript(FacesContext context, UIChart uichart) throws IOException{
		ResponseWriter writer = context.getResponseWriter();
		BarChart chart = (BarChart) uichart;
		String clientId = chart.getClientId(context);

		writer.startElement("script", null);
		writer.writeAttribute("type", "text/javascript", null);

		writer.write("$(function(){");

        writer.write(chart.resolveWidgetVar() + " = new PrimeFaces.widget.BarChart('" + clientId + "', { ");

        encodeOptions(context, chart);

        encodeClientBehaviors(context, chart);

		writer.write("});});");

		writer.endElement("script");
	}

    protected void encodeOptions(FacesContext context, BarChart chart) throws IOException {
		ResponseWriter writer = context.getResponseWriter();
        CartesianChartModel model = (CartesianChartModel) chart.getValue();
        boolean horizontal = chart.getOrientation().equals("horizontal");
        List<String> categories = model.getCategories();

        //data
		writer.write("data:[" );
        for(Iterator<ChartSeries> it = model.getSeries().iterator(); it.hasNext();) {
            ChartSeries series = it.next();
            int i = 1;

            writer.write("[");
            for(Iterator<Object> x = series.getData().keySet().iterator(); x.hasNext();) {
                Number value = series.getData().get(x.next());
                String valueToRender = value != null ? value.toString() : "null";

                if(horizontal) {
                    writer.write("[");
                    writer.write(valueToRender + "," + i);
                    writer.write("]");

                    i++;
                } else {
                    writer.write(valueToRender);
                }

                if(x.hasNext()) {
                    writer.write(",");
                }
            }
            writer.write("]");

            if(it.hasNext()) {
                writer.write(",");
            }
        }
        writer.write("]");

        //common config
        encodeCommonConfig(context, chart);

        //series
        writer.write(",series:[");
        for(Iterator<ChartSeries> it = model.getSeries().iterator(); it.hasNext();) {
            ChartSeries series = (ChartSeries) it.next();

            writer.write("{");
            writer.write("label:'" + series.getLabel() + "'");
            writer.write("}");

            if(it.hasNext()) {
                writer.write(",");
            }
        }
        writer.write("]");

        //categories
        writer.write(",categories:[");
        for(Iterator<String> it = categories.iterator(); it.hasNext();) {
            writer.write("'" + it.next() + "'");

            if(it.hasNext()) {
                writer.write(",");
            }
        }
        writer.write("]");

        //config
        writer.write(",orientation:'" + chart.getOrientation() + "'");
        writer.write(",barPadding:" + chart.getBarPadding());
        writer.write(",barMargin:" + chart.getBarMargin());

        if(chart.isStacked()) {
            writer.write(",stackSeries:true");
        }

        //boundaries
        if(chart.getMin() != Double.MIN_VALUE) writer.write(",min:" + chart.getMin());
        if(chart.getMax() != Double.MAX_VALUE) writer.write(",max:" + chart.getMax());

        //other
        if(chart.isBreakOnNull()) writer.write(",breakOnNull:true");
    }
}