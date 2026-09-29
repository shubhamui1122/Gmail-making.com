const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 🔒 BLACK-BOX PERSISTENT DATA STRUCTS (स्थायी फ़ाइल तिजोरी लॉक जो डेटा उड़ने नहीं देगी)
const DATA_FILE = path.join(__dirname, 'database_vault.json');
let db = { users: {}, pendingPayments: [], systemUpi: "shubham77sah@fam", liveAnnouncement: "Welcome to SMM Matrix Core Terminal!", notifications: [] };

function loadVaultData() {
    try { if (fs.existsSync(DATA_FILE)) { db = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); } } catch (e) { console.log("Vault Read Error, resetting safely."); }
}
function saveVaultData() {
    try { fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf8'); } catch (e) { console.log("Vault Write Error Matrix!"); }
}
loadVaultData();

// 📢 MASTER ANNOUNCEMENT CORE ENGINE (लाइव एलान पट्टी डेटा API)
app.get('/api/system/announcement', (req, res) => {
    res.json({ announcement: db.liveAnnouncement || "" });
});

app.post('/api/admin/update-announcement', (req, res) => {
    const { text } = req.body;
    db.liveAnnouncement = text;
    saveVaultData();
    res.json({ success: true, message: "Announcement distributed to all 35,000 nodes!" });
});

// 🔐 REMOTE PASSWORD OVERRIDE OVERHAUL (ओनर और सब-एडमिन दोनों के लिए समान रूप से एक्टिव)
app.post('/api/admin/reset-password', (req, res) => {
    const { username, newPassword, adminName } = req.body;
    if (!username || !newPassword) return res.json({ success: false, message: "Missing data packets!" });
    
    if (db.users[username]) {
        db.users[username].password = newPassword;
        db.notifications.unshift({ time: new Date().toLocaleTimeString(), details: `🔑 Password override for @${username} executed by ${adminName || 'Admin Node'}` });
        saveVaultData();
        return res.json({ success: true, message: "Client credential array forcefully updated!" });
    } else {
        return res.json({ success: false, message: "Target mobile node not found in registry!" });
    }
});

// 📊 GLOBAL STATISTICS INFRASTRUCTURE (लाइफटाइम अर्निंग महा-मीटर डेटा)
app.get('/api/admin/stats', (req, res) => {
    let usersCount = Object.keys(db.users).length;
    let totalInvestedFund = 0;
    Object.values(db.users).forEach(u => {
        if(u.totalDeposited) totalInvestedFund += u.totalDeposited;
    });
    res.json({ usersCount, totalInvestedFund });
});
// 👤 USER REGISTRY & SECURITY PROTOCOLS (यूजर लॉगिन और लाइव अलर्ट गेट)
app.post('/api/user/register', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.json({ success: false, message: "Missing credentials!" });
    if (db.users[username]) return res.json({ success: false, message: "User already exists!" });
    
    db.users[username] = { username, password, balance: 0, totalDeposited: 0, balanceAlert: "" };
    saveVaultData();
    res.json({ success: true, message: "User node registry complete!" });
});

app.post('/api/user/login', (req, res) => {
    const { username, password } = req.body;
    loadVaultData();
    const u = db.users[username];
    if (u && u.password === password) {
        res.json({ success: true, username, balance: u.balance });
    } else {
        res.json({ success: false, message: "Invalid credentials!" });
    }
});

app.post('/api/user/sync-profile', (req, res) => {
    const { username } = req.body;
    loadVaultData();
    const u = db.users[username];
    if (!u) return res.json({ success: false, message: "Node mismatch!" });
    
    // अगर कोई नया बैलेंस अलर्ट (बधाई संदेश) है, तो उसे भेजकर तुरंत क्लियर कर देंगे
    let alertMsg = u.balanceAlert || "";
    if (alertMsg) { u.balanceAlert = ""; saveVaultData(); }
    
    res.json({ success: true, balance: u.balance, alertMessage: alertMsg });
});

// 💳 UPI GATEWAY & FORCE ADJUSTER LEDGER (यूटीआर वेरिफिकेशन और सीधे वॉलेट ऐड रिमोट)
app.post('/api/user/submit-utr', (req, res) => {
    const { username, amount, utr } = req.body;
    if (!username || !amount || !utr) return res.json({ success: false, message: "Empty packet!" });
    
    let amtNum = parseFloat(amount);
    db.pendingPayments.push({ id: Date.now().toString(), username, amount: amtNum, utr });
    db.notifications.unshift({ time: new Date().toLocaleTimeString(), details: `💰 New Deposit Request: @${username} sent UTR ${utr} (₹${amount})` });
    saveVaultData();
    res.json({ success: true, message: "UTR queued for owner audit lock!" });
});

