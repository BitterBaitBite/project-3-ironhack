// FIX - helpers and middleware for validation
// FIX - unify like & dislike routes

const express = require('express');
const router = express.Router();

const PortfolioImage = require('./../models/PortfolioImage.model');

router.get('/getAll', (req, res) => {
	PortfolioImage.find()
		.then(allImages => {
			if (!allImages || allImages.length <= 0)
				res.status(400).json({ code: 400, message: 'Could not find any portfolio images' });

			res.json(allImages), 200;
		})
		.catch(err => res.status(500).json({ code: 500, message: 'DDBB error fetching portfolio images', err }));
});

router.get('/getAll/currentArtist', (req, res) => {
	if (!req.session.currentUser) res.status(401).json({ code: 401, message: 'You need to log in to get your portfolio images' });

	PortfolioImage.find({ artist_id: req.session.currentUser._id })
		.then(allImages => {
			if (!allImages || allImages.length <= 0)
				res.status(400).json({ code: 400, message: 'The current user does not have portfolio images' });

			res.json(allImages), 200;
		})
		.catch(err => res.status(500).json({ code: 500, message: 'DDBB error fetching portfolio images', err }));
});

router.get('/getAll/:user_id', (req, res) => {
	if (!req.session.currentUser)
		res.status(401).json({ code: 401, message: 'You need to log in to get that user portfolio images' });

	PortfolioImage.find({ artist_id: req.params.user_id })
		.then(allImages => {
			if (!allImages || allImages.length <= 0)
				res.status(400).json({ code: 400, message: 'The specified user does not have portfolio images' });

			res.json(allImages), 200;
		})
		.catch(err => res.status(500).json({ code: 500, message: 'DDBB error fetching portfolio images', err }));
});

router.get('/getOne/:image_id', (req, res) => {
	PortfolioImage.findById(req.params.image_id)
		.then(image => {
			if (!image) res.status(400).json({ code: 400, message: 'Not found any image for the specified id' });

			res.json(image), 200;
		})
		.catch(err => res.status(500).json({ code: 500, message: `DDBB error fetching user for id ${req.params.job_id}`, err }));
});

router.post('/add-portfolio-image', (req, res) => {
	const { img_url, tags } = req.body;

	if (!req.session.currentUser) res.status(401).json({ code: 401, message: 'You need to log in to add a portfolio image' });

	if (req.session.currentUser.role != 'ARTIST')
		res.status(401).json({ code: 401, message: 'You need to log in as artist to add a portfolio image' });

	const { _id } = req.session.currentUser;

	if (!img_url || img_url.match(/^\s*$/)) res.status(400).json({ code: 400, message: 'A image url is mandatory' });

	PortfolioImage.create({ artist_id: _id, img_url, tags })
		.then(image => res.json(image), 200)
		.catch(err => res.status(500).json({ code: 500, message: `DDBB error creating the portfolio image`, err }));
});

router.put('/:image_id/edit-portfolio-image', (req, res) => {
	const { img_url, tags } = req.body;

	if (!req.session.currentUser) res.status(401).json({ code: 401, message: 'You need to log in to edit a portfolio image' });

	if (req.session.currentUser.role != 'ARTIST')
		res.status(401).json({ code: 401, message: 'You need to log in as artist to edit a portfolio image' });

	const { _id } = req.session.currentUser;

	if (!img_url || img_url.match(/^\s*$/)) res.status(400).json({ code: 400, message: 'A image url is mandatory' });

	PortfolioImage.findOneAndUpdate(
		{ _id: req.params.image_id, artist_id: req.session.currentUser._id },
		{ img_url, tags },
		{ new: true }
	)
		.then(image => {
			if (!image)
				res.status(400).json({ code: 400, message: 'There are no images with the specified id for the current user' });

			res.json(image), 200;
		})
		.catch(err => res.status(500).json({ code: 500, message: `Could not update the job offer in the DDBB`, err }));
});

router.put('/:image_id/like', (req, res) => {
	if (!req.session.currentUser) res.status(401).json({ code: 401, message: 'You need to log in to like an image' });

	PortfolioImage.findOneAndUpdate(
		{ _id: req.params.image_id, liked: { $nin: req.session.currentUser._id } },
		{ $inc: { likes: 1 }, $push: { liked: req.session.currentUser._id } },
		{ new: true }
	)
		.then(image => {
			if (!image) res.status(400).json({ code: 400, message: 'The current user already likes this image' });

			res.json(image), 200;
		})
		.catch(err =>
			res.status(500).json({ code: 500, message: `DDBB error trying to update the image with the new like`, err })
		);
});

router.put('/:image_id/dislike', (req, res) => {
	if (!req.session.currentUser) res.status(401).json({ code: 401, message: 'You need to log in to dislike an image' });

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

router.delete('/:image_id/delete', (req, res) => {
	if (!req.session.currentUser) res.status(401).json({ code: 401, message: 'You need to log in to delete a portfolio image' });

	if (req.session.currentUser.role != 'ARTIST')
		res.status(401).json({ code: 401, message: 'You need to log in as artist to delete a job offer' });

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
