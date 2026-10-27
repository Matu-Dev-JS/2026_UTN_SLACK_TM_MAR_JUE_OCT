import Channel from "../models/channel.model.js"

class ChannelRepository {
    async createChannel(name, description, workspace_id) {
        const result = await Channel.create(
            {
                nombre: name,
                descripcion: description,
                fk_id_espacio_trabajo: workspace_id
            }
        )
        return result
    }

    async deleteById(channel_id) {
        const result = await Channel.findByIdAndDelete(channel_id)
        return result
    }
    async updateById(channel_id, name, description) {
        const result = await Channel.findByIdAndUpdate(
            channel_id, 
            { 
                nombre: name, 
                descripcion: description 
            }, 
            { new: true } //Hace que te devuelva el canal actualizado
        )
        return result
    }
    async getAllChannelsByWorkpaceId(workspace_id) {
        const result = await Channel.find({ fk_id_espacio_trabajo: workspace_id })
        return result
    }
}
const channel_repository = new ChannelRepository()
export default channel_repository