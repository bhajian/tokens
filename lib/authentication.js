/**
 * Created by behnamhajian on 2016-08-25.
 */


var jwt = require('jsonwebtoken');
var cryto = require('../helper/cryptography');


exports.authenticate = function(options) {
  return function authenticate(req, res, next) {
    options.Model.findOne({
      userName: req.body.userName
    }, function(err, user) {
      if (err) throw err;
      if (!user) {
        res.json({ success: false, message: 'Authentication failed. User not found.' });
      } else if (user) {
        if (user.password != req.body.password) {
          res.json({
            success: false,
            message: 'Authentication failed. Wrong password.',
          });
        } else {
          var token = jwt.sign({sub: 'users/' + user._id}, options.secret,
            {
              expiresIn: options.expiresIn,
            });
          user.accessToken = cryto.encrypt(JSON.stringify({
            userId: user._id,
            password: user.password,
            timestamp: Date.now(),
          }), options.cryptoAlgorithm, options.secret);
          user.save();
          res.json({
            success: true,
            message: 'Enjoy your tokens!',
            token: token,
            accessToken: user.accessToken,
          });
        }
      }
    });
    next();
  };
};
