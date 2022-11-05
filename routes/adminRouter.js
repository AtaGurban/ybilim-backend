const Router = require('express')
const AdminControllers = require('../controllers/AdminControllers')
const router = new Router()
const authMiddleware = require('../middleware/authMiddleware')



router.post('/create-course',authMiddleware, AdminControllers.createCourse)
router.post('/create-video',authMiddleware, AdminControllers.createVideo)
router.get('/getvideo', AdminControllers.getAllVideo)
router.get('/get-all-course', AdminControllers.getAll)
router.get('/get-users', AdminControllers.getAllUsers)
router.delete('/remove-course', AdminControllers.deleteCourse)
router.delete('/remove-video', AdminControllers.deleteVideo)





module.exports = router