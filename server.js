require("dotenv").config();
const express=require("express");
const app=express();
const cookieParser=require("cookie-parser");
const cors=require("cors");
const corsOptions =require("./config/corsOptions");

const connectDB = require('./db');
connectDB();

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

//routes
const authRoutes = require('./routes/auth');
const backupRoutes = require('./routes/backup');
const branchesRoutes = require('./routes/branches');
const categoriesRoutes = require('./routes/categories');
const customersRoutes = require('./routes/customers');
const ledgersRoutes = require('./routes/ledgers');
const productsRoutes = require('./routes/products');
const purchasesRoutes = require('./routes/purchases');
const salesRoutes = require('./routes/sales');
const stockMovementsRoutes = require('./routes/stockMovements');
const usersRoutes = require('./routes/users');
const vendorsRoutes = require('./routes/vendors');
const dashboardRoutes = require('./routes/dashboardRoutes');


//Link routes to its paths
app.use('/api/auth', authRoutes);
app.use('/api/backup', backupRoutes);
app.use('/api/branches', branchesRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/ledgers', ledgersRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/purchases', purchasesRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/stock-movements', stockMovementsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/vendors', vendorsRoutes);
app.use('/api/dashboard', dashboardRoutes);

//server listening



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
