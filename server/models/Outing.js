const mongoose = require('mongoose');

const outingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: 'This field is required.'
  },
  email: {
    type: String,
    required: 'This field is required.'
  },
  description: {
    type: String,
    required: 'This field is required.'
  },
  // ingredients: {
  //   type: Array,
  //   required: 'This field is required.'
  // },
  category: {
    type: String,
    enum: ['northIndia', 'westIndia', 'southIndia', 'eastIndia'],
    required: 'This field is required.'
  },
  image: {
    type: String,
    required: 'This field is required.'
  },
  likes : {
    type: Object,
    default: {}
  },
  comments : {
    type : Array,
    default: []
  },
  userId: {
    type: String,
    required:true
  },
});

outingSchema.index({ name: 'text', description: 'text' });
// WildCard Indexing
//recipeSchema.index({ "$**" : 'text' });

module.exports = mongoose.model('Outing', outingSchema);