"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = __importDefault(require("chai"));
const chai_http_1 = __importDefault(require("chai-http"));
const const_1 = require("../util/const");
const url = 'localhost:3000';
const expect = chai_1.default.expect;
chai_1.default.use(chai_http_1.default);
describe("Register", () => {
    const email = 'test@test.com';
    const password = '123456';
    it('should throw an error if user already registered', ok => {
        chai_1.default.request(url)
            .post('/auth/register')
            .send({
            email: "vatsalp.tcs@gmail.com",
            password: "123456"
        })
            .end((err, res) => {
            expect(res).to.have.status(const_1.globals.StatusBadRequest);
            ok();
        });
    });
    it('should throw an error if user entered invalid email', ok => {
        chai_1.default.request(url)
            .post('/auth/register')
            .send({
            email: "vatsalp",
            password: "123456"
        })
            .end((err, res) => {
            expect(res).to.have.status(const_1.globals.StatusBadRequest);
            expect(res.body.message).to.equals('Please enter a valid email address!');
            ok();
        });
    });
    it('should throw an error if user entered invalid password', ok => {
        chai_1.default.request(url)
            .post('/auth/register')
            .send({
            email: "vatsalp.tcs@gmail.com",
            password: "16"
        })
            .end((err, res) => {
            expect(res).to.have.status(const_1.globals.StatusBadRequest);
            expect(res.body.message).to.equals('Please Enter a valid Password!');
            ok();
        });
    });
});
describe("Login", () => {
    const email = 'test@test.com';
    const password = '123456';
    it('should throw an error if user does not exist', ok => {
        chai_1.default.request(url)
            .post('/auth/login')
            .send({
            email: "vatsp.tcs@gmail.com",
            password: "123456"
        })
            .end((err, res) => {
            expect(res).to.have.status(const_1.globals.StatusNotFound);
            ok();
        });
    });
    it('should throw an error if user entered incorrect credentials', ok => {
        chai_1.default.request(url)
            .post('/auth/login')
            .send({
            email: "vatsalp.tcs@gmail.com",
            password: "12345678"
        })
            .end((err, res) => {
            expect(res).to.have.status(const_1.globals.StatusBadRequest);
            expect(res.body.message).to.equals(const_1.globalResponse.InvalidCredentials);
            ok();
        });
    });
    it('should throw an error if user entered invalid email', ok => {
        chai_1.default.request(url)
            .post('/auth/login')
            .send({
            email: "vatsalp",
            password: "123456"
        })
            .end((err, res) => {
            expect(res).to.have.status(const_1.globals.StatusBadRequest);
            expect(res.body.message).to.equals('Please enter a valid email address!');
            ok();
        });
    });
    it('should throw an error if user entered invalid password', ok => {
        chai_1.default.request(url)
            .post('/auth/login')
            .send({
            email: "vatsalp.tcs@gmail.com",
            password: "16"
        })
            .end((err, res) => {
            expect(res).to.have.status(const_1.globals.StatusBadRequest);
            expect(res.body.message).to.equals('Please Enter a valid Password!');
            ok();
        });
    });
});
// describe("generateOTP", ()=>{
//   const email = 'test@test.com';
//   const password = '123456';
//   it('should throw an error if user already exist', ok=>{
//     chai.request(url)
//         .post('/auth/generateOTP')
//         .send({
//           country_code: "+91",
//           phone_number: "9999999999",
//           channel: "sms"
//         })
//         .end((err,res)=>{
//           expect(res).to.have.status(globals.StatusBadRequest)
//           expect(res.body.message).to.equals(globalResponse.UserExist)
//           ok()
//         })
//   })
//   it('should throw an error if user entered invalid phone number', ok=>{
//     chai.request(url)
//         .post('/auth/generateOTP')
//         .send({
//           country_code: "+91",
//           phone_number: "9999999999",
//           channel: "sms"
//         })
//         .end((err,res)=>{
//           expect(res).to.have.status(globals.StatusBadRequest)
//           expect(res.body.message).to.equals('Please enter a valid phone number!')
//           ok()
//         })
//   })
// })
// describe("otpLogin", ()=>{
//   const email = 'test@test.com';
//   const password = '123456';
//   it('should throw an error if user does not exist', ok=>{
//     chai.request(url)
//         .post('/auth/otpLogin')
//         .send({
//           country_code: "+91",
//           phone_number: "9999999999",
//           otpValue: "0000"
//         })
//         .end((err,res)=>{
//           expect(res).to.have.status(globals.StatusNotFound)
//           expect(res.body.message).to.equals(globalResponse.UserNotFound)
//           ok()
//         })
//   })
//   it('should throw an error if user entered incorrect OTP', ok=>{
//     chai.request(url)
//         .post('/auth/otpLogin')
//         .send({
//           country_code: "+91",
//           phone_number: "9999999999",
//           otpValue: "0000"
//         })
//         .end((err,res)=>{
//           expect(res).to.have.status(globals.StatusBadRequest)
//           expect(res.body.message).to.equals(globalResponse.InvalidOTP)
//           ok()
//         })
//   })
//   it('should throw an error if user entered invalid phone number', ok=>{
//     chai.request(url)
//         .post('/auth/otpLogin')
//         .send({
//           country_code: "+91",
//           phone_number: "9999999999",
//           otpValue: "0000"
//         })
//         .end((err,res)=>{
//           expect(res).to.have.status(globals.StatusBadRequest)
//           expect(res.body.message).to.equals('Please enter a valid phone number!')
//           ok()
//         })
//   })
//   it('should throw an error if user entered invalid OTP', ok=>{
//     chai.request(url)
//         .post('/auth/otpLogin')
//         .send({
//           country_code: "+91",
//           phone_number: "9999999999",
//           otpValue: "0000"
//         })
//         .end((err,res)=>{
//           expect(res).to.have.status(globals.StatusBadRequest)
//           expect(res.body.message).to.equals('Enter Valid OTP!')
//           ok()
//         })
//   })
// })
// describe("verifyOTP", ()=>{
//   const email = 'test@test.com';
//   const password = '123456';
//   it('should throw an error if user entered incorrect OTP', ok=>{
//     chai.request(url)
//         .post('/auth/verifyOTP')
//         .send({
//           country_code: "+91",
//           phone_number: "9999999999",
//           otpValue: "0000"
//         })
//         .end((err,res)=>{
//           expect(res).to.have.status(globals.StatusBadRequest)
//           expect(res.body.message).to.equals(globalResponse.InvalidOTP)
//           ok()
//         })
//   })
//   it('should throw an error if user entered invalid phone number', ok=>{
//     chai.request(url)
//         .post('/auth/verifyOTP')
//         .send({
//           country_code: "+91",
//           phone_number: "9999999999",
//           otpValue: "0000"
//         })
//         .end((err,res)=>{
//           expect(res).to.have.status(globals.StatusBadRequest)
//           expect(res.body.message).to.equals('Please enter a valid phone number!')
//           ok()
//         })
//   })
//   it('should throw an error if user entered invalid OTP', ok=>{
//     chai.request(url)
//         .post('/auth/verifyOTP')
//         .send({
//           country_code: "+91",
//           phone_number: "9999999999",
//           otpValue: "0000"
//         })
//         .end((err,res)=>{
//           expect(res).to.have.status(globals.StatusBadRequest)
//           expect(res.body.message).to.equals('Enter Valid OTP!')
//           ok()
//         })
//   })
// })
