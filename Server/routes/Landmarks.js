const express =require('express')
const router=express.Router();
const {Landmarks}=require('../controllers/Landmarks');
router.route('/').post(Landmarks)
module.exports=router;
