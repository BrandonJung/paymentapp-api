// Setting middleware globally or pass function as 2nd argument before (req, res), must invoke before wanted end points
// Can be passed into a router to be called during specific routes
const loggingMiddleware = (request, response, next) => {
  console.log(`${request.method} - ${request.url}`);
  next();
};
