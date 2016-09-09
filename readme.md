# Tokens2
Tokens2 is a token based authentication module that works based on two tokens:
    1- json web token (jwt) ensures the used is logged in is a valid user
    2- access token which makes sure the user is not invalidated

[![Protocol Logo](https://github.com/bhajian/tokens/blob/master/protocol.png)]



This protocol works based on a short time to live jwt token.
The access token is persisted in a database which never expires unless we invalidate the user.
JWT suffers from token invalidation and has serious issues for mobile users.

## How to use it:
Tokens2 has two apis:
  - Authentication : Receives userName and user Model including password to verify the identity and authenticity of the user.
  - Verification : verifies if the user is a correct user and has access to the apis based on the information in the token.
    * Note: if the token is expired, access-token is verified. Access-token is persisted and can be invalidated.
    For example we can set 1 hour for the first token to be expired and use the access-token when the token is expired.


if the UserModel bellow is persistent model for user:

```
// User model used for authentication and verification.
var UserModel = {
  records : [
    { _id: 1, userName: 'jack', password: 'secret', displayName: 'Jack', emails: [ { value: 'jack@example.com' } ], save: function(){}, },
    { _id: 2, userName: 'jill', password: 'birthd', displayName: 'Jill', emails: [ { value: 'jill@example.com' } ], save: function(){}, }
  ],
  findOne: function(user, cb) {
    if(user._id){
      for (var i = 0, len = this.records.length; i < len; i++) {
        var record = this.records[i];
        if (record._id === user._id) {
          return cb(null, record);
        }
      }
      return cb(null, null);
    }
    if(user.userName) {
      for (var i = 0, len = this.records.length; i < len; i++) {
        var record = this.records[i];
        if (record.userName === user.userName) {
          return cb(null, record);
        }
      }
      return cb(null, null);
    }
  },
};
```

we can use the above model to verify username/password and persist access token in the DB.

### tokens2 Usage with express:

```
  var authenticate = require('tokens2').authentication.authenticate;
  var verify = require('tokens2').verification.verify;

  // This method is called if tokens are valid. The first token expires in 15 minutes.
  router.get('/', verify({
    userModel: UserModel,
    secret: 'superSecret',
    expiresIn: '15m',
    cryptoAlgorithm: 'aes-256-ctr'}), function(req, res, next) {
        res.json({'message': 'you have landed here.', newtoken: res.token});
      });

  // This method returns tokens if userName and password are correct
  router.post('/authenticate', authenticate({
    userModel: UserModel,
    secret: 'superSecret',
    expiresIn: '15m',
    cryptoAlgorithm: 'aes-256-ctr'}));
```
[![rest call](https://github.com/bhajian/tokens/blob/master/rest-call.png)]
[![authenticate(https://github.com/bhajian/tokens/blob/master/authenticate.png)]


### tokens2 Usage with Web Socket

tokens2 can be used to verify and validate websocket connections. The usage is as bellow:

assuming `../model/user.js` is designed to be :

```var mongoose = require('mongoose');
   var Schema = mongoose.Schema;

   // set up a mongoose model and pass it using module.exports
   module.exports = mongoose.model('User', new Schema({
     userName: String,
     password: String,
     accessToken: String,
   }));
```

we can use the above UserModel in our wesocket function with the following format:

```
var verify = require('tokens2').verification.verify;
var UserModel = require('../../model/user');

exports.websocketServer = function websocketServer(options, callback){
  var verifyMe = verify({
    userModel: UserModel,
    secret: 'superSecret',
    expiresIn: '15m',
    cryptoAlgorithm: 'aes-256-ctr'
  });
  var sockets = new ws.Server({
    server: options.server
  });

  sockets.on('connection', function(client) {
    console.log('Connection.');
    var res = {};
    verifyMe({headers: client.upgradeReq.headers, body:{}, query: {}}, res,
      function () {
        console.log(JSON.stringify(res));
        acceptMessages(client);
      });
  });

  return callback();
};
```
The websocket client sends the tokens as connection headers as :

```
var WebSocket = require('ws');
var ws = new WebSocket('ws://localhost:3000/', {
  headers: {
    'x-token' : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2Vycy81N2M4ZmZhNmQxMzNhMjU0NDdkODg4M2MiLCJpYXQiOjE0NzM0NDk0MTYsImV4cCI6MTQ3MzQ1MDMxNn0.YEWSG_yvXsgzLnv2Asmk6SO10SHAwl6odBYCMBHQR1cA',
    'x-access-token': '3c4e13e04fe931e52263dc3c0ecb704012399d7ffea9ec80bd2c0ce9a1622b3a6ca241f874acdf386bf3693a7c0ecafb2b9ec87b4ab72285d39f2866711d4245b7732f0832936d6066e8af04f6eafae6cc8a',
}});
```
[npm-image]: https://github.com/bhajian/tokens/blob/master/protocol.png
