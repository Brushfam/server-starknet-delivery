const express = require('express');
const router = express.Router();

const songsRoutesRouter = require('./SongsRoutes');
const isVerifiedRouter = require('./IsVerified')
const whitepayInvoiceRouter = require('./WhitepayInvoiceRoutes')
const usersRouter = require('./users/index')

router.use('/songs', songsRoutesRouter);
router.use('/is-verified', isVerifiedRouter)
router.use('/whitepay-invoice', whitepayInvoiceRouter)
router.use('/users', usersRouter)

module.exports = router;