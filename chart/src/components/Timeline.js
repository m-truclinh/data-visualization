import React, { Component } from "react";

import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";

class TimeLine extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    //Themes begin
    am4core.useTheme(am4themes_myTheme);
    //Themes end

    // Change color of the chart
    function am4themes_myTheme(target) {
      if (target instanceof am4core.ColorSet) {
        target.list = [am4core.color("#225688"), am4core.color("#a8495b")];
      }
    }

    // Create chart instance
    let chart = am4core.create("chartdiv", am4charts.XYChart);

    //Add data
    chart.data = this.props.data;

    //Create axes
    let categoryAxis = chart.xAxes.push(new am4charts.DateAxis());
    categoryAxis.dataFields.category = "date";
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 30;

    let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.min = 0;
    valueAxis.strictMinMax = false;

    //Create series
    let series = chart.series.push(new am4charts.ColumnSeries());
    series.dataFields.valueY = "value";
    series.dataFields.dateX = "date";
    series.name = "bisheriger Stand";

    series.columns.template.fillOpacity = 0.8;
    let columnTemplate = series.columns.template;
    columnTemplate.strokeWidth = 2;
    columnTemplate.strokeOpacity = 1;

    //Create 2nd series for improvement
    var series2 = chart.series.push(new am4charts.ColumnSeries());
    series2.dataFields.valueY = "improvedResult";
    series2.dataFields.dateX = "date";
    series2.name = "Fortschritt";
    //series2.tooltipText = "{name}: [bold]{valueY}[/]";
    series2.stacked = true;

    //scrollbar Zeiteinstellung
    chart.scrollbarX = new am4charts.XYChartScrollbar();
    chart.scrollbarX.series.push(series);
    chart.scrollbarX.parent = chart.bottomAxesContainer;

    //scrollbar starts by showing recent scores
    chart.events.on("ready", function() {
      categoryAxis.zoom({ start: 0.8, end: 1 });
    });

    // Legend
    chart.legend = new am4charts.Legend();
    chart.legend.position = "top";
    chart.legend.itemContainers.template.clickable = false;

    // Mouse pointer
    chart.cursorOverStyle = am4core.MouseCursorStyle.pointer;
  }
  render() {
    return <div id="chartdiv" style={{ width: "100%", height: "500px" }} />;
  }
}

export { TimeLine };
