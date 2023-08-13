import { forwardRef } from 'react'
import TextField from '@material-ui/core/TextField'


const MTPhoneInput = (props, ref) => {
  return (
    <TextField
        {...props}
        inputRef={ref} />
  )
}


export default forwardRef(MTPhoneInput)