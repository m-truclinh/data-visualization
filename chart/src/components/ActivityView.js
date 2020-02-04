import React, { Component } from "react";

import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";

class ActivityView extends Component {
  componentDidMount() {
    //Themes begin
    am4core.useTheme(am4themes_myTheme);
    // Themes end

    // Change color of the chart
    function am4themes_myTheme(target) {
      if (target instanceof am4core.ColorSet) {
        target.list = [am4core.color("#225699")];
      }
    }

    let chart = am4core.create("chart", am4charts.XYChart);
    chart.maskBullets = false;

    let xAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    let yAxis = chart.yAxes.push(new am4charts.CategoryAxis());


    yAxis.title.text="Tag";
    xAxis.renderer.fontSize = 12;
    yAxis.renderer.inversed = true;

    xAxis.dataFields.category = "month";
    yAxis.dataFields.category = "day";

    xAxis.renderer.grid.template.disabled = true;
    xAxis.renderer.minGridDistance = 10;

    yAxis.renderer.grid.template.disabled = true;
    yAxis.renderer.minGridDistance = 40;
    yAxis.renderer.labels.template.fontSize = 12;

    let series = chart.series.push(new am4charts.ColumnSeries());
    series.dataFields.categoryX = "month";
    series.dataFields.categoryY = "day";
    series.dataFields.value = "value";
    series.sequencedInterpolation = false;
    series.defaultState.transitionDuration = 3000;

    let bgColor = new am4core.InterfaceColorSet().getFor("background");

    let columnTemplate = series.columns.template;
    columnTemplate.strokeWidth = 2;
    columnTemplate.strokeOpacity = 0.2;
    columnTemplate.stroke = bgColor;
    columnTemplate.tooltipText =
      "{month}, {day}: {value.workingValue.formatNumber('#.')}";
    columnTemplate.width = am4core.percent(100);
    columnTemplate.height = am4core.percent(100);
    //columnTemplate.defaultState = 0;

    series.heatRules.push({
      target: columnTemplate,
      property: "fill",
      minValue: 0,
      maxValue: 50,
      min: am4core.color("#e9e9e9"),
      max: chart.colors.getIndex(0),
    });

    // heat legend
    let heatLegend = chart.bottomAxesContainer.createChild(
      am4charts.HeatLegend
    );
    heatLegend.width = am4core.percent(100);
    heatLegend.series = series;
    heatLegend.minValue = 0;
    heatLegend.maxValue = 50;
    heatLegend.valueAxis.renderer.labels.template.fontSize = 9;
    heatLegend.valueAxis.renderer.minGridDistance = 30;
    heatLegend.markerCount = 5;


    // heat legend behavior
    series.columns.template.events.on("over", event => {
      handleHover(event.target);
    });

    series.columns.template.events.on("hit", event => {
      handleHover(event.target);
    });

    function handleHover(column) {
      if (!isNaN(column.dataItem.value)) {
        heatLegend.valueAxis.showTooltipAt(column.dataItem.value);
      } else {
        heatLegend.valueAxis.hideTooltip();
      }
    }

    series.columns.template.events.on("out", event => {
      heatLegend.valueAxis.hideTooltip();
    });

    //chart.data = activitydata;
    chart.data = this.props.data;

    // Mouse pointer
    chart.cursorOverStyle = am4core.MouseCursorStyle.pointer;
  }

  render() {
    return (
      <div
        id="chart"
        style={{
          width: "450px",
          height: "520px",
          marginLeft: "auto",
          marginRight: "auto"
        }}
      />
    );
  }
}

export { ActivityView };
