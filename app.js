
const express = require('express');
const path = require('path');
const session = require('express-session');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'godmode',
  resave: false,
  saveUninitialized: true
}));

const ROLES = { VIEWER:1, EDITOR:2, ADMIN:3, SUPERADMIN:4 };

const users = {
  viewer: { password: '123', role: ROLES.VIEWER },
  editor: { password: '123', role: ROLES.EDITOR },
  admin: { password: '123', role: ROLES.ADMIN },
  god: { password: '123', role: ROLES.SUPERADMIN }
};

const auth = (roles=[]) => (req,res,next)=>{
  if(!req.session.user) return res.redirect('/login');
  if(roles.length && !roles.includes(req.session.user.role))
    return res.status(403).send('ACCESS DENIED');
  next();
};

app.get('/login',(req,res)=>res.render('login'));
app.post('/login',(req,res)=>{
  const {login,password}=req.body;
  const u=users[login];
  if(!u||u.password!==password) return res.send('ERROR');
  req.session.user={login,role:u.role};
  res.redirect('/');
});
app.get('/logout',(req,res)=>{req.session.destroy(()=>res.redirect('/login'))});

app.get('/',auth(),(req,res)=>res.render('home',{user:req.session.user,ROLES}));
app.get('/role1',auth([ROLES.VIEWER]),(req,res)=>res.render('role1'));
app.get('/role2',auth([ROLES.EDITOR]),(req,res)=>res.render('role2'));
app.get('/role34',auth([ROLES.ADMIN,ROLES.SUPERADMIN]),
(req,res)=>res.render('role34',{user:req.session.user,ROLES}));

app.listen(PORT,()=>console.log('GODMODE READY'));
