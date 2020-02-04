import React, { Component } from "react";

import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

class SecondLevel extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    // Themes begin
    am4core.useTheme(am4themes_animated);
    // Themes end

    // Create chart
    let chart = am4core.create("chartdiv", am4charts.XYChart);

    // Add data
    chart.data = this.props.data;

    // Create axes
    let categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "subchapter";
    categoryAxis.numberFormatter.numberFormat = "#.##"; // round up the result
    categoryAxis.renderer.inversed = true;
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.cellStartLocation = 0.1;
    categoryAxis.renderer.cellEndLocation = 0.9;

    let valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
    valueAxis.renderer.opposite = true;
    valueAxis.min = 0;
    valueAxis.max = 100;
    valueAxis.strictMinMax = 100;

    // Create series
    function createSeries(field, name) {
      let series = chart.series.push(new am4charts.ColumnSeries());
      series.dataFields.valueX = field;
      series.dataFields.categoryY = "subchapter";
      series.name = name;
      series.columns.template.height = am4core.percent(100);
      series.sequencedInterpolation = true;

      let valueLabel = series.bullets.push(new am4charts.LabelBullet());
      valueLabel.label.text = "{valueX}";
      valueLabel.label.dx = -200; // location of the result
      valueLabel.label.hideOversized = false;
      valueLabel.label.truncate = false;
      valueLabel.label.fill = am4core.color("#fff");

      let categoryLabel = series.bullets.push(new am4charts.LabelBullet());
      categoryLabel.label.text = "{name}";
      categoryLabel.label.horizontalCenter = "right";
      categoryLabel.label.dx = -10;
      categoryLabel.label.fill = am4core.color("#fff");
      categoryLabel.label.hideOversized = false;
      categoryLabel.label.truncate = false;
    }

    createSeries("training", "Training");
    createSeries("quiz", "Quiz");
  }

  render() {
    return <div id="chartdiv" style={{ width: "75%", height: "500px" }} />;
  }
}

export { SecondLevel };
