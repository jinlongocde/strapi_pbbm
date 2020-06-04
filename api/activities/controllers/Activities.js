'use strict';

/**
 * Activities.js controller
 *
 * @description: A set of functions called "actions" for managing `Activities`.
 */

module.exports = {

  /**
   * Retrieve activities records.
   *
   * @return {Object|Array}
   */

  find: async (ctx, next, { populate } = {}) => {
    if (ctx.query._q) {
      return strapi.services.activities.search(ctx.query);
    } else {
      return strapi.services.activities.fetchAll(ctx.query, populate);
    }
  },

  /**
   * Retrieve a activities record.
   *
   * @return {Object}
   */

  findOne: async (ctx) => {
    return strapi.services.activities.fetch(ctx.params);
  },

  /**
   * Count activities records.
   *
   * @return {Number}
   */

  count: async (ctx, next, { populate } = {}) => {
    return strapi.services.activities.count(ctx.query, populate);
  },

  /**
   * Create a/an activities record.
   *
   * @return {Object}
   */

  create: async (ctx) => {
    
    return strapi.services.activities.add(ctx.request.body);
  },

  /**
   * Update a/an activities record.
   *
   * @return {Object}
   */

  update: async (ctx, next) => {
    console.log(12345);
     return strapi.services.activities.edit(ctx.params, ctx.request.body) ;
  },

  /**
   * Destroy a/an activities record.
   *
   * @return {Object}
   */

  destroy: async (ctx, next) => {
    return strapi.services.activities.remove(ctx.params);
  },


  // Added by coder - cai
   /**
   * Update all activities record.
   *
   * @return {Object}
   */

  activities_price: async (ctx) => {
    const percent = ctx.request.body;
    return strapi.services.activities.update_all_prices(percent);
  },
  testemail: async (ctx) => { 
    strapi.services.activities.send__email('Test');
    ctx.send('sent email')
  }
};
