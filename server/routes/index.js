// module.exports = app => {
// 	app.use('/api', require('./auth.routes.js'));
// 	// app.use('/api/users', require('./user.routes.js'));
// 	// app.use('/api/portfolio', require('./portfolio.routes.js'));
// 	// app.use('/api/job-offers', require('./jobOffers.routes.js'));
// };

module.exports = app => {
	app.use('/api', require('./auth.routes.js'));
	app.use('/api/users', require('./user.routes.js'));
	app.use('/api/portfolio', require('./portfolio.routes.js'));
	app.use('/api/job-offers', require('./jobOffer.routes.js'));
	app.use('/api/upload', require('./upload.routes.js'));
};
