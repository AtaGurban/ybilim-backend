const Router = require('express')
const router = new Router()
const streamRouter = require('./streamRouter')
const userRouter = require('./userRouter.js')



   
router.use('/video', streamRouter) 
router.use('/user', userRouter) 




module.exports = router 