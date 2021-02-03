/* eslint-disable eqeqeq */
/* eslint-disable indent */
'use strict';
require('dotenv').config();
const express = require('express');
const winston = require('winston');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const { transports } = require('winston');
const {v4:uuid} = require('uuid');

const app = express();

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [new winston.transports.File({filename: 'info.log'})]
});

if (NODE_ENV !== 'production'){
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
} 
app.use(cors());
app.use(helmet());
app.use(express.json());


app.use(function validateBearerToken(req,res,next) {
    const apiToken = process.env.API_TOKEN;
    const authToken = req.get('Authorization');

    if(!authToken || authToken.split(' ')[1] !== apiToken){
        logger.error(`Unauthorized request to path: ${req.path}`);
        return res.status(401).json({error: 'Unauthorized Request'});
    }
    next();
});

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

const cards = [{
    id: 1,
    title: 'Task One',
    content: 'This is card one'
}];
const lists = [{
    id: 1,
    header: 'List One',
    cardIds: [1]
}];

app.get('/cards',(req,res)=>{
    res.json(cards);
});

app.get('/card/:id',(req,res)=>{
    const {id} = req.params;
    const card = cards.find(c=> c.id == id);

    if(!card){
        logger.error(`Card with id ${id} not found`);
        return res.status(404).send('Card Not Found');
    }
    res.json(card);
});

app.post('/card',(req,res)=>{
    const {title,content} =req.body;
    if(!title){
        logger.error('Title is required');
        return res.status(400).send('Invalid Data');
    }
    if(!content){
        logger.error('Content is required');
        return res.status(400).send('Invalid Data');
    }

    const id = uuid();

    const newCard={
        id,
        title,
        content
    };

    cards.push(newCard);

    logger.info(`Card with id ${id} created`);
    res
        .status(201)
        .location(`http://localhost:8000/card/${id}`)
        .json(newCard);

});

app.get('/lists',(req,res) => {
    res.json(lists);
});

app.get('/list/:id',(req,res)=>{
    const {id} = req.params;
    const list = lists.find(l => l.id == id);

    if(!list){
        logger.error(`List with id ${id} not found`);
        return res.status(404).send('List Not Found');
    }
    res.json(list);
});

app.post('/list',(req,res)=>{
    const {header,cardIds} = req.body;
    if(!header){
        logger.error('Header is required');
        return res.status(400).send('Invalid Data');
    }
    if(!cardIds){
        logger.error('CardId is required');
        return res.status(400).send('Invalid Data');
    }

    const id = uuid();

    const newList={
        id,
        header,
        cardIds
    };

    lists.push(newList);
    logger.info(`New List with id ${id} created`);
    res
        .status(201)
        .location(`http://localhost:8000/list/${id}`)
        .json(newList);
});

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});
    
module.exports = app;