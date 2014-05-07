/**
  Module transitions
  @module transitions
*/

/**
  @class Models/Transitions
  @augments Backbone.Model
*/
App.Models.Transitions = Backbone.Model.extend( /** @lends module:transisitons~Models/Transitions.prototype */ {
  defaults:{
    "id": 1
  }
});

/**
  @class Collections/Transitions
  @augments Backbone.Model
*/
App.Collections.Transitions = Backbone.Collection.extend( /** @lends module:transisitons~Collections/Transitions.prototype */ {
  url: 'assets/resources/map/transitions.json',
  model: App.Models.Transitions
});
