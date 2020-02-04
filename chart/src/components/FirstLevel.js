import React, { Component } from "react";

import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

class FirstLevel extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    // Themes begin
    am4core.useTheme(am4themes_animated);
    am4core.useTheme(am4themes_myTheme);
    // Themes end

    // Change color of the chart
    function am4themes_myTheme(target) {
      if (target instanceof am4core.ColorSet) {
        target.list = [am4core.color("#a8495b"), am4core.color("#225688")];
      }
    }

    // Create chart instance
    let chart = am4core.create(this.props.id, am4charts.RadarChart);

    // Add cursor pointer
    chart.cursorOverStyle = am4core.MouseCursorStyle.pointer;

    // Add data
    chart.data = this.props.data.progress;

    // label in the middle of charts
    var label = chart.createChild(am4core.Label);
    label.text = this.props.data.chapter;
    label.fontSize = 20;
    label.fontWeight = "bold";
    label.align = "center";
    label.isMeasured = false;
    label.x = 114;
    label.y = 73;

    // Make chart not full circle
    chart.startAngle = -90;
    chart.endAngle = 180;
    chart.innerRadius = am4core.percent(20);

    // Set number format
    chart.numberFormatter.numberFormat = ""; // make % disappear

    // Create axes
    let categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "category";
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.grid.template.strokeOpacity = 0;
    categoryAxis.renderer.labels.template.horizontalCenter = "right";
    categoryAxis.renderer.labels.template.fontWeight = 500;
    categoryAxis.renderer.labels.template.adapter.add("fill", function(
      fill,
      target
    ) {
      return target.dataItem.index >= 0
        ? chart.colors.getIndex(target.dataItem.index)
        : fill;
    });
    categoryAxis.renderer.minGridDistance = 10;

    let valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
    valueAxis.renderer.grid.template.strokeOpacity = 0;
    valueAxis.min = 0;
    valueAxis.max = 100;
    valueAxis.strictMinMax = true;

    // Create series
    let series1 = chart.series.push(new am4charts.RadarColumnSeries());
    series1.name = "Abschlussprüfung";
    series1.dataFields.valueX = "full";
    series1.dataFields.categoryY = "category";
    series1.clustered = false;
    series1.columns.template.fill = new am4core.InterfaceColorSet().getFor(
      "alternativeBackground"
    );
    series1.columns.template.fillOpacity = 0.08;
    series1.columns.template.cornerRadiusTopLeft = 20;
    series1.columns.template.strokeWidth = 0;
    series1.columns.template.radarColumn.cornerRadius = 20;

    let series2 = chart.series.push(new am4charts.RadarColumnSeries());
    series2.name = "Kapitelforschritt";
    series2.dataFields.valueX = "value";
    series2.dataFields.categoryY = "category";
    series2.clustered = false;
    series2.columns.template.strokeWidth = 0;
    series2.columns.template.radarColumn.cornerRadius = 20;

    series2.columns.template.adapter.add("fill", function(fill, target) {
      return chart.colors.getIndex(target.dataItem.index);
    });
  }

  render() {
    return (
      <div
        id={this.props.id} //use the id of the chapter here
        style={{ width: "275px", height: "200px" }}
        display={"inline-block"}
      />
    );
  }
}
export { FirstLevel };
