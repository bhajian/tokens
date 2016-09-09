/**
 * Created by behnamhajian on 2016-08-17.
 */

'use strict';
var jwt = require('jsonwebtoken');
var cryto = require('../helper/cryptography');

exports.verify = function(options) {
  return function verifyIt(req, res, next) {
    options.req = req;
    options.res = res;
    options.next = next;
    var token =  options.req.body.token || options.req.query.token
      || options.req.headers['x-token'];
    var accessToken = options.req.body.accessToken ||
      options.req.query.accessToken || options.req.headers['x-access-token'];
    if (!token && !accessToken) {
      return authenticationFailed(options.res, 'No Token provided.');
    } else {
      jwt.verify(token, options.secret, function (err, decoded) {
        if (err) {
          verifyAccessToken(accessToken, options);
        } else {
          options.req.decoded = decoded;
          next();
        }
      });
    }
  };
};

function authenticationFailed(res, message) {
  return res.status(403).send({
    success: false,
    message: message
  });
}

function verifyAccessToken(accessToken, options) {
  var _req = options.req;
  var _res = options.res;
  var _next = options.next;
  if (accessToken) {
    try {
      var decrypteedAccessToken = cryto.decrypt(accessToken,
        options.cryptoAlgorithm, options.secret);
      var _id = JSON.parse(decrypteedAccessToken)._id;
      options.userModel.findOne({
        _id: _id,
      }, function (err, user) {
        if (user && user.accessToken === accessToken) {
          var token = jwt.sign({sub: 'users/' + user._id}, options.secret,
            {
              expiresIn: options.expiresIn,
            });
          _res.token = token;
          _res.decoded = {sub: 'users/' + user._id};
          _next();
        } else {
          return authenticationFailed(_res, 'Failed to authenticate. ' +
            'The access token is not valid.');
        }
      });
    } catch(ex) {
      return authenticationFailed(_res, 'Failed to authenticate. ' +
        'The access token is not valid');
    }
  } else {
    return authenticationFailed(_res, 'Failed to authenticate and access ' +
      'token is not provided.');
  }
}
