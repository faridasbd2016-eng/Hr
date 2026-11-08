# AMAZ HR — Employee & Payroll

Amin Square (BD) Ltd. এর জন্য তৈরি HR ও Payroll সফটওয়্যার — একটা মাত্র HTML ফাইল, কোনো সার্ভার লাগে না।

**Version:** 2.8.1 · **Powered by:** AMAZ ERP SOLUTION

## মডিউল
- কর্মচারী (Employee) — প্রোফাইল, ডকুমেন্ট, Service Book, Appointment/Experience/Salary Certificate, Settlement
- Salary Sheet, OT Sheet, Attendance (In/Out), Bonus, Increment
- Deposit, Advance / Loan (EMI), Leave / ছুটি, Notice Board
- Reports — Turnover, Headcount, Leave Balance, Increment History, Payroll Summary, TDS Challan, Provident Fund, Analytics, Custom Report
- User / Role Panel, Audit Log, Cloud Sync (Google Apps Script / Supabase), Version History
- Employee Self-Service (মোবাইল + PIN দিয়ে Payslip ও ছুটির আবেদন)

## নতুন device এ প্রথমবার (Cloud Setup)
1. লিংক খুলুন → Login পাতার নিচে **☁️ Cloud Setup** চাপুন
2. Google Apps Script (Web App URL + Secret Key) অথবা Supabase (URL, Anon Key, Company Code, Secret) দিন
3. **🔌 সংযোগ পরীক্ষা** → **⬇ সেভ ও ডাটা আনুন** — সব ডাটা নেমে আসবে
4. তারপর নিজের username/password দিয়ে Login করুন
- যে device এ আগে থেকেই ডাটা আছে সেখানে Cloud বদলাতে Admin পাসওয়ার্ড লাগবে।

## GitHub Pages এ চালানো
1. GitHub এ নতুন repository বানান (যেমন `amaz-hr`)। **Private রাখতে চাইলে** GitHub Pro লাগবে Pages এর জন্য।
2. এই ফোল্ডারের সব ফাইল upload করুন: `index.html`, `manifest.webmanifest`, `sw.js`, `icon-192.png`, `icon-512.png`, `.nojekyll`, `README.md`
3. **Settings → Pages → Source: Deploy from a branch → `main` / `(root)`** → Save
4. ১–২ মিনিট পর লিংক: `https://<আপনার-username>.github.io/amaz-hr/`
5. মোবাইল/PC এর Chrome এ খুলে **Install / Add to Home screen** দিলে অ্যাপের মতো চলবে, ইন্টারনেট ছাড়াও খুলবে।

## নতুন Version আপলোড
- শুধু `index.html` বদলে দিন। চাইলে `sw.js` এর `VERSION` (যেমন `amaz-hr-v2.1`) বাড়ান — তাহলে সবার কাছে পুরনো cache সাথে সাথে মুছে যাবে।
- ডাটা browser এ (localStorage + IndexedDB) আর Cloud Sync এ থাকে — নতুন ফাইল দিলে ডাটা হারায় না।

## নিরাপত্তা নোট
- ⚠️ প্রথম login: `admin` / `admin123` — **সাথে সাথে পাসওয়ার্ড বদলান** (User Panel)। Public repo তে লিংক যে কেউ খুলতে পারবে, তাই এটা জরুরি।
- User Panel → **🔑 Recovery Key** বানিয়ে নিরাপদ জায়গায় রাখুন — Admin পাসওয়ার্ড ভুলে গেলে Login পাতা থেকে রিসেট করা যাবে।
- Password গুলো salt + SHA-256 hash হিসেবে জমা থাকে, সরাসরি নয়।
- Cloud Sync এর Apps Script URL / Supabase key কোডে নয়, Settings থেকে বসান — তাহলে repo তে কোনো গোপন তথ্য থাকে না।

## version.json — Update notice
প্রতিবার নতুন version আপলোড করার সময় `version.json` এর `"version"` নতুন নম্বরে বদলে দিন (যেমন `"2.9"`) আর `"notes"` এ ছোট করে কী নতুন। তাহলে যাদের অ্যাপ খোলা আছে তাদের উপরে "নতুন ভার্সন এসেছে — এখনই আপডেট" নোটিশ আসবে। `sw.js` এর `VERSION` ও বদলাবেন।

⚠️ `AMAZ_License_Generator_VENDOR_ONLY.html` কখনো এই repo তে দেবেন না।
