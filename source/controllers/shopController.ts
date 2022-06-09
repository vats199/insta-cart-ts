import User from "../models/userModel";
import Token from "../models/tokenModel";
import Address from "../models/addressModel";
import item from "../models/itemModel";
import Store from "../models/storeModel";
import Category from "../models/categoryModel";
import { globals, globalResponse } from '../util/const'
import { successResponse, errorResponse} from "../util/response";
import { Request, Response } from "express";

import { Op } from "sequelize";

export const getStores = async (req: any, res: Response) => {
    try {
        
        const stores = await Store.findAll({include: Category})

        return successResponse(res, globals.StatusOK, globalResponse.StoresFetched, stores)

    } catch (error) {
        console.log(error);
        return errorResponse(res, globals.StatusInternalServerError, globalResponse.ServerError, null);
    }
}

export const getSingleStore = async (req: any, res: Response) => {
    const storeId = req.params.storeId;

    try {

        const categories = await Category.findAll({include: item})
        const store = await Store.findByPk(storeId)

        const data: any = {}
        data.store = store
        data.categories = categories

        return successResponse(res, globals.StatusOK, globalResponse.SingleStoreFetched, data)
        
    } catch (error) {
        console.log(error);
        return errorResponse(res, globals.StatusInternalServerError, globalResponse.ServerError, null);
    }
}

export const getItem = async (req:any, res:Response) => {
    const itemId = req.params.itemId;

    try {
        
        const data = await item.findOne({ where: { id: itemId } });

        return successResponse(res, globals.StatusOK, globalResponse.ItemsFetched, data)

    } catch (error) {
        console.log(error);
        return errorResponse(res, globals.StatusInternalServerError, globalResponse.ServerError, null);
    }
}

export const search = async (req: any, res: Response) => {
    const term = req.query.term;
    const storeId = req.query.storeId;

    try {

        if(storeId){
            const categories = await Category.findAll({ include: item ,where: {title: { [Op.like]: '%'+ term + '%' }, storeId:storeId}});

            const data: any = {}
            data.totalResult = categories.length
            data.categories = categories

            return successResponse(res, globals.StatusOK, globalResponse.SearchResponse, data)
            
        } else {

                const categories = await Category.findAll({ include: [Store, item] ,where: {title: { [Op.like]: '%'+ term + '%' }}});
            
                const items = await item.findAll({ include: Category , where: {title: { [Op.like]: '%'+ term + '%' }}});
            
                const stores = await Store.findAll({ include: Category ,where: {name: { [Op.like]: '%'+ term + '%' }}});

                const data: any = {}
                data.totalResults = categories.length + items.length + stores.length;
                data.categories = categories
                data.stores = stores
                data.items = items

                return successResponse(res, globals.StatusOK, globalResponse.SearchResponse, data)

        }
        
    } catch (error) {
        console.log(error);
        return errorResponse(res, globals.StatusInternalServerError, globalResponse.ServerError, null);
    }
}