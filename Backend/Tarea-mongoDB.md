Plan de implementacion:

Modelos:
    - Channel (Corregido)
        nombre
        fk_id_espacio_trabajo
        fecha_creacion
        descripcion

    - MessageChannel
        contenido
        fk_id_emisor
        fk_id_canal
        fecha_creacion
        (Opcional) editado: boolean OR fecha_edicion: Date (Si quieren que un mensaje se pueda editar)
        
    - DirectMessage
        contenido
        fk_id_receptor
        fk_id_emisor
        fecha_creacion

Repositories:
    WorkspaceRepository
        - getById(workspace_id) 
        - deleteById(workspace_id)
        - updateById(workspace_id, {name, description})

    ChannelRepository (Corregido)
        - create
        - deleteById(channel_id)
        - updateById(name, description)
        - getAllChannelsByWorkspaceId(workspace_id)

    MessageChannelRepository
        - create
        - deleteById(message_id)
        - updateById(content) (opcional)
        - getAllMessagesByChannelId(channel_id)
        - getAllMessagesBySearchTerm(search_term) tree todos los mensajes por termino de busqueda (buscamos por contenido)
        - getAllMessagesByDateRange(min_date, max_date) trae todos los mensajes por rango de fechas
        - getAllMessagesByMemberId(member_id) Trae todos los mensajes por usuario

    DirectMessageRepository
        - create
        - deleteById(message_id)
        - updateById(content) (opcional)
        - getAllMessagesBySearchTerm(search_term) tree todos los mensajes por termino de busqueda (buscamos por contenido)
        - getAllMessagesByDateRange(min_date, max_date) trae todos los mensajes por rango de fechas

Tratemos de tenerlo para: 6/10/2026


