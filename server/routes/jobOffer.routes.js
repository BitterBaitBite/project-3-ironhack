// FIX - helpers and middleware for validation
// FIX - fix routes adapting them to the http verb
// FIX - adapt for query strings

const express = require('express');
const { isLoggedIn, checkRole } = require('../middleware');
const router = express.Router();

const JobOffer = require('./../models/JobOffer.model');

router.get('/all', (req, res) => {
	JobOffer.find()
		.then(allOffers => res.json(allOffers), 200)
		.catch(err => res.status(500).json({ code: 500, message: 'DDBB error fetching job offers', err }));
});

router.get('/all/applied', isLoggedIn, checkRole('ARTIST'), (req, res) => {
	JobOffer.find({ applicants: { $in: req.session.currentUser._id } })
		.then(allOffers => {
			if (!allOffers || allOffers.length <= 0)
				res.status(400).json({ code: 400, message: 'The current user does not have job offers' });

			res.json(allOffers), 200;
		})
		.catch(err => res.status(500).json({ code: 500, message: 'DDBB error fetching job offers', err }));
});

router.get('/all/created', isLoggedIn, checkRole('RECRUITER'), (req, res) => {
	JobOffer.find({ recruiter_id: req.session.currentUser._id })
		.then(allOffers => {
			if (!allOffers || allOffers.length <= 0)
				res.status(400).json({ code: 400, message: 'The current user does not have job offers' });

			res.json(allOffers), 200;
		})
		.catch(err => res.status(500).json({ code: 500, message: 'DDBB error fetching job offers', err }));
});

router.get('/all/applied/:user_id', isLoggedIn, (req, res) => {
	JobOffer.find({ applicants: { $in: req.params.user_id } })
		.then(allOffers => {
			if (!allOffers || allOffers.length <= 0)
				res.status(400).json({ code: 400, message: 'The specified user has not applied to any job offer' });

			res.json(allOffers), 200;
		})
		.catch(err => res.status(500).json({ code: 500, message: 'DDBB error fetching job offers', err }));
});

router.get('/all/created/:user_id', isLoggedIn, (req, res) => {
	JobOffer.find({ recruiter_id: req.params.user_id })
		.then(allOffers => {
			if (!allOffers || allOffers.length <= 0)
				res.status(400).json({ code: 400, message: 'The specified user does not have created job offers' });

			res.json(allOffers), 200;
		})
		.catch(err => res.status(500).json({ code: 500, message: 'DDBB error fetching job offers', err }));
});

router.post('/job-offer', isLoggedIn, checkRole('RECRUITER'), (req, res) => {
	const { brand, title, description, tags } = req.body;

	const { _id } = req.session.currentUser;

	if (!brand || brand.match(/^\s*$/)) res.status(400).json({ code: 400, message: 'A brand is mandatory' });

	if (!title || title.match(/^\s*$/)) res.status(400).json({ code: 400, message: 'A title is mandatory' });

	if (!description || description.match(/^\s*$/)) res.status(400).json({ code: 400, message: 'A description is mandatory' });

	JobOffer.create({ recruiter_id: _id, brand, title, description, tags })
		.then(jobOffer => res.json(jobOffer), 200)
		.catch(err => res.status(500).json({ code: 500, message: `DDBB error creating the job offer`, err }));
});

router.get('/:job_id', (req, res) => {
	JobOffer.findById(req.params.job_id)
		.populate({
			path: 'applicants',
			select: '_id portfolio',
		})
		.then(jobOffer => {
			if (!jobOffer) res.status(400).json({ code: 400, message: 'Not found any job offer for the specified id' });

			res.json(jobOffer), 200;
		})
		.catch(err => res.status(500).json({ code: 500, message: `DDBB error fetching user for id ${req.params.job_id}`, err }));
});

router.put('/:job_id', isLoggedIn, checkRole('RECRUITER'), (req, res) => {
	const { brand, title, description, tags } = req.body;

	if (!brand || brand.match(/^\s*$/)) res.status(400).json({ code: 400, message: 'A brand is mandatory' });

	if (!title || title.match(/^\s*$/)) res.status(400).json({ code: 400, message: 'A title is mandatory' });

	if (!description || description.match(/^\s*$/)) res.status(400).json({ code: 400, message: 'A description is mandatory' });

	JobOffer.findOneAndUpdate(
		{ _id: req.params.job_id, recruiter_id: req.session.currentUser._id },
		{ brand, title, description, tags },
		{ new: true }
	)
		.then(jobOffer => {
			if (!jobOffer) res.status(400).json({ code: 400, message: "There's no job offers for the current user" });

			res.json(jobOffer), 200;
		})
		.catch(err => res.status(500).json({ code: 500, message: `Could not update the job offer in the DDBB`, err }));
});

router.put('/:job_id/apply', isLoggedIn, checkRole('ARTIST'), (req, res) => {
	JobOffer.findOneAndUpdate(
		{ _id: req.params.job_id, applicants: { $nin: req.session.currentUser._id } },
		{ $push: { applicants: req.session.currentUser._id } },
		{ new: true }
	)
		.then(jobOffer => {
			if (!jobOffer) res.status(400).json({ code: 400, message: 'The current user cannot apply again for this job offer' });

			res.json(jobOffer), 200;
		})
		.catch(err =>
			res.status(500).json({ code: 500, message: `DDBB error trying to update the job offer with the new applicant`, err })
		);
});

router.put('/:job_id/quit', isLoggedIn, checkRole('ARTIST'), (req, res) => {
	JobOffer.findOneAndUpdate(
		{ _id: req.params.job_id, applicants: { $in: req.session.currentUser._id } },
		{ $pull: { applicants: req.session.currentUser._id } },
		{ new: true }
	)
		.then(jobOffer => {
			if (!jobOffer) res.status(400).json({ code: 400, message: 'The current user cannot quit from this job offer' });

			res.json(jobOffer), 200;
		})
		.catch(err => res.status(500).json({ code: 500, message: `DDBB error trying to remove the applicant`, err }));
});

router.delete('/:job_id', isLoggedIn, checkRole('RECRUITER'), (req, res) => {
	JobOffer.findOneAndDelete({ _id: req.params.job_id, recruiter_id: req.session.currentUser._id })
		.then(jobOffer => {
			if (!jobOffer) res.status(400).json({ code: 400, message: 'The job offer did not exist for the current user' });

			res.json(jobOffer), 200;
		})
		.catch(err => res.status(500).json({ code: 500, message: `Error trying to delete the job offer from the DDBB`, err }));
});

module.exports = router;
