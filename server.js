const express = require('express');
const app = express();
const path = require('path');

app.use(express.json());
app.use(express.static('public'));

// 🔒 CLEAN DATABASE ARRAY SYSTEM (WITHDRAWAL COMPLETELY REMOVED FROM ENTIRE ARCHITECTURE)
let users = [];
let admins = [{ username: "OWNERSHUBHAM11", password: "8734812286", role: "Owner" }];
let supportTickets = []; 
let standardTickets = [];
let highTickets = []; 
let giftCodes = []; 

// 📦 LIVE TELEMETRY STORAGE ARRAYS
let gmailOrders = []; 
let pendingPayments = []; 
let ownerLogs = []; // 📡 Live System Audit Stream (गुप्त जासूसी तिजोरी)

// 📊 TOTAL LIFETIME METERS & 5SIM LOGIC NODES
let stats = {
    totalInvestedFund: 0,     // My All Network (कुल आज तक की लाइफटाइम कमाई का महा-मीटर)
    totalPaymentsToday: 0,    // Live UTR Submissions Counter
    approvedPaymentsToday: 0, // Successfully Confirmed Credits Counter
    simApiBalanceRubles: 750, // Live 5Sim API Balance Tracker (Default Value)
    activeProxyLink: ""       // Owner Secret Proxy Connection Storage Node
};

let standardHistory = { winner: null, status: "Counter chalu hai!" };
let highWinnerList = []; 

// 👑 ADMIN CORE AUTHENTICATOR LOGIN MATRIX
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    const admin = admins.find(a => a.username === username && a.password === password);
    if (admin) return res.json({ success: true, role: admin.role });
    res.status(401).json({ success: false, message: "Access Mismatch!" });
});
// 👤 USER PREMIUM REGISTRATION MATRIX (MOBILE VALIDATION LOCK)
app.post('/api/user/register', (req, res) => {
    const { name, username, password } = req.body;
    let existing = users.find(u => u.username === username);
    if (existing) return res.json({ success: false, message: "Galti: Yeh mobile number pehle se register hai!" });
    
    users.push({ 
        name, 
        username, // Target Mobile Number acts as unique Login ID identity
        password, 
        balance: 0, 
        isPremium: false, // VIP 0 default mode tier indicator
        registeredAt: new Date().toLocaleDateString()
    });
    res.json({ success: true, message: "Registration successful! Ab login karo." });
});

// 👤 USER SECURE APP AUTHORIZATION LOGIN MATRIX
app.post('/api/user/login', (req, res) => {
    const { username, password } = req.body;
    let user = users.find(u => u.username === username && u.password === password);
    if (user) return res.json({ success: true, username: user.username, name: user.name });
    res.json({ success: false, message: "Mobile Number ya Password galat hai!" });
});

// 📥 UTR SECURE CASH DEPOSIT QUEUE HANDLER (💥 WITH OWNER STRENGTHENED FILTER LIMITS)
app.post('/api/user/submit-utr', (req, res) => {
    const { username, amount, utr } = req.body;
    let depositAmount = parseFloat(amount);
    
    // 🚨 STRENGTHENED SAFETY FILTER: Force strict minimum limit condition rule matrix
    if (depositAmount < 70) {
        return res.json({ success: false, message: "Galti: Website mein minimum deposit limit ₹70 hai!" });
    }

    let paymentId = "PAY-" + Math.floor(1000 + Math.random() * 9000);
    pendingPayments.push({
        id: paymentId,
        username,
        amount: depositAmount,
        utr,
        status: "Pending"
    });

    stats.totalPaymentsToday += 1;
    ownerLogs.unshift({
        action: "DEPOSIT_REQUEST",
        details: `User '${username}' submitted UTR: ${utr} for ₹${amount}. Redirected to Owner Desk.`,
        time: new Date().toLocaleTimeString()
    });
    res.json({ success: true, message: "UTR Grid Transmitted! Owner validation pending." });
});
// 👥 ADD NEW SUB-ADMIN NODE TERMINAL (OWNER EXCLUSIVE ROUTER MODULE)
app.post('/api/admin/add-sub', (req, res) => {
    const { username, password } = req.body;
    let check = admins.find(a => a.username === username);
    if(check) return res.json({ success: false, message: "Yeh sub-admin pehle se added hai!" });
    
    admins.push({ username, password, role: "Sub-Admin" });
    ownerLogs.unshift({ 
        action: "NEW_SUB_ADMIN", 
        details: `Owner authorized new Sub-Admin node: '${username}' into memory stack.`, 
        time: new Date().toLocaleTimeString() 
    });
    res.json({ success: true, message: "Naya Sub-Admin successfully authorized!" });
});

