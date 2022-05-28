# Checkers_WebGL

Web GL project on Stefańczyk classes.

Heroku link: https://mepels.herokuapp.com/

To start the project:
  - npm install
  - npm start
 
Server runs on port 3000. 

You need 2 clients to play. 

Game rules and changes:
  1. Start with regular checkers rules
  2. You aren't forced to beat your opponent's pawns
  3. Beating doesn't give you any additional moves
  4. Queen may move on any field of any cross direction
  5. Queen move is blocked by 2 opponent's pawns 
     or the same player pawn
  6. Queen beats only if moves directly 1 field 
     behind an opponent's pawn
  7. Being unable to move means that you lose
