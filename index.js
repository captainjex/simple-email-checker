console.log('asw');
const mongoString = process.env.MONGO_STRING || 'mongodb://127.0.0.1/example'

const mongojs = require('mongojs')
const signale = require('signale');
const Agenda = require('agenda');

const db = mongojs(mongoString, ['emailFls17'])

const agenda = new Agenda({ db: { address: mongoString } });
// agenda.processEvery('3 minutes')
agenda.processEvery('10 seconds')
agenda.maxConcurrency(5);
agenda.defaultLockLimit(5);

let i = 0

db.emailFls17.find({
  bio_email: { $nin: [null] }
}).forEach(function(err, doc) {
  if (err) return console.log('err', err);
  if (!doc) return
  // setTimeout(() => {
  //   console.log('>> ', doc._id, i++);
  // }, Math.floor(Math.random() * 10000))
  signale.watch('>> email masuk schedule', doc.bio_email)
  require('./utils/schedule-email')(agenda, db)
  agenda.start()
  agenda.now('verify email', {
    email: doc.bio_email,
  });
});
console.log('<<<<<<< selesai', i);
