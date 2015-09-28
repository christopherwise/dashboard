var React = require('react');
var MonthDay = require('react-month-day');
var Day = require('./day');
var Clock = require('react-clock');
var Temp = require('./temp');

var App = React.createClass({
  render() {
    return (
      <div>
        <MonthDay />
        <Day />
        <Clock />
        <Temp />
      </div>
    );
  }
});

module.exports = App;
