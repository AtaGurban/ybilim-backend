const Router = require('express')
const router = new Router()
const streamRouter = require('./streamRouter')
const userRouter = require('./userRouter.js')
const adminRouter = require('./adminRouter')



   
router.use('/video', streamRouter) 
router.use('/user', userRouter) 
router.use('/admin', adminRouter) 




module.exports = router 