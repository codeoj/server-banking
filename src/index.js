const express = require('express');
const { v4: uuid } = require('uuid');

const app = express();
app.use(express.json());

const customers = [];

function getBalance(statement) {
   const balance = statement.reduce((acc, operator) => {
      if(operator.type === 'deposit') {
         return acc + operator.amount
      } else if(operator.type === 'debit') {
         return acc - operator.amount
      }
   }, 0)

   return balance;
}

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

app.put('/signup', accountAlreadyExists, (request, response) => {
   const { name } = request.body;
   const { customer } = request;

   customer.name = name;

   return response.status(201).send();
});

app.delete('/signup', accountAlreadyExists, (request, response) => {
   const { customer } = request;

   customers.splice(customer, 1);

   return response.status(201).json(customers);
});

app.get('/signup', accountAlreadyExists, (request, response) => {
   const { customer } = request;

   return response.json(customer);
});

app.post('/deposit', accountAlreadyExists, (request, response) => {
   const { amount, description } = request.body;

   const depositOperation = {
      description,
      amount,
      created_at: new Date(),
      type: 'deposit'
   }

   const { customer } = request;

   customer.statement.push(depositOperation);

   response.status(201).send();
});

app.post('/withdraw', accountAlreadyExists, (request, response) => {
   const { amount } = request.body;
   const { customer } = request;

   const balance = getBalance(customer.statement);

   console.log(balance);

   if (balance < amount) {
      return response.status(400).json({ error: "Insufficient funds!" })
   }

   const withdrawOperation = {
      amount,
      created_at: new Date(),
      type: 'debit'
   }

   customer.statement.push(withdrawOperation)

   response.status(201).send();
})

app.get('/statement', accountAlreadyExists, (request, response) => {
   const { customer } = request;

   response.json(customer.statement);
});

app.get('/statement/date', accountAlreadyExists, (request, response) => {
   const { date } = request.query;
   const { customer } = request;

   const statement = customer.statement.filter((statement) => 
      statement.created_at.toDateString() === new Date(date).toDateString()
   );

   return response.json(statement)
});

app.get('/balance', accountAlreadyExists, (request, response) => {
   const { customer } = request;

   const balance = getBalance(customer.statement);

   return response.json(balance);
})

app.listen(3333);