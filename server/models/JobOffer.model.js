const { Schema, model } = require('mongoose');

const jobOfferSchema = new Schema({
	recruiter_id: {
		type: Schema.Types.ObjectId,
		ref: 'User',
	},

	brand: String,

	title: String,

	description: String,

	tags: [String],

	applicants: [
		{
			type: Schema.Types.ObjectId,
			ref: 'User',
		},
	],
});

const JobOffer = model('JobOffer', jobOfferSchema);

module.exports = JobOffer;
