var io = require('socket.io')(3000);

io.on('connection', function (socket) {
  socket.on('settings', function (data) {
    console.log(data);
    socket.emit("mob", {
    "tweets": [{
            "id": "some_tweet_id",
            "text": "I got a pikachu",
            "coordinates": [48.166276, 11.591952],
            "timestamp": 1473599493
        },{
            "id": "another_tweet_id",
            "text": "i also got a pikachu!",
            "coordinates": [48.166276, 11.591952],
            "timestamp": 1473599499
        }],
    "coordinates": [48.166276, 11.591952],  // this is a weighted moving average of the tweets in the cluster
    "timestamp": 1473599499, // timestamp of last tweet in cluster
    "isMob": true,
    "clusterId": 1
});

  });
  // socket.on('private message', function (from, msg) {
  //   console.log('I received a private message by ', from, ' saying ', msg);
  // });
  //
  // socket.on('disconnect', function () {
  //   io.emit('user disconnected');
  // });
});
