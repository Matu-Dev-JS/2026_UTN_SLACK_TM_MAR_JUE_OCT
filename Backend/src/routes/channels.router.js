import express from 'express'

const channel_router = express.Router({mergeParams: true})

channel_router.get(
    '/',
    (request, response) => {
        response.send({
            ok: true
            ,
            message: 'Channel'
        })
    }
)

export default channel_router

