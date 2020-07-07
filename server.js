const express=require('express');
const path=require('path');
const http=require('http');
const socketio=require('socket.io');
const formatmessage=require('./utils/messages');
const {userjoin,getcurrentuser,userleaves,getroomusers}=require('./utils/users');

const app=express();
const server=http.createServer(app);
const io=socketio(server);
const botname='ChatCord Bot';
app.use(express.static(path.join(__dirname,'public')));
io.on('connection', socket =>{
  socket.on('joinroom',({username,room})=>{
    const user=userjoin(socket.id,username,room);
    socket.join(user.room);
    socket.emit('message',formatmessage(botname,'Welcome To ChatCord'));

    socket.broadcast.to(user.room).emit('message',formatmessage(botname,`${user.username} has joined`));
    io.to(user.room).emit('roomusers',{
      room:user.room,
      users:getroomusers(user.room)
    });
  });
//  console.log('New WSconnection..');


  socket.on('chatmessage',msg=>{
    const user=getcurrentuser(socket.id);
    io.to(user.room).emit('message',formatmessage(user.username,msg));
  });
  socket.on('disconnect',()=>{
    const user=userleaves(socket.id);
    if(user){
        io.to(user.room).emit(
          'message',
          formatmessage(botname,`${user.username} user has left the chat`)
        );
        io.to(user.room).emit('roomusers',{
          room:user.room,
          users:getroomusers(user.room)
        });
    }



  });
});
const PORT=3000||process.env.PORT;
server.listen(PORT,()=>console.log(`Server is running on ${PORT}`));
