/**
 * Created by behnamhajian on 2016-08-27.
 */
var crypto = require('crypto');

exports.encrypt = function encrypt(text, algorithm, password){
  var cipher = crypto.createCipher(algorithm, password);
  var crypted = cipher.update(text,'utf8','hex');
  crypted += cipher.final('hex');
  return crypted;
};

exports.decrypt = function decrypt(text, algorithm, password){
  var decipher = crypto.createDecipher(algorithm, password);
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
};
