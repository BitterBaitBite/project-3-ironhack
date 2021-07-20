// FIX - helpers and middleware for validation

const express = require('express');
const router = express.Router();

const JobOffer = require('./../models/JobOffer.model');

router.get('/getAll', (req, res) => {
	JobOffer.find()
		.then(allOffers => res.json(allOffers), 200)
		.catch(err => res.status(500).json({ code: 500, message: 'DDBB error fetching job offers', err }));
});

router.get('/getAll/applied', (req, res) => {
	if (!req.session.currentUser) res.status(401).json({ code: 401, message: 'You need to log in to get your job offers' });

	if (req.session.currentUser.role != 'ARTIST')
		res.status(401).json({ code: 401, message: 'You need to log in as artist to see the job offers you applied to' });

	JobOffer.find({ applicants: { $in: req.session.currentUser._id } })
		.then(allOffers => {
			if (!allOffers || allOffers.length <= 0)
				res.status(400).json({ code: 400, message: 'The current user does not have job offers' });

			res.json(allOffers), 200;
		})
		.catch(err => res.status(500).json({ code: 500, message: 'DDBB error fetching job offers', err }));
});

router.get('/getAll/created', (req, res) => {
	if (!req.session.currentUser) res.status(401).json({ code: 401, message: 'You need to log in to get your job offers' });

	if (req.session.currentUser.role != 'RECRUITER')
		res.status(401).json({ code: 401, message: 'You need to log in as recruiter to see your created job offers' });

	JobOffer.find({ recruiter_id: req.session.currentUser._id })
		.then(allOffers => {
			if (!allOffers || allOffers.length <= 0)
				res.status(400).json({ code: 400, message: 'The current user does not have job offers' });

			res.json(allOffers), 200;
		})
		.catch(err => res.status(500).json({ code: 500, message: 'DDBB error fetching job offers', err }));
});

router.get('/getAll/applied/:user_id', (req, res) => {
	if (!req.session.currentUser) res.status(401).json({ code: 401, message: 'You need to log in to get your job offers' });

	JobOffer.find({ applicants: { $in: req.params.user_id } })
		.then(allOffers => {
			if (!allOffers || allOffers.length <= 0)
				res.status(400).json({ code: 400, message: 'The specified user has not applied to any job offer' });

			res.json(allOffers), 200;
		})
		.catch(err => res.status(500).json({ code: 500, message: 'DDBB error fetching job offers', err }));
});

router.get('/getAll/created/:user_id', (req, res) => {
	if (!req.session.currentUser) res.status(401).json({ code: 401, message: 'You need to log in to get your job offers' });

	JobOffer.find({ recruiter_id: req.params.user_id })
		.then(allOffers => {
			if (!allOffers || allOffers.length <= 0)
				res.status(400).json({ code: 400, message: 'The specified user does not have created job offers' });

			res.json(allOffers), 200;
		})
		.catch(err => res.status(500).json({ code: 500, message: 'DDBB error fetching job offers', err }));
});

router.get('/getOne/:job_id', (req, res) => {
	JobOffer.findById(req.params.job_id)
		.then(jobOffer => {
			if (!jobOffer) res.status(400).json({ code: 400, message: 'Not found any job offer for the specified id' });

			res.json(jobOffer), 200;
		})
		.catch(err => res.status(500).json({ code: 500, message: `DDBB error fetching user for id ${req.params.job_id}`, err }));
});

router.post('/create-job-offer', (req, res) => {
	const { brand, title, description, tags } = req.body;

	if (!req.session.currentUser) res.status(401).json({ code: 401, message: 'You need to log in to create a job offer' });

	if (req.session.currentUser.role != 'RECRUITER')
		res.status(401).json({ code: 401, message: 'You need to log in as recruiter to create a job offer' });

	const { _id } = req.session.currentUser;

	if (!brand || brand.match(/^\s*$/)) res.status(400).json({ code: 400, message: 'A brand is mandatory' });

	if (!title || title.match(/^\s*$/)) res.status(400).json({ code: 400, message: 'A title is mandatory' });

	if (!description || description.match(/^\s*$/)) res.status(400).json({ code: 400, message: 'A description is mandatory' });

	JobOffer.create({ recruiter_id: _id, brand, title, description, tags })
		.then(jobOffer => res.json(jobOffer), 200)
		.catch(err => res.status(500).json({ code: 500, message: `DDBB error creating the job offer`, err }));
});

router.put('/:job_id/edit-job-offer', (req, res) => {
	const { brand, title, description, tags } = req.body;

	if (!req.session.currentUser) res.status(401).json({ code: 401, message: 'You need to log in to create a job offer' });

	if (req.session.currentUser.role != 'RECRUITER')
		res.status(401).json({ code: 401, message: 'You need to log in as recruiter to create a job offer' });

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

router.put('/:job_id/apply', (req, res) => {
	if (!req.session.currentUser) res.status(401).json({ code: 401, message: 'You need to log in to apply to a job offer' });

	if (req.session.currentUser.role != 'ARTIST')
		res.status(401).json({ code: 401, message: 'You need to log in as artist to apply to a job offer' });

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

router.put('/:job_id/quit', (req, res) => {
	if (!req.session.currentUser) res.status(401).json({ code: 401, message: 'You need to log in to apply to a job offer' });

	if (req.session.currentUser.role != 'ARTIST')
		res.status(401).json({ code: 401, message: 'You need to log in as artist to apply to a job offer' });

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

router.delete('/:job_id/delete', (req, res) => {
	if (!req.session.currentUser) res.status(401).json({ code: 401, message: 'You need to log in to delete a job offer' });

	if (req.session.currentUser.role != 'RECRUITER')
		res.status(401).json({ code: 401, message: 'You need to log in as recruiter to delete a job offer' });

	JobOffer.findOneAndDelete({ _id: req.params.job_id, recruiter_id: req.session.currentUser._id })
		.then(jobOffer => {
			if (!jobOffer) res.status(400).json({ code: 400, message: 'The job offer did not exist for the current user' });

			res.json(jobOffer), 200;
		})
		.catch(err => res.status(500).json({ code: 500, message: `Error trying to delete the job offer from the DDBB`, err }));
});

module.exports = router;
