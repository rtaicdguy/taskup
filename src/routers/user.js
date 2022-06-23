const express = require('express')
const User = require('../models/user')
const auth=require('../middleware/auth')
const router = new express.Router()
const multer=require('multer')
const {sendWelcomeEmail,sendCancellationEmail}=require('../emails/account')

router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
       // await sendWelcomeEmail(user.email,user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/users/logout',auth,async(req,res)=>{
    try{
       req.user.tokens=req.user.tokens.filter((token)=>{
        return req.token!==token.token
       }) 
       await req.user.save()
       res.send()

    }catch(e){
      req.status(500).send()
    }
})

router.post('/users/logoutall',auth,async(req,res)=>{
    try{
       req.user.tokens=[]
       await req.user.save()
       res.send()

    }catch(e){
      req.status(500).send()
    }
})

router.get('/users/me', auth,async (req, res) => {
    res.send(req.user)
})

router.patch('/users/me',auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    } catch (e) {
        res.status(400).sen
        
        d(e)
    }
})

router.delete('/users/me', auth,async (req, res) => {
    try {
        //await sendCancellationEmail(req.user.email,req.user.name)
        await req.user.remove()
        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})

const upload=multer({
   // dest : 'avatars',
    limits : {
        fileSize: 1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/))
        {
            return cb(new Error("Please upload Image files less than 1MB"))
        }
        cb(undefined,true)
    }
})

router.post('/users/me/avatar',auth,upload.single('avatar'),async (req,res)=>{
    req.user.avatar=req.file.buffer
    await req.user.save()
     res.send()
},(error,req,res,next)=>{
    res.status(400).send({error: error.message})
})

router.delete('/users/me/avatar',auth,upload.single('avatar'),async (req,res)=>{
    req.user.avatar=undefined
    await req.user.save()
     res.send()
},(error,req,res,next)=>{
    res.status(400).send({error: error.message})
})

router.get('/users/me/avatar',auth,async(req,res)=>{
    try{
        if(!req.user.avatar)
        {
            throw new Error(" No avatar detected")
        }
        res.set('content-Type','image/jpg')
        res.send(req.user.avatar)
    }
    catch(e)
    {
        res.status(400).send({e})
    }
})

module.exports = router