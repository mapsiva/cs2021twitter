"use strict";

const Tweet = use("App/Models/Tweet");
const Reply = use("App/Models/Reply");

class TweetController {
  async tweet({ request, auth, response }) {
    try {
      const user = auth.current.user;

      const tweet = await Tweet.create({
        user_id: user.id,
        tweet: request.input("tweet"),
      });

      await tweet.loadMany(["user", "replies", "favorites"]);

      return response.json({
        status: "success",
        message: "Tweet criado com sucesso!",
        data: tweet,
      });
    } catch (error) {
      return response.status(500).json({
        status: "error",
        message: "Ocorreu um erro inesperado!",
        technical: error,
      });
    }
  }

  async show({ params, response }) {
    try {
      const tweet = await Tweet.query()
        .where("id", params.id)
        .with("user")
        .with("replies")
        .with("replies.user")
        .with("favorites")
        .firstOrFail();

      return response.json({
        status: "success",
        data: tweet,
      });
    } catch (error) {
      return response.status(404).json({
        status: "error",
        message: "Tweet não encontrado!",
        technical: error,
      });
    }
  }

  async reply({ params, auth, response, request }) {
    const user = auth.current.user;
    let tweet;

    try {
      tweet = await Tweet.findOrFail(params.id);
    } catch (error) {
      return response.status(404).json({
        status: "error",
        message: "Tweet não encontrado!",
        technical: error,
      });
    }

    try {
      const reply = await Reply.create({
        user_id: user.id,
        tweet_id: tweet.id,
        reply: request.input("reply"),
      });

      await reply.loadMany(["user"]);

      return response.json({
        status: "success",
        data: reply,
      });
    } catch (error) {
      return response.status(500).json({
        status: "error",
        message: "Erro ao criar comentário!",
        technical: error,
      });
    }
  }

  async destroy({ params, auth, response }) {
    try {
      const tweet = await Tweet.query()
        .where("id", params.id)
        .where("user_id", auth.current.user.id)
        .firstOrFail();

      await tweet.delete();
    } catch (error) {
      return response.status(404).json({
        status: "error",
        message: "Tweet não encontrado!",
        technical: error,
      });
    }
  }
}

module.exports = TweetController;
