console.log('asw');
const mongoString = process.env.MONGO_STRING || 'mongodb://127.0.0.1/example'

const express = require('express')
const app = express()
require('dotenv').config()

const mongojs = require('mongojs')
const signale = require('signale');
const Agenda = require('agenda');
var Agendash = require('agendash');

const db = mongojs(mongoString, ['emailList'])

const agenda = new Agenda({ db: { address: mongoString } });
agenda.processEvery('1 minutes')
// agenda.processEvery('20 seconds')
agenda.maxConcurrency(5);
agenda.defaultLockLimit(5);

let pass = process.env.PASS || 'pass'

let dashMiddleware = (req, res, next) => {
  if (req.params.pass == pass) {
    next()
  } else {
    res.send('dilarang masuk')
  }
}

app.use('/dash/:pass', dashMiddleware, Agendash(agenda));
app.get('/tes', (req, res) => {
  res.json('Hello World!')
})

db.emailList.find({
  email: { $nin: [null] }
}).forEach(function(err, doc) {
  if (err) return console.log('err', err);
  if (!doc) return
  signale.watch('>> email masuk schedule', doc.email)
  require('./utils/schedule-email')(agenda, db)
  agenda.start()
  agenda.now('verify email', {
    email: doc.email,
  });
});

let port = process.env.PORT || 3000
app.listen(port, () => console.log('Example app listening on port 3000!'))
