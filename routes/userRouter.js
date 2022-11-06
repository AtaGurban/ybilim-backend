const Router = require('express')
const UserControllers = require('../controllers/UserControllers')
const router = new Router()
const authMiddleware = require('../middleware/authMiddleware')



router.get('/auth', authMiddleware, UserControllers.check)
router.post('/registration',  UserControllers.registration)
router.post('/login',  UserControllers.login)
router.get('/my-courses', authMiddleware,  UserControllers.myCourse)
// router.post('/upload', StreamControllers.add) 
// router.get('/list', StreamControllers.list) 
// router.delete('/remove', StreamControllers.remove) 




module.exports = router