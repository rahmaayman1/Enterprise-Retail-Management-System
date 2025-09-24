# SAMA Enterprise Retail Management System (SERMS)

A **comprehensive cloud-based Retail Management System** built for SAMA Enterprise using the **MERN stack** (MongoDB, Express.js, React.js, Node.js). The system manages inventory, purchases, sales, accounting, profit analysis, and multi-branch operations while providing real-time dashboards and automated email notifications.

---

## **Features**

### Core Modules
- **Inventory & Stock Management**
  - Add, edit, delete products and SKUs
  - Track quantity, expiry dates, reorder levels
  - Barcode generation and scanning
  - Import/export via CSV

- **Purchase & Vendor Management**
  - Create/manage purchase orders
  - Vendor profiles and transaction history
  - GRNs and invoice generation
  - Payment tracking for vendors

- **Sales & POS**
  - Add sales manually or via barcode scanner
  - Print receipts/invoices
  - Apply discounts, taxes, and promotions
  - Handle cash and digital payments

- **Ledger & Accounting**
  - Auto-generate supplier/customer ledgers
  - Manage cash in/out
  - View outstanding payments
  - Export financial reports

- **Profit & Loss Analysis**
  - Real-time profit margin analysis
  - P&L for items, categories, or branches
  - Expense tracking and summaries

- **User Management & Roles**
  - Role-based access control (Admin, Manager, Cashier, Warehouse Staff)
  - Create/delete user accounts
  - Activity audit logs

- **Reports & Analytics**
  - Sales, purchase, and ledger reports
  - Filter and export options 

- **Email Notifications**
  - Automated emails to users on account creation or system actions
  - Implemented using **Nodemailer / SMTP**

- **Backup & Recovery**
  - Daily automated cloud backups
  - Manual export and restore options

---

## **Tech Stack**
- **Frontend**: React.js, HTML5, CSS3, JavaScript  
- **Backend**: Node.js, Express.js  
- **Database**: MongoDB Atlas  
- **Email Notifications**: Nodemailer / SMTP  
- **Analytics & Charts**: Chart.js  
- **Hosting / Cloud**: AWS, Azure, or any cloud platform  
- **Version Control**: Git & GitHub  

---

## **Installation & Setup**

1. **Clone the repository**
```bash
git clone https://github.com/rahmaayman1/Enterprise-Retail-Management-System.git
cd Enterprise-Retail-Management-System
