const express = require('express')
const path = require('path')
const exphbs  = require('express-handlebars')
const app = express()
const server  = require('http').createServer(app)
const io = require('socket.io')(server)
const port = 3000




app.use('/', express.static(path.join(__dirname, 'public')))
app.engine('.hbs', exphbs({extname: '.hbs'}));
app.set('view engine', '.hbs');
app.use(express.urlencoded({ extended:true}))
app.use(express.json())
  
  let userOnline = []
// lắng nghe user đã kết nói và tạo group 
io.on('connection', socket => {

  socket.custom = {}
  socket.custom.group = ['test']
  socket.on('Register', ({username,group})=>{
    if(userOnline.find(user => user===username)){
      socket.emit('userOnline',undefined)
    }else{
      socket.custom.username = username
      // socket.custom.group = group
      socket.join(username)
      userOnline.push({username,group})
      io.sockets.emit('userOnline',userOnline)
    }
  })

  // lắng nghe user cần kết nối
  socket.on('connect_user',(userChat)=>{
    socket.custom.groupCurrent = userChat
    socket.join(userChat)
    // xác nhận là đã lắng nghe và join group thành công 
    socket.emit('connect_user','success')

  })
  
  // nhận tin user muốn gửi
  socket.on('message', (message)=>{
    // socket.custom.group.find(gr => gr===group) || socket.custom.group.push(group)
    io.to(socket.custom.username).to(socket.custom.userChat).emit('message',message)
    //io.to(socket.custom.group).emit('message',socket.custom.username+':  '+message)
  })

  // user hủy kết nối 
  socket.on('disconnect', () => { 
    userOnline = userOnline.filter(user => user != socket.custom.username)
  });
});

app.get('/room', (req, res) => {
  res.render('room')
})
app.get('/', (req, res) => {
  res.render('home')
})

server.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
