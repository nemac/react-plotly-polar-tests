import Plot from 'react-plotly.js';
import React, { Component } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'https://pwol6zjt3f.execute-api.us-east-1.amazonaws.com/production/landat-ndvi?lng=-85.01358032226562&lat=40.36224194899873'
//let rawDataYearOne = ['20000108,23', '20000116,22', '20000124,23', '20000201,23', '20000209,23', '20000217,23', '20000225,24', '20000305,23', '20000313,22', '20000321,21', '20000329,23', '20000406,23', '20000414,25', '20000422,24', '20000430,25', '20000508,31', '20000516,34', '20000524,37', '20000601,36', '20000609,36', '20000617,37', '20000625,44', '20000703,53', '20000711,60', '20000719,68', '20000727,74', '20000804,81', '20000812,87', '20000820,89', '20000828,90', '20000905,88', '20000913,86', '20000921,83', '20000929,79', '20001007,72', '20001015,62', '20001023,51', '20001031,41', '20001108,34', '20001116,29', '20001124,26', '20001202,24', '20001210,24', '20001218,23', '20001226,23', '20010103,22'];
//let rawDataYearTwo = ["20010108,22", "20010116,22", "20010124,22", "20010201,21", "20010209,22", "20010217,21", "20010225,22", "20010305,21", "20010313,23", "20010321,23", "20010329,25", "20010406,25", "20010414,27", "20010422,29", "20010430,31", "20010508,33", "20010516,35", "20010524,37", "20010601,38", "20010609,39", "20010617,42", "20010625,43", "20010703,46", "20010711,48", "20010719,52", "20010727,61", "20010804,72", "20010812,81", "20010820,88", "20010828,92", "20010905,92", "20010913,91", "20010921,89", "20010929,83", "20011007,74", "20011015,64", "20011023,54", "20011031,46", "20011108,39", "20011116,34", "20011124,32", "20011202,30", "20011210,27", "20011218,27", "20011226,25", "20020103,24"];
//let rawDataYearThree = ["20020108,23", "20020116,22", "20020124,22", "20020201,22", "20020209,22", "20020217,22", "20020225,23", "20020305,23", "20020313,23", "20020321,25", "20020329,24", "20020406,23", "20020414,23", "20020422,23", "20020430,25", "20020508,29", "20020516,30", "20020524,30", "20020601,33", "20020609,35", "20020617,37", "20020625,40", "20020703,45", "20020711,51", "20020719,59", "20020727,64", "20020804,69", "20020812,73", "20020820,76", "20020828,78", "20020905,78", "20020913,74", "20020921,67", "20020929,62", "20021007,54", "20021015,47", "20021023,40", "20021031,36", "20021108,31", "20021116,28", "20021124,27", "20021202,26", "20021210,26", "20021218,27", "20021226,25", "20030103,25"];
// lng: -85.01358032226562
// lat:  40.36224194899873

const getDayOfYear = date => {
  var start = new Date(date.getFullYear(), 0, 0);
  var diff = date - start;
  var oneDay = 1000 * 60 * 60 * 24;
  var day = Math.floor(diff / oneDay);
  return day;
}

/*function parseRawData(data) {
  return data.map(d => {
    let split = d.split(',')
    let dateString = split[0];
    let val = parseFloat(split[1]);
    let date = new Date(
      parseInt(dateString.substring(0, 4)), // year
      (parseInt(dateString.substring(4, 6)) - 1), // months are 0-indexed
      parseInt(dateString.substring(6, 8))); // day of month
    return {date: date, val: val };
  })
}*/

function parseRawData(data) {
  let newData = data.map(d => {
    let split = d.split(',')
    let dateString = split[0];
    let val = parseFloat(split[1]);
    let year = parseInt(dateString.substring(0, 4));
    let date = new Date(
      parseInt(dateString.substring(0, 4)), // year
      (parseInt(dateString.substring(4, 6)) - 1), // months are 0-indexed
      parseInt(dateString.substring(6, 8))); // day of month
    return {
      date: date,
      val: val,
      year: year
    }
  })
  let year_data = {}
  let counter = 0
  newData.forEach(function (item, index) {
    counter++
    let year = item.year
    year_data[year] = year_data[year] || []
    if (counter === 46) {
      year_data[year - 1].push({ val: item['val'], date: item['date'] })
      counter = 0
    } else {
      year_data[year].push({ val: item['val'], date: item['date'] })
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

//const parsedDataYearOne = parseRawData(rawDataYearOne)
//const parsedDataYearTwo = parseRawData(rawDataYearTwo)
//const parsedDataYearThree = parseRawData(rawDataYearThree)

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

/*function App() {
  return (
    <Plot
      data={dataPlotly}
      layout={layout}
      config={{responsive: true}}
    />
  );
}*/

export default App;
