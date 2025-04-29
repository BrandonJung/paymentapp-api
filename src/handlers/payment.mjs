import Stripe from "stripe";
import { BadRequestError } from "../utils/errors.mjs";
import { findJobById } from "./jobs.mjs";
const stripe = new Stripe(process.env.STRIPE_TEST_SECRET_KEY);

export const createPaymentIntent = async (req, res, next) => {
  const { jobId } = req.body;
  if (!jobId) {
    return next(new BadRequestError("No job id"));
  }
  try {
    const job = await findJobById(jobId);
    if (!job) {
      return next(new BadRequestError("Job does not exist"));
    }
    const { totalPrice, customer } = job;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalPrice,
      currency: "cad",
    });
    return res
      .status(200)
      .send({ clientSecret: paymentIntent.client_secret, job: job });
  } catch (err) {
    console.log("Error creating payment intent", err);
  }
};

// const createStartSubscription = async () => {
//   stripe.products
//     .create({
//       name: "Starter Subscription",
//       description: "$12/Month subscription",
//     })
//     .then((product) => {
//       stripe.prices
//         .create({
//           unit_amount: 1200,
//           currency: "usd",
//           recurring: {
//             interval: "month",
//           },
//           product: product.id,
//         })
//         .then((price) => {
//           console.log(
//             "Success! Here is your starter subscription product id: " +
//               product.id
//           );
//           console.log(
//             "Success! Here is your starter subscription price id: " + price.id
//           );
//         });
//     });
// };

// Success! Here is your starter subscription product id:
// prod_SDPmCDigXZNgca
// Success! Here is your starter subscription price id:
// price_1RIyxO02C0h5bqgBexYRVpYR
