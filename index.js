console.log('asw');
const mongoString = process.env.MONGO_STRING || 'mongodb://127.0.0.1/example'

const express = require('express')
const app = express()

const mongojs = require('mongojs')
const signale = require('signale');
const Agenda = require('agenda');
var Agendash = require('agendash');

const db = mongojs(mongoString, ['emailFls17'])

const agenda = new Agenda({ db: { address: mongoString } });
// agenda.processEvery('3 minutes')
agenda.processEvery('20 seconds')
agenda.maxConcurrency(5);
agenda.defaultLockLimit(5);

let dashMiddleware = (req, res, next) => {
  if (req.params.pass == 'wkwksama') {
    next()
  } else {
    res.send('dilarang masuk')
  }
}

app.use('/dash/:pass', dashMiddleware, Agendash(agenda));
app.get('/tes', (req, res) => {
  res.json('Hello World!')
})

db.emailFls17.find({
  bio_email: { $nin: [null] }
}).forEach(function(err, doc) {
  if (err) return console.log('err', err);
  if (!doc) return
  signale.watch('>> email masuk schedule', doc.bio_email)
  require('./utils/schedule-email')(agenda, db)
  agenda.start()
  agenda.now('verify email', {
    email: doc.bio_email,
  });
});

app.listen(3000, () => console.log('Example app listening on port 3000!'))
