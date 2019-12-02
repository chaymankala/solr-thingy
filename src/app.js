const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require("cors");

var Sentiment = require('sentiment');
var sentiment = new Sentiment();

require('dotenv').config();

const middlewares = require('./middlewares');
const api = require('./api');

const app = express();

const rp = require("request-promise");

app.use(cors())

app.use(morgan('dev'));
app.use(helmet());

const BASE_URL = "http://3.14.153.158:8983/solr/IRF19P1/"

app.get('/select', async (req, res) => {
  try {
    console.log(objectToQuerystring(req.query));
    let _result = await rp.get(BASE_URL + "select?" + objectToQuerystring(req.query), { json: true });
    if (_result && _result.response && _result.response.docs && _result.response.docs.length) {
      for (let i of _result.response.docs) {
        if (i.tweet_text && i.tweet_text[0]) {
          i.sentiment = sentiment.analyze(i.tweet_text[0], {
            language: i.metadata && i.metadata.iso_language_code && i.metadata.iso_language_code[0] ? i.metadata.iso_language_code[0] : "en"
          });
        }
      }
    }
    return res.json(_result);

  }
  catch (e) {
    return res.status(500).json(e);
  }
});

// app.use('/api/v1', api);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);


function objectToQuerystring(obj) {
  let _ = ""
  for (let i in obj) {
    if (Array.isArray(obj[i])) {
      for (let j of obj[i]) {
        _ += (`${i}=${encodeURIComponent(j)}&`)
      }
    }
    else {
      _ += (`${i}=${encodeURIComponent(obj[i])}&`)
    }
  }
  return _?_.substr(0, _.length-1):"";
}

module.exports = app;
