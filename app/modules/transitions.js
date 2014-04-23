App.Models.Transitions = Backbone.Model.extend({
  defaults:{
    "id": 1
  }
});

App.Collections.Transitions = Backbone.Collection.extend({
  url: 'assets/resources/map/transitions.json',
  model: App.Models.Transitions
});