// 💸 MANUAL WALLET BALANCING CONSOLE TERMINAL (OWNER PRIVILEGE CONTROL HUB)
app.post('/api/admin/update-balance', (req, res) => {
    const { username, amount, action, adminName } = req.body;
    let user = users.find(u => u.username === username);
    if (!user) return res.json({ success: false, message: "Error: Target user nahi mila!" });
    
    let cash = parseFloat(amount);
    if (action === 'credit') {
        user.balance += cash;
        stats.approvedPaymentsToday += 1;
        stats.totalInvestedFund += cash; // Sync with My All Network Lifetime Ledger
    } else if (action === 'debit') {
        user.balance = Math.max(0, user.balance - cash);
    }
    
    ownerLogs.unshift({ 
        action: action.toUpperCase(), 
        details: `Owner/Admin '${adminName}' manually ${action}ed ₹${amount} for user '${username}'`, 
        time: new Date().toLocaleTimeString() 
    });
    res.json({ success: true, message: "User wallet registry synced!" });
});

// 💳 EXCLUSIVE OWNER UTR VERIFICATION REMOTE DESK MATRIX (SUB-ADMIN ACCESS STRIPPED)
app.post('/api/admin/verify-payment', (req, res) => {
    const { paymentId, action, adminName } = req.body;
    let payIndex = pendingPayments.findIndex(p => p.id === paymentId);
    if (payIndex === -1) return res.json({ success: false, message: "Request invalid ya already processed!" });
    
    let targetPayment = pendingPayments[payIndex];
    let user = users.find(u => u.username === targetPayment.username);
    
    if (action === 'success') {
        if (user) {
            user.balance += targetPayment.amount;
            stats.totalInvestedFund += targetPayment.amount; // 📊 Add straight to My All Network Lifetime Gain
            stats.approvedPaymentsToday += 1;
        }
        ownerLogs.unshift({ 
            action: "UTR_APPROVED", 
            details: `Owner '${adminName}' approved ₹${targetPayment.amount} for user ${targetPayment.username} (UTR: ${targetPayment.utr})`, 
            time: new Date().toLocaleTimeString() 
        });
    } else if (action === 'reject') {
        ownerLogs.unshift({ 
            action: "UTR_REJECTED", 
            details: `Owner '${adminName}' rejected and deleted fake UTR entry from ${targetPayment.username}`, 
            time: new Date().toLocaleTimeString() 
        });
    }
    
    pendingPayments.splice(payIndex, 1); // Flush straight from active queue grid lists
    res.json({ success: true, message: `Payment registration state updated to [${action.toUpperCase()}]!` });
});
// ⚙️ OWNER PROXY CONNECT MATRIX ENDPOINT (REMOTELY DEPLOY 5 PROXY API LINKS)
app.post('/api/owner/save-proxy', (req, res) => {
    const { proxyLink } = req.body;
    stats.activeProxyLink = proxyLink;
    
    ownerLogs.unshift({ 
        action: "PROXY_CONNECTED", 
        details: `Owner updated core network matrix with fresh 5-Proxy API gateway endpoint link!`, 
        time: new Date().toLocaleTimeString() 
    });
    
    // ⚡ DYNAMIC UPDATE: Trigger instant backlog acceleration from 15% to 100% for all locked orders
    gmailOrders.forEach(o => {
        if(o.status === "Pending") {
            o.progress = 100;
            o.status = "Completed";
            o.details += " | [⚡ Proxy Stream: SUCCESSFUL]";
        }
    });
    
    res.json({ success: true, message: "5-Proxy API Server Connection Successful! All backlog orders accelerated to 100%." });
});

