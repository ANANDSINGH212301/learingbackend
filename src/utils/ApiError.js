class ApiError extends Error{
    constructor(
       status,
       message="Something went wrong",
       errors = [],
       statck
    ){
      super(message),
      this.statusCode = status,
      this.data = null,
      this.message = message,
      this.success = false,
      this.errors = errors

      if(statck){
        this.statck = statck
      }else{
        Error.captureStackTrace(this,this.constructor)
      }
    }
}

export {ApiError}