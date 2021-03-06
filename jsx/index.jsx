import React from 'react';
import cheerio from 'cheerio';
import request from 'request';
import MonthDay from 'react-month-day';
import Day from './day';
import Clock from './clock';
import Temp from './temp';
import Tasks from './tasks';
import MLB from './mlb';
import getDay from './get-day';
import renderTime from './time';
import Stock from './stock';
import config from '../config.json';
var currentDay;
var currentHour;

// tempuratur API
var tempurature;
function getTemp() {
  let city = config.settings.city;
  city = city.replace(/ /g, '_');
  let request = new XMLHttpRequest();
  request.open('GET', 'http://api.wunderground.com/api/'+ config.api.weather +'/conditions/q/CA/'+ city +'.json', true);

  request.onload = function() {
    if (request.status >= 200 && request.status < 400) {
      let data = JSON.parse(request.responseText);
      let temp = data.current_observation.temp_f;
      let weather = data.current_observation.weather;
      let feels = data.current_observation.feelslike_f;
      let icon = data.current_observation.icon_url;
      icon = icon.replace('http://icons.wxug.com/i/c/k/', 'public/img/weather/').replace('.gif', '.svg').replace('_', '-');
      temp = temp.toFixed(0);
      feels = Number(feels).toFixed(0);

      // create tempurate object
      tempurature = {
        temp: temp,
        weather: weather,
        feels: 'Feels like ' + feels,
        icon: icon
      }
      return tempurature;
    }
  };
  request.send();
}

// get date from stock api
var stock;
function getStock(){
  let symbol = config.stock.symbol;

  let request = new XMLHttpRequest();
  request.open('GET', 'http://stockz-api.herokuapp.com/api/?s='+ symbol, true);

  request.onload = function() {
    if (request.status >= 200 && request.status < 400) {
      let data = JSON.parse(request.responseText);

      stock = {
        company: data[0].company,
        percent_change: data[0].percent_change,
        price_change: data[0].price_change,
        price: data[0].stock_number,
        symbol: data[0].symbol,
        up_down: data[0].up_down
      }

      return stock;
    }
  };
  request.send();
}

// use a set interval mixin for timer
var SetIntervalMixin = {
  componentWillMount: function componentWillMount() {
    this.intervals = [];
  },

  componentWillUnmount: function componentWillUnmount() {
    this.intervals.map(clearInterval);
  },

  setInterval: (function (_setInterval) {
    function setInterval() {
      return _setInterval.apply(this, arguments);
    }

    setInterval.toString = function () {
      return _setInterval.toString();
    };

    return setInterval;
  })(function () {
    this.intervals.push(setInterval.apply(null, arguments));
  })
};

// main react app class
var App = React.createClass({
  mixins: [SetIntervalMixin],
  getInitialState() {
    return {day: getDay()};
  },
  componentDidMount() {
    this.setInterval(this.tick, 1000);
  },
  tick() {
    let today = getDay();
    let time = renderTime();

    if(tempurature !== undefined){
      this.setState({temp: tempurature.temp, weather: tempurature.weather, degree: '°F', feels: tempurature.feels, icon: tempurature.icon});
    }

    if(stock !== undefined){
      this.setState({stock: stock.price, stock_symbol: stock.symbol});
    }

    // make calls by the day change
    if(today !== currentDay || currentDay === undefined){
      currentDay = today;
      this.setState({day: today});
    }

    // make calls by the hour change
    if(time.hours !== currentHour || currentHour === undefined){
      currentHour = time.hours;
      getStock();
      getTemp();
    }

    //set the state
    this.setState({hours: time.hours, minutes: time.minutes, seconds: time.seconds, diem: time.diem});
  },
  render() {
    return (
      <div>
        <MonthDay />
        <Day day={this.state.day} />
        <Clock hours={this.state.hours} minutes={this.state.minutes} seconds={this.state.seconds} diem={this.state.diem} />
        <Temp temp={this.state.temp} weather={this.state.weather} degree={this.state.degree} feels={this.state.feels} icon={this.state.icon} />
        <Tasks day={this.state.day} />
        <MLB day={this.state.day} />
        <Stock stock={this.state.stock} stock_symbol={this.state.stock_symbol} />
      </div>
    );
  }
});

module.exports = App;

