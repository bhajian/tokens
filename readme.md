# Tokens
Tokens is a token based authentication module that works based on two tokens:
1- json web token (jwt) ensures the used is logged in is a valid user
2- access token which makes sure the user is not invalidated

This protocol works based on a short time to live jwt token. The access token is persisted in a database which never expires unless we invalidate the user.
JWT suffers from token invalidation and has serious issues for mobile users.