app.get('/api/admin/pending-payments', (req, res) => {
    loadVaultData();
    res.json(db.pendingPayments);
});

app.post('/api/admin/update-balance', (req, res) => {
    const { username, amount, action, adminName } = req.body;
    let amtNum = parseFloat(amount);
    if (!db.users[username]) return res.json({ success: false, message: "Client not found!" });
    
    if (action === 'add') {
        db.users[username].balance += amtNum;
        db.users[username].totalDeposited += amtNum;
        db.users[username].balanceAlert = `🎉 ₹${amtNum} Direct Wallet Force Credit Completed by ${adminName || 'Admin'}!`;
    } else {
        db.users[username].balance = Math.max(0, db.users[username].balance - amtNum);
    }
    db.notifications.unshift({ time: new Date().toLocaleTimeString(), details: `🛡️ Force Adjust: @${username} balance changed by ₹${amtNum} (${action}) by ${adminName}` });
    saveVaultData();
    res.json({ success: true, message: "Wallet forced ledger updated successfully!" });
});
app.post('/api/admin/verify-payment', (req, res) => {
    const { paymentId, action, adminName } = req.body;
    loadVaultData();
    let index = db.pendingPayments.findIndex(p => p.id === paymentId);
    if (index === -1) return res.json({ success: false, message: "UTR token missing!" });
    
    let payment = db.pendingPayments[index];
    if (action === 'success') {
        if (db.users[payment.username]) {
            db.users[payment.username].balance += payment.amount;
            db.users[payment.username].totalDeposited += payment.amount;
            // 🔔 LIVE POP-UP ALERT ENGINE LOCK: यूज़र को बिना लॉग-आउट किए तुरंत बधाई मैसेज दिखेगा
            db.users[payment.username].balanceAlert = `🎉 बधाई हो! आपका ₹${payment.amount} का डिपॉजिट सफलतापूर्वक आपके वॉलेट में जोड़ दिया गया है।`;
            db.notifications.unshift({ time: new Date().toLocaleTimeString(), details: `✅ UTR APPROVED: ₹${payment.amount} added to @${payment.username} by ${adminName}` });
        }
    } else {
        db.notifications.unshift({ time: new Date().toLocaleTimeString(), details: `❌ UTR REJECTED: Request from @${payment.username} cancelled by ${adminName}` });
    }
    
    db.pendingPayments.splice(index, 1);
    saveVaultData();
    res.json({ success: true, message: "UTR ledger state updated!" });
});

// 🎟️ PROMO CODE NODE DESK (गिफ्ट कार्ड रिडीम इंजन)
let activeGiftCodes = {};
app.post('/api/admin/create-gift', (req, res) => {
    const { codeName, amount } = req.body;
    activeGiftCodes[codeName] = parseFloat(amount);
    res.json({ success: true, message: "Promo Code Node Online!" });
});

app.post('/api/user/redeem-gift', (req, res) => {
    const { username, codeName } = req.body;
    if (!db.users[username]) return res.json({ success: false, message: "User node missing!" });
    
    if (activeGiftCodes[codeName]) {
        let prize = activeGiftCodes[codeName];
        db.users[username].balance += prize;
        db.users[username].balanceAlert = `🎁 Promo Code Applied! ₹${prize} added to your vault.`;
        delete activeGiftCodes[codeName]; // कोड एक बार रिडीम होते ही डिलीकर लॉक हो जाएगा
        saveVaultData();
        res.json({ success: true, message: "Dispatch! Promo prize unlocked." });
    } else {
        res.json({ success: false, message: "Invalid or expired code node!" });
    }
});

// ⚙️ OWNER MASTER SETTINGS & WORKER AUDITS
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (username === "OWNERSHUBHAM11" && password === "8734812286") {
        res.json({ success: true, role: 'owner' });
    } else {
        res.json({ success: false, message: "Master credentials mismatch!" });
    }
});

app.get('/api/owner/notifications', (req, res) => {
    res.json(db.notifications.slice(0, 30));
});

// 🚀 SERVER INIT RUNTIME BOOT
app.listen(PORT, () => {
    console.log(`SMM Core Machine Matrix active on port ${PORT}`);
});
