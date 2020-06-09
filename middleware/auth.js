const jwt = require('jsonwebtoken')
const UserList = require('../models/user')

const auth = async(req, res, next) => {
 
  try {
      // Get tokent from HEADER by key "Authorization"
    const token = req.header('Authorization').replace('Bearer ', '')
      // Verify token
    const decode = jwt.verify(token, process.env.JWT)
      // Find current user by decoded ID & token
    const user = await UserList.findOne({ _id: decode._id, 'tokens.token': token })
    // const user = await UserList.findOne({ _id: decode._id, token })
      // Not found user
    if (!user) {
      throw new Error()
    }
    // Copy token to request object for check later when user is logout
    // This need if user have auth from many devices and will not logout at all
    req.token = token
    // Create user data to request object
    req.user = user
    next()
  } catch (error) {
    res.status(401).send({error: 'Please authenticate'})
  }
}

module.exports = auth