import user_repository from "../repositories/user.repository.js"
import ServerError from "../utils/error.util.js"


export async function getUsers(request, response) {
    const user_list = await user_repository.get()
    response.status(200).send({
        message: "Get users list",
        ok: true,
        status: 200,
        data: {
            users: user_list
        }
    })
}

export async function getUserById(request, response) {
    const user_id = request.params.user_id
    const user = await user_repository.getById(user_id)

    if (!user) {
        throw new ServerError("User not found", 404)
    }
    return response.status(200).send(
        {
            message: "Get user details successfully",
            status: 200,
            ok: true,
            data: {
                user: user
            }
        }
    )
}