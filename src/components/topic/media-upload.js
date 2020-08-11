import React from "react";
import mime from "mime-types";
import {Button, Icon, Input, Modal} from "semantic-ui-react";

class MediaUpload extends React.Component {
    state = {
        file: null,
        authorized: ["image/jpeg", "image/png"]
    };

    addFile = event => {
        const file = event.target.files[0];
        if (file) {
            this.setState({file});
        }
    };

    sendFile = () => {
        const {file} = this.state;
        const {closeModal, uploadFile} = this.props;
        if (file !== null) {
            if (this.isAuthorized(file.name)) {
                const metadata = {contentType: mime.lookup(file.name)};
                uploadFile(file, metadata);
                closeModal();
                this.clearFile();
            }
        }
    };

    isAuthorized = filename => this.state.authorized.includes(mime.lookup(filename));

    clearFile = () => this.setState({
        file: null
    });

    render() {
        const {closeModal, modal} = this.props;
        return (
            <Modal onClose={closeModal} open={modal} >
                <Modal.Header>Selecione um Arquivo</Modal.Header>
                <Modal.Content>
                    <Input
                        fluid
                        label="Tipos de arquivo: JPG ou PNG."
                        name="file"
                        onChange={this.addFile}
                        type="file"
                    />
                </Modal.Content>
                <Modal.Actions>
                    <Button color="green" onClick={this.sendFile}>
                        <Icon name="checkmark"/> ENVIAR
                    </Button>
                    <Button color="red" onClick={closeModal}>
                        <Icon name="remove"/> CANCELAR
                    </Button>
                </Modal.Actions>
            </Modal>
        );
    }
}

export default MediaUpload;
