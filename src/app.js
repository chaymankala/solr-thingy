const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require("cors");

require('dotenv').config();

const middlewares = require('./middlewares');
const api = require('./api');

const app = express();

const rp = require("request-promise");

app.use(cors())

app.use(morgan('dev'));
app.use(helmet());

const BASE_URL = "http://ec2-18-191-81-4.us-east-2.compute.amazonaws.com:8983/solr/IRF19P1/"

app.get('/select', async (req, res) => {
  try {
    return res.json(await rp.get(BASE_URL + "select" + objectToQuerystring(req.query), { json: true }));

  }
  catch (e) {
    return res.status(500).json(e);
  }
});

// app.use('/api/v1', api);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);


function objectToQuerystring(obj) {
  return Object.keys(obj).reduce(function (str, key, i) {
    var delimiter, val;
    delimiter = (i === 0) ? '?' : '&';
    key = encodeURIComponent(key);
    val = encodeURIComponent(obj[key]);
    return [str, delimiter, key, '=', val].join('');
  }, '');
}

module.exports = app;
