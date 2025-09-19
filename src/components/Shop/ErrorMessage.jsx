import './Error.css';

const ErrorMessage = ({message}) => {
    return (
        <div className='Error--container'>
            <p>{message || 'An error occured. Please try again later.'}</p>
        </div>
    )
}

export default ErrorMessage;