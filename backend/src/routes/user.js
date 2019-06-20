const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')//p user um midware em uma rota especifica/particular
//basta eu passar o midware como segundo argumento xD
//n preciso do router.use express json pq ja o fiz no index.js
const router = new express.Router()


router.get('/users/me',auth,async(req,res) => {
    const user = { 
        name:req.user.name,
        _id: req.user._id,
        userType: req.user.userType
    }
    res.send({user,token: req.token})//req.user foi passado pela funcao auth qd o user foi autenticado xD
})
router.delete('/users/me', auth, async (req,res)=>{
        
    try{
        await req.user.remove()//remove o usuario autenticado, msm efeito das linhas acima
        res.send(req.user)//retorna o profile deletado
    }catch(e){
        res.status(500).send(e)
    }
})
router.patch('/users/me', auth, async (req,res) => {
    
    const allowedUpdates = [ "name","password","userType"]
    const updates = Object.keys(req.body)
    const filtro = updates.every(field => allowedUpdates.includes(field))
     
    if(!filtro)
        res.status(404).send("invalid updates...")
    
    try{ 
       // const user = await User.findById(_id)//findByIdAndUpdate(_id,req.body,{new: true})//retorna o user atualizado, em vez do antigo
        updates.forEach(update => req.user[update] = req.body[update])
        await req.user.save()//hook pro midware será executado imediatamente antes de chamar .save()                    
        const msg = "usuário atualizado: " + req.user
        res.status(202).send(msg)//como ja salvou. mostra o usuario atual(modificado/atualizado)
    }catch(e){
        res.status(500).send(e)
    }
})



router.post('/users/signin', async (req,res) => {
    //achar user pelas credenciais
    //retornará um token de autenticacao
    const new_user = new User(req.body)

    try{
        await new_user.save()
     //   if(new_user){//n precisa pois a operacao assima retorna uma promise
            //const user = await User.findByCredentials(req.body.email, req.body.password)//f q eu irei definir
        const token = await new_user.generateAuthToken()//criarei esse metodo a lvl de instancia
        res.status(202).send({new_user,token})
       
    }catch(e){
        res.status(404).send("" + e )//n sei pq, se passo só send(e), ele n printa nada
    }
})
//desloga um login parituclar: pc/cel etc...
router.post('/users/logoutParticular', auth,async (req,res)=> {
    try{                                                //token.token pq é um array d objeto
        req.user.tokens =[ req.user.tokens.filter(token => token.token !== req.token)]
        await req.user.save()
        res.status(202).send()
    }catch(e){
        res.status(404).send()
    } 
})
//deslogad o user de tds as paradas: fb, cel etc
router.post('/users/logout', auth,async (req,res)=> {
    try{ 
      //  console.log("ENTRO ROTA LOGOUT")                                               //token.token pq é um array d objeto
        req.user.tokens = []
        await req.user.save()
        const msg = "user " + req.user.name + " deslogado com sucesso. "
        res.status(202).send(msg)
    }catch(e){
        res.status(404).send()
    } 
})
router.post('/users/login', async (req,res) => {
    //achar user pelas credenciais
    //retornará um token de autenticacao
    try{
        const user = await User.findByCredentials(req.body.user, req.body.password)//f q eu irei definir
        const token = await user.generateAuthToken()//criarei esse metodo a lvl de instancia
        //console.log("ACHOA")
        res.status(202).send({user,token})
    }catch(e){
       // console.log("N ACHOU")
        res.status(404).send(e)//n sei pq, se passo só send(e), ele n printa nada
    }
})
module.exports = router