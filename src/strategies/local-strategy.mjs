import passport from "passport";
import { Strategy } from "passport-local";
import { findUserByEmail, findUserById } from "../handlers/users.mjs";
import { comparePassword } from "../utils/helpers.mjs";

passport.serializeUser((user, done) => {
  // Argument that you pass in 2nd argument is unique to save to session
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  // Search for user in DB
  try {
    const user = await findUserById(id);
    if (!user) {
      throw new Error("User not found");
    }
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport.use(
  new Strategy({ usernameField: "email" }, async (username, password, done) => {
    // Responsible for validating user,
    // ex. check if user exists, check if password is the same
    try {
      const user = await findUserByEmail(username);
      if (!user) {
        throw new Error("User not found");
      }
      const correctPassword = await comparePassword(password, user.password);
      if (!correctPassword) {
        throw new Error("Invalid Credentials");
      }

      done(null, user);
    } catch (err) {
      done(err, null);
    }
  })
);
