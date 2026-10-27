import mongoose from "mongoose";
import { WORKSPACE_COLLECTION_NAME } from "./workspace.model.js";

const channelSchema = new mongoose.Schema(
    {
        nombre: {
            type: String,
            required: true
        },
        descripcion: {
            type: String,
            maxlength: 1000
        },
        fk_id_espacio_trabajo: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: WORKSPACE_COLLECTION_NAME
        },
        fecha_creacion: {
            type: Date,
            default: Date.now
        }
    }
)
export const CHANNEL_COLLECTION_NAME = 'Canal'
const Channel = mongoose.model(CHANNEL_COLLECTION_NAME, channelSchema)
export default Channel