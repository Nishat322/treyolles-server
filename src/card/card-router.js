/* eslint-disable eqeqeq */
/* eslint-disable indent */
'use strict';
const express = require('express');
const {v4:uuid} = require('uuid');

const logger = require('../logger');
const cardRouter = express.Router();
const bodyParser = express.json();
const {cards,lists} = require('../store');

cardRouter
    .route('/card')
    .get((req,res) => {
        res.json(cards);
    })
    .post(bodyParser,(req,res)=>{
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

cardRouter
    .route('/card/:id')
    .get((req,res)=>{
        const {id} = req.params;
        const card = cards.find(c=> c.id == id);

        if(!card){
            logger.error(`Card with id ${id} not found`);
            return res.status(404).send('Card Not Found');
        }
        res.json(card);
    })
    .delete((req,res)=>{
        const {id} = req.params;
        const cardIndex =cards.findIndex( c=> c.id == id);
    
        if(cardIndex === -1){
            logger.error(`Card with id ${id} not found`);
            return res.status(404).send('Not Found');
        }
    
        lists.forEach(list =>{
            const cardIds = list.cardIds.filter(cid => cid !== id);
            list.cardIds = cardIds;
        });
        cards.splice(cardIndex, 1);
    
        logger.info(`Card with id ${id} deleted`);
        res.status(204).end();
    });

module.exports = cardRouter;