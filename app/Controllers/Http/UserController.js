"use strict";

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const User = use("App/Models/User");
const Tweet = use("App/Models/Tweet");
const Hash = use("Hash");
/**
 * Resourceful controller for interacting with users
 */
class UserController {
  /**
   * Show a list of all users.
   * GET users
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index({ request, response, view }) {
    const users = await User.all();

    return response.json(users);
  }

  /**
   * Create/save a new user.
   * POST users
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async signup({ request, response, auth }) {
    const userData = request.only(["name", "username", "email", "password"]);
    // console.log (userData)

    try {
      const user = await User.create(userData);

      const token = await auth.generate(user);

      return response.json({
        status: "success",
        data: token,
      });
    } catch (error) {
      return response.status(500).json({
        status: "error",
        message: "Ocorreu um erro inesperado!",
        technical: error,
      });
    }
  }

  async login({ request, response, auth }) {
    try {
      const token = await auth.attempt(
        request.input("email"),
        request.input("password")
      );

      return response.json({
        status: "success",
        data: token,
      });
    } catch (error) {
      return response.status(500).json({
        status: "error",
        message: "E-mail ou Senha inválidos.",
      });
    }
  }

  /**
   * Display a single user.
   * GET users/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async show({ params, response }) {
    try {
      return response.json(await User.findOrFail(params.id));
    } catch (error) {
      return response.status(404).json({
        status: "error",
        message: "Usuário não encontrado!",
      });
    }
  }

  /**
   * Update user details.
   * PUT or PATCH users/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async updateProfile({ auth, request, response }) {
    const userData = request.only([
      "name",
      "username",
      "email",
      "password",
      "bio",
      "website_url",
      "location",
    ]);

    try {
      const user = auth.current.user;

      user.name = userData.name;
      user.username = userData.username;
      user.email = userData.email;
      user.password = userData.password;
      user.bio = userData.bio;
      user.website_url = userData.website_url;
      user.location = userData.location;

      await user.save();
    } catch (error) {
      return response.status(404).json({
        status: "error",
        message: "Não foi possível atualizar o seu perfil!",
      });
    }
  }
  // PUT http://localhost:3333/users/3
  async update({ auth, params, request, response }) {
    const userData = request.only([
      "name",
      "username",
      "email",
      "password",
      "bio",
      "website_url",
      "location",
    ]);

    try {
      const user = await User.findOrFail(params.id);

      user.name = userData.name;
      user.username = userData.username;
      user.email = userData.email;
      user.password = userData.password;
      user.bio = userData.bio;
      user.website_url = userData.website_url;
      user.location = userData.location;

      await user.save();
    } catch (error) {
      return response.status(404).json({
        status: "error",
        message: "Não foi possível atualizar o seu perfil!",
      });
    }
  }

  async timeline({ auth, response }) {
    const user = await User.find(auth.current.user.id);
    const followingIds = await user.following().ids();

    followingIds.push(user.id);

    const tweets = await Tweet.query()
      .whereIn("user_id", followingIds)
      .with("user")
      .with("favorites")
      .with("replies")
      .fetch();

    return response.json({
      status: "success",
      data: tweets,
    });
  }

  async me({ auth, response }) {
    try {
      const user = await User.query()
        .where("id", auth.current.user.id)
        .with("tweets", (builder) => {
          builder.with("user");
          builder.with("favorites");
          builder.with("replies");
        })
        .with("following")
        .with("followers")
        .with("favorites")
        .with("favorites.tweet", (builder) => {
          builder.with("user");
          builder.with("favorites");
          builder.with("replies");
        })
        .firstOrFail();

      return response.json({
        status: "success",
        data: user,
      });
    } catch (error) {
      return response.status(404).json({
        status: "error",
        message: "Não foi possível mostrar o seu profile!",
      });
    }
  }

  // http://localhost:3333/:username
  async showProfile({ response, params }) {
    try {
      const user = await User.query()
        .where("username", params.username)
        .with("tweets", (builder) => {
          builder.with("user");
          builder.with("favorites");
          builder.with("replies");
        })
        .with("following")
        .with("followers")
        .with("favorites")
        .with("favorites.tweet", (builder) => {
          builder.with("user");
          builder.with("favorites");
          builder.with("replies");
        })
        .firstOrFail();

      return response.json({
        status: "success",
        data: user,
      });
    } catch (error) {
      return response.status(404).json({
        status: "error",
        message: "Não foi possível mostrar o seu profile!",
      });
    }
  }

  async changePassword({ auth, response, request }) {
    const user = auth.current.user;

    const currentPassword = request.input("password");

    const verifyPassword = await Hash.verify(currentPassword, user.password);

    if (!verifyPassword) {
      return response.status(401).json({
        status: "error",
        message: "Senha atual não confere!",
      });
    }

    const newPassword = request.input("newPassword");

    user.password = await Hash.make(newPassword);
    await user.save();

    return response.json({
      status: "success",
      message: "Senha atualizada com sucesso!",
    });
  }

  /**
   * Delete a user with id.
   * DELETE users/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy({ params, auth, request, response }) {
    try {
      const user = await User.findOrFail(params.id);

      await user.delete();

      return response.json({
        status: "success",
        message: "Usuário removido com o sucesso!",
      });
    } catch (error) {
      return response.status(404).json({
        status: "error",
        message: "Usuário não encontrado!",
      });
    }
  }

  async follow({ auth, request, response }) {
    const user = auth.current.user; // sou eu

    await user.following().attach(request.input("user_id"));

    // EU -> user_id

    return response.json({
      status: "success",
      message: "Você seguiu o usuário com sucesso!",
      data: null,
    });
  }

  async unFollow({ params, auth, response }) {
    const user = auth.current.user; // sou eu

    await user.following().detach(params.id);

    return response.json({
      status: "success",
      message: "Você deixou de seguir o usuário com sucesso!",
      data: null,
    });
  }
}

module.exports = UserController;
