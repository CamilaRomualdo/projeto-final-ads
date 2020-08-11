import React from "react";
import {Button, Form, Grid, Header, Icon, Message, Segment} from "semantic-ui-react";
import MediaQuery from "react-responsive";
import firebase from "../../core/service/firebase";
import {Link} from "react-router-dom";
import md5 from "md5";

class SignUp extends React.Component {

    state = {
        email: "",
        errors: [],
        loading: false,
        password: "",
        passwordConfirmation: "",
        username: "",
        usersRef: firebase.database().ref("usuarios")
    };

    isFormValid = () => {
        let error;
        let errors = [];
        if (this.isFormEmpty(this.state)) {
            error = {
                message: "Por favor, complete todos os campos."
            };
            this.setState({errors: errors.concat(error)});
            return false;
        } else if (!this.isPasswordValid(this.state)) {
            error = {
                message: "Senha incompatível. Verifique os dados e tente novamente."
            };
            this.setState({errors: errors.concat(error)});
            return false;
        } else {
            return true;
        }
    };

    isFormEmpty = ({username, email, password, passwordConfirmation}) => {
        return (
            !email.length ||
            !password.length ||
            !passwordConfirmation.length ||
            !username.length
        );
    };

    isPasswordValid = ({password, passwordConfirmation}) => {
        if (password.length < 6 || passwordConfirmation.length < 6) {
            return false;
        } else {
            return password === passwordConfirmation;
        }
    };

    displayErrors = errors => errors.map((error, i) =>
        <p key={i}>{error.message}</p>
    );

    handleChange = event => {
        this.setState({[event.target.name]: event.target.value})
    };

    handleSubmit = event => {
        event.preventDefault();
        if (this.isFormValid()) {
            this.setState({errors: [], loading: true});
            firebase
                .auth()
                .createUserWithEmailAndPassword(this.state.email, this.state.password)
                .then(createdUser => {
                    console.log(createdUser);
                    createdUser.user.updateProfile({
                        displayName: this.state.username,
                        photoURL: `http://gravatar.com/avatar/${md5(createdUser.user.email)}?d=identicon`
                    })
                        .then(() => {
                            this.saveUser(createdUser).then(() => {
                                console.log("Usuário cadastrado e logado com sucesso!");
                            })
                        })
                        .catch(err => {
                            console.error(err);
                            this.setState({errors: this.state.errors.concat(err), loading: false});
                        })
                })
                .catch(err => {
                    console.error(err);
                    this.setState({errors: this.state.errors.concat(err), loading: false});
                });
        }
    };

    saveUser = createdUser => {
        return this.state.usersRef.child(createdUser.user.uid).set({
            name: createdUser.user.displayName,
            avatar: createdUser.user.photoURL
        })
    };

    handleInputError = (errors, inputName) => {
        return errors.some(error =>
            error.message.toLowerCase().includes(inputName)) ? "error" : ""
    };

    render() {
        const {email, errors, loading, password, passwordConfirmation, username } = this.state;
        return (
            <MediaQuery device={{deviceWidth: 1600}} minDeviceWidth={1224}>
                <Grid className="app" columns="3" textAlign="center" verticalAlign="middle">
                    <Grid.Column style={{maxWidth: 450}}>
                        <Header as="h1" icon style={{color: "#eee"}} textAlign="center">
                            <Icon name="user circle outline" style={{color: "white", marginBottom: "0.3em"}}/>
                            Junte-se a nós e
                            <br/>
                            compartilhe do melhor.
                        </Header>
                        <Form onSubmit={this.handleSubmit} size="large">
                            <Segment stacked>
                                <Form.Input
                                    fluid
                                    icon="user"
                                    iconPosition="left"
                                    name="username"
                                    onChange={this.handleChange}
                                    placeholder="Nome: "
                                    type="text"
                                    value={username}
                                />
                                <Form.Input
                                    className={this.handleInputError(errors, "email")}
                                    fluid
                                    icon="mail"
                                    iconPosition="left"
                                    name="email"
                                    onChange={this.handleChange}
                                    placeholder="E-mail: "
                                    type="email"
                                    value={email}
                                />
                                <Form.Input
                                    className={this.handleInputError(errors, "password")}
                                    fluid
                                    icon="lock"
                                    iconPosition="left"
                                    name="password"
                                    onChange={this.handleChange}
                                    placeholder="Senha: "
                                    type="password"
                                    value={password}
                                />
                                <Form.Input
                                    className={this.handleInputError(errors, "passwordConfirmation")}
                                    fluid
                                    icon="repeat"
                                    iconPosition="left"
                                    name="passwordConfirmation"
                                    onChange={this.handleChange}
                                    placeholder="Confirme sua senha: "
                                    type="password"
                                    value={passwordConfirmation}
                                />
                                <Button
                                    className={loading ? "loading" : ""}
                                    color="orange"
                                    disable="false"
                                    fluid
                                    size="large"> REGISTRAR
                                </Button>
                            </Segment>
                        </Form>
                        {errors.length > 0 && (
                            <Message error>
                                <h3>Error</h3> {this.displayErrors(errors)}
                            </Message>
                        )}
                        <Message>Já é um membro? <Link to="/geekat/login">Faça seu login aqui!</Link></Message>
                    </Grid.Column>
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

export default SignUp;
