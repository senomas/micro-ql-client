
export default function (context) {
  return {
    httpEndpoint: 'http://localhost:5000/graphql',
    httpLinkOptions: {
      credentials: 'same-origin'
    },
    getAuth: () => {
      const token = process.server ? null : sessionStorage.getItem('token');
      if (token) {
        return `Bearer ${token}`;
      }
      return null;
    }
  };
}
