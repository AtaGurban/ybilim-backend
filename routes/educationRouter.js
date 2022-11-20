const Router = require('express')
const EducationControllers = require('../controllers/EducationControllers')
const router = new Router()



router.get('/city', EducationControllers.getAllCity)
router.get('/collage', EducationControllers.getAllCollage)
router.post('/city', EducationControllers.createCity)
router.post('/collage', EducationControllers.createCollage)
router.put('/city', EducationControllers.updateCity)
router.put('/collage', EducationControllers.updateCollage)
router.delete('/city', EducationControllers.removeCity) 
router.delete('/collage', EducationControllers.removeCollage)






module.exports = router