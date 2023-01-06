const express = require('express');
const cors = require ('cors');
require('dotenv').config();
const morgan = require('morgan');
const PORT = process.env.PORT || 9000;
const path = require('path');
const multer = require('multer');
require('./database/conexion')
const app = express();
const personaController = require('./controllers/personasControllers')
const Persona = require ('./models/personaModel');
const bcrypt = require ('bcrypt');



//middelwars
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(morgan('common'));

//configuramos Multer
const storage = multer.diskStorage({
    destination: function(req, file, callback) {
        console.log(file);
        callback(null, 'uploads')    
    },
    filename: function(req, file, callback){
        callback(null, `${file.originalname}`)
    }
});

//pasamos la configuracion a Multer
const uploads = multer({storage: storage })


// aca arranca la cosa
app.get('/datos', async (req, res)=> {
    res.json({
        personas: await personaController.findAll()
    });
});

app.post('/crear', async (req, res)=> {
    const {nombre, apellido, dni } =req.body;
    console.log( `${nombre} ${apellido} - ${dni}`);

    //buscamos a la persona por su (podria ser email , aca lo vamos a hacer por su nombre)
    let usuario = await Persona.findOne({nombre})
    console.log(`1.=${usuario}`);

    if(usuario){
          return  res.send('El usuario ya existe')
    }else{
            //genelarmos la sal para encriptar
            const salt = bcrypt.genSaltSync();
            console.log(salt);
            const persona = new Persona(req.body)
            //encriptamos el (lo q sea, password)
            persona.dni = bcrypt.hashSync(dni, salt);
            console.log(persona.dni);
            console.log(persona);

            await personaController.create(persona)
            res.send('Persona Creada')
          }
         
}) 


app.delete('/delete', async (req, res)=> {
    const {nombre} = req.body;
    console.log( `${nombre}`);

    //buscamos a la persona por su (podria ser email , aca lo vamos a hacer por su nombre)
    let usuario = await Persona.findOne({nombre})
    console.log(`usuario a borrar.${usuario}  `);
   

    if(usuario){
        
        console.log(`aca iria el id ${usuario._id}`)
        let id = usuario._id
           await personaController.delete(id)
          // await Persona.deleteOne
           res.send('El usuario fue borrado')
    }else{ /* 
           return  res.send('El usuario no existe')
          } */

      res.send('Ese usuario no existe')   
    }  
}) 

app.put('/put', async (req, res)=> {
    const {nombre, apellido, dni } = req.body;
    console.log( `${nombre} ${apellido} - ${dni}`);

    //buscamos a la persona por su (podria ser email , aca lo vamos a hacer por su nombre)
    let usuario = await Persona.findOne({nombre})
    console.log(`usuario a actualizar.${usuario}  `);
   

    if(usuario){
        const persona = Persona(req.body)
        //const ObjectId = mongodb.ObjectId
        console.log(`aca iria el id ${usuario._id} y el ${persona.apellido}`)
        let id = usuario._id
        await personaController.update(id)
         //personaController.update(id=persona.ObjectId),{{set$: {nombre, apellido, dni}}}  //({_id: ObjectId(id)}, {nombre, apellido, dni})              
           //({_id: ObjectId(id)}, {nombre, apellido, dni})
         
           //replaceOne({_id: ObjectId(id)}, {nombre, apellido, dni} )
           res.send(persona)
           
         console.log(persona);
          // console.log(`nuevo id "${persona._id}" nuevo nombre "${persona.nombre}" nuevo apellido "${persona.apellido}"`)
  
          // res.send('El usuario fue editado')
           
    }else{ /* 
           return  res.send('El usuario no existe')
          } */

      res.send('El usuario no existe')   
    }  
}) 


app.get('/subir', (req, res) =>{
    res.sendFile('index')
})
app.post('/subir', uploads.single('miArchivo'), (req, res, next) =>{
    const file = req.file;
    if(!file){
        const error = new Error('Error subiendo el archivo')
        error.httpStatusCode=404
        return next(error)
    }
    res.send(`Archivo <b>${file.originalname}</b> subido correctamente`)
})

app.listen(PORT, ()=>{
    console.log(`MERN trabajando en el puerto ${PORT}`);
})