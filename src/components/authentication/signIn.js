import React from "react";
import {Button, Form, Grid, Header, Icon, Message, Segment} from "semantic-ui-react";
import MediaQuery from "react-responsive";
import firebase from "../../core/service/firebase";
import {Link} from "react-router-dom";

class SignIn extends React.Component {

    state = {
        email: "",
        errors: [],
        loading: false,
        password: "",
    };

    displayErrors = errors => errors.map((error, i) =>
        <p key={i}>{error.message}</p>
    );

    handleChange = event => {
        this.setState({[event.target.name]: event.target.value})
    };

    handleSubmit = event => {
        event.preventDefault();
        if (this.isFormValid(this.state)) {
            this.setState({errors: [], loading: true});
            firebase
                .auth()
                .signInWithEmailAndPassword(this.state.email, this.state.password)
                .then(signedInUser => {
                    console.log(signedInUser)
                })
                .catch(err => {
                    console.log(err);
                    this.setState({
                        errors: this.state.errors.concat(err),
                        loading: false
                    })
                })
        }
    };

    isFormValid = ({email, password}) => email && password;

    handleInputError = (errors, inputName) => {
        return errors.some(error => error.message.toLowerCase().includes(inputName)) ? "error" : ""
    };

    render() {
        const {email, errors, loading, password} = this.state;
        return (
            <MediaQuery device={{deviceWidth: 1600}} minDeviceWidth={1224}>
                <Grid className="app" columns="3" textAlign="center" verticalAlign="middle">
                    <Grid.Column style={{maxWidth: 450}}>
                        <Header as="h1" icon style={{color: "#eee"}} textAlign="center">
                            <Icon name="user circle outline" style={{color: "white", marginBottom: "0.3em"}}/>
                            Seja bem-vindo ao Geekat
                        </Header>
                        <Form onSubmit={this.handleSubmit} size="large">
                            <Segment stacked>
                                <Form.Input
                                    className={this.handleInputError(errors, "email")}
                                    fluid
                                    icon="mail"
                                    iconPosition="left"
                                    name="email"
                                    onChange={this.handleChange}
                                    placeholder="Informe seu e-mail: "
                                    type="email"
                                    value={email}
                                />
                                <Form.Input
                                    className={this.handleInputError(errors, "password")}
                                    fluid
                                    icon="lock"
                                    iconPosition="left"
                                    name="password"
                                    placeholder="Informe sua senha: "
                                    onChange={this.handleChange}
                                    type="password"
                                    value={password}
                                />
                                <Button
                                    className={loading ? "loading" : ""}
                                    color="orange"
                                    disable="false"
                                    fluid
                                    size="large"> ENTRAR
                                </Button>
                            </Segment>
                        </Form>
                        {errors.length > 0 && (
                            <Message error>
                                <h3>Error</h3> {this.displayErrors(errors)}
                            </Message>
                        )}
                        <Message>Ainda não é um membro? <Link to="/geekat/cadastro">Cadastre-se aqui.</Link></Message>
                    </Grid.Column>
                    <Grid.Row>
                        <Link to="/github">
                            <Icon circular className='link' name='github'/>
                        </Link>
                        <Link to="/linkedin">
                            <Icon circular className='link' name='linkedin'/>
                        </Link>
                        <Link to="/portfolio">
                            <Icon circular className='link' name='world'/>
                        </Link>
                    </Grid.Row>
                    <Grid.Row>
                        <span>
                            <Link className='link' to="/geekat/privacidade">Privacidade</Link>
                        </span>
                        <span>
                            <Link className='link' to="/geekat/segurança">Segurança</Link>
                        </span>
                        <span>
                            <Link className='link' to="/geekat/termos">Termos</Link>
                        </span>
                    </Grid.Row>
                </Grid>
            </MediaQuery>
        );
    }
}

export default SignIn;
