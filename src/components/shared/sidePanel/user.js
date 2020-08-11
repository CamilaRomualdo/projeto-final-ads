import React from "react";
import firebase from "../../../core/service/firebase";
import AvatarEditor from "react-avatar-editor";
import { Grid, Header, Icon, Dropdown, Image, Modal, Divider, Input, Button } from "semantic-ui-react";

class User extends React.Component {
    state = {
        blob: null,
        croppedImage: "",
        metadata: {
            contentType: "image/jpeg"
        },
        modal: false,
        previewImage: "",
        storageRef: firebase.storage().ref(),
        uploadedCroppedImage: "",
        user: this.props.currentUser,
        userRef: firebase.auth().currentUser,
        usersRef: firebase.database().ref("usuarios")
    };

    openModal = () => this.setState({
        modal: true
    });

    closeModal = () => this.setState({
        modal: false
    });

    dropdownOptions = () => [
        {
            disabled: true,
            key: "user",
            text: (
                <span>
                    Logado como <strong>{this.state.user.displayName}</strong>
                </span>
            )
        },
        {
            key: "avatar",
            text: <Button onClick={this.openModal} fluid>Alterar Avatar</Button>
        },
        {
            key: "signout",
            text: <Button onClick={this.handleSignout} fluid>Sair</Button>
        }
    ];

    uploadCroppedImage = () => {
        const { blob, metadata, storageRef, userRef } = this.state;
        storageRef.child(`avatars/user-${userRef.uid}`).put(blob, metadata).then(snap => {
            snap.ref.getDownloadURL().then(downloadURL => {
                this.setState({ uploadedCroppedImage: downloadURL }, () =>
                    this.changeAvatar()
                );
            });
        });
    };

    changeAvatar = () => {
        this.state.userRef
            .updateProfile({
                photoURL: this.state.uploadedCroppedImage
            }).then(() => {
                console.log("Alteração feita.");
                this.closeModal();
            }).catch(err => {
                console.error(err);
            });
        this.state.usersRef.child(this.state.user.uid).update({
            avatar: this.state.uploadedCroppedImage }).then(() => {
                console.log("Alteração de avatar realizada.");
            }).catch(err => {
                console.error(err);
            });
    };

    handleChange = event => {
        const file = event.target.files[0];
        const reader = new FileReader();
        if (file) {
            reader.readAsDataURL(file);
            reader.addEventListener("load", () => {
                this.setState({ previewImage: reader.result });
            });
        }
    };

    handleCropImage = () => {
        if (this.avatarEditor) {
            this.avatarEditor.getImageScaledToCanvas().toBlob(blob => {
                let imageUrl = URL.createObjectURL(blob);
                this.setState({
                    croppedImage: imageUrl, blob
                });
            });
        }
    };

    handleSignout = () => {
        firebase.auth().signOut().then(() => console.log("Usuário deslogado com sucesso!"));
    };

    render() {
        const {croppedImage, modal, previewImage, user} = this.state;
        const {sidePanelColor} = this.props;
        return (
            <Grid.Column style={{background: sidePanelColor}}>
                <Grid style={{margin: 0, padding: "1.7em"}}>
                    <Header as="h2" floated="left" inverted>
                        <Header.Content style={{fontSize: "35px", margin: "0.1em", marginTop: "35px"}}>GEEKAT</Header.Content>
                    </Header>
                    <Header as="h5" className="dropDown" inverted>
                        <Dropdown trigger={
                            <span style={{marginLeft: "25px"}}>
                                <Image avatar spaced="right" src={user.photoURL}/> {user.displayName}
                            </span>
                        } options={
                            this.dropdownOptions()
                        }
                        />
                    </Header>
                </Grid>
                <Divider className='line' inverted />
                <Modal centered={false} onClose={this.closeModal} open={modal}>
                    <Modal.Header>Alterar Avatar</Modal.Header>
                    <Modal.Content>
                        <Input
                            fluid
                            label="Novo Avatar"
                            name="previewImage"
                            onChange={this.handleChange}
                            type="file"
                        />
                        <Grid centered columns={2} stackable style={{marginTop: "1.5em"}}>
                            <Grid.Row centered>
                                <Grid.Column className="ui center aligned grid">
                                    {previewImage && (
                                        <AvatarEditor
                                            border={50}
                                            image={previewImage}
                                            height={120}
                                            scale={1.2}
                                            ref={node => (this.avatarEditor = node)}
                                            width={120}
                                        />
                                    )}
                                </Grid.Column>
                                <Grid.Column>
                                    {croppedImage && (
                                        <Image
                                            height={100}
                                            style={{ margin: "3.5em auto" }}
                                            src={croppedImage}
                                            width={100}
                                        />
                                    )}
                                </Grid.Column>
                            </Grid.Row>
                        </Grid>
                    </Modal.Content>
                    <Modal.Actions>
                        {croppedImage && (
                            <Button color="green" onClick={this.uploadCroppedImage}>
                                <Icon name="save" /> Confimar
                            </Button>
                        )}
                        <Button color="green"  onClick={this.handleCropImage}>
                            <Icon name="image" /> Visualizar
                        </Button>
                        <Button color="red"  onClick={this.closeModal}>
                            <Icon name="remove" /> Fechar
                        </Button>
                    </Modal.Actions>
                </Modal>
            </Grid.Column>
        );
    }
}

export default User;
