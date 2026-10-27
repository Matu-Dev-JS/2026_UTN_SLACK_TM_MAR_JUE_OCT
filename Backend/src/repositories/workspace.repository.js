import Workspace from "../models/workspace.model.js"

class WorkspaceRepository {
    async createWorkspace(name, description) {
        const workspace_created = await Workspace.create({ nombre: name, description: description })
        return workspace_created
    }

    async getById(workspace_id) {
        return await Workspace.findById(workspace_id)
    }

    async deleteById (workspace_id){
        await Workspace.findByIdAndDelete(workspace_id)
    }

    async updateById(workspace_id, update_data){
        await Workspace.findByIdAndUpdate(workspace_id, update_data)
    }
}
const workspace_repository = new WorkspaceRepository()
export default workspace_repository