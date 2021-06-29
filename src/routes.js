const express = require('express')
const router = express.Router()
const pool = require('./connection')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

//-------------ROUTES-------------------
router.get('/', function (req, res, next) {
    res.send('Auth API.')
});
//----------------API---------------------------

router.get('/api/users', async (req, res, next) => {
    let data = await pool.query('Select * from "Usuarios"')
    res.json(data.rows)
})

router.get('/api/user', async (req, res, next) => {
    try {
        const cookie = req.cookies['jwt']
    
        const claims = jwt.verify(cookie, 'secret')
        if (!claims) {
            res.status(401).send({
                message: 'Unauthorized'
            })
        }
        const user = await pool.query(`select * from "Usuarios" where id = ${claims.id}`)
        const {password, ...new_user} = await user.rows[0]
        res.send(new_user)
    } catch (error) {
        res.status(401).send({
            message: 'Unauthorized'
        })
    }
})

router.get('/api/logout', async (req, res, next) => {
    res.cookie('jwt','',{
        maxAge:0
    })
    res.status(200).send({
        message: 'Logged Out Successfully'
    })
})

router.post('/api/signup', async (req, res, next) => {
    let user_data = req.body
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(user_data.password, salt)

    let data = await pool.query(`insert into "Usuarios"(name,email,password)
                                values('${user_data.name}','${user_data.email}','${hashedPassword}')`)
    res.status(200).send({
        message: 'Registered Successfully'
    })
})

router.post('/api/login', async (req, res, next) => {
    let user_data = req.body
    let data = await pool.query(`select * from "Usuarios" where email = '${user_data.email}'`)
    if (data.rowCount == 0) {
        res.status(404).send({
            message: 'User not found'
        })
    }
    if (data.rowCount == 1) {
        if (!await bcrypt.compare(user_data.password, data.rows[0].password)) {
            res.status(400).send({
                message: 'Invalid credentials'
            })
        }else{//VALID USER
            let token = jwt.sign({id:data.rows[0].id}, "secret")
            const {password, ...new_user} = await data.rows[0]
            res.cookie('jwt', token, {
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000 // 1 day
            })
            res.status(200).send({
                message: 'Logged In Successfully'
                // user: [new_user],
                // token: token
            })
        }
    }
})

module.exports = router