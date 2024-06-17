require('dotenv').config()
require('express-async-errors')

// express
const express = require('express')
const app = express()

// security packages
const rateLimiter = require('express-rate-limit')
const helmet = require('helmet')
const xss = require('xss-clean')
const cors = require('cors')
const mongoSanitize = require('express-mongo-sanitize')

// other packages
// const morgan = require('morgan')
const cookieParser = require('cookie-parser')

// db
const connectDB = require('./db/connect')

// routers
const authRouter = require('./routes/authRoutes')
const usersRouter = require('./routes/userRoutes')
const productsRouter = require('./routes/productRoutes')
const reviewRouter = require('./routes/reviewRoutes')
const orderRouter = require('./routes/orderRoutes')

// middleware
const notFoundMiddleware = require('./middleware/not-found')
const errorHandlerMiddleware = require('./middleware/error-handler')
const { authenticateUser } = require('./middleware/authentication')

app.set('trust proxy', 1)
app.use(
	rateLimiter({
		windowMs: 15 * 60 * 1000,
		max: 60,
	}),
)
app.use(helmet())
app.use(cors())
app.use(xss())
app.use(mongoSanitize())

app.use(express.json())
app.use(cookieParser(process.env.JWT_SECRET))

app.use(express.static('./public'))

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/users', authenticateUser, usersRouter)
app.use('/api/v1/products', productsRouter)
app.use('/api/v1/reviews', reviewRouter)
app.use('/api/v1/orders', authenticateUser, orderRouter)

app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)

const port = process.env.PORT
const start = async () => {
	try {
		await connectDB(process.env.MONGO_URL)
		app.listen(port, () =>
			console.log(`✔️  Server is listening on port ${port}...`),
		)
	} catch (error) {
		console.log('❌ Error occured while starting server', error)
	}
}

start()
