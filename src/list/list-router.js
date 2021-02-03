/* eslint-disable eqeqeq */
/* eslint-disable indent */
'use strict';
const express = require('express');
const {v4:uuid} = require('uuid');

const logger = require('../logger');
const listRouter = express.Router();
const bodyParser = express.json();
const {cards,lists} = require('../store');

listRouter
    .route('/list')
    .get((req,res)=>{
        res.json(lists);
    })
    .post(bodyParser,(req,res)=>{
        const {header,cardIds} = req.body;
        if(!header){
            logger.error('Header is required');
            return res.status(400).send('Invalid Data');
        }
        if (cardIds.length > 0) {
            let valid = true;
            cardIds.forEach(cid => {
            const card = cards.find(c => c.id == cid);
            if (!card) {
                logger.error(`Card with id ${cid} not found in cards array.`);
                valid = false;
            }
            });
        
            if (!valid) {
            return res
                .status(400)
                .send('Invalid data');
            }
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

module.exports = listRouter;