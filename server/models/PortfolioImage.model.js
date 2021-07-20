const { Schema, model } = require('mongoose');

const portfolioImageSchema = new Schema({
	artist_id: {
		type: Schema.Types.ObjectId,
		ref: 'User',
	},

	img_url: String,

	tags: [String],

	likes: {
		type: Number,
		default: 0,
	},

	liked: [
		{
			type: Schema.Types.ObjectId,
			ref: 'User',
		},
	],
});

const PortfolioImage = model('PortfolioImage', portfolioImageSchema);

module.exports = PortfolioImage;
