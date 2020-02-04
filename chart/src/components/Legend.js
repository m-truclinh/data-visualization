import React, { Component } from "react";

class Legend extends Component {
  render() {
    return (
      <div>
        <div>
          <div className="legend">
            <div className="circle" />
            <sup> Abschlussprüfung</sup>
          </div>
          <div className="legend">
            <div className="circle second" />
            <sup>Kapitelfortschritt</sup>
          </div>
        </div>
      </div>
    );
  }
}

export { Legend };