// 📦 UNIQUE GMAIL AUTOMATIC MACHINE LOGIC ENGINE (WITH LIVE 0% TO 100% PROGRESS METERS)
app.post('/api/user/order-gmail', (req, res) => {
    const { username, mode, password, name, dob, preferredAddress, bulkUsernamesList } = req.body;
    let user = users.find(u => u.username === username);
    if (!user) return res.json({ success: false, message: "Session dead! Login dubara karein." });

    let orderId = "ORD-" + Math.floor(10000 + Math.random() * 90000);
    let initialProgress = stats.activeProxyLink ? 100 : 15; // 🚨 If no proxy link, lock at 15% safe hold delay state
    let orderStatus = stats.activeProxyLink ? "Completed" : "Pending";
    
    if (mode === 'single') {
        let cost = 15;
        if (user.balance < cost) return res.json({ success: false, message: "Wallet balance kam hai! Single order ke liye ₹15 chahiye." });
        
        user.balance -= cost;
        gmailOrders.push({
            id: orderId,
            username,
            mode: "Single Mode",
            details: `Name: ${name} | DOB: ${dob} | Pref: ${preferredAddress}`,
            password: password,
            progress: initialProgress,
            status: orderStatus,
            time: new Date().toLocaleTimeString()
        });
    } else if (mode === 'bulk') {
        let listCount = bulkUsernamesList ? bulkUsernamesList.length : 0;
        if (listCount === 0) return res.json({ success: false, message: "Galti: Bulk textbox list khali hai!" });
        
        let totalCost = listCount * 12;
        if (user.balance < totalCost) return res.json({ success: false, message: `Wallet balance kam hai! ${listCount} emails ke liye ₹${totalCost} chahiye.` });
        
        user.balance -= totalCost;
        gmailOrders.push({
            id: orderId,
            username,
            mode: "Bulk Mode",
            details: `Qty: ${listCount} Mails | Array List: [${bulkUsernamesList.join(', ')}]`,
            password: password,
            progress: initialProgress,
            status: orderStatus,
            time: new Date().toLocaleTimeString()
        });
    }

    ownerLogs.unshift({ 
        action: "GMAIL_ORDER_LOCKED", 
        details: `User '${username}' submitted a ${mode} request (${orderId}). Current tracking state: ${initialProgress}%.`, 
        time: new Date().toLocaleTimeString() 
    });
    
    res.json({ success: true, message: "Order Request Transmitted! Automated proxy bot triggered." });
});

// 🔒 USER SECURITY PASSWORD SUPPORT CHANGE REMOTELY TERMINAL NODES
app.post('/api/admin/reset-password', (req, res) => {
    const { username, newPassword, adminName } = req.body;
    let user = users.find(u => u.username === username);
    if (!user) return res.json({ success: false, message: "Error: Is mobile number se koi user nahi mila!" });
    
    user.password = newPassword;
    ownerLogs.unshift({ action: "MASTER_PASSWORD_RESET", details: `Owner/Admin '${adminName}' reset account password for user '${username}' (Baat Khatam)`, time: new Date().toLocaleTimeString() });
    res.json({ success: true, message: "Success: User ka naya password lock ho gaya!" });
});

// 🎫 CREATE PROMO GIFT CODES GENERATOR (OWNER CONTROL ARCHITECTURE MODULE)
app.post('/api/admin/create-gift', (req, res) => {
    const { codeName, amount } = req.body;
    giftCodes.push({ code: codeName.toUpperCase(), amount: parseFloat(amount), usedBy: [] });
    res.json({ success: true, message: `Gift Promo Node ${codeName} online!` });
});
// 🎁 REDEEM GIFT CODE PIPELINE (USER ACCOUNT VIEWPORT GATE LINK MATRIX)
app.post('/api/user/redeem-gift', (req, res) => {
    const { username, code } = req.body;
    let target = giftCodes.find(g => g.code === code.toUpperCase());
    if(!target) return res.json({ success: false, message: "Galti: Yeh Gift Code galat hai!" });
    if(target.usedBy.includes(username)) return res.json({ success: false, message: "Aap pehle hi yeh code use kar chuke ho!" });
    
    let user = users.find(u => u.username === username);
    if(!user) return res.json({ success: false, message: "User session dead!" });
    
    user.balance += target.amount;
    target.usedBy.push(username);
    res.json({ success: true, message: `Success! ₹${target.amount} aapke account mein add ho gaye.` });
});

// 🎰 AUTOMATIC DOUBLE CASH REWARD DRAW ROUTER ENGINE
app.post('/api/lottery/buy', (req, res) => {
    const { username, count, tier } = req.body; 
    let user = users.find(u => u.username === username); if (!user) return res.json({ success: false, message: "Login dead!" });
    
    let price = tier === 'high' ? 100 : 31; let cost = price * parseInt(count);
    if (user.balance < cost) return res.json({ success: false, message: "Wallet balance kam hai! Pehle recharge karein." });
    
    user.balance -= cost;
    for(let i=0; i<count; i++) {
        let tkt = { username, ticketId: "TK-" + Math.floor(1000 + Math.random() * 9000) };
        if (tier === 'high') highTickets.push(tkt); else standardTickets.push(tkt);
    }
    res.json({ success: true, message: `${count} ticket pool mein lag gaye.` });
});

