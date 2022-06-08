import User from "../models/userModel";
import Token from "../models/tokenModel";
import Address from "../models/addressModel";
import item from "../models/itemModel";
import Store from "../models/storeModel";
import Category from "../models/categoryModel";


import { Request, Response } from "express";

import { Op } from "sequelize";

export const getStores = async (req: any, res: Response) => {
    try {
        
        const stores = await Store.findAll({include: Category})
        return res.status(200).json({message: "Stores fetched Successfully!", data: stores})

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error || 'Something went wrong!', status: 0 });
    }
}

export const getSingleStore = async (req: any, res: Response) => {
    const storeId = req.params.storeId;

    try {

        const categories = await Category.findAll({include: item})
        const store = await Store.findByPk(storeId)

        return res.status(200).json({message: "Store Fetched Successfully!", store: store, data: categories})
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error || 'Something went wrong!', status: 0 });
    }
}

export const getItem = async (req:any, res:Response) => {
    const itemId = req.params.itemId;

    try {
        
        const data = await item.findOne({ where: { id: itemId } });
        return res.status(200).json({message: "Item fetched successfully!", data: data})

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error || 'Something went wrong!', status: 0 });
    }
}

export const search = async (req: any, res: Response) => {
    const term = req.query.term;
    const storeId = req.query.storeId;

    try {

        if(storeId){
            const categories = await Category.findAll({ include: item ,where: {title: { [Op.like]: '%'+ term + '%' }, storeId:storeId}});
            
            return res.status(200).json({message: 'Fetched results Successfully!', 
                                        totalResult: categories.length,
                                        categories: categories,
                                        status: 1});
        } else {

                const categories = await Category.findAll({ include: [Store, item] ,where: {title: { [Op.like]: '%'+ term + '%' }}});
            
                const items = await item.findAll({ include: Category , where: {title: { [Op.like]: '%'+ term + '%' }}});
            
                const stores = await Store.findAll({ include: Category ,where: {name: { [Op.like]: '%'+ term + '%' }}});
            
                const total = categories.length + items.length + stores.length;
            
                return res.status(200).json({message: 'Fetched results Successfully!', 
                                            totalResult: total,
                                            categories: categories,
                                            stores: stores,
                                            items: items,
                                            status: 1})

        }
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error || 'Something went wrong!', status: 0 });
    }
}