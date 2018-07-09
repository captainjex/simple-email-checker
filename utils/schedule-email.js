var verifier = require('email-verify');
const signale = require('signale');

module.exports = function (agenda, db) {
  agenda.define('verify email', (job, done) => {
    signale.watch('>> mulai meriksa email', job.attrs.data.email)
    verifier.verify(job.attrs.data.email, function (err, info) {
      if (err) {
        signale.fatal('[err verify email]', job.attrs.data.email, err);
        done(err)
      } else {
        if (info.success) {
          db.emailFls17.findAndModify({
            query: { bio_email: job.attrs.data.email },
            update: { $set: { verified: true } },
            new: true
          }, function (err, doc, lastErrorObject) {
            // doc.tag === 'maintainer'
            if(err) done(err)
            signale.success('email verified', doc.bio_email)
            done()
          });
        } else {
          signale.fatal('[email verify not success]', info.info);
          done(info.info)
        }
      }
    })
  });
};
