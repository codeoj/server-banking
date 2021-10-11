const express = require('express');
const { v4: uuid } = require('uuid');

const app = express();

app.use(express.json());

const customers = [];

function verifyExistsAccount(request, response, next) {
   const { cpf } = request.params;

   const customer = customers.find((customer) => customer.cpf === cpf);

   if(!customer) {
      return response.status(400).json({ error: "Customer not found" });
   }

   request.customer = customer;

   return next();
}

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

//app.use(verifyExistsAccount);

app.get('/statement/:cpf', verifyExistsAccount, (request, response) => {
   const { customer } = request;
   return response.json(customer.statement);
});

app.listen(3000);