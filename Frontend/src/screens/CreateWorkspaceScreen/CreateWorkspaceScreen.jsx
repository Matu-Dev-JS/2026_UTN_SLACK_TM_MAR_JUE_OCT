import React from 'react'
import { useNavigate } from 'react-router'
import useForm from '../../hooks/useForm'
import useRequest from '../../hooks/useRequest'
import { createWorkspace } from '../../services/workspaceService'
import TextField from '../../Components/Form/TextField'
import TextArea from '../../Components/Form/TextArea'
import FormButton from '../../Components/Form/FormButton'
import Alert from '../../Components/Alert/Alert'

const DESCRIPTION_MAX_LENGTH = 1000

function CreateWorkspaceScreen() {
  const initial_state = { name: '', description: '' }
  const { formState, handleChangeInput } = useForm(initial_state)
  const { loading, response, error, sendRequest } = useRequest()
  const navigate = useNavigate()

  async function handleSubmit(event) {
    event.preventDefault()
    sendRequest(
      async () => {
        const res = await createWorkspace(formState.name, formState.description)
        navigate('/home')
        return res
      }
    )
  }

  return (
    <div className='form-screen'>
      <div className='form-card'>
        <img
          className='form-logo'
          alt='Slack'
          height='26'
          title='Slack'
          src='https://a.slack-edge.com/bv1-13/slack_logo-97f7334.svg'
        />
        <h1 className='form-title form-title--wrap'>Asigna un nombre a tu espacio de trabajo de Slack</h1>
        <p className='form-subtitle'>
          Elige algo que tu equipo reconozca fácilmente, como el nombre de la
          empresa o del equipo. Puedes modificarlo cuando quieras.
        </p>
        <form className='form-stack' onSubmit={handleSubmit}>
          <TextField
            name='name'
            label='Nombre del espacio de trabajo:'
            type='text'
            value={formState.name}
            onChange={handleChangeInput}
            autoComplete='off'
          />
          <TextArea
            name='description'
            label='Descripción:'
            value={formState.description}
            onChange={handleChangeInput}
            maxLength={DESCRIPTION_MAX_LENGTH}
            rows={4}
          />
          {
            error
            &&
            !loading
            &&
            <Alert type='error'>{error}</Alert>
          }
          <FormButton loading={loading} loadingText='Creando…'>Crear espacio de trabajo</FormButton>
          {
            response
            &&
            !loading
            &&
            <Alert type='success'>Espacio de trabajo creado correctamente</Alert>
          }
        </form>
      </div>
    </div>
  )
}

export default CreateWorkspaceScreen