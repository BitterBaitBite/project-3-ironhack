// FIX - helpers and middleware for validation
// FIX - unify like & dislike routes
// FIX - adapt for query strings

const express = require('express');
const { isLoggedIn, checkRole } = require('../middleware');
const router = express.Router();

const PortfolioImage = require('./../models/PortfolioImage.model');

router.get('/all', (req, res) => {
	PortfolioImage.find()
		.then(allImages => {
			if (!allImages || allImages.length <= 0)
				res.status(400).json({ code: 400, message: 'Could not find any portfolio images' });

			res.json(allImages), 200;
		})
		.catch(err => res.status(500).json({ code: 500, message: 'DDBB error fetching portfolio images', err }));
});

router.get('/all/limit-:limit', (req, res) => {
	const { limit } = req.params;

	PortfolioImage.find()
		.sort({ likes: -1 })
		.limit(Number(limit))
		.then(allImages => {
			if (!allImages || allImages.length <= 0)
				res.status(400).json({ code: 400, message: 'Could not find any portfolio images' });

			res.json(allImages), 200;
		})
		.catch(err => res.status(500).json({ code: 500, message: 'DDBB error fetching portfolio images', err }));
});

router.get('/all/currentArtist', isLoggedIn, (req, res) => {
	PortfolioImage.find({ artist_id: req.session.currentUser._id })
		.then(allImages => {
			if (!allImages || allImages.length <= 0)
				res.status(400).json({ code: 400, message: 'The current user does not have portfolio images' });

			res.json(allImages), 200;
		})
		.catch(err => res.status(500).json({ code: 500, message: 'DDBB error fetching portfolio images', err }));
});

router.get('/all/:user_id', isLoggedIn, (req, res) => {
	PortfolioImage.find({ artist_id: req.params.user_id })
		.then(allImages => {
			if (!allImages || allImages.length <= 0)
				res.status(400).json({ code: 400, message: 'The specified user does not have portfolio images' });

			res.json(allImages), 200;
		})
		.catch(err => res.status(500).json({ code: 500, message: 'DDBB error fetching portfolio images', err }));
});

router.post('/portfolio-image', isLoggedIn, checkRole('ARTIST'), (req, res) => {
	const { img_url, tags } = req.body;

	const { _id } = req.session.currentUser;

	if (!img_url || img_url.match(/^\s*$/)) res.status(400).json({ code: 400, message: 'A image url is mandatory' });

	PortfolioImage.create({ artist_id: _id, img_url, tags })
		.then(image => res.json(image), 200)
		.catch(err => res.status(500).json({ code: 500, message: `DDBB error creating the portfolio image`, err }));
});

router.get('/:image_id', (req, res) => {
	PortfolioImage.findById(req.params.image_id)
		.populate({ path: 'artist_id', select: ['portfolio.name', 'portfolio.last_name'] })
		.then(image => {
			if (!image) res.status(400).json({ code: 400, message: 'Not found any image for the specified id' });

			res.json(image), 200;
		})
		.catch(err => res.status(500).json({ code: 500, message: `DDBB error fetching user for id ${req.params.job_id}`, err }));
});

router.put('/:image_id', isLoggedIn, checkRole('ARTIST'), (req, res) => {
	const { img_url, tags } = req.body;

	const { _id } = req.session.currentUser;

	if (!img_url || img_url.match(/^\s*$/)) res.status(400).json({ code: 400, message: 'A image url is mandatory' });

	PortfolioImage.findOneAndUpdate({ _id: req.params.image_id, artist_id: _id }, { img_url, tags }, { new: true })
		.populate({ path: 'artist_id', select: ['portfolio.name', 'portfolio.last_name'] })
		.then(image => {
			if (!image)
				res.status(400).json({ code: 400, message: 'There are no images with the specified id for the current user' });

			res.json(image), 200;
		})
		.catch(err => res.status(500).json({ code: 500, message: `Could not update the job offer in the DDBB`, err }));
});

router.put('/:image_id/like', isLoggedIn, (req, res) => {
	PortfolioImage.findOneAndUpdate(
		{ _id: req.params.image_id, liked: { $nin: req.session.currentUser._id } },
		{ $inc: { likes: 1 }, $push: { liked: req.session.currentUser._id } },
		{ new: true }
	)
		// .populate({ path: 'artist_id', select: ['name', 'last_name'] })
		.then(image => {
			if (!image) res.status(400).json({ code: 400, message: 'The current user already likes this image' });

			res.json(image), 200;
		})
		.catch(err =>
			res.status(500).json({ code: 500, message: `DDBB error trying to update the image with the new like`, err })
		);
});

router.put('/:image_id/dislike', isLoggedIn, (req, res) => {
	PortfolioImage.findOneAndUpdate(
		{ _id: req.params.image_id, liked: { $in: req.session.currentUser._id } },
		{ $inc: { likes: -1 }, $pull: { liked: req.session.currentUser._id } },
		{ new: true }
	)
		.then(image => {
			if (!image) res.status(400).json({ code: 400, message: 'The current user does not like this image already' });

			res.json(image), 200;
		})
		.catch(err =>
			res.status(500).json({ code: 500, message: `DDBB error trying to update the image with the new dislike`, err })
		);
});

router.delete('/:image_id', isLoggedIn, checkRole('ARTIST'), (req, res) => {
	PortfolioImage.findOneAndDelete({ _id: req.params.image_id, artist_id: req.session.currentUser._id })
		.then(image => {
			if (!image) res.status(400).json({ code: 400, message: 'The specified image did not exist for the current user' });

			res.json(image), 200;
		})
		.catch(err =>
			res.status(500).json({ code: 500, message: `Error trying to delete the portfolio image from the DDBB`, err })
		);
});

module.exports = router;
