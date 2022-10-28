const Router = require('express')
const router = new Router()
const streamRouter = require('./streamRouter')



   
router.use('/video', streamRouter)




module.exports = router 