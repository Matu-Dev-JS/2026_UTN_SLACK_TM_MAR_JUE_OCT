import React from 'react'
import './Form.css'

/*
  Campo de formulario reutilizable (label + input).

  Uso:
    <TextField
      name="email"
      label="Email:"
      type="email"
      value={formState.email}
      onChange={handleChangeInput}
      autoComplete="email"
    />
*/
function TextField({
  name,
  label,
  type = 'text',
  value,
  onChange,
  autoComplete,
  ...props
}) {
  return (
    <div className='form-field'>
      <label className='form-field__label' htmlFor={name}>
        {label}
      </label>
      <input
        className='form-field__input'
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        {...props}
      />
    </div>
  )
}

export default TextField
