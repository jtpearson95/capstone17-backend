'use strict';

const { createCoreController } = require('@strapi/strapi').factories;
const stripe = require("stripe")("sk_test_51OPXMbIpCo7yP5rrNBgInPEKAovhtPtrdpRhbHZRcv51pwexJZovqySLXt3c9kNRQCwWrwQzoQ163Wk72lEAVyB400ebPt1O9Z");

module.exports = createCoreController('api::order.order', ({ strapi }) =>  ({

  async create(ctx) {
    try {
      console.log("->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
      console.log('create order call: ' + JSON.stringify(ctx));
      console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<");

      // Ensure that the request body is a string
      const body = ctx.request.body;

      // Check if the body is already an object
      const bodyData = typeof body === 'object' ? body : JSON.parse(body);
      console.log('create order call DATA: ' + JSON.stringify(bodyData));
      const { address, amount, dishes, email, city, state, token } = bodyData.data;
      const stripeAmount = Math.floor(amount * 100);
      // console.log('create order call TOKEN: ' + JSON.stringify(payment_method));
      console.log('create order call STRIPEAMOUNT: ' + JSON.stringify(stripeAmount));
      console.log("STRIPE Token:", token);
  
      const charge = await stripe.charges.create({
        amount: stripeAmount,
        currency: 'usd',
        description: `Order ${new Date()} by ${ctx.state.user._id}`,
        source: token, 
      });
  
      const entity = await strapi.service('api::order.order').create({
        data: {
          user: ctx.state.user.id,
          charge_id: charge.id,
          amount: stripeAmount,
          address,
          dishes,
          city,
          state,
          email,
        },
      });
  
      const sanitizedEntity = await this.sanitizeOutput(entity, ctx);
  
      return this.transformResponse(sanitizedEntity);
    } catch (error) {
      // Log the error for debugging
      console.error('Error processing payment:', error);
  
      // Return an error response
      return ctx.response.internalServerError('Error processing payment');
    }
  },
}))

// "use strict";
// /**
//  * Order.js controller
//  *
//  * @description: A set of functions called "actions" for managing `Order`.
//  */
// // note that this needs to be a "private" key from STRIPE
// const stripe = require("stripe")(
//   "sk_test_51OPXMbIpCo7yP5rrNBgInPEKAovhtPtrdpRhbHZRcv51pwexJZovqySLXt3c9kNRQCwWrwQzoQ163Wk72lEAVyB400ebPt1O9Z"
// );
// module.exports = {
//   // /**
//   //  * Create a/an order record.
//   //  *
//   //  * @return {Object}
//   //  */

//   create: async (ctx) => {
//     const { address, amount, dishes, token, city, state } = JSON.parse(
//       ctx.request.body
//     );
//     const stripeAmount = Math.floor(amount * 100);
//     // charge on stripe
//     const charge = await stripe.charges.create({
//       // Transform cents to dollars.
//       amount: stripeAmount,
//       currency: "usd",
//       description: `Order ${new Date()} by ${ctx.state.user._id}`,
//       source: token,
//     });

//     // Register the order in the database
//     const order = await strapi.services.order.create({
//       user: ctx.state.user.id,
//       charge_id: charge.id,
//       amount: stripeAmount,
//       address,
//       dishes,
//       city,
//       state,
//     });

//     return order;
//   },
// };

