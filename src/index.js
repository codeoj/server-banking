const express = require('express');
const { v4: uuid } = require('uuid');

const app = express();

app.use(express.json());

const customers = [];

app.post('/singup', (request, response) => {
   const { cpf, name } = request.body
   const id = uuid();
   
   customers.push({
      cpf,
      name,
      id,
      statement: []
   })

   return response.status(201).send()
});

app.listen(3000);