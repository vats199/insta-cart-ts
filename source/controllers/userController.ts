import User from "../models/userModel";
import Token from "../models/tokenModel";
import Address from "../models/addressModel";
import item from "../models/itemModel";
import order from "../models/orderModel";
import orderItem from "../models/orderItemModel";
import bcrypt from 'bcryptjs'
import { Request, Response } from "express";
import * as fs from 'fs'
import * as path from 'path'

import PDF from 'pdfkit'

import { Op } from "sequelize";
import { validationResult } from "express-validator/check";

export const getProfile = async (req: any, res: Response) => {
    const userId = req.user.id;

    try {

        const user = await User.findByPk(userId);

        if(!user){
            return res.status(400).json({message: "User not found!", status: 0})
        }

        const data = {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.country_code + user.phone_number
        }

        return res.status(200).json({message: "User Found!", data: data, status: 1})
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error || 'Something went wrong!', status: 0 });
    }
}

export const editName = async (req: any, res: Response) => {
    const userId = req.user.id;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;

    try {

        const user = await User.findByPk(userId);

        if(!user){
            return res.status(404).json({message: "User not found!", status: 0})
        }
        
        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;

        await user.save();
        
        const result = await User.findByPk(userId, { attributes: {exclude: ['password']} })

        return res.status(200).json({message: "Profile updated!",user: result, status: 1})

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error || 'Something went wrong!', status: 0 });
    }
}

export const editEmail = async (req: any, res: Response)=> {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        
      return res.status(400).json({message: errors.array()[0].msg, status: 0})
    }
    const userId = req.user.id;
    const email = req.body.email;
    const password = req.body.password;

    try {

        const test: any = await User.findByPk(userId)
        const test1: any = await User.findOne({where: {email: email}})

        if(test1){
            return res.status(400).json({ message: 'Entered email already exist!', status: 0 })
        }
        const passCheck = await bcrypt.compare(req.body.password, test.password)
        
        
        if(!passCheck){
            return res.status(400).json({ message: 'Invalid Password!', status: 0 })
        }

        test.email = email;

        await test.save();

        const resp = await User.findByPk(userId, {attributes: {exclude: ['password']}})

        return res.status(200).json({message: "E-mail id uploaded!", status: 1});
        
    } catch (error) {
        console.log(error);

        
    }
}

export const postAddress = async (req: any, res: Response) => {
    const payload = {
        addressInfo: req.body.address,
        address_type: req.body.address_type || 0,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        userId: req.user.id,
        is_active: 1
    }

    try {

        const address = await Address.create(payload);
        return res.status(200).json({message: 'Address added!', data: address, status: 1})
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error || 'Something went wrong!', status: 0 });
    }

}

export const getAddresses = async (req: any, res: Response) => {
    const userId = req.user.id;

    try {

        const addresses = await Address.findAll({where: {userId: userId}})
        return res.status(200).json({message: "Addresses fetched!", totalAddresses: addresses.length, data: addresses, status: 1})
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error || 'Something went wrong!', status: 0 });
    }
}

export const editAddress = async (req: any, res: Response) => {
    const userId = req.user.id;
    const addressId = req.params.addressId;

    try {

        const address = await Address.findOne({where: { userId: userId, id: addressId }})
        
        if(address){
            address.addressInfo = req.body.address || address.addressInfo
            address.icon = req.body.icon || address.icon;
            address.address_type = req.body.address_type || address.address_type;
            address.latitude = req.body.latitude || address.latitude;
            address.longitude = req.body.longitude || address.longitude;
            try {
                const result = await address.save();
                return res.status(200).json({message:"Address Updated!", data: result, status: 1});
            } catch (err) {
                console.log(err)
                return res.status(404).json({error:"Address Not Updated!", status: 0});
            }
        } else {
            return res.status(400).json({message: "No address found for given id!", status: 0})
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error || 'Something went wrong!', status: 0 });
    }
}

export const deleteAddress = async (req: any, res: Response) => {
    const addressId = req.body.addressId;
    const userId = req.user.id;

    try {

        await Address.destroy({where: { id:addressId, userId: userId }})
        return res.status(200).json({message: "Address Deleted!", status: 0})
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error || 'Something went wrong!', status: 0 });
    }
}

export const activateAddress = async (req: any, res: Response) => {
    const userId = req.user.id;
    const addressId = req.body.addressId;
    try {

        const address: any = await Address.findOne({where: { id: addressId, userId: userId }})
        
        if(address.is_active == true){
            return res.status(200).json({message: "Address is already active!", status: 0})
        }else{

            address.is_active = 1;

            const otherAddresses = await Address.findAll({where: { is_active: 1, userId}})
            if(otherAddresses.length !== 0){
                for(let i=0; i<otherAddresses.length; i++){
                otherAddresses[i].is_active = 0;
                await otherAddresses[i].save();
              }
            }
            const result = await address.save()
            return res.status(200).json({message: "Address Activated!", data: result, status: 1})
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error || 'Something went wrong!', status: 0 });
    }
}

