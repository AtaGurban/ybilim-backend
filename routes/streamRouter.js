const Router = require('express')
const StreamControllers = require('../controllers/StreamControllers')
const router = new Router()



router.get('/', StreamControllers.stream)




module.exports = router