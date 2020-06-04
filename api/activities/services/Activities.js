/* global Activities */
'use strict';

/**
 * Activities.js service
 *
 * @description: A set of functions similar to controller's actions to avoid code duplication.
 */

// Public dependencies.
const _ = require('lodash');

// Strapi utilities.
const utils = require('strapi-hook-bookshelf/lib/utils/');
const { convertRestQueryParams, buildQuery } = require('strapi-utils');


module.exports = {

  /**
   * Promise to fetch all activities.
   *
   * @return {Promise}
   */

  fetchAll: (params, populate) => {
    // Select field to populate.
    const withRelated = populate || Activities.associations
      .filter(ast => ast.autoPopulate !== false)
      .map(ast => ast.alias);

    const filters = convertRestQueryParams(params);

    return Activities.query(buildQuery({ model: Activities, filters }))
      .fetchAll({ withRelated })
      .then(data => data.toJSON());
  },

  /**
   * Promise to fetch a/an activities.
   *
   * @return {Promise}
   */

  fetch: (params) => {
    // Select field to populate.
    const populate = Activities.associations
      .filter(ast => ast.autoPopulate !== false)
      .map(ast => ast.alias);

    return Activities.forge(_.pick(params, 'id')).fetch({
      withRelated: populate
    });
  },

  /**
   * Promise to count a/an activities.
   *
   * @return {Promise}
   */

  count: (params) => {
    // Convert `params` object to filters compatible with Bookshelf.
    const filters = convertRestQueryParams(params);

    return Activities.query(buildQuery({ model: Activities, filters: _.pick(filters, 'where') })).count();
  },

  /**
   * Promise to add a/an activities.
   *
   * @return {Promise}
   */

  add: async (values) => {
    // Extract values related to relational data.
    const relations = _.pick(values, Activities.associations.map(ast => ast.alias));
    const data = _.omit(values, Activities.associations.map(ast => ast.alias));

    // Create entry with no-relational data.
    const entry = await Activities.forge(data).save();

    // Create relational data and return the entry.

    this.send__email('Add');

    return Activities.updateRelations({ id: entry.id , values: relations });
  },

  /**
   * Promise to edit a/an activities.
   *
   * @return {Promise}
   */

  edit: async (params, values) => {
    // Extract values related to relational data.
    const relations = _.pick(values, Activities.associations.map(ast => ast.alias));
    const data = _.omit(values, Activities.associations.map(ast => ast.alias));

    // Create entry with no-relational data.
    const entry = await Activities.forge(params).save(data);

    this.send__email('Update');
    console.log(123455);
    // Create relational data and return the entry.
    return Activities.updateRelations(Object.assign(params, { values: relations }));
  },

  /**
   * Promise to remove a/an activities.
   *
   * @return {Promise}
   */

  remove: async (params) => {
    params.values = {};
    Activities.associations.map(association => {
      switch (association.nature) {
        case 'oneWay':
        case 'oneToOne':
        case 'manyToOne':
        case 'oneToManyMorph':
          params.values[association.alias] = null;
          break;
        case 'oneToMany':
        case 'manyToMany':
        case 'manyToManyMorph':
          params.values[association.alias] = [];
          break;
        default:
      }
    });

    await Activities.updateRelations(params);

    return Activities.forge(params).destroy();
  },

  /**
   * Promise to search a/an activities.
   *
   * @return {Promise}
   */

  search: async (params) => {
    // Convert `params` object to filters compatible with Bookshelf.
    const filters = strapi.utils.models.convertParams('activities', params);
    // Select field to populate.
    const populate = Activities.associations
      .filter(ast => ast.autoPopulate !== false)
      .map(ast => ast.alias);

    const associations = Activities.associations.map(x => x.alias);
    const searchText = Object.keys(Activities._attributes)
      .filter(attribute => attribute !== Activities.primaryKey && !associations.includes(attribute))
      .filter(attribute => ['string', 'text'].includes(Activities._attributes[attribute].type));

    const searchInt = Object.keys(Activities._attributes)
      .filter(attribute => attribute !== Activities.primaryKey && !associations.includes(attribute))
      .filter(attribute => ['integer', 'decimal', 'float'].includes(Activities._attributes[attribute].type));

    const searchBool = Object.keys(Activities._attributes)
      .filter(attribute => attribute !== Activities.primaryKey && !associations.includes(attribute))
      .filter(attribute => ['boolean'].includes(Activities._attributes[attribute].type));

    const query = (params._q || '').replace(/[^a-zA-Z0-9.-\s]+/g, '');

    return Activities.query(qb => {
      if (!_.isNaN(_.toNumber(query))) {
        searchInt.forEach(attribute => {
          qb.orWhereRaw(`${attribute} = ${_.toNumber(query)}`);
        });
      }

      if (query === 'true' || query === 'false') {
        searchBool.forEach(attribute => {
          qb.orWhereRaw(`${attribute} = ${_.toNumber(query === 'true')}`);
        });
      }

      // Search in columns with text using index.
      switch (Activities.client) {
        case 'mysql':
          qb.orWhereRaw(`MATCH(${searchText.join(',')}) AGAINST(? IN BOOLEAN MODE)`, `*${query}*`);
          break;
        case 'pg': {
          const searchQuery = searchText.map(attribute =>
            _.toLower(attribute) === attribute
              ? `to_tsvector(${attribute})`
              : `to_tsvector('${attribute}')`
          );

          qb.orWhereRaw(`${searchQuery.join(' || ')} @@ to_tsquery(?)`, query);
          break;
        }
      }

      if (filters.sort) {
        qb.orderBy(filters.sort.key, filters.sort.order);
      }

      if (filters.skip) {
        qb.offset(_.toNumber(filters.skip));
      }

      if (filters.limit) {
        qb.limit(_.toNumber(filters.limit));
      }
    }).fetchAll({
      withRelated: populate
    });
  },

  // Added by coder-cai
  /**
   * 
   *  Update all activities price by percent
   *
   * @return {Promise}
  */

  update_all_prices: async (percent) => {
   Activities.query(buildQuery({ model: Activities})).fetchAll().then(function( resData) {
     _.each(resData.models, function(model) {      
      const newPrice = model.attributes.Price - model.attributes.Price/100 * percent.Discount;
      Activities.forge({id: model.attributes.id}).save({Price: newPrice});
     })
   })

   return Activities.query(buildQuery({ model: Activities})).fetchAll();
  },

  send__email: async (type)=>{

    console.log(type)
    await strapi.plugins['email'].services.email.send({
      to: 'pbelhe@yandex.com',
      from: 'support@strapi.io',
      replyTo: 'noreply@strapi.io',
      subject: 'Activity Test Email' ,
      text: 'Activity Test Email',
    });
  }
};
