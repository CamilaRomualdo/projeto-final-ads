import React from "react";
import ReactDOM from "react-dom";
import App from "./components/App";
import * as serviceWorker from "./serviceWorker";

import {BrowserRouter as Router, Route, Switch, withRouter} from "react-router-dom";
import "semantic-ui-css/semantic.min.css";

// Service
import firebase from "./core/service/firebase";

// Components
import Loading from "./core/loading";
import signIn from "./components/authentication/signIn";
import signUp from "./components/authentication/signUp";
import privacidade from "./core/components/privacidade";
import seguranca from "./core/components/seguranca";
import termo from "./core/components/termo";

// Redux
import {createStore} from "redux";
import {connect, Provider} from "react-redux";
import {composeWithDevTools} from "redux-devtools-extension";
import {clearUser, setUser} from "./core/store/actions/index.action";
import rootReducer from "./core/store/reducers/index.reducer";

const store = createStore(rootReducer, composeWithDevTools());

class Root extends React.Component {

    componentDidMount() {
        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                this.props.setUser(user);
                this.props.history.push("/geekat/usuario")
            } else {
                this.props.history.push("/geekat/login");
                this.props.clearUser();
            }
        });
    }

    render() {

        return this.props.isLoading ? (<Loading/>) : (
            <Switch>
                <Route exact path="/geekat/usuario"     component={App}/>
                <Route       path="/geekat/login"       component={signIn}/>
                <Route       path="/geekat/cadastro"    component={signUp}/>
                <Route       path="/geekat/privacidade" component={privacidade}/>
                <Route       path="/geekat/segurança"   component={seguranca}/>
                <Route       path="/geekat/termos"      component={termo}/>
                <Route path='/github' component={() => {
                    window.location.href = 'https://github.com/CamilaRomualdo';
                    return null;
                }}/>
                <Route path='/linkedin' component={() => {
                    window.location.href = 'https://www.linkedin.com/in/camila-romualdo-12695ab4/';
                    return null;
                }}/>
                <Route path='/portfolio' component={() => {
                    window.location.href = 'https://camilaromualdo.com/';
                    return null;
                }}/>
            </Switch>
        );

    }

}

const mapStateFromProps = state => ({
    isLoading: state.user.isLoading
});

const RootWithAuth = withRouter(
    connect(mapStateFromProps, {setUser, clearUser})(Root)
);

ReactDOM.render(
    <Provider store={store}>
        <Router>
            <RootWithAuth/>
        </Router>
    </Provider>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
