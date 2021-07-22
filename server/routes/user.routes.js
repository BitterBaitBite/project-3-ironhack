// FIX - helpers and middleware for validation
// FIX - adapt for query strings

const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');
const bcryptSalt = 10;

const User = require('./../models/User.model');
const { isLoggedIn } = require('../middleware');

router.get('/all', (req, res) => {
	User.find()
		.then(allUsers => res.json(allUsers), 200)
		.catch(err => res.status(500).json({ code: 500, message: 'Error fetching users', err }));
});

router.put('/user-profile', isLoggedIn, (req, res) => {
	const { username, oldPassword, newPassword } = req.body;

	if (username.length <= 0 || username.match(/^\s*$/)) {
		res.status(400).json({ code: 400, message: 'Username cannot be empty' });
	}

	if (newPassword.length <= 0 || newPassword.match(/^\s*$/)) {
		res.status(400).json({ code: 400, message: 'Password cannot be empty' });
	}

	User.findOne({ username })
		.then(user => {
			if (user && !user._id.equals(req.session.currentUser._id)) {
				res.status(400).json({ code: 400, message: 'Username already exists' });
				return;
			}

			if (bcrypt.compareSync(oldPassword, req.session.currentUser.password) === false) {
				res.status(401).json({ code: 401, message: 'Wrong password' });
				return;
			}

			const salt = bcrypt.genSaltSync(bcryptSalt);
			const hashPass = bcrypt.hashSync(newPassword, salt);

			User.findByIdAndUpdate(req.session.currentUser._id, { username, password: hashPass }, { new: true })
				.then(user => {
					req.session.currentUser = user;
					return res.json(user), 200;
				})
				.catch(err =>
					res.status(500).json({
						code: 500,
						message: `Error updating profile information for user with id ${req.session.currentUser._id}`,
						err,
					})
				);
		})
		.catch(err => res.status(500).json({ code: 500, message: 'DDBB error while fetching user', err }));
});

router.put('/user-portfolio', isLoggedIn, (req, res) => {
	const { name, last_name, country, city, about, email, tel, tags, experience } = req.body;

	if (!name || name.match(/^\s*$/)) res.status(400).json({ code: 400, message: 'A name is mandatory' });

	if (!last_name || last_name.match(/^\s*$/)) res.status(400).json({ code: 400, message: 'A last name is mandatory' });

	if (req.session.currentUser.role != 'ARTIST')
		res.status(401).json({ code: 401, message: 'You need to log in as artist to create a job offer' });

	const { _id } = req.session.currentUser;

	User.findByIdAndUpdate(
		_id,
		{ portfolio: { name, last_name, country, city, about, email, tel, tags, experience } },
		{ new: true }
	)
		.then(user => {
			req.session.currentUser = user;
			return res.json(user), 200;
		})
		.catch(err => res.status(500).json({ code: 500, message: `Error updating the portfolio for user with id ${_id}`, err }));
});

router.get('/:user_id', (req, res) => {
	User.findById(req.params.user_id)
		.then(user => res.json(user), 200)
		.catch(err => res.status(500).json({ code: 500, message: `Error fetching user for id ${req.params.user_id}`, err }));
});

module.exports = router;
