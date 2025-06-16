import { useEffect, useState } from 'react'


const useFetch = (endpoint, query) => {
    const [data, setData] = useState([])
    const[isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)

    const axios = require('axios');

    const options = {
    method: 'GET',
    url: `https://jsearch.p.rapidapi.com/${endpoint}`,
    params: { ...query },
    headers: {
        'x-rapidapi-key': 'd0dfbda215msh388e934859816f7p1d45bfjsn257d4147288b',
        'x-rapidapi-host': 'jsearch.p.rapidapi.com'
    }
    };

    const fetchData = async() => {
        
        setIsLoading(true)
        try{
            const response = await axios.request(options)

            setData(response.data.data)
            setIsLoading(false)
        }catch(error){
            setError(error)
            alert("There is an error")
        }finally{
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    const refetch = () => {
        setIsLoading(true);
        fetchData();
    }

    return { data, isLoading, error, refetch }
}
export default useFetch;


