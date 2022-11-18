const Router = require('express')
const EducationControllers = require('../controllers/EducationControllers')
const router = new Router()



router.get('/city', EducationControllers.getAllCity)
router.post('/city', EducationControllers.createCity)
router.delete('/city', EducationControllers.removeCity)






module.exports = router