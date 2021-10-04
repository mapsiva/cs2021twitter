"use strict";

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URLs and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use("Route");

Route.get("/", () => {
  return { greeting: "Hello world in JSON" };
});

Route.post("/login", "UserController.login");
Route.post("/users", "UserController.signup");

// account http://facom.ufms.br/account/change_password
Route.group(() => {
  Route.get("/me", "UserController.me");
  Route.put("/update_profile", "UserController.updateProfile");
  Route.put("/change_password", "UserController.changePassword");
})
  .prefix("account")
  .middleware(["auth"]);

// account http://facom.ufms.br/users/follow
Route.group(() => {
  Route.get("/timeline", "UserController.timeline");
  Route.put("/users", "UserController.update");
  Route.get("/users", "UserController.index");
  Route.post("/follow", "UserController.follow");
  Route.delete("/unfollow/:id", "UserController.unFollow");
})
  .prefix("users")
  .middleware(["auth"]);

Route.group(() => {
  Route.post("/tweet", "TweetController.tweet");
  Route.get("/tweets/:id", "TweetController.show");
  Route.delete("/tweets/destroy/:id", "TweetController.destroy");
  Route.post("/tweets/reply/:id", "TweetController.reply");
}).middleware(["auth"]);

// gerenciar Favoritos
Route.group(() => {
  Route.post("/create", "FavoriteController.favorite");
  Route.delete("/destroy/:id", "FavoriteController.unFavorite");
})
  .prefix("favorites")
  .middleware(["auth"]);

Route.get(":username", "UserController.showProfile");
