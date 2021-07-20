const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');
const bcryptSalt = 10;

const User = require('./../models/User.model');

router.post('/signup', (req, res) => {
	const { username, password, role } = req.body;

	if (req.session.currentUser) res.status(401).json({ code: 401, message: 'You are already logged' });

	if (username.length <= 0 || username.match(/^\s*$/)) {
		res.status(400).json({ code: 400, message: 'Username cannot be empty' });
	}

	if (password.length <= 0 || password.match(/^\s*$/)) {
		res.status(400).json({ code: 400, message: 'Password cannot be empty' });
	}

	User.findOne({ username })
		.then(user => {
			if (user) {
				res.status(400).json({ code: 400, message: 'Username already exists' });
				return;
			}

			if (!['ARTIST', 'RECRUITER'].includes(role)) {
				res.status(400).json({ code: 400, message: 'Role is not valid' });
				return;
			}

			const salt = bcrypt.genSaltSync(bcryptSalt);
			const hashPass = bcrypt.hashSync(password, salt);

			User.create({ username, password: hashPass, role })
				.then(user => {
					req.session.currentUser = user;
					res.json({ code: 200, message: 'User created' });
				})
				.catch(err => res.status(500).json({ code: 500, message: 'DB error while creating user', err }));
		})
		.catch(err => res.status(500).json({ code: 500, message: 'DB error while fetching user', err }));
});

router.post('/login', (req, res) => {
	const { username, password } = req.body;

	if (req.session.currentUser) res.status(401).json({ code: 401, message: 'You are already logged' });

	if (username.length <= 0 || username.match(/^\s*$/)) {
		res.status(400).json({ code: 400, message: 'Username cannot be empty' });
	}

	if (password.length <= 0 || password.match(/^\s*$/)) {
		res.status(400).json({ code: 400, message: 'Password cannot be empty' });
	}

	User.findOne({ username })
		.then(user => {
			if (!user) {
				res.status(401).json({ code: 401, message: 'Username not found' });
				return;
			}

			if (bcrypt.compareSync(password, user.password) === false) {
				res.status(401).json({ code: 401, message: 'Wrong password' });
				return;
			}

			req.session.currentUser = user;
			res.json(req.session.currentUser);
		})
		.catch(err => res.status(500).json({ code: 500, message: 'DDBB error while fetching user', err }));
});

router.get('/logout', (req, res) => {
	req.session.destroy(
		err =>
			(!err && res.json({ message: 'Logout successful' })) ||
			res.status(500).json({ code: 500, message: 'Error on destroying session', err })
	);
});

router.post('/isloggedin', (req, res) => {
	req.session.currentUser
		? res.json(req.session.currentUser)
		: res.status(401).json({ code: 401, message: 'You need to log in' });
});

module.exports = router;
