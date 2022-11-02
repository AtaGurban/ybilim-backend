const ApiError = require("../error/ApiError")
const bcrypt = require('bcrypt')
const {User} = require('../models/models')
const jwt = require('jsonwebtoken')

const generateJwt = (id, email, name, role, phone)=>{
 return jwt.sign({id, email:email, name:name, phone:phone, role:role}, process.env.SECRET_KEY, {expiresIn: '24h'})
}

class UserController {
    async registration(req, res, next){
   
        const {email, name, password, phone,  role} = req.body;
       
        if (!email || !password || !name || !phone){
            return next(ApiError.badRequest('Maglumatlarynyz nadogry'))
        }
        const candidate = await User.findOne({where:{email}})
        if (candidate){ 
            return next(ApiError.badRequest('Bu email on hasaba alyndy'))
        }
        const hashPassword = await bcrypt.hash(password, 5)
        const user = await User.create({email, first_name:name, role, phone, password: hashPassword})
        const token = generateJwt(user.id, user.email, user.name, user.role, user.phone)
        return res.json({token})
    }
    async login(req, res, next){
        const {email, password} = req.body;
        const user = await User.findOne({where:{email}})
        if (!user){
            return next(ApiError.internal('Munun yaly ulanyjy yok'))
        }
        let comparePassword = bcrypt.compareSync(password, user.password)
        if(!comparePassword){
            return next(ApiError.internal('Acarsoz yalnys'))
        }
        const token = generateJwt (user.id, user.email, user.name, user.role)
        return res.json({token})
    }
    async check(req, res, next){
        const token = generateJwt(req.user.id, req.user.email, req.user.name, req.user.role)
        return res.json({token}) 
    }
}

module.exports = new UserController()