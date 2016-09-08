# Tokens2
Tokens2 is a token based authentication module that works based on two tokens:
    1- json web token (jwt) ensures the used is logged in is a valid user
    2- access token which makes sure the user is not invalidated

    Reference-style:
    ![alt text][protocol-image]

    [protocol-image]: https://github.com/bhajian/tokens/protocol.png "tokens2 protocol"

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

### tokens2 Usage:

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