export const postOrder = async (req: any, res: Response) => {

    const userId = req.user.id,
          items = req.body.items,
          order_type = req.body.order_type,
          delivery_time = req.body.delivery_time,
          amount = req.body.amount,
          discount_amount = req.body.discount_amount,
          addressId = req.body.addressId,
          country_code = req.body.country_code,
          phone_number = req.body.phone_number,
          instructions = req.body.instructions,
          is_gift = req.body.is_gift;
    const net_amount = amount - discount_amount;

    try {

        const ord = await order.create({
            userId: userId,
            order_type: order_type,
            delivery_time: delivery_time,
            country_code: country_code,
            phone_number: country_code + phone_number,
            instructions: instructions,
            is_gift: is_gift,
            addressId: addressId,
            amount: amount,
            discount_amount: discount_amount,
            net_amount: net_amount
        })

        for (let j = 0; j < items.length; j++) {
            if (items[j]) {
              await orderItem.create({
                itemId: items[j].id,
                orderId: ord.id,
                quantity: items[j].qty,
                itemTotal: (items[j].qty) * (items[j].price)
              });     
            }
          }
          const resp = await order.findByPk(ord.id, {include: {model: orderItem, include: [item]}})
          
          return res.status(200).json({ message: "Order has been Placed!", order: resp, status: 1 });
 
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error || 'Something went wrong!', status: 0 });
    }
          
}

export const getOrders = async (req: any, res: Response) => {
    const userId = req.user.id;

    try {

    const orders = await order.findAll({where: {userId: userId}, include: {model: orderItem, include: [item]}})        
    // const orders = await order.findAll({where: {userId: userId}, include: item})
    return res.status(200).json({message: "Orders Fetched!", orders: orders, status: 1})
    
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error || 'Something went wrong!', status: 0 });
    }
}

export const getInvoice = async (req: any, res: Response) => {
    const userId = req.user.id;
    const orderId = req.params.orderId;
    const invoiceName = 'Order #' + orderId + ' Invoice' + '.pdf';
    const invoicePath = path.join('data', 'invoices', invoiceName);

    try {

        const ord: any = await order.findOne({where: {userId: userId, id: orderId}, include: item});

        const pdfDoc = new PDF();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="' + invoicePath + '"');

        // pdfDoc.pipe(fs.createWriteStream(invoicePath));
        pdfDoc.pipe(res);
        pdfDoc.fontSize(30).text('Insta-Cart', {
            align: 'center'
        });
        pdfDoc.fontSize(22).text('Invoice', {
            underline: true
        });

        pdfDoc.text('  ');

        let total = 0;
        ord.items.forEach((item: { price: number; orderItem: { quantity: number; }; }) => {
            total += item.price * item.orderItem.quantity;
        });

        total -= ord.discount_amount;
        let i;

        let invoiceTableTop = 160;
        pdfDoc.font("Helvetica-Bold");
        generateTableRowHeader(
            pdfDoc,
            160,
            'Name',
            "Unit Price",
            'Quantity',
            'Item Total',
        );
        generateHr(pdfDoc, invoiceTableTop + 20);
        pdfDoc.font("Helvetica");

            for (i = 0; i < ord.items.length; i++) {
                const item = ord.items[i];
                const position = invoiceTableTop + (i + 1) * 30;
                generateTableRow(
                    pdfDoc,
                    position,
                    item.title,
                    item.price,
                    item.orderItem.quantity,
                    item.price * item.orderItem.quantity,
                );
            }
            pdfDoc.text(' ');
            pdfDoc.text(' ');
            pdfDoc.text(' ');
            pdfDoc.text('-' + ord.discount_amount, { align: 'right' });
            pdfDoc.text('_____________________________', { align: 'right' });
            pdfDoc.text('  ');
            pdfDoc.fontSize(16).text('Total Price: $' + total, { align: 'right' });
            pdfDoc.text('  ');
            pdfDoc.fontSize(10).text('--------Thanks for shopping at InstaCart--------', {
                align: 'center'
            })

            pdfDoc.end();

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error || 'Something went wrong!', status: 0 });
    }
}

function generateTableRow(doc: any, y: any, c2: any, c3: any, c4: any, c5: any) {
	doc.fontSize(10)
		.text(c2, 150, y)
		.text(c3, 280, y, { width: 90, align: 'right' })
		.text(c4, 370, y, { width: 90, align: 'right' })
		.text(c5, 0, y, { align: 'right' });
}

function generateTableRowHeader(doc: any, y: any, c2: any, c3: any, c4: any, c5: any) {
	doc.fontSize(10)
		.text(c2, 150, y)
		.text(c3, 280, y, { width: 90, align: 'right'})
		.text(c4, 370, y, { width: 90, align: 'right'})
		.text(c5, 0, y, { align: 'right'});
}

function generateHr(doc: any, y: any) {
  doc
    .strokeColor("#aaaaaa")
    .lineWidth(1)
    .moveTo(50, y)
    .lineTo(550, y)
    .stroke();
}