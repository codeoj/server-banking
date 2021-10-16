const express = require('express');
const { v4: uuid } = require('uuid');

const app = express();
app.use(express.json());

const customers = [];

function accountAlreadyExists(request, response, next) {
   const { cpf } = request.headers;

   const findCustomerStatement = customers.find((customer) => customer.cpf === cpf);

   if(!findCustomerStatement) {
      return response.status(400).json({ error: "Customer not found" });
   }

   request.customer = findCustomerStatement;

   return next();
}

app.post('/signup', (request, response) => {
   const { name, cpf } = request.body;

   const alreadyExists = customers.some((customer) => customer.cpf === cpf);

   if(alreadyExists) {
      return response.status(400).json({ error: "Customer already exists" })
   }
   
   customers.push({
      cpf,
      name,
      id: uuid(),
      statement: []
   });

   response.status(201).send();
});

app.post('/deposit', accountAlreadyExists, (request, response) => {
   const { amount, description } = request.body;

   const depositOperation = {
      description,
      amount,
      createdAt: new Date(),
      type: 'deposit'
   }

   const { customer } = request;

   customer.statement.push(depositOperation);

   response.status(201).send();
});

app.get('/statement', accountAlreadyExists, (request, response) => {
   const { customer } = request;

   response.json(customer.statement);
});

app.listen(3333);