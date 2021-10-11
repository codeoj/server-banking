const express = require('express');
const { v4: uuid } = require('uuid');

const app = express();

app.use(express.json());

const customers = [];

app.post('/singup', (request, response) => {
   const { cpf, name } = request.body
   //const id = uuid();
   const alreadyExists = customers.some((customer) => customer.cpf === cpf);
   
   if(alreadyExists) {
      return response.status(400).json({ error: "Customer already exists!" });
   }

   customers.push({
      cpf,
      name,
      id: uuid(),
      statement: []
   })

   return response.status(201).send()
});

app.listen(3000);