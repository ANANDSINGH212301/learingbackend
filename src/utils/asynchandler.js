const asynchandler = (requestHandler) => {
    (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    }
}
export { asynchandler }


// const asynchandler =  () => {}
// const asynchandler =  (func) => {  () => {}  }
// const asynchandler = (func) => async()=>{}


//try-catch request handler

// const asynchandler = (func) => async (req, res, next) => {
//     try {
//         await func(req, res, next)
//     } catch (error) {
//         res.status(error.code || 500).json({
//             sucess: false,
//             message: error.message
//         });
//         console.log("There is an error : ", error);
//     }
// }

