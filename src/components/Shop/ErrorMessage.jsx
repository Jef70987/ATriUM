

const styles = {
    container : {
        width:'1200px',
        padding:'15px',
        backgroundColor: 'transparent',
        border:'1px solid #ef9a9a',
        borderRadius: '4px',
        color: '#c62828',
        fontSize:'20px',
        textAlign:'center'
    },

};

const ErrorMessage = ({message}) => {
    return (
        <div style={styles.container}>
            {message || 'An error occured. Please try again later.'}
        </div>
    )
}

export default ErrorMessage;