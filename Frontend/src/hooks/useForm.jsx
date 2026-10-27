import { useState } from "react"

function useForm (initial_state ){

    const [formState, setFormState] = useState(initial_state)

    function handleChangeInput (event){
        const input = event.target
        const field_name = input.name
        const field_value = input.value

        setFormState(
            (prevState) => {
                return {...prevState, [field_name]: field_value}
            }
        )
    }

    return {
        formState, 
        handleChangeInput
    }
}

export default useForm