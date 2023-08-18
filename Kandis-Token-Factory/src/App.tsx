import { useNav } from './routes';
import Layout from './components/Layout';
import { SnackbarProvider } from 'notistack';
import { useEffect, useState } from 'react';
import DisclaimerDialog from "./components/DisclaimerDialog"

function App() {
  const { routesList, menu, element: routes } = useNav();
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    setAgreed(window.localStorage.getItem("agreed") == "agreed")  
  }, []);

  const onAccepted = ()=>{
    setAgreed(true);
  }

  return (
    <div className="AppContainer">
      { !agreed && <DisclaimerDialog open={true} onAccepted={onAccepted}/>}
      <SnackbarProvider 
        autoHideDuration={2000}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}>
        <Layout menu={menu}
          routesList={routesList}>
          {routes}
        </Layout>
      </SnackbarProvider>
    </div>
  )
}

export default App;
