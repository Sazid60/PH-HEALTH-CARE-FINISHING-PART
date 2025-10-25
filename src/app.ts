import express, { Application, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import notFound from './app/middlewares/notFound';
import config from './config';
import router from './app/routes';
import cookieParser from 'cookie-parser'
import { PaymentController } from './app/modules/payment/payment.controller';

import cron from 'node-cron';
import { AppointmentService } from './app/modules/appointment/appointment.service';


const app: Application = express();

app.post(
    "/webhook",
    express.raw({ type: "application/json" }),
    PaymentController.handleStripeWebhookEvent
);
app.use(cors({
    origin: 'http://localhost:3001',
    credentials: true
}));

//parser
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));


// added for cronjob - 5 start means it will call in every minute  
cron.schedule('* * * * *', () => {
    try {
        console.log('Node Cron called at', new Date());
        AppointmentService.cancelUnpaidAppointments()

    } catch (error) {
        console.log(error)
    }

});
// ___________________

app.use("/api/v1", router);

app.get('/', (req: Request, res: Response) => {
    res.send({
        message: "Server is running..",
        environment: config.node_env,
        uptime: process.uptime().toFixed(2) + " sec",
        timeStamp: new Date().toISOString()
    })
});

app.use(globalErrorHandler);

app.use(notFound);

export default app;