// 🎯 OWNER EXCLUSIVE CASH DRAW RIGGING RIG DESK (AUTO-CASH REWARD SYSTEM MATRIX)
app.post('/api/admin/set-high-winner', (req, res) => {
    const { winnerUsername } = req.body;
    let u = users.find(usr => usr.username === winnerUsername);
    
    // 💥 STRENGTHENED RULE: Instantly credit ₹200 hard cash straight to winner balance vault!
    if(u) { u.balance += 200; stats.totalInvestedFund += 200; }
    
    highWinnerList.unshift({ username: winnerUsername, prize: "₹200 Instant Cash Balance", time: new Date().toLocaleTimeString() });
    ownerLogs.unshift({ action: "LOTTERY_HIGH_RIGGED", details: `Owner manually proclaimed @${winnerUsername} as High-Tier Winner! ₹200 credited automatically.`, time: new Date().toLocaleTimeString() });
    highTickets = []; // Flush active high-tier pool
    res.json({ success: true, message: `Database Lock: @${winnerUsername} won! ₹200 hard cash injected.` });
});

// 💬 CUSTOMER LIVE TWO-WAY SUPPORT MATRIX FOR PROBLEM TICKETS
app.post('/api/user/create-ticket', (req, res) => {
    const { username, category, description } = req.body;
    let ticketId = "TKT-" + Math.floor(1000 + Math.random() * 9000);
    supportTickets.unshift({ id: ticketId, username, category, description, reply: "Awaiting review from support desk...", status: "Process Query" });
    res.json({ success: true, message: "Problem Form transmitted!" });
});

app.post('/api/admin/reply-ticket', (req, res) => {
    const { ticketId, replyMsg } = req.body; let ticket = supportTickets.find(t => t.id === ticketId);
    if(ticket) { ticket.reply = replyMsg; res.json({ success: true, message: "Response dispatched!" }); } 
    else { res.json({ success: false, message: "Invalid Ticket!" }); }
});

app.post('/api/admin/resolve-ticket', (req, res) => {
    const { ticketId } = req.body; let ticket = supportTickets.find(t => t.id === ticketId);
    if(ticket) { ticket.status = "My All Doubts"; res.json({ success: true, message: "Success Locked! Chat permanently stopped." }); } 
    else { res.json({ success: false, message: "Failed." }); }
});

// ⏱️ AUTO-LOOP FOR NIGHT 10:00 PM STANDARD CASH DRAW (WITH AUTOMATIC ₹50 CASH INJECTION)
setInterval(() => {
    let now = new Date(); let ist = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
    if (ist.getHours() === 22 && ist.getMinutes() === 0) {
        if (standardTickets.length >= 5) {
            let winIdx = Math.floor(Math.random() * standardTickets.length); let winTkt = standardTickets[winIdx];
            let targetUser = users.find(usr => usr.username === winTkt.username);
            
            // 💥 AUTOMATIC ₹50 HARD CASH SYSTEM CREDIT LOCK
            if(targetUser) { targetUser.balance += 50; stats.totalInvestedFund += 50; }
            standardHistory = { winner: winTkt.username, status: `🎉 Live Draw: @${winTkt.username} won ₹50 Instant Cash Balance!` };
        } else {
            standardTickets.forEach(t => { let u = users.find(usr => usr.username === t.username); if(u) u.balance += 31; });
            standardHistory = { winner: "REFUNDED", status: "Anti-Loss Triggered: Low entries (<5). Wallet cash refunded!" };
        }
        standardTickets = [];
    }
}, 60000);

// GLOBAL FULL DATA PIPELINE STREAM ROUTERS
app.get('/api/admin/stats', (req, res) => res.json({ ...stats, usersCount: users.length, vipCount: users.filter(u=>u.isPremium).length, pendingPayCount: pendingPayments.length, totalGmailOrdersCount: gmailOrders.length }));
app.get('/api/admin/pending-payments', (req, res) => res.json(pendingPayments));
app.get('/api/admin/gmail-orders', (req, res) => res.json(gmailOrders));
app.get('/api/lottery/status', (req, res) => res.json({ standard: standardHistory, highWinners: highWinnerList, stdCount: standardTickets.length, highCount: highTickets.length }));
app.get('/api/users', (req, res) => res.json(users));
app.get('/api/tickets/all', (req, res) => res.json(supportTickets));
app.get('/api/owner/notifications', (req, res) => res.json(ownerLogs));

app.listen(3000, () => console.log('Gmail Maker SMM Multi-Tier 3-Panel Server Active'));
