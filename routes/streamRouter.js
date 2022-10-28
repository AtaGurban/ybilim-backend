const Router = require('express')
const StreamControllers = require('../controllers/StreamControllers')
const router = new Router()



router.get('/', StreamControllers.stream)
router.post('/add-video', StreamControllers.add)




module.exports = router