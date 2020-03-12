import Plot from 'react-plotly.js';
import React, { Component } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'https://pwol6zjt3f.execute-api.us-east-1.amazonaws.com/production/landat-ndvi?lng=-85.01358032226562&lat=40.36224194899873'

const getDayOfYear = date => {
  var start = new Date(date.getFullYear(), 0, 0);
  var diff = date - start;
  var oneDay = 1000 * 60 * 60 * 24;
  var day = Math.floor(diff / oneDay);
  return day;
}

function parseRawData(data) {
  let year_data = {}
  let counter = 0 // counter is so we can get the first date of the following year
  data.forEach(function (item, index){
    //console.log(item)
    counter++
    let split = item.split(',')
    let dateString = split[0]
    let val = parseFloat(split[1])
    let year = parseInt(dateString.substring(0, 4))
    let date = new Date(
      parseInt(dateString.substring(0, 4)), // year
      (parseInt(dateString.substring(4, 6)) - 1), // months are 0-indexed
      parseInt(dateString.substring(6, 8))) // day of month
    year_data[year] = year_data[year] || []
    if (counter === 46) { // 46 entries per year (e.g. 45 in 2000 and 1 in 2001)
      year_data[year - 1].push({ val: val, date: date })
      counter = 0
    } else {
      year_data[year].push({ val: val, date: date })
    }
  })
  return year_data
}

function unpack(data, key) {
  if (key === 'val') {
    return data.map(d => d.val);
  }
  if (key === 'doy') {
    return data.map(d => getDayOfYear(d.date));
  }
  if (key === 'date') {
    return data.map(d => d.date);
  }
}

/*const dataPlotly = [
  { // 2000 data
    type: "scatterpolar",
    mode: "lines+markers",
    name: "2000",
    r: unpack(parsedDataYearOne, 'val'),
    theta: unpack(parsedDataYearOne, 'doy'),
    customdata: unpack(parsedDataYearOne, 'date'),
    hovertemplate: "%{customdata|%B %d, %Y}<br>NDVI: %{r:.1f}<extra></extra>"
  },
  { // 2001 data
    type: "scatterpolar",
    mode: "lines+markers",
    name: "2001",
    r: unpack(parsedDataYearTwo, 'val'),
    theta: unpack(parsedDataYearTwo, 'doy'),
    customdata: unpack(parsedDataYearTwo, 'date'),
    hovertemplate: "%{customdata|%B %d, %Y}<br>NDVI: %{r:.1f}<extra></extra>"
  },
  { // 2002 data
    type: "scatterpolar",
    mode: "lines+markers",
    name: "2002",
    r: unpack(parsedDataYearThree, 'val'),
    theta: unpack(parsedDataYearThree, 'doy'),
    customdata: unpack(parsedDataYearThree, 'date'),
    hovertemplate: "%{customdata|%B %d, %Y}<br>NDVI: %{r:.1f}<extra></extra>"
  },
  { // 80% line
    type: "scatterpolar",
    mode: "lines+text",
    showlegend: false,
    r: [0, 90, 100],
    theta: [0, 310, 310],
    text: ["", "80%", ""],
    hovertext: ["", "", "End of Growing Season - November 10th"],
    hoverinfo: ["none", "none", "text"],
    textposition: "bottom-left",
    line: {
      color: "#800080"
    }
  },
  { // 15% line
    type: "scatterpolar",
    mode: "lines+text",
    showlegend: false,
    r: [0, 90, 100],
    theta: [0, 135, 135],
    text: ["", "15%", ""],
    hovertext: ["", "", "Start of Growing Season - May 15th"],
    hoverinfo: ["none", "none", "text"],
    textposition: "bottom-left",
    line: {
      color: "#800080"
    }
  },
  { // orange line
    type: "scatterpolar",
    mode: "lines",
    showlegend: false,
    r: [0, 100, 100],
    theta: [0, 55, 235],
    hovertext: ["", "Start of Phenological Year - February 25th", "Middle of Phenological Year - August 20th"],
    hoverinfo: ["none", "text", "text"],
    line: {
      color: "#ffa500",
      width: 1,
    },
  },
  { // red center dot
    type: "scatterpolar",
    mode: "lines+markers",
    showlegend: false,
    r: [20],
    theta: [235],
    hovertemplate: "Center: %{r}<extra></extra>",
    marker: {
      size: 9
    },
    line: {
      color: "#ff0000"
    },
  },
  { // red center line
    type: "scatterpolar",
    mode: "lines",
    showlegend: false,
    r: [0, 20],
    theta: [0, 235],
    hoverinfo: ["none", "none"],
    line: {
      color: "#ff0000",
      width: 4
    },
  },
];*/

const layout = {
  width: 800,
  height: 800,
  legend: {
    title: {
      text: 'Click to turn on/off'
    },
  },
  polar: {
    domain: {
      x: [0, 100],
      y: [1, 365]
    },
    radialaxis: {
      visible: true,
      type: "linear",
    },
    angularaxis: {
      visible: true,
      type: "linear",
      tickmode: "array",
      showticklabels: true,
      tickvals: [ 1, 32, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335 ],
      ticktext: [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ],
      direction: "clockwise",
      period: 12
    }
  }
}

function buildTrace(data, year) {
  return [
    {
      type: 'scatterpolar',
      mode: "lines+markers",
      name: year,
      r: unpack(data, 'val'),
      theta: unpack(data, 'doy'),
      customdata: unpack(data, 'date'),
      hovertemplate: "%{customdata|%B %d, %Y}<br>NDVI: %{r:.1f}<extra></extra>"
    }
  ]
}

class App extends Component {
  state = {
    plot: []
  }

  componentDidMount() {
    const url = `${API_URL}`;
    axios.get(url)
      .then(response => {
        const rawValues = response.data
        const parsedValues = parseRawData(rawValues)
        let dataPlotly = []
        for (const [key, value] of Object.entries(parsedValues)) {
          dataPlotly = dataPlotly.concat(buildTrace(value, key))
        }
        const plot = < Plot data={dataPlotly} layout={layout} config={{ responsive: true }} />

        this.setState({ plot })
      })
  }

  render() {
    return (
      <ul>
        {this.state.plot}
      </ul>
    )
  }

}

export default App;
