import { BrowserRouter, Route, Switch } from "react-router-dom";
import AppContext from "./app-context";
import AppStore from "./stores/app";
import AppApi from "./apis/app";
import HomePage from "./pages/home";

const store = new AppStore();
const api = new AppApi(store);

function App() {
  return (
    <AppContext.Provider value={{ store, api }}>
      <BrowserRouter>
        <Switch>
          <Route path="/" component={HomePage} />
        </Switch>
      </BrowserRouter>
    </AppContext.Provider>
  );
}

export default App;
