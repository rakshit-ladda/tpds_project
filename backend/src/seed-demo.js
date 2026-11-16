import 'dotenv/config';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

// Explicit, repeatable demo seeding. Never runs automatically on application startup.
const db=await mysql.createConnection({host:process.env.DB_HOST||'localhost',port:Number(process.env.DB_PORT||3306),user:process.env.DB_USER||'campus',password:process.env.DB_PASSWORD||'campuspass',database:process.env.DB_NAME||'campuspulse'});
const random=(n)=>{const x=Math.sin(n*127.1+78.233)*43758.5453;return x-Math.floor(x)};
const first=['Aarav','Diya','Ishaan','Ananya','Vivaan','Meera','Aditya','Saanvi','Arjun','Riya','Kabir','Ira','Reyansh','Tara','Atharv','Nisha','Krish','Aisha','Rohan','Priya','Dev','Kavya','Neel','Sara','Om','Myra','Yash','Avni','Rudra','Kiara','Ved','Anika','Dhruv','Navya','Shaurya','Mahi','Harsh','Siya','Aryan','Tanvi','Parth','Pihu','Nikhil','Aditi','Manav','Sana','Varun','Esha','Kunal','Zoya'];
const last=['Shah','Patil','Mehta','Joshi','Rao','Kulkarni','Gupta','Desai','Nair','Kapoor'];
const templates=[
 ['IT','Projector not connecting','Projector shows no signal during lectures',3,4],
 ['IT','Campus Wi-Fi disconnecting','Wi-Fi drops frequently and disrupts online assignments',3,4],
 ['IT','Lab computer not starting','Computer does not power on in the lab',3,3],
 ['Electrical','Ceiling fan not working','Fan is not rotating and room becomes uncomfortable',3,3],
 ['Electrical','Corridor light flickering','Light flickers continuously near the corridor',3,3],
 ['Electrical','Exposed electrical wiring','Exposed wire near a student walkway poses a safety hazard',5,5],
 ['Cleaning','Washroom requires cleaning','Washroom requires attention and supplies',3,4],
 ['Cleaning','Overflowing dustbin','Dustbin has overflowed and needs collection',2,3],
 ['Water','Water cooler not functioning','Drinking water cooler is not dispensing water',4,4],
 ['Water','Leaking tap','Tap is leaking and wasting water',3,3],
 ['Furniture','Broken classroom chair','Chair is damaged and unsafe to sit on',3,2],
 ['Furniture','Damaged desk','Desk surface is cracked and needs repair',2,2],
 ['Other','Notice board damaged','Notice board is loose and needs repair',2,2],
 ['Other','Classroom door lock jammed','Door lock is difficult to open and close',3,3]
];
const locations=[['Block A','Ground','Lobby'],['Block A','1','101'],['Block A','2','204'],['Block B','1','Lab 1'],['Block B','2','205'],['Block C','Ground','Canteen'],['Library','Ground','Reading Hall'],['Hostel','1','Corridor'],['Block A','3','301'],['Block B','Ground','Seminar Hall'],['Sports Complex','Ground','Indoor Court'],['Admin Block','1','Office']];
const statuses=['submitted','assigned','in_progress','resolved','reopened'];
try{
 await db.beginTransaction();
 const hash=await bcrypt.hash('CampusDemo@123',10);
 const adminEmail='demo.admin@campuspulse.local';
 await db.execute("INSERT INTO users(name,email,password_hash,role) VALUES(?,?,?,'admin') ON DUPLICATE KEY UPDATE name=VALUES(name),password_hash=VALUES(password_hash),role='admin'",['Demo Administrator',adminEmail,hash]);
 const [[admin]]=await db.execute('SELECT id FROM users WHERE email=?',[adminEmail]);
 const userIds=[];
 for(let i=0;i<50;i++){
  const email=`demo.student${String(i+1).padStart(2,'0')}@campuspulse.local`;
  await db.execute("INSERT INTO users(name,email,password_hash,role) VALUES(?,?,?,'student') ON DUPLICATE KEY UPDATE name=VALUES(name),password_hash=VALUES(password_hash)",[`${first[i]} ${last[i%last.length]}`,email,hash]);
  const [[u]]=await db.execute('SELECT id FROM users WHERE email=?',[email]);userIds.push(u.id);
 }
 for(const loc of locations)await db.execute('INSERT IGNORE INTO locations(building,floor,room) VALUES(?,?,?)',loc);
 const [locRows]=await db.execute('SELECT id FROM locations ORDER BY id');
 // Re-runs are safe: all generated issues carry a marker in the description.
 const [previous]=await db.execute("SELECT id FROM issues WHERE description LIKE '%[CampusPulse DEMO]%' ");
 if(previous.length){const ids=previous.map(r=>r.id);for(let p=0;p<ids.length;p+=100){const part=ids.slice(p,p+100);const placeholders=part.map(()=>'?').join(',');await db.execute(`DELETE FROM confirmations WHERE issue_id IN (${placeholders})`,part);await db.execute(`DELETE FROM status_history WHERE issue_id IN (${placeholders})`,part);await db.execute(`DELETE FROM issues WHERE id IN (${placeholders})`,part)}}
 let confirms=0;
 for(let i=0;i<145;i++){
  const t=templates[(i*7+Math.floor(i/5))%templates.length];const loc=locRows[(i*3+Math.floor(i/9))%locRows.length];const reporter=userIds[(i*11)%50];const age=1+Math.floor(random(i+3)*45);const hour=Math.floor(random(i+29)*20);const status=statuses[(i*13+Math.floor(i/4))%statuses.length];
  const created=new Date(Date.now()-(age*24+hour)*3600*1000);
  const date=v=>v.toISOString().slice(0,19).replace('T',' ');
  const resolved=status==='resolved'?new Date(created.getTime()+(3+Math.floor(random(i+4)*110))*3600000):null;
  const [r]=await db.execute('INSERT INTO issues(reporter_id,location_id,category,title,description,severity,impact,status,assigned_to,resolution_notes,created_at,resolved_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)',[reporter,loc.id,t[0],t[1]+(i%7===0?' — follow-up':''),`${t[2]}. [CampusPulse DEMO]`,t[3],t[4],status,status==='submitted'?null:admin.id,status==='resolved'?'Issue checked and resolved by the campus facilities team.':null,date(created),resolved?date(resolved):null]);
  await db.execute('INSERT INTO status_history(issue_id,old_status,new_status,changed_by,note,created_at) VALUES(?,?,?,?,?,?)',[r.insertId,null,'submitted',reporter,'Student submitted issue',date(created)]);
  if(status!=='submitted'){
   const assigned=new Date(created.getTime()+3600000);
   await db.execute('INSERT INTO status_history(issue_id,old_status,new_status,changed_by,note,created_at) VALUES(?,?,?,?,?,?)',[r.insertId,'submitted','assigned',admin.id,'Assigned to campus operations',date(assigned)]);
   if(status!=='assigned'){
    const progress=new Date(created.getTime()+7200000);
    await db.execute('INSERT INTO status_history(issue_id,old_status,new_status,changed_by,note,created_at) VALUES(?,?,?,?,?,?)',[r.insertId,'assigned','in_progress',admin.id,'Technician is investigating',date(progress)]);
    if(status==='resolved'||status==='reopened')await db.execute('INSERT INTO status_history(issue_id,old_status,new_status,changed_by,note,created_at) VALUES(?,?,?,?,?,?)',[r.insertId,'in_progress','resolved',admin.id,'Maintenance completed',date(resolved||new Date(created.getTime()+10800000))]);
    if(status==='reopened')await db.execute('INSERT INTO status_history(issue_id,old_status,new_status,changed_by,note,created_at) VALUES(?,?,?,?,?,?)',[r.insertId,'resolved','reopened',reporter,'Issue has recurred',date(new Date(created.getTime()+14400000))]);
   }
  }
  const count=Math.floor(random(i+97)*7);
  for(let k=0;k<count;k++){const confirmer=userIds[(i*17+k*7+1)%50];if(confirmer===reporter)continue;await db.execute('INSERT IGNORE INTO confirmations(issue_id,user_id) VALUES(?,?)',[r.insertId,confirmer]);confirms++}
 }
 await db.commit();
 console.log('CampusPulse demo seeded: 50 students, 1 demo admin, 145 issues, locations, history and confirmations.');
 console.log('Demo admin: demo.admin@campuspulse.local | password: CampusDemo@123');
 console.log('Demo student: demo.student01@campuspulse.local | password: CampusDemo@123');
 console.log('DEMO ACCOUNTS ARE FOR LOCAL TESTING ONLY. Change credentials before public deployment.');
}catch(e){await db.rollback();console.error(e);process.exitCode=1}finally{await db.end()}
