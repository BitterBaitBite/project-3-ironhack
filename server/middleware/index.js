module.exports = {
	isLoggedIn: (req, res, next) => {
		if (!req.session.currentUser) res.status(401).json({ code: 401, message: 'That action requires you to be logged' });
		else next();
	},

	isLoggedOut: (req, res, next) => {
		if (req.session.currentUser) res.status(401).json({ code: 401, message: 'That action requires you to be logged out' });
		else next();
	},

	checkRole:
		(...roles) =>
		(req, res, next) => {
			if (roles.includes(req.session.currentUser.role)) next();
			else
				res.status(401).json({
					code: 401,
					message: `You need to log in as ${roles} for that action`,
				});
		},
